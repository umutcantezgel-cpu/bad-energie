import 'server-only';

/**
 * Zeitrechnung in Europe/Berlin ohne Bibliothek (Intl.DateTimeFormat).
 * Jede Fälligkeit wird als absoluter Zeitpunkt gespeichert; die Wanduhr ist immer Berlin.
 */

export type Clock = { now(): Date };

/** Standarduhr (Systemzeit). */
export const systemUhr: Clock = { now: () => new Date() };

/** Feste Uhr für Tests. */
export function testUhr(start: Date | string): Clock & { setze(zeit: Date | string): void } {
  let jetzt = new Date(start);
  return {
    now: () => new Date(jetzt),
    setze(zeit: Date | string) { jetzt = new Date(zeit); },
  };
}

export const ZEITZONE = 'Europe/Berlin';

const teileFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZEITZONE,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
});

export type BerlinTeile = { jahr: number; monat: number; tag: number; stunde: number; minute: number; sekunde: number };

/** Wanduhr-Bestandteile eines Zeitpunkts in Europe/Berlin. */
export function berlinTeile(d: Date): BerlinTeile {
  const teile = teileFormat.formatToParts(d);
  const lies = (typ: Intl.DateTimeFormatPartTypes): number => Number(teile.find((t) => t.type === typ)?.value ?? '0');
  // en-GB liefert 24 für Mitternacht; auf 0 normalisieren.
  const stunde = lies('hour') % 24;
  return { jahr: lies('year'), monat: lies('month'), tag: lies('day'), stunde, minute: lies('minute'), sekunde: lies('second') };
}

/** Abstand der Berliner Wanduhr zu UTC in Minuten (60 im Winter, 120 im Sommer). */
function offsetMinuten(d: Date): number {
  const t = berlinTeile(d);
  const alsUtc = Date.UTC(t.jahr, t.monat - 1, t.tag, t.stunde, t.minute, t.sekunde);
  return Math.round((alsUtc - Math.floor(d.getTime() / 1000) * 1000) / 60000);
}

/** Zeitpunkt aus einer Berliner Wanduhrangabe (Sommer- und Winterzeit werden aufgelöst). */
export function berlinZeitpunkt(jahr: number, monat: number, tag: number, stunde: number, minute: number, sekunde = 0): Date {
  const grob = Date.UTC(jahr, monat - 1, tag, stunde, minute, sekunde);
  let ms = grob - offsetMinuten(new Date(grob)) * 60000;
  ms = grob - offsetMinuten(new Date(ms)) * 60000;
  return new Date(ms);
}

const HHMM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function zerlegeUhrzeit(uhrzeit: string): { stunde: number; minute: number } {
  const treffer = HHMM.exec(uhrzeit.trim());
  if (!treffer) return { stunde: 18, minute: 0 };
  return { stunde: Number(treffer[1]), minute: Number(treffer[2]) };
}

/**
 * Nächster Versandzeitpunkt: heute um `uhrzeit` (Berlin), wenn dieser Zeitpunkt noch vor uns liegt,
 * sonst sofort. Damit ist der Abendpuffer und das Nachholen derselbe Mechanismus.
 */
export function naechsteVersandzeit(now: Date, uhrzeit: string): Date {
  const { stunde, minute } = zerlegeUhrzeit(uhrzeit);
  const heute = berlinTeile(now);
  const ziel = berlinZeitpunkt(heute.jahr, heute.monat, heute.tag, stunde, minute, 0);
  return ziel.getTime() > now.getTime() ? ziel : new Date(now);
}

/** Datum in deutscher Schreibweise: 04.09.2026. */
export function datumDeutsch(d: Date): string {
  const t = berlinTeile(d);
  return `${String(t.tag).padStart(2, '0')}.${String(t.monat).padStart(2, '0')}.${t.jahr}`;
}

/** Datum und Uhrzeit: 04.09.2026, 18:00. */
export function datumZeitDeutsch(d: Date): string {
  const t = berlinTeile(d);
  return `${datumDeutsch(d)}, ${String(t.stunde).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

/** ISO-Datum in Berlin: 2026-09-04. Slot für Tagesjobs. */
export function tagesBucket(d: Date): string {
  const t = berlinTeile(d);
  return `${t.jahr}-${String(t.monat).padStart(2, '0')}-${String(t.tag).padStart(2, '0')}`;
}

/** Minutenbucket in Berlin: 2026-09-04T18:00. Slot für den Versandjob. */
export function minutenBucket(d: Date): string {
  const t = berlinTeile(d);
  return `${tagesBucket(d)}T${String(t.stunde).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

/** Kalendertage addieren (Wanduhrzeit bleibt erhalten, auch über die Zeitumstellung). */
export function plusTage(d: Date, tage: number): Date {
  const t = berlinTeile(d);
  return berlinZeitpunkt(t.jahr, t.monat, t.tag + tage, t.stunde, t.minute, t.sekunde);
}

export function plusMinuten(d: Date, minuten: number): Date {
  return new Date(d.getTime() + minuten * 60000);
}

/** Monate abziehen (Speicherfrist). */
export function minusMonate(d: Date, monate: number): Date {
  const t = berlinTeile(d);
  return berlinZeitpunkt(t.jahr, t.monat - monate, t.tag, t.stunde, t.minute, t.sekunde);
}

/** Beginn des Berliner Kalendertages. */
export function tagesBeginn(d: Date): Date {
  const t = berlinTeile(d);
  return berlinZeitpunkt(t.jahr, t.monat, t.tag, 0, 0, 0);
}

/** Ende des Berliner Kalendertages (23:59:59). */
export function tagesEnde(d: Date): Date {
  const t = berlinTeile(d);
  return berlinZeitpunkt(t.jahr, t.monat, t.tag, 23, 59, 59);
}

/** Jahr in Berlin (Nummernkreis). */
export function jahrVon(d: Date): number {
  return berlinTeile(d).jahr;
}
