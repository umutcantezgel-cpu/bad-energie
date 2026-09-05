/**
 * Zuständigkeit beim Speichern eines Vorgangs (Rollenregel 3.3, Fachregel 2).
 *
 * Geprüft wird gegen eine frische PGlite-Datenbank: ein fremder Vorgang lässt sich weder
 * übernehmen noch überschreiben, und das Büro pflegt Stammdaten, ohne Preise zu bewegen.
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

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, anfrageZeile } from '@/db/schema';
import { ladeKalkulationsdaten } from './kalkulationsdaten';
import { positionAusBaustein } from './calculation';
import { leeresGebaeude } from './heizlast';
import { speichereInternAnfrage, ZugriffFehler } from './estimates';
import { fakeMailer, fakeStorage, frischeDb, legeBenutzerAn } from '../../../test/db';
import type { InternAnfrage, Position, SessionInfo } from '../types';

let chef: SessionInfo;

/** Positionen der Wärmepumpen-Vorlage mit den Demo-Preisen aus dem Seed. */
async function wpPositionen(): Promise<Position[]> {
  const { vorlagen, matrix } = await ladeKalkulationsdaten();
  const vorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
  if (!vorlage) throw new Error('Vorlage waermepumpe_gas fehlt im Seed.');
  return vorlage.bausteine.map((b) => positionAusBaustein(b, matrix, { varianteMatrixNr: 2, kW: 10, liter: 200 }));
}

function eingabe(zusatz: Partial<InternAnfrage> = {}): InternAnfrage {
  return {
    modus: 'intern', aktion: 'entwurf', quelle: 'intern', vorlageIds: ['waermepumpe_gas'],
    kontakt: {
      anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', email: 'max.mustermann@example.de',
      telefon: '06441 123456', strasse: 'Musterweg 4', plzOrt: '35578 Wetzlar', kenntnisnahme: true,
    },
    objekt: { adresse: 'Musterweg 4', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
    gebaeude: leeresGebaeude(),
    dringlichkeit: 'wochen_4',
    vorhabenKurz: 'Luft/Wasser Wärmepumpe statt Gasheizung',
    positionen: [],
    kalkulation: {},
    foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: null },
    persoenlicherSatz: '',
    annahmen: [], vorbehalte: [], ausfuehrungSatz: '',
    terminfensterIds: [],
    notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: '' },
    skizzen: [], fotos: [],
    ...zusatz,
  } as InternAnfrage;
}

beforeEach(async () => {
  const start = await frischeDb({ demoPreise: true, rolle: 'chef' });
  chef = start.session;
  fakeMailer();
  fakeStorage();
});

describe('speichereInternAnfrage, Zuständigkeit', () => {
  it('setzt den Anlegenden als Bearbeiter', async () => {
    const bauleiter = await legeBenutzerAn('bauleiter', 'Bauleiter Eins');
    const anlage = await speichereInternAnfrage(eingabe({ positionen: await wpPositionen() }), bauleiter);

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anlage.anfrageId)))[0];
    expect(a.bearbeiterId).toBe(bauleiter.benutzerId);
  });

  it('lässt einen fremden Bauleiter den Vorgang nicht überschreiben', async () => {
    const einer = await legeBenutzerAn('bauleiter', 'Bauleiter Eins');
    const anderer = await legeBenutzerAn('bauleiter', 'Bauleiter Zwei');
    const anlage = await speichereInternAnfrage(eingabe({ positionen: await wpPositionen() }), einer);

    await expect(speichereInternAnfrage(
      eingabe({ anfrageId: anlage.anfrageId, vorhabenKurz: 'Fremdzugriff' }),
      anderer,
    )).rejects.toBeInstanceOf(ZugriffFehler);

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anlage.anfrageId)))[0];
    expect(a.vorhabenKurz).toBe('Luft/Wasser Wärmepumpe statt Gasheizung');
    expect(a.bearbeiterId).toBe(einer.benutzerId);
  });

  it('trägt den Grund berechtigung am Fehler, damit der Route Handler 403 antworten kann', async () => {
    const einer = await legeBenutzerAn('bauleiter', 'Bauleiter Eins');
    const anderer = await legeBenutzerAn('bauleiter', 'Bauleiter Zwei');
    const anlage = await speichereInternAnfrage(eingabe({ positionen: await wpPositionen() }), einer);

    const fehler = await speichereInternAnfrage(eingabe({ anfrageId: anlage.anfrageId }), anderer).catch((e) => e);
    expect(fehler).toBeInstanceOf(ZugriffFehler);
    expect((fehler as ZugriffFehler).grund).toBe('berechtigung');
  });

  it('lässt den Chef jeden Vorgang überschreiben', async () => {
    const einer = await legeBenutzerAn('bauleiter', 'Bauleiter Eins');
    const anlage = await speichereInternAnfrage(eingabe({ positionen: await wpPositionen() }), einer);

    await speichereInternAnfrage(eingabe({ anfrageId: anlage.anfrageId, vorhabenKurz: 'Vom Chef geprüft' }), chef);

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anlage.anfrageId)))[0];
    expect(a.vorhabenKurz).toBe('Vom Chef geprüft');
    // Der Vorgang bleibt beim ursprünglichen Bearbeiter.
    expect(a.bearbeiterId).toBe(einer.benutzerId);
  });
});

