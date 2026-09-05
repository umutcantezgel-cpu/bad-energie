import 'server-only';
import { createHash } from 'node:crypto';
import { lt, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { rateLimit } from '@/db/schema';
import { plusTage, tagesBucket } from './zeit';

/**
 * Zähler mit gleitendem Fenster in der Datenbank (serverless-tauglich, kein Prozess-Singleton).
 * IP-Adressen werden nur als sha256(ip + Tagessalz) gespeichert.
 */

export type LimitErgebnis = { erlaubt: boolean; zaehler: number; max: number };

function pfeffer(): string {
  return process.env.SESSION_SECRET ?? 'entwicklungs-pfeffer-bad-und-energie';
}

/** Tagessalz, damit ein IP-Hash nach einem Tag nicht mehr zuzuordnen ist. */
export function tagesSalz(jetzt: Date): string {
  return `${pfeffer()}:${tagesBucket(jetzt)}`;
}

/**
 * Gesalzener Kurzhash eines Zählerschlüssels (IP, E-Mail). Rohwerte gehören nie in die
 * Tabelle `rate_limit`: sie wäre sonst ein Personenverzeichnis mit Zeitstempel.
 */
export function schluesselHash(wert: string, jetzt: Date): string {
  return createHash('sha256').update(`${tagesSalz(jetzt)}:${wert}`).digest('hex').slice(0, 32);
}

export function ipHash(ip: string, jetzt: Date): string {
  return schluesselHash(ip, jetzt);
}

/** Client-IP aus den Vercel-Headern (x-real-ip, sonst erster Eintrag von x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  const weiter = headers.get('x-forwarded-for');
  if (weiter) return weiter.split(',')[0].trim();
  return 'unbekannt';
}

/**
 * Erhöht den Zähler für `schluessel` im Fenster `fensterMs` und meldet, ob `max` überschritten ist.
 * Ein abgelaufenes Fenster wird in derselben Anweisung zurückgesetzt.
 */
export async function pruefeLimit(schluessel: string, max: number, fensterMs: number, jetzt: Date = new Date()): Promise<LimitErgebnis> {
  const db = await getDb();
  const grenze = new Date(jetzt.getTime() - fensterMs);
  const zeilen = await db
    .insert(rateLimit)
    .values({ schluessel, fensterBeginn: jetzt, zaehler: 1 })
    .onConflictDoUpdate({
      target: rateLimit.schluessel,
      set: {
        zaehler: sql`case when ${rateLimit.fensterBeginn} <= ${grenze} then 1 else ${rateLimit.zaehler} + 1 end`,
        fensterBeginn: sql`case when ${rateLimit.fensterBeginn} <= ${grenze} then ${jetzt} else ${rateLimit.fensterBeginn} end`,
      },
    })
    .returning({ zaehler: rateLimit.zaehler });
  const zaehler = zeilen[0]?.zaehler ?? 1;
  return { erlaubt: zaehler <= max, zaehler, max };
}

/** Liest den aktuellen Stand, ohne zu zählen. */
export async function standLimit(schluessel: string, fensterMs: number, jetzt: Date = new Date()): Promise<number> {
  const db = await getDb();
  const zeilen = await db.select().from(rateLimit).where(sql`${rateLimit.schluessel} = ${schluessel}`).limit(1);
  const zeile = zeilen[0];
  if (!zeile) return 0;
  if (zeile.fensterBeginn.getTime() <= jetzt.getTime() - fensterMs) return 0;
  return zeile.zaehler;
}

/** Setzt einen Zähler zurück (nach erfolgreichem Login). */
export async function loescheLimit(schluessel: string): Promise<void> {
  const db = await getDb();
  await db.delete(rateLimit).where(sql`${rateLimit.schluessel} = ${schluessel}`);
}

/** Entfernt Zähler, deren Fenster älter als sieben Tage ist. */
export async function raeumeLimitsAuf(jetzt: Date = new Date()): Promise<number> {
  const db = await getDb();
  const geloescht = await db.delete(rateLimit).where(lt(rateLimit.fensterBeginn, plusTage(jetzt, -7))).returning({ schluessel: rateLimit.schluessel });
  return geloescht.length;
}
