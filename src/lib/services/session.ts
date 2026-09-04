import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { benutzer, sitzung } from '@/db/schema';
import type { Rolle, SessionInfo } from '../types';

/**
 * Opake Serversitzung. Im Cookie steht nur eine Zufalls-ID, in der Datenbank nur deren Hash.
 * Absolut 12 Stunden, Leerlauf 2 Stunden gleitend.
 */

export const ABSOLUT_MS = 12 * 60 * 60 * 1000;
export const LEERLAUF_MS = 2 * 60 * 60 * 1000;
/** letzte_nutzung_am wird höchstens alle fünf Minuten geschrieben. */
export const SCHREIB_INTERVALL_MS = 5 * 60 * 1000;

const ENTWICKLUNGS_PFEFFER = 'entwicklungs-pfeffer-bad-und-energie';

function pfeffer(): string {
  const geheim = process.env.SESSION_SECRET;
  if (geheim && geheim.length >= 32) return geheim;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET fehlt oder ist zu kurz.');
  return ENTWICKLUNGS_PFEFFER;
}

export function sitzungHash(id: string): string {
  return createHash('sha256').update(pfeffer() + id).digest('hex');
}

function appUrl(): string {
  return process.env.APP_URL ?? 'http://localhost:3000';
}

/** `__Host-sitzung` nur bei https (dann zwingend secure, path=/, kein domain). */
export function cookieName(): string {
  return appUrl().startsWith('https://') ? '__Host-sitzung' : 'sitzung';
}

export function cookieSicher(): boolean {
  return appUrl().startsWith('https://');
}

export type SitzungMeta = { ipHash?: string | null; userAgent?: string | null };

/** Legt eine Sitzung an und liefert die Klartext-ID (nur diese gehört ins Cookie). */
export async function erstelleSitzung(benutzerId: string, jetzt: Date, meta: SitzungMeta = {}): Promise<{ id: string; laeuftAbAm: Date }> {
  const db = await getDb();
  const id = randomBytes(32).toString('base64url');
  const laeuftAbAm = new Date(jetzt.getTime() + ABSOLUT_MS);
  await db.insert(sitzung).values({
    idHash: sitzungHash(id),
    benutzerId,
    erstelltAm: jetzt,
    laeuftAbAm,
    letzteNutzungAm: jetzt,
    ipHash: meta.ipHash ?? null,
    userAgent: (meta.userAgent ?? '').slice(0, 300) || null,
  });
  return { id, laeuftAbAm };
}

/**
 * Lädt die Sitzung zur Klartext-ID, prüft Ablauf und Leerlauf und verlängert gleitend.
 * Liefert null, wenn die Sitzung fehlt, widerrufen, abgelaufen oder der Benutzer inaktiv ist.
 */
export async function sitzungAusId(id: string, jetzt: Date): Promise<SessionInfo | null> {
  const db = await getDb();
  const zeilen = await db
    .select({
      idHash: sitzung.idHash,
      laeuftAbAm: sitzung.laeuftAbAm,
      letzteNutzungAm: sitzung.letzteNutzungAm,
      widerrufenAm: sitzung.widerrufenAm,
      benutzerId: benutzer.id,
      name: benutzer.name,
      rolle: benutzer.rolle,
      funktion: benutzer.funktion,
      signaturMail: benutzer.signaturMail,
      email: benutzer.email,
      aktiv: benutzer.aktiv,
    })
    .from(sitzung)
    .innerJoin(benutzer, eq(benutzer.id, sitzung.benutzerId))
    .where(eq(sitzung.idHash, sitzungHash(id)))
    .limit(1);
  const zeile = zeilen[0];
  if (!zeile) return null;
  if (zeile.widerrufenAm) return null;
  if (!zeile.aktiv) return null;
  if (zeile.laeuftAbAm.getTime() <= jetzt.getTime()) return null;
  if (jetzt.getTime() - zeile.letzteNutzungAm.getTime() > LEERLAUF_MS) return null;
  if (jetzt.getTime() - zeile.letzteNutzungAm.getTime() > SCHREIB_INTERVALL_MS) {
    await db.update(sitzung).set({ letzteNutzungAm: jetzt }).where(eq(sitzung.idHash, zeile.idHash));
  }
  return {
    benutzerId: zeile.benutzerId,
    name: zeile.name,
    rolle: zeile.rolle as Rolle,
    funktion: zeile.funktion,
    signaturMail: zeile.signaturMail || zeile.email,
  };
}

export async function widerrufeSitzung(id: string, jetzt: Date = new Date()): Promise<void> {
  const db = await getDb();
  await db.update(sitzung).set({ widerrufenAm: jetzt }).where(eq(sitzung.idHash, sitzungHash(id)));
}

/** Alle Sitzungen eines Benutzers widerrufen (Deaktivierung, Vorfall). */
export async function widerrufeAlleSitzungen(benutzerId: string, jetzt: Date = new Date()): Promise<number> {
  const db = await getDb();
  const zeilen = await db.update(sitzung).set({ widerrufenAm: jetzt })
    .where(and(eq(sitzung.benutzerId, benutzerId), isNull(sitzung.widerrufenAm)))
    .returning({ idHash: sitzung.idHash });
  return zeilen.length;
}

/** Entfernt abgelaufene und widerrufene Sitzungen (Job `bereinigung`). */
export async function raeumeSitzungenAuf(jetzt: Date = new Date()): Promise<number> {
  const db = await getDb();
  const zeilen = await db.delete(sitzung)
    .where(or(lt(sitzung.laeuftAbAm, jetzt), sql`${sitzung.widerrufenAm} is not null`))
    .returning({ idHash: sitzung.idHash });
  return zeilen.length;
}

// ---------------------------------------------------------------------------
// Cookie-Zugriff (nur in Server Actions und Route Handlern schreibbar)
// ---------------------------------------------------------------------------

export async function leseSitzungsCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(cookieName())?.value ?? null;
}

export async function setzeSitzungsCookie(id: string, laeuftAbAm: Date): Promise<void> {
  const store = await cookies();
  store.set(cookieName(), id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSicher(),
    path: '/',
    expires: laeuftAbAm,
  });
}

export async function loescheSitzungsCookie(): Promise<void> {
  const store = await cookies();
  store.set(cookieName(), '', { httpOnly: true, sameSite: 'lax', secure: cookieSicher(), path: '/', maxAge: 0 });
}
