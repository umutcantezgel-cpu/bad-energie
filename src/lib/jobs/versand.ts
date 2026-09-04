import 'server-only';
import { and, eq, isNull, lte, or } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { versandauftrag } from '@/db/schema';
import { versendeAuftrag } from '@/lib/services/versand';
import type { JobErgebnis } from './runner';

/**
 * Sendet alle fälligen Versandaufträge. Der 18:00-Puffer und das Nachholen nach einem
 * Fehlversuch sind derselbe Mechanismus: beides steckt in `faellig_am` und `naechster_versuch_am`.
 */
export async function versandJob(jetzt: Date): Promise<JobErgebnis> {
  const db = await getDb();
  const faellig = await db.select().from(versandauftrag).where(and(
    eq(versandauftrag.status, 'freigegeben'),
    lte(versandauftrag.faelligAm, jetzt),
    or(isNull(versandauftrag.naechsterVersuchAm), lte(versandauftrag.naechsterVersuchAm, jetzt)),
  ));

  let verarbeitet = 0;
  let blockiert = 0;
  const zeilen: string[] = [];
  for (const auftrag of faellig) {
    const bericht = await versendeAuftrag(auftrag.id, { jetzt });
    if (bericht.status === 'versendet') {
      verarbeitet += 1;
      zeilen.push(`${bericht.art} versendet`);
    } else {
      blockiert += 1;
      zeilen.push(`${bericht.art} ${bericht.status}${bericht.fehler ? `: ${bericht.fehler}` : ''}`);
    }
  }
  const zusammenfassung = faellig.length === 0
    ? 'Nichts fällig.'
    : `${verarbeitet} versendet, ${blockiert} offen. ${zeilen.join('; ')}`;
  return { verarbeitet, blockiert, zusammenfassung };
}
