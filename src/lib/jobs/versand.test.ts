/**
 * Versandjob gegen die Datenbank: Wiederholung nach einem Fehlversuch, endgültiges Aufgeben
 * nach `MAX_VERSUCHE` und Fehlerisolierung je Auftrag.
 *
 * PDF ist gemockt (kein Chrome im Testlauf), Mailer und Ablage sind Fakes aus `test/db.ts`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/pdf', () => ({
  renderPdf: async () => Buffer.from('%PDF-1.4 test'),
  pdfSeitenzahl: () => 2,
  lokalerChromePfad: () => null,
  schliesseBrowser: async () => undefined,
  PDF_TIMEOUT_MS: 20_000,
}));

/** Aufträge, deren Versand mit einem harten Fehler abbricht (etwa Chromium startet nicht). */
const { abbrechende } = vi.hoisted(() => ({ abbrechende: new Set<string>() }));

vi.mock('@/lib/services/versand', async (importOriginal) => {
  const echt = await importOriginal<typeof import('@/lib/services/versand')>();
  return {
    ...echt,
    versendeAuftrag: async (auftragId: string, optionen?: { jetzt?: Date }) => {
      if (abbrechende.has(auftragId)) throw new Error('Chromium ist nicht startbar.');
      return echt.versendeAuftrag(auftragId, optionen);
    },
  };
});

import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, versandauftrag } from '@/db/schema';
import { freigeben } from '@/lib/services/estimates';
import { BACKOFF_MINUTEN, MAX_VERSUCHE } from '@/lib/services/versand';
import { plusMinuten } from '@/lib/services/zeit';
import { versandJob } from './versand';
import { versandfertigerVorgang } from './testfall';
import { fakeMailer, fakeStorage, frischeDb, type FakeMailer } from '../../../test/db';
import type { SessionInfo } from '@/lib/types';

let post: FakeMailer;
let session: SessionInfo;

beforeEach(async () => {
  ({ session } = await frischeDb({ demoPreise: true }));
  post = fakeMailer();
  fakeStorage();
  abbrechende.clear();
});

/** Gibt den Erstkontakt für den Abendversand frei und liefert Auftrag und Fälligkeit. */
async function freigegeben(anfrageId: string) {
  const freigabe = await freigeben(anfrageId, session, { sofort: false });
  expect(freigabe.ok).toBe(true);
  const db = await getDb();
  const zeilen = await db.select().from(versandauftrag).where(and(
    eq(versandauftrag.anfrageId, anfrageId), eq(versandauftrag.art, 'erstkontakt'),
  ));
  const auftrag = zeilen[0];
  expect(auftrag.faelligAm).not.toBeNull();
  return { auftrag, faelligAm: auftrag.faelligAm as Date };
}

async function auftragZeile(auftragId: string) {
  const db = await getDb();
  return (await db.select().from(versandauftrag).where(eq(versandauftrag.id, auftragId)))[0];
}

describe('Versandjob, Wiederholung nach Fehlversuch', () => {
  it('holt einen fehlgeschlagenen Auftrag nach Ablauf der Wartezeit nach', async () => {
    const { anfrageId } = await versandfertigerVorgang(session);
    const { auftrag, faelligAm } = await freigegeben(anfrageId);
    post.scheitereImmer('Resend: Domain nicht verifiziert');

    const ersterLauf = plusMinuten(faelligAm, 1);
    const eins = await versandJob(ersterLauf);
    expect(eins.verarbeitet).toBe(0);
    expect(eins.blockiert).toBeGreaterThanOrEqual(1);
    expect(post.mails).toHaveLength(0);
    const nachFehler = await auftragZeile(auftrag.id);
    expect(nachFehler.status).toBe('fehlgeschlagen');
    expect(nachFehler.versuch).toBe(1);

    // Innerhalb der Wartezeit rührt der Job den Auftrag nicht an.
    const zuFrueh = await versandJob(plusMinuten(ersterLauf, BACKOFF_MINUTEN[0] - 0.5));
    expect(zuFrueh.zusammenfassung).toBe('Nichts fällig.');
    expect(post.mails).toHaveLength(0);

    // Nach der Wartezeit läuft der Versand von selbst wieder an.
    post.scheitereImmer(null);
    const zwei = await versandJob(plusMinuten(ersterLauf, BACKOFF_MINUTEN[0] + 1));
    expect(zwei.verarbeitet).toBeGreaterThanOrEqual(1);
    expect(post.an('max.mustermann@example.de')).toHaveLength(1);
    expect(post.an('info@bad-energie.de')).toHaveLength(1);

    const fertig = await auftragZeile(auftrag.id);
    expect(fertig.status).toBe('versendet');
    const db = await getDb();
    const vorgang = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)))[0];
    expect(vorgang.status).toBe('versendet');
  });

  it('gibt nach MAX_VERSUCHE endgültig auf und nimmt den Auftrag nicht mehr auf', async () => {
    const { anfrageId } = await versandfertigerVorgang(session);
    const { auftrag, faelligAm } = await freigegeben(anfrageId);
    post.scheitereImmer('Resend: Domain nicht verifiziert');

    let jetzt = plusMinuten(faelligAm, 1);
    for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch += 1) {
      await versandJob(jetzt);
      const zeile = await auftragZeile(auftrag.id);
      expect(zeile.versuch).toBe(versuch);
      jetzt = plusMinuten(jetzt, BACKOFF_MINUTEN[versuch - 1] + 1);
    }

    const endgueltig = await auftragZeile(auftrag.id);
    expect(endgueltig.status).toBe('fehlgeschlagen');
    expect(endgueltig.versuch).toBe(MAX_VERSUCHE);
    expect(endgueltig.naechsterVersuchAm).toBeNull();

    post.scheitereImmer(null);
    const danach = await versandJob(plusMinuten(jetzt, 60));
    expect(danach.zusammenfassung).toBe('Nichts fällig.');
    expect(post.mails).toHaveLength(0);
  });
});

describe('Versandjob, Fehlerisolierung', () => {
  it('lässt einen abbrechenden Auftrag den Lauf nicht mitreißen', async () => {
    const kaputt = await versandfertigerVorgang(session, { email: 'kaputt@example.de', nachname: 'Kaputt' });
    const heil = await versandfertigerVorgang(session, { email: 'heil@example.de', nachname: 'Heil', fensterAb: 2 });
    const einsK = await freigegeben(kaputt.anfrageId);
    const einsH = await freigegeben(heil.anfrageId);
    abbrechende.add(einsK.auftrag.id);

    const ergebnis = await versandJob(plusMinuten(einsH.faelligAm, 1));

    expect(ergebnis.blockiert).toBe(1);
    expect(ergebnis.verarbeitet).toBe(1);
    expect(ergebnis.zusammenfassung).toContain('abgebrochen');
    // Der zweite Vorgang ist trotz des Abbruchs vollständig hinausgegangen.
    expect(post.an('heil@example.de')).toHaveLength(1);
    expect(post.an('kaputt@example.de')).toHaveLength(0);
    expect((await auftragZeile(einsH.auftrag.id)).status).toBe('versendet');
    expect((await auftragZeile(einsK.auftrag.id)).status).toBe('freigegeben');
  });
});
