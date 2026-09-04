import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { jobLauf } from '@/db/schema';
import { minutenBucket, tagesBucket } from '@/lib/services/zeit';

/**
 * Einzelläufer-Sperre für die Cron-Jobs. Der Slot ist ein Minutenbucket (Versand)
 * bzw. ein Tagesbucket; der Unique-Index (job, slot) verhindert Doppelläufe über mehrere Functions.
 */

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
 * Führt `arbeit` genau einmal je Slot aus. Ein zweiter Lauf im selben Slot meldet `gesperrt`.
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
  const lauf = angelegt[0];
  if (!lauf) return { ok: false, job, slot, grund: 'gesperrt' };
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
