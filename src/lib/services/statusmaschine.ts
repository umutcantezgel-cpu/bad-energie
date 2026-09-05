import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage, ereignis, versandauftrag } from '@/db/schema';
import type { AnfrageStatus, VersandStatus } from '../types';

/**
 * Statusmaschine für Vorgang und Versandauftrag (Plan 4.2).
 * Jede Transition läuft als `UPDATE … WHERE status = <erwartet> RETURNING` (optimistische Sperre)
 * und schreibt ein Ereignis.
 */

export const VORGANG_UEBERGAENGE: Record<AnfrageStatus, AnfrageStatus[]> = {
  eingang: ['geplant', 'blockiert', 'verworfen'],
  geplant: ['blockiert', 'versendet', 'verworfen'],
  blockiert: ['geplant', 'verworfen'],
  versendet: ['antwort', 'erinnert', 'verworfen'],
  erinnert: ['antwort', 'verworfen'],
  antwort: ['termin', 'verworfen'],
  termin: ['verworfen'],
  verworfen: [],
};

export const VERSAND_UEBERGAENGE: Record<VersandStatus, VersandStatus[]> = {
  // 'versendet' direkt aus 'entwurf': Sofortversand von der Baustelle (Freigabe und Versand in einem Schritt).
  entwurf: ['freigegeben', 'versendet', 'storniert'],
  freigegeben: ['versendet', 'fehlgeschlagen', 'storniert'],
  fehlgeschlagen: ['freigegeben', 'versendet', 'storniert'],
  versendet: [],
  storniert: [],
};

export function istVorgangsUebergangErlaubt(von: AnfrageStatus, nach: AnfrageStatus): boolean {
  return VORGANG_UEBERGAENGE[von]?.includes(nach) ?? false;
}

export function istVersandUebergangErlaubt(von: VersandStatus, nach: VersandStatus): boolean {
  return VERSAND_UEBERGAENGE[von]?.includes(nach) ?? false;
}

export type EreignisEingabe = { anfrageId: string | null; typ: string; benutzerId?: string | null; payload?: Record<string, unknown> };

/** Schreibt ein Ereignis. PIN und Token gehören nie in den Payload. */
export async function schreibeEreignis(e: EreignisEingabe): Promise<void> {
  const db = await getDb();
  await db.insert(ereignis).values({
    anfrageId: e.anfrageId,
    typ: e.typ,
    benutzerId: e.benutzerId ?? null,
    payload: e.payload ?? {},
  });
}

export type StatusFelder = Partial<{
  versendetAm: Date | null;
  wiedervorlageAm: Date | null;
  erinnertAm: Date | null;
  antwortAm: Date | null;
  terminAm: Date | null;
  verworfenAm: Date | null;
  grundVerworfen: string | null;
  bemerkung: string;
}>;

/**
 * Setzt den Vorgangsstatus, wenn der aktuelle Status einem der erwarteten entspricht.
 * Liefert false, wenn ein anderer Lauf schneller war.
 */
export async function setzeVorgangsStatus(
  anfrageId: string,
  erwartet: AnfrageStatus | AnfrageStatus[],
  neu: AnfrageStatus,
  felder: StatusFelder = {},
  ereignisDaten: { benutzerId?: string | null; typ?: string; payload?: Record<string, unknown> } = {},
): Promise<boolean> {
  const db = await getDb();
  const alleErwarteten = Array.isArray(erwartet) ? erwartet : [erwartet];
  // Nur die Ausgangszustände zählen, aus denen der Übergang erlaubt ist; steht keiner zur Wahl, ist es ein Fehler.
  const erwarteteListe = alleErwarteten.filter((von) => von === neu || istVorgangsUebergangErlaubt(von, neu));
  if (erwarteteListe.length === 0) {
    throw new Error(`Übergang ${alleErwarteten.join('/')} → ${neu} ist nicht erlaubt.`);
  }
  for (const von of erwarteteListe) {
    if (von !== neu && !istVorgangsUebergangErlaubt(von, neu)) {
      throw new Error(`Übergang ${von} → ${neu} ist nicht erlaubt.`);
    }
  }
  const zeilen = await db.update(anfrage)
    .set({ status: neu, geaendertAm: new Date(), ...felder })
    .where(and(eq(anfrage.id, anfrageId), inArray(anfrage.status, erwarteteListe)))
    .returning({ id: anfrage.id });
  if (zeilen.length === 0) return false;
  await schreibeEreignis({
    anfrageId,
    typ: ereignisDaten.typ ?? `status:${neu}`,
    benutzerId: ereignisDaten.benutzerId ?? null,
    payload: { von: erwarteteListe, nach: neu, ...(ereignisDaten.payload ?? {}) },
  });
  return true;
}

export type VersandFelder = Partial<{
  faelligAm: Date | null;
  naechsterVersuchAm: Date | null;
  freigegebenVon: string | null;
  freigegebenAm: Date | null;
  versendetAm: Date | null;
  zugestelltAm: Date | null;
  empfaenger: string;
  betreff: string;
  messageId: string | null;
  inReplyTo: string | null;
  resendId: string | null;
  fehler: string | null;
  versuch: number;
  dokumentIds: string[];
}>;

/** Setzt den Status eines Versandauftrags mit optimistischer Sperre. */
export async function setzeVersandStatus(
  auftragId: string,
  erwartet: VersandStatus | VersandStatus[],
  neu: VersandStatus,
  felder: VersandFelder = {},
): Promise<boolean> {
  const db = await getDb();
  const erwarteteListe = Array.isArray(erwartet) ? erwartet : [erwartet];
  for (const von of erwarteteListe) {
    if (von !== neu && !istVersandUebergangErlaubt(von, neu)) {
      throw new Error(`Versandübergang ${von} → ${neu} ist nicht erlaubt.`);
    }
  }
  const zeilen = await db.update(versandauftrag)
    .set({ status: neu, ...felder })
    .where(and(eq(versandauftrag.id, auftragId), inArray(versandauftrag.status, erwarteteListe)))
    .returning({ id: versandauftrag.id });
  return zeilen.length > 0;
}
