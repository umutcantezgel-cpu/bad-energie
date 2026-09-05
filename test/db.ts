/**
 * Testhelfer für Läufe gegen eine frische PGlite-Datenbank im Speicher (Plan AP7).
 *
 * `frischeDb()` wirft die Verbindung des Prozesses weg, migriert und seedet neu und legt
 * einen Benutzer an, damit Fremdschlüssel (anfrage.bearbeiter_id) tragen. Zusätzlich stehen
 * ein Fake-Mailer (sammelt Mails im Speicher, prüft aber die echten Kopfzeilenregeln) und
 * eine Fake-Ablage (Map statt Platte) bereit.
 */
import { randomUUID } from 'node:crypto';
import { getDb } from '@/db/client';
import { migrieren } from '@/db/migrate';
import { seeden } from '@/db/seed';
import { benutzer } from '@/db/schema';
import { pinHashen } from '@/lib/services/pin';
import { pruefeMail, setzeMailer, type Mail, type Mailer } from '@/lib/services/mail';
import { setzeStorage, type Storage, type StorageObjekt } from '@/lib/services/storage';
import type { Rolle, SessionInfo } from '@/lib/types';

type MitDb = typeof globalThis & { __badEnergieDb?: unknown };

export const TEST_PIN = '123456';

export type FrischeDbOptionen = {
  /** Demo-Preissatz einspielen (Matrixzeilen gefüllt, Standardfördersatz 55 %). */
  demoPreise?: boolean;
  /** Benutzer mit Rolle `chef` anlegen (Vorgabe). Mit `rolle` lässt sich die Rolle ändern. */
  chef?: boolean;
  rolle?: Rolle;
  name?: string;
  email?: string;
};

export type FrischeDbErgebnis = { benutzerId: string; session: SessionInfo };

/**
 * Frische Datenbank im Speicher: Verbindung zurücksetzen, migrieren, seeden, Benutzer anlegen.
 * Der Aufrufer setzt die Sitzung selbst (die Route wird mit gemocktem `auth` aufgerufen).
 */
export async function frischeDb(optionen: FrischeDbOptionen = {}): Promise<FrischeDbErgebnis> {
  (globalThis as MitDb).__badEnergieDb = undefined;
  process.env.DATABASE_URL = 'pglite://memory';

  await migrieren();
  await seeden({ demoPreise: optionen.demoPreise ?? false });

  const rolle: Rolle = optionen.rolle ?? (optionen.chef === false ? 'buero' : 'chef');
  const benutzerId = randomUUID();
  const name = optionen.name ?? 'Testmeister';
  const email = optionen.email ?? `${rolle}@bad-energie.de`;
  const db = await getDb();
  await db.insert(benutzer).values({
    id: benutzerId,
    name,
    email,
    pinHash: pinHashen(TEST_PIN),
    rolle,
    funktion: rolle === 'chef' ? 'Geschäftsführer' : 'Mitarbeiter',
    signaturMail: email,
    aktiv: true,
  });

  return {
    benutzerId,
    session: { benutzerId, name, rolle, funktion: rolle === 'chef' ? 'Geschäftsführer' : 'Mitarbeiter', signaturMail: email },
  };
}

/** Legt einen weiteren Benutzer an (etwa für die Rollenprüfung „buero darf nicht freigeben“). */
export async function legeBenutzerAn(rolle: Rolle, name = `Test ${rolle}`): Promise<SessionInfo> {
  const db = await getDb();
  const benutzerId = randomUUID();
  const email = `${rolle}-${benutzerId.slice(0, 8)}@bad-energie.de`;
  await db.insert(benutzer).values({
    id: benutzerId, name, email, pinHash: pinHashen(TEST_PIN), rolle,
    funktion: rolle === 'chef' ? 'Geschäftsführer' : 'Mitarbeiter', signaturMail: email, aktiv: true,
  });
  return { benutzerId, name, rolle, funktion: rolle === 'chef' ? 'Geschäftsführer' : 'Mitarbeiter', signaturMail: email };
}

// ---------------------------------------------------------------------------
// Fake-Mailer
// ---------------------------------------------------------------------------

export type GesendeteMail = Mail & { id: string };

export type FakeMailer = {
  mailer: Mailer;
  mails: GesendeteMail[];
  /** Mails einer Adresse (etwa der Büroadresse) oder eines Tags. */
  an(adresse: string): GesendeteMail[];
  mitTag(tag: string): GesendeteMail[];
  leeren(): void;
  /** Jeder Sendeversuch scheitert mit diesem Fehler (Backoff-Pfad); `null` schaltet zurück. */
  scheitereImmer(fehler: string | null): void;
};

/** Mailer im Speicher; prüft dieselben Kopfzeilenregeln wie die echten Adapter (Regel 8). */
export function fakeMailer(): FakeMailer {
  const mails: GesendeteMail[] = [];
  let fehlerText: string | null = null;
  const mailer: Mailer = {
    async senden(m) {
      pruefeMail(m);
      if (fehlerText) throw new Error(fehlerText);
      const id = m.idempotencyKey ?? randomUUID();
      mails.push({ ...m, id });
      return { id };
    },
  };
  setzeMailer(mailer);
  return {
    mailer,
    mails,
    an: (adresse) => mails.filter((m) => m.an === adresse),
    mitTag: (tag) => mails.filter((m) => m.tag === tag),
    leeren: () => { mails.length = 0; },
    scheitereImmer: (fehler) => { fehlerText = fehler; },
  };
}

// ---------------------------------------------------------------------------
// Fake-Ablage
// ---------------------------------------------------------------------------

export type FakeStorage = { storage: Storage; dateien: Map<string, StorageObjekt> };

/** Ablage im Speicher statt auf der Platte (kein Schreiben nach ./data/blob im Test). */
export function fakeStorage(): FakeStorage {
  const dateien = new Map<string, StorageObjekt>();
  const storage: Storage = {
    async put(pfad, daten, mime) { dateien.set(pfad, { daten, mime }); },
    async get(pfad) { return dateien.get(pfad) ?? null; },
    async del(pfad) { dateien.delete(pfad); },
  };
  setzeStorage(storage);
  return { storage, dateien };
}

/** Setzt Mailer und Ablage auf die echten Adapter zurück (nach dem Testlauf). */
export function adapterZuruecksetzen(): void {
  setzeMailer(undefined);
  setzeStorage(undefined);
}
