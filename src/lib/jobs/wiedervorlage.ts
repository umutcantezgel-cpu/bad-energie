import 'server-only';
import { and, eq, inArray, isNotNull, lte } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle } from '@/db/schema';
import { stelleAuftragBereit } from '@/lib/services/versand';
import { ladeVorgang } from '@/lib/services/dokument-eingabe';
import { schreibeEreignis } from '@/lib/services/statusmaschine';
import type { JobErgebnis } from './runner';

/**
 * Wiedervorlage nach Regel 9: Tag 5 ohne Antwort erzeugt einen Erinnerungsauftrag im Entwurf
 * (Freigabe bleibt beim Menschen). Nach der Erinnerung und erneutem Ablauf wird
 * die Bemerkung „keine Reaktion“ gesetzt; eine zweite Erinnerung gibt es nicht.
 */
export async function wiedervorlageJob(jetzt: Date): Promise<JobErgebnis> {
  const db = await getDb();
  const faellig = await db.select().from(anfrageTabelle).where(and(
    inArray(anfrageTabelle.status, ['versendet', 'erinnert']),
    isNotNull(anfrageTabelle.wiedervorlageAm),
    lte(anfrageTabelle.wiedervorlageAm, jetzt),
  ));

  let verarbeitet = 0;
  let blockiert = 0;
  const zeilen: string[] = [];
  for (const a of faellig) {
    if (a.antwortAm) continue;
    if (a.status === 'versendet') {
      const daten = await ladeVorgang(a.id);
      const auftrag = await stelleAuftragBereit(a.id, 'erinnerung', { empfaenger: daten?.kunde?.email ?? '' });
      await schreibeEreignis({ anfrageId: a.id, typ: 'wiedervorlage:erinnerung_vorbereitet', payload: { auftragId: auftrag.id } });
      verarbeitet += 1;
      zeilen.push(`${a.ksNummer} Erinnerung liegt zur Freigabe bereit`);
    } else {
      if (a.bemerkung.includes('keine Reaktion')) continue;
      await db.update(anfrageTabelle)
        .set({ bemerkung: [a.bemerkung, 'keine Reaktion'].filter(Boolean).join(' '), wiedervorlageAm: null, geaendertAm: jetzt })
        .where(eq(anfrageTabelle.id, a.id));
      await schreibeEreignis({ anfrageId: a.id, typ: 'wiedervorlage:keine_reaktion' });
      blockiert += 1;
      zeilen.push(`${a.ksNummer} keine Reaktion`);
    }
  }
  const zusammenfassung = zeilen.length ? zeilen.join('; ') : 'Nichts zur Wiedervorlage.';
  return { verarbeitet, blockiert, zusammenfassung };
}
