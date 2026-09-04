import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  anfrage as anfrageTabelle, anhang as anhangTabelle, dokument, kunde as kundeTabelle, loeschprotokoll,
} from '@/db/schema';
import { ladeEinstellungen } from '@/lib/services/kalkulationsdaten';
import { getStorage } from '@/lib/services/storage';
import { minusMonate } from '@/lib/services/zeit';
import type { JobErgebnis } from './runner';

/**
 * Löschung nach Ablauf der Speicherfrist (Artikel 17, Einstellung `speicherfrist_monate`).
 * Maßgeblich ist `termin_am`, ersatzweise `verworfen_am`, ersatzweise `versendet_am`.
 * Positionen, Anhänge, Dokumente, Versandaufträge und Ereignisse hängen an der Fremdschlüsselkaskade;
 * Blob-Objekte werden vorher einzeln entfernt. Das Löschprotokoll enthält keine personenbezogenen Daten.
 */
export async function speicherfristJob(jetzt: Date): Promise<JobErgebnis> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  const grenze = minusMonate(jetzt, einst.speicherfristMonate);
  const alle = await db.select().from(anfrageTabelle);
  const faellig = alle.filter((a) => {
    const stichtag = a.terminAm ?? a.verworfenAm ?? a.versendetAm;
    return stichtag !== null && stichtag.getTime() <= grenze.getTime();
  });

  let verarbeitet = 0;
  const zeilen: string[] = [];
  for (const a of faellig) {
    const [anhaenge, dokumente] = await Promise.all([
      db.select().from(anhangTabelle).where(eq(anhangTabelle.anfrageId, a.id)),
      db.select().from(dokument).where(eq(dokument.anfrageId, a.id)),
    ]);
    for (const h of anhaenge) {
      await getStorage().del(h.blobPfad).catch(() => undefined);
      if (h.thumbBlobPfad) await getStorage().del(h.thumbBlobPfad).catch(() => undefined);
    }
    for (const d of dokumente) {
      await getStorage().del(d.blobPfad).catch(() => undefined);
    }
    const kundeId = a.kundeId;
    await db.delete(anfrageTabelle).where(eq(anfrageTabelle.id, a.id));
    const weitere = await db.select({ id: anfrageTabelle.id }).from(anfrageTabelle).where(eq(anfrageTabelle.kundeId, kundeId));
    if (weitere.length === 0) {
      await db.delete(kundeTabelle).where(inArray(kundeTabelle.id, [kundeId]));
    }
    await db.insert(loeschprotokoll).values({ ksNummer: a.ksNummer, geloeschtAm: jetzt, grund: `Speicherfrist ${einst.speicherfristMonate} Monate abgelaufen.` });
    verarbeitet += 1;
    zeilen.push(a.ksNummer);
  }
  return {
    verarbeitet,
    blockiert: 0,
    zusammenfassung: verarbeitet ? `${verarbeitet} Vorgänge gelöscht: ${zeilen.join(', ')}` : 'Nichts zu löschen.',
  };
}
