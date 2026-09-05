import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { benutzer } from '@/db/schema';
import type { AnmeldeErgebnis, Rolle, SessionInfo } from '../types';
import { dummyHash, pinGueltig, pinPruefen } from './pin';
import { loescheLimit, pruefeLimit, schluesselHash } from './ratelimit';
import {
  erstelleSitzung, leseSitzungsCookie, loescheSitzungsCookie, setzeSitzungsCookie, sitzungAusId,
  widerrufeAlleSitzungen, widerrufeSitzung,
} from './session';

/**
 * PIN-Anmeldung und Sitzungsprüfung des Intern-Bereichs.
 * Fachregel: Sperre nach fünf Fehlversuchen für 15 Minuten, Rate-Limit je IP, Dummy-Vergleich bei unbekannter E-Mail.
 */

export const MAX_FEHLVERSUCHE = 5;
export const SPERRE_MS = 15 * 60 * 1000;
/** Anmeldeversuche je IP im Zehnminutenfenster. */
export const IP_VERSUCHE = 20;
export const IP_FENSTER_MS = 10 * 60 * 1000;
/**
 * Anmeldeversuche je E-Mail-Adresse in der Stunde. Der IP-Zähler allein greift nicht,
 * wenn die Versuche über viele Adressen verteilt kommen; die Kontosperre nach fünf
 * Fehlversuchen wäre dann ein Werkzeug, um einen Kollegen auszusperren. Der
 * Adresszähler deckelt genau das, ohne den Zugang nach Ablauf der Sperre zu verbauen.
 */
export const EMAIL_VERSUCHE = 30;
export const EMAIL_FENSTER_MS = 60 * 60 * 1000;

const FEHLER_ALLGEMEIN = 'E-Mail oder PIN stimmt nicht.';

export type AnmeldeEingabe = { email: string; pin: string; ipHash?: string | null; userAgent?: string | null };

/**
 * Prüft E-Mail und PIN und legt bei Erfolg eine Sitzung an.
 * Liefert die Klartext-Sitzungs-ID; das Cookie setzt der Aufrufer (Server Action oder Route Handler).
 */
export async function anmeldenMitPin(
  eingabe: AnmeldeEingabe,
  jetzt: Date = new Date(),
): Promise<{ ok: true; sitzungId: string; laeuftAbAm: Date; session: SessionInfo } | { ok: false; fehler: string }> {
  const db = await getDb();
  const email = eingabe.email.trim().toLowerCase();
  const pin = eingabe.pin.trim();

  if (eingabe.ipHash) {
    const limit = await pruefeLimit(`anmeldung:ip:${eingabe.ipHash}`, IP_VERSUCHE, IP_FENSTER_MS, jetzt);
    if (!limit.erlaubt) return { ok: false, fehler: 'Zu viele Versuche. Bitte in einigen Minuten erneut probieren.' };
  }
  if (!email || !pinGueltig(pin)) {
    pinPruefen(pin || '000000', dummyHash());
    return { ok: false, fehler: FEHLER_ALLGEMEIN };
  }

  // Zähler je Adresse, auch für unbekannte Adressen: sonst zählt nur die IP.
  const emailSchluessel = `anmeldung:mail:${schluesselHash(email, jetzt)}`;
  const emailLimit = await pruefeLimit(emailSchluessel, EMAIL_VERSUCHE, EMAIL_FENSTER_MS, jetzt);
  if (!emailLimit.erlaubt) {
    return { ok: false, fehler: 'Zu viele Versuche. Bitte in einigen Minuten erneut probieren.' };
  }

  const zeilen = await db.select().from(benutzer).where(eq(sql`lower(${benutzer.email})`, email)).limit(1);
  const person = zeilen[0];
  if (!person) {
    pinPruefen(pin, dummyHash());
    return { ok: false, fehler: FEHLER_ALLGEMEIN };
  }
  if (!person.aktiv) {
    pinPruefen(pin, dummyHash());
    return { ok: false, fehler: FEHLER_ALLGEMEIN };
  }
  // Eine abgelaufene Sperre hält nicht nach: der Zähler wird beim nächsten Fehlversuch neu
  // gezählt und ein gültiges PIN-Login setzt Zähler und Sperre unten wieder zurück.
  if (person.gesperrtBis && person.gesperrtBis.getTime() > jetzt.getTime()) {
    return { ok: false, fehler: 'Zugang ist für 15 Minuten gesperrt.' };
  }

  if (!pinPruefen(pin, person.pinHash)) {
    const fehlversuche = (person.gesperrtBis && person.gesperrtBis.getTime() <= jetzt.getTime() ? 0 : person.fehlversuche) + 1;
    const gesperrtBis = fehlversuche >= MAX_FEHLVERSUCHE ? new Date(jetzt.getTime() + SPERRE_MS) : null;
    await db.update(benutzer)
      .set({ fehlversuche: gesperrtBis ? 0 : fehlversuche, gesperrtBis })
      .where(eq(benutzer.id, person.id));
    if (gesperrtBis) return { ok: false, fehler: 'Zugang ist für 15 Minuten gesperrt.' };
    return { ok: false, fehler: FEHLER_ALLGEMEIN };
  }

  await db.update(benutzer).set({ fehlversuche: 0, gesperrtBis: null, letzterLoginAm: jetzt }).where(eq(benutzer.id, person.id));
  if (eingabe.ipHash) await loescheLimit(`anmeldung:ip:${eingabe.ipHash}`);
  await loescheLimit(emailSchluessel);
  const { id, laeuftAbAm } = await erstelleSitzung(person.id, jetzt, { ipHash: eingabe.ipHash, userAgent: eingabe.userAgent });
  return {
    ok: true,
    sitzungId: id,
    laeuftAbAm,
    session: {
      benutzerId: person.id,
      name: person.name,
      rolle: person.rolle as Rolle,
      funktion: person.funktion,
      signaturMail: person.signaturMail || person.email,
    },
  };
}

