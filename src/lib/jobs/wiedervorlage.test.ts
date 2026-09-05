/**
 * Wiedervorlage: der Erinnerungsauftrag entsteht genau einmal, und der Tageslauf zieht
 * Speicherfrist und Bereinigung mit (Vercel Hobby erlaubt nur zwei Cron-Einträge).
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

import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, ereignis, loeschprotokoll, versandauftrag } from '@/db/schema';
import { freigeben } from '@/lib/services/estimates';
import { minusMonate, plusMinuten } from '@/lib/services/zeit';
import { wiedervorlageJob } from './wiedervorlage';
import { versandfertigerVorgang } from './testfall';
import { fakeMailer, fakeStorage, frischeDb } from '../../../test/db';
import type { SessionInfo } from '@/lib/types';

let session: SessionInfo;

beforeEach(async () => {
  ({ session } = await frischeDb({ demoPreise: true }));
  fakeMailer();
  fakeStorage();
});

describe('Wiedervorlage, Erinnerung', () => {
  it('legt den Erinnerungsauftrag genau einmal an und meldet den Vorgang nicht täglich erneut', async () => {
    const { anfrageId } = await versandfertigerVorgang(session);
    const versand = await freigeben(anfrageId, session, { sofort: true });
    expect(versand.ok).toBe(true);

    const db = await getDb();
    const vorher = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)))[0];
    expect(vorher.status).toBe('versendet');
    const wiedervorlageAm = vorher.wiedervorlageAm as Date;
    expect(wiedervorlageAm).not.toBeNull();

    const jetzt = plusMinuten(wiedervorlageAm, 1);
    const erster = await wiedervorlageJob(jetzt);
    expect(erster.verarbeitet).toBeGreaterThanOrEqual(1);
    expect(erster.zusammenfassung).toContain('Erinnerung liegt zur Freigabe bereit');

    const auftraege = await db.select().from(versandauftrag).where(and(
      eq(versandauftrag.anfrageId, anfrageId), eq(versandauftrag.art, 'erinnerung'),
    ));
    expect(auftraege).toHaveLength(1);
    expect(auftraege[0].status).toBe('entwurf');

    const nachher = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)))[0];
    expect(nachher.wiedervorlageAm).toBeNull();

    // Zweiter Tag: kein neuer Auftrag, kein zweites Ereignis, keine erneute Meldung.
    const zweiter = await wiedervorlageJob(plusMinuten(jetzt, 24 * 60));
    expect(zweiter.zusammenfassung).toContain('Nichts zur Wiedervorlage.');

    const ereignisse = await db.select().from(ereignis).where(and(
      eq(ereignis.anfrageId, anfrageId), eq(ereignis.typ, 'wiedervorlage:erinnerung_vorbereitet'),
    ));
    expect(ereignisse).toHaveLength(1);
  });
});

describe('Wiedervorlage zieht Speicherfrist und Bereinigung mit', () => {
  it('löscht einen nie bearbeiteten Vorgang nach Ablauf der Frist über sein Eingangsdatum', async () => {
    const { anfrageId, ksNummer } = await versandfertigerVorgang(session);
    const db = await getDb();
    // Ein Vorgang ohne Termin, ohne Versand und ohne Verwerfen: nur das Eingangsdatum trägt die Frist.
    const jetzt = new Date('2026-09-05T02:00:00.000Z');
    await db.update(anfrageTabelle)
      .set({ erstelltAm: minusMonate(jetzt, 30) })
      .where(eq(anfrageTabelle.id, anfrageId));

    const ergebnis = await wiedervorlageJob(jetzt);

    expect(ergebnis.zusammenfassung).toContain('Speicherfrist:');
    expect(ergebnis.zusammenfassung).toContain('Bereinigung:');
    expect(ergebnis.zusammenfassung).toContain(ksNummer);

    const uebrig = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId));
    expect(uebrig).toHaveLength(0);
    const protokoll = await db.select().from(loeschprotokoll).where(eq(loeschprotokoll.ksNummer, ksNummer));
    expect(protokoll).toHaveLength(1);
  });

  it('behält einen frischen Vorgang und meldet beide Zusatzläufe trotzdem', async () => {
    const { anfrageId } = await versandfertigerVorgang(session);

    const ergebnis = await wiedervorlageJob(new Date('2026-09-05T02:00:00.000Z'));

    expect(ergebnis.zusammenfassung).toContain('Speicherfrist: Nichts zu löschen.');
    expect(ergebnis.zusammenfassung).toContain('Bereinigung:');
    const db = await getDb();
    const uebrig = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId));
    expect(uebrig).toHaveLength(1);
  });
});
