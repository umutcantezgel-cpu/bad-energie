import 'server-only';
import { and, eq, isNotNull, isNull, lt, or } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { jobLauf } from '@/db/schema';
import { minutenBucket, plusMinuten, tagesBucket } from '@/lib/services/zeit';

/**
 * Einzelläufer-Sperre für die Cron-Jobs. Der Slot ist ein Minutenbucket (Versand)
 * bzw. ein Tagesbucket; der Unique-Index (job, slot) verhindert Doppelläufe über mehrere Functions.
 * Gesperrt bleibt ein Slot nur, solange ein Lauf arbeitet oder erfolgreich war: ein gescheiterter
 * oder abgebrochener Lauf darf wiederholt werden, sonst blockiert ein einziger Fehler den ganzen Tag.
 */

/** Ein Lauf ohne Ende gilt nach dieser Zeit als abgebrochen; die Function läuft höchstens 120 Sekunden. */
export const LAUF_ABBRUCH_MINUTEN = 15;

export const JOBS = ['versand', 'wiedervorlage', 'eingang', 'speicherfrist', 'bereinigung'] as const;
export type JobName = (typeof JOBS)[number];

export function istJobName(name: string): name is JobName {
  return (JOBS as readonly string[]).includes(name);
}

export type JobErgebnis = { verarbeitet: number; blockiert: number; zusammenfassung: string };

export type LaufErgebnis =
  | ({ ok: true; job: JobName; slot: string } & JobErgebnis)
  | { ok: false; job: JobName; slot: string; grund: 'gesperrt' | 'fehler'; fehler?: string };

export function slotFuer(job: JobName, jetzt: Date): string {
  return job === 'versand' ? minutenBucket(jetzt) : tagesBucket(jetzt);
}

/**
 * Führt `arbeit` genau einmal je Slot aus. Ein zweiter Lauf im selben Slot meldet `gesperrt`,
 * solange der erste läuft oder erfolgreich war; nach einem Fehler oder Abbruch übernimmt er den Slot.
 */
export async function mitJobSperre(
  job: JobName,
  ausloeser: 'cron' | 'manuell',
  jetzt: Date,
  arbeit: () => Promise<JobErgebnis>,
): Promise<LaufErgebnis> {
  const db = await getDb();
  const slot = slotFuer(job, jetzt);
  const angelegt = await db.insert(jobLauf)
    .values({ job, slot, ausgeloestDurch: ausloeser, gestartet: jetzt })
    .onConflictDoNothing({ target: [jobLauf.job, jobLauf.slot] })
    .returning({ id: jobLauf.id });
  let lauf = angelegt[0];
  if (!lauf) {
    // Der Slot ist belegt. Übernehmen darf ihn nur, wer einen gescheiterten oder abgebrochenen Lauf
    // vorfindet; das UPDATE mit RETURNING entscheidet das atomar, ein erfolgreicher Lauf bleibt gesperrt.
    const abgebrochen = plusMinuten(jetzt, -LAUF_ABBRUCH_MINUTEN);
    const uebernommen = await db.update(jobLauf)
      .set({
        ausgeloestDurch: ausloeser, gestartet: jetzt, beendet: null, fehler: null,
        verarbeitet: 0, blockiert: 0, zusammenfassung: null,
      })
      .where(and(
        eq(jobLauf.job, job),
        eq(jobLauf.slot, slot),
        or(
          isNotNull(jobLauf.fehler),
          and(isNull(jobLauf.beendet), lt(jobLauf.gestartet, abgebrochen)),
        ),
      ))
      .returning({ id: jobLauf.id });
    if (!uebernommen[0]) return { ok: false, job, slot, grund: 'gesperrt' };
    lauf = uebernommen[0];
  }
  try {
    const ergebnis = await arbeit();
    await db.update(jobLauf).set({
      beendet: new Date(),
      verarbeitet: ergebnis.verarbeitet,
      blockiert: ergebnis.blockiert,
      zusammenfassung: ergebnis.zusammenfassung.slice(0, 2000),
    }).where(eq(jobLauf.id, lauf.id));
    return { ok: true, job, slot, ...ergebnis };
  } catch (fehler) {
    const text = fehler instanceof Error ? fehler.message : String(fehler);
    await db.update(jobLauf).set({ beendet: new Date(), fehler: text.slice(0, 500) }).where(eq(jobLauf.id, lauf.id));
    return { ok: false, job, slot, grund: 'fehler', fehler: text };
  }
}