/** Anmeldung inklusive Cookie (Server Action, Route Handler). */
export async function anmelden(eingabe: AnmeldeEingabe, jetzt: Date = new Date()): Promise<AnmeldeErgebnis> {
  const ergebnis = await anmeldenMitPin(eingabe, jetzt);
  if (!ergebnis.ok) return { ok: false, fehler: ergebnis.fehler };
  await setzeSitzungsCookie(ergebnis.sitzungId, ergebnis.laeuftAbAm);
  return { ok: true };
}

/** Sitzung ohne Redirect (null, wenn nicht angemeldet). Innerhalb einer Anfrage gecacht. */
export const aktuelleSession = cache(async (): Promise<SessionInfo | null> => {
  const id = await leseSitzungsCookie();
  if (!id) return null;
  return sitzungAusId(id, new Date());
});

/** Liest die Sitzung aus dem Cookie; leitet ohne gültige Sitzung nach /intern um. */
export async function verifySession(): Promise<SessionInfo> {
  const session = await aktuelleSession();
  if (!session) redirect('/intern');
  return session;
}

/** Variante für Route Handler: liefert null statt Redirect (der Handler antwortet mit 401). */
export async function verifySessionApi(): Promise<SessionInfo | null> {
  return aktuelleSession();
}

export async function abmelden(): Promise<void> {
  const id = await leseSitzungsCookie();
  if (id) await widerrufeSitzung(id);
  await loescheSitzungsCookie();
}

/** Deaktiviert einen Benutzer und widerruft alle seine Sitzungen. */
export async function deaktiviereBenutzer(benutzerId: string, jetzt: Date = new Date()): Promise<void> {
  const db = await getDb();
  await db.update(benutzer).set({ aktiv: false }).where(eq(benutzer.id, benutzerId));
  await widerrufeAlleSitzungen(benutzerId, jetzt);
}

/** Rollenregel 3.3: chef gibt alles frei, bauleiter nur eigene Anfragen, buero nie. */
export function darfFreigeben(session: SessionInfo, anfrage: { bearbeiterId: string | null }): boolean {
  if (session.rolle === 'chef') return true;
  if (session.rolle === 'bauleiter') return anfrage.bearbeiterId === session.benutzerId;
  return false;
}

/** Leseregel: bauleiter sieht nur eigene Anfragen, chef und buero alle. */
export function darfSehen(session: SessionInfo, anfrage: { bearbeiterId: string | null }): boolean {
  if (session.rolle === 'bauleiter') return anfrage.bearbeiterId === session.benutzerId || anfrage.bearbeiterId === null;
  return true;
}
