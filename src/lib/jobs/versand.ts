import 'server-only';
import { and, eq, isNotNull, isNull, lt, lte, or } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { versandauftrag } from '@/db/schema';
import { BEANSPRUCHUNG_MINUTEN, MAX_VERSUCHE, bereiteWiederholungVor, versendeAuftrag } from '@/lib/services/versand';
import { plusMinuten } from '@/lib/services/zeit';
import type { JobErgebnis } from './runner';

/**
 * Sendet alle fälligen Versandaufträge. Der 18:00-Puffer und das Nachholen nach einem
 * Fehlversuch sind derselbe Mechanismus: beides steckt in `faellig_am` und `naechster_versuch_am`.
 * Fehlgeschlagene Aufträge nimmt der Lauf bis `MAX_VERSUCHE` wieder auf; ein Auftrag, den ein
 * abgebrochener Lauf beansprucht hat, kommt nach Ablauf der Beanspruchung von selbst zurück.
 */
export async function versandJob(jetzt: Date): Promise<JobErgebnis> {
  const db = await getDb();
  const beanspruchungVerfallen = plusMinuten(jetzt, -BEANSPRUCHUNG_MINUTEN);
  const faellig = await db.select().from(versandauftrag).where(and(
    or(
      // Freigegeben und fällig: der reguläre Abendversand.
      and(
        eq(versandauftrag.status, 'freigegeben'),
        // Dossier und Eingangsbestätigung tragen kein `faellig_am`; ein hängender Auftrag kommt so zurück.
        or(isNull(versandauftrag.faelligAm), lte(versandauftrag.faelligAm, jetzt)),
        or(isNull(versandauftrag.naechsterVersuchAm), lte(versandauftrag.naechsterVersuchAm, jetzt)),
      ),
      // Fehlversuch mit abgelaufener Wartezeit: Dossier und Eingangsbestätigung tragen kein
      // `faellig_am`, ihre Wiederholung steuert allein `naechster_versuch_am`.
      and(
        eq(versandauftrag.status, 'fehlgeschlagen'),
        lt(versandauftrag.versuch, MAX_VERSUCHE),
        isNotNull(versandauftrag.naechsterVersuchAm),
        lte(versandauftrag.naechsterVersuchAm, jetzt),
        or(isNull(versandauftrag.faelligAm), lte(versandauftrag.faelligAm, jetzt)),
      ),
    ),
    or(isNull(versandauftrag.beanspruchtAm), lt(versandauftrag.beanspruchtAm, beanspruchungVerfallen)),
  ));

  let verarbeitet = 0;
  let blockiert = 0;
  const zeilen: string[] = [];
  for (const auftrag of faellig) {
    // Ein einzelner Auftrag darf den Lauf nicht abbrechen; die übrigen Anfragen warten sonst bis morgen.
    try {
      if (auftrag.status === 'fehlgeschlagen') {
        const bereit = await bereiteWiederholungVor(auftrag.id);
        if (!bereit) continue;
      }
      const bericht = await versendeAuftrag(auftrag.id, { jetzt });
      if (bericht.status === 'versendet') {
        verarbeitet += 1;
        zeilen.push(`${bericht.art} versendet`);
      } else {
        blockiert += 1;
        zeilen.push(`${bericht.art} ${bericht.status}${bericht.fehler ? `: ${bericht.fehler}` : ''}`);
      }
      // Das Büro-Dossier läuft parallel zur Kundenmail; sein Scheitern gehört in die Tageszusammenfassung.
      if (bericht.dossier && bericht.dossier.status !== 'versendet') {
        blockiert += 1;
        zeilen.push(`${bericht.art}: Dossier ${bericht.dossier.status}${bericht.dossier.fehler ? `: ${bericht.dossier.fehler}` : ''}`);
      }
    } catch (fehler) {
      blockiert += 1;
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      zeilen.push(`${auftrag.art} abgebrochen: ${text.slice(0, 200)}`);
    }
  }
  const zusammenfassung = faellig.length === 0
    ? 'Nichts fällig.'
    : `${verarbeitet} versendet, ${blockiert} offen. ${zeilen.join('; ')}`;
  return { verarbeitet, blockiert, zusammenfassung };
}
