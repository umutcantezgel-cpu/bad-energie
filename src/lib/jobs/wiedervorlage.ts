import 'server-only';
import { and, eq, inArray, isNotNull, lte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, versandauftrag } from '@/db/schema';
import { stelleAuftragBereit } from '@/lib/services/versand';
import { ladeVorgang } from '@/lib/services/dokument-eingabe';
import { schreibeEreignis } from '@/lib/services/statusmaschine';
import { bereinigungJob } from './bereinigung';
import { speicherfristJob } from './speicherfrist';
import type { JobErgebnis } from './runner';

/**
 * Wiedervorlage nach Regel 9: Tag 5 ohne Antwort erzeugt einen Erinnerungsauftrag im Entwurf
 * (Freigabe bleibt beim Menschen). Nach der Erinnerung und erneutem Ablauf wird
 * die Bemerkung „keine Reaktion“ gesetzt; eine zweite Erinnerung gibt es nicht.
 *
 * Der Lauf zieht anschließend Speicherfrist und Bereinigung mit: Vercel Hobby erlaubt nur zwei
 * Cron-Einträge, beide Tagesjobs hängen deshalb an diesem hier. Jeder läuft für sich, damit ein
 * Fehler dort die Wiedervorlage nicht mitreißt.
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
      const vorhandene = await db.select({ id: versandauftrag.id }).from(versandauftrag).where(and(
        eq(versandauftrag.anfrageId, a.id),
        eq(versandauftrag.art, 'erinnerung'),
        sql`${versandauftrag.status} <> 'storniert'`,
      ));
      const daten = await ladeVorgang(a.id);
      const auftrag = await stelleAuftragBereit(a.id, 'erinnerung', { empfaenger: daten?.kunde?.email ?? '' });
      // Die Wiedervorlage ist erledigt, sobald der Auftrag zur Freigabe liegt. Ohne das Zurücksetzen
      // liefe der Vorgang jeden Tag erneut durch und schriebe jedes Mal dasselbe Ereignis.
      await db.update(anfrageTabelle)
        .set({ wiedervorlageAm: null, geaendertAm: jetzt })
        .where(eq(anfrageTabelle.id, a.id));
      if (vorhandene.length === 0) {
        await schreibeEreignis({ anfrageId: a.id, typ: 'wiedervorlage:erinnerung_vorbereitet', payload: { auftragId: auftrag.id } });
      }
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
  if (zeilen.length === 0) zeilen.push('Nichts zur Wiedervorlage.');

  for (const [name, arbeit] of [['Speicherfrist', speicherfristJob], ['Bereinigung', bereinigungJob]] as const) {
    try {
      const ergebnis = await arbeit(jetzt);
      verarbeitet += ergebnis.verarbeitet;
      blockiert += ergebnis.blockiert;
      zeilen.push(`${name}: ${ergebnis.zusammenfassung}`);
    } catch (fehler) {
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      blockiert += 1;
      zeilen.push(`${name} abgebrochen: ${text.slice(0, 200)}`);
    }
  }

  return { verarbeitet, blockiert, zusammenfassung: zeilen.join('; ') };
}
