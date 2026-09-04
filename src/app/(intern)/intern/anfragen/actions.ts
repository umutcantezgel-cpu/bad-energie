'use server';

import { eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  anfrage as anfrageTabelle,
  anhang as anhangTabelle,
  dokument,
  kunde as kundeTabelle,
  loeschprotokoll,
} from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import { ladeInternAnfrage } from '@/lib/services/estimates';
import { ladeVorgang, csvZeile, csvKopfzeile, datenblattJson, type VorgangDaten } from '@/lib/services/dokument-eingabe';
import { ladeMatrix, ladeFoerderRegeln } from '@/lib/services/kalkulationsdaten';
import { rechneVorgang } from '@/lib/services/dokument-eingabe';
import { getStorage } from '@/lib/services/storage';
import { setzeVorgangsStatus, schreibeEreignis } from '@/lib/services/statusmaschine';
import type { AnfrageStatus } from '@/lib/types';
import { redirect } from 'next/navigation';

/** DSGVO Art. 17: Löschen einer Anfrage samt Anhängen, Dokumenten und Löschprotokoll-Eintrag. */
export async function loescheAnfrage(anfrageId: string): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  const db = await getDb();
  const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
  const a = anfragen[0];
  if (!a) return { ok: false, fehler: 'Anfrage nicht gefunden.' };

  if (session.rolle === 'bauleiter' && a.bearbeiterId && a.bearbeiterId !== session.benutzerId) {
    return { ok: false, fehler: 'Keine Berechtigung zum Löschen dieser Anfrage.' };
  }

  const [anhaenge, dokumente] = await Promise.all([
    db.select().from(anhangTabelle).where(eq(anhangTabelle.anfrageId, anfrageId)),
    db.select().from(dokument).where(eq(dokument.anfrageId, anfrageId)),
  ]);

  const storage = getStorage();
  for (const h of anhaenge) {
    await storage.del(h.blobPfad).catch(() => undefined);
    if (h.thumbBlobPfad) await storage.del(h.thumbBlobPfad).catch(() => undefined);
  }
  for (const d of dokumente) {
    await storage.del(d.blobPfad).catch(() => undefined);
  }

  const kundeId = a.kundeId;
  await db.delete(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId));

  if (kundeId) {
    const weitere = await db.select({ id: anfrageTabelle.id }).from(anfrageTabelle).where(eq(anfrageTabelle.kundeId, kundeId));
    if (weitere.length === 0) {
      await db.delete(kundeTabelle).where(inArray(kundeTabelle.id, [kundeId]));
    }
  }

  await db.insert(loeschprotokoll).values({
    ksNummer: a.ksNummer,
    geloeschtAm: new Date(),
    grund: `Manuelle Löschung durch ${session.name} (${session.rolle}) nach Art. 17 DSGVO.`,
  });

  return { ok: true };
}

/** DSGVO Art. 15: Datenauskunft als JSON */
export async function holeAuskunftJson(anfrageId: string): Promise<string> {
  const session = await verifySession();
  const dto = await ladeInternAnfrage(anfrageId);
  if (!dto) throw new Error('Anfrage nicht gefunden.');
  if (session.rolle === 'bauleiter' && dto.bearbeiter && dto.bearbeiter !== session.name) {
    throw new Error('Keine Berechtigung.');
  }
  return JSON.stringify(dto, null, 2);
}

/** CSV-Zeile für diese Anfrage im Altsystem-Format (16 Spalten) */
export async function holeCsvExport(anfrageId: string): Promise<string> {
  await verifySession();
  const daten = await ladeVorgang(anfrageId);
  if (!daten) throw new Error('Anfrage nicht gefunden.');
  const [matrix, regeln] = await Promise.all([ladeMatrix(), ladeFoerderRegeln()]);
  const ergebnis = rechneVorgang(daten, matrix, regeln);
  return `${csvKopfzeile()}\n${csvZeile(daten, ergebnis)}`;
}

/** Ändert den Status eines Vorgangs manuell */
export async function aendereStatus(
  anfrageId: string,
  neuerStatus: AnfrageStatus,
  grund = '',
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  const daten = await ladeVorgang(anfrageId);
  if (!daten) return { ok: false, fehler: 'Anfrage nicht gefunden.' };

  const db = await getDb();
  await db.update(anfrageTabelle).set({
    status: neuerStatus,
    verworfenAm: neuerStatus === 'verworfen' ? new Date() : daten.anfrage.verworfenAm,
    grundVerworfen: neuerStatus === 'verworfen' ? grund || 'Manuell verworfen.' : daten.anfrage.grundVerworfen,
  }).where(eq(anfrageTabelle.id, anfrageId));

  await schreibeEreignis({
    anfrageId,
    typ: `status:${neuerStatus}`,
    benutzerId: session.benutzerId,
    payload: { grund, alterStatus: daten.anfrage.status },
  });

  return { ok: true };
}
