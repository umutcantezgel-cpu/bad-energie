import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle } from '@/db/schema';
import { ladeFoerderRegeln, ladeMatrix } from '@/lib/services/kalkulationsdaten';
import { ladeVorgang, rechneVorgang } from '@/lib/services/dokument-eingabe';
import type { JobErgebnis } from './runner';

/**
 * Bewertet Anfragen im Status `eingang` neu: Ist die Matrix inzwischen gepflegt,
 * trägt der Vorgang eine Spanne. Der Statuswechsel bleibt beim Menschen (Regel 10),
 * der Job aktualisiert nur die Zwischenstände und meldet, was rechenbar geworden ist.
 */
export async function eingangJob(jetzt: Date): Promise<JobErgebnis> {
  const db = await getDb();
  const [matrix, regeln] = await Promise.all([ladeMatrix(), ladeFoerderRegeln()]);
  const offene = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.status, 'eingang'));

  let verarbeitet = 0;
  let blockiert = 0;
  const zeilen: string[] = [];
  for (const a of offene) {
    const daten = await ladeVorgang(a.id);
    if (!daten) continue;
    const ergebnis = rechneVorgang(daten, matrix, regeln);
    await db.update(anfrageTabelle).set({
      summeNettoVon: ergebnis.nettoVon || null,
      summeNettoBis: ergebnis.nettoBis || null,
      geaendertAm: jetzt,
    }).where(eq(anfrageTabelle.id, a.id));
    if (ergebnis.blockiert.length === 0 && ergebnis.bruttoBis > 0) {
      verarbeitet += 1;
      zeilen.push(`${a.ksNummer} ist rechenbar`);
    } else {
      blockiert += 1;
      const grund = ergebnis.blockiert[0]?.text ?? 'ohne Positionen';
      zeilen.push(`${a.ksNummer} offen: ${grund}`);
    }
  }
  const zusammenfassung = offene.length === 0 ? 'Kein Eingang offen.' : zeilen.join('; ');
  return { verarbeitet, blockiert, zusammenfassung };
}