describe('speichereInternAnfrage, Rolle buero', () => {
  it('lässt das Büro Kontakt und Notizen pflegen, aber keine Positionen ändern', async () => {
    const buero = await legeBenutzerAn('buero', 'Bueromitarbeit');
    const positionen = await wpPositionen();
    const anlage = await speichereInternAnfrage(eingabe({ positionen }), chef);

    const db = await getDb();
    const vorher = await db.select().from(anfrageZeile).where(eq(anfrageZeile.anfrageId, anlage.anfrageId));
    expect(vorher.length).toBeGreaterThan(0);

    // Das Büro versucht, eine eigene Preiszeile unterzuschieben.
    const gefaelscht: Position[] = [{
      ...positionen[0], id: 'frei-1', titel: 'Sonderpreis', von: 1, bis: 2,
      matrixNr: null, varianteMatrixNr: null, quelle: 'manuell',
    }];
    await speichereInternAnfrage(eingabe({
      anfrageId: anlage.anfrageId,
      positionen: gefaelscht,
      vorhabenKurz: 'Vom Büro ergänzt',
      notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: 'Rückruf am Montag.' },
    }), buero);

    const nachher = await db.select().from(anfrageZeile).where(eq(anfrageZeile.anfrageId, anlage.anfrageId));
    expect(nachher).toHaveLength(vorher.length);
    expect(nachher.some((z) => z.titel === 'Sonderpreis')).toBe(false);

    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anlage.anfrageId)))[0];
    expect(a.vorhabenKurz).toBe('Vom Büro ergänzt');
    expect(a.interneNotizen).toBe('Rückruf am Montag.');
  });

  it('lässt die Nettosumme des Vorgangs unverändert, wenn das Büro speichert', async () => {
    const buero = await legeBenutzerAn('buero', 'Bueromitarbeit');
    const anlage = await speichereInternAnfrage(eingabe({ positionen: await wpPositionen() }), chef);

    const db = await getDb();
    const vorher = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anlage.anfrageId)))[0];

    await speichereInternAnfrage(eingabe({ anfrageId: anlage.anfrageId, positionen: [] }), buero);

    const nachher = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anlage.anfrageId)))[0];
    expect(nachher.summeNettoVon).toBe(vorher.summeNettoVon);
    expect(nachher.summeNettoBis).toBe(vorher.summeNettoBis);
  });

  it('lässt das Büro einen neuen Vorgang mit Vorlagenpositionen anlegen (Dispatch)', async () => {
    const buero = await legeBenutzerAn('buero', 'Bueromitarbeit');
    const anlage = await speichereInternAnfrage(eingabe({ positionen: await wpPositionen() }), buero);

    const db = await getDb();
    const zeilen = await db.select().from(anfrageZeile).where(eq(anfrageZeile.anfrageId, anlage.anfrageId));
    expect(zeilen.length).toBeGreaterThan(0);
  });
});
