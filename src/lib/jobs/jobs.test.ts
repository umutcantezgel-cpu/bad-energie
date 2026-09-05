import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/pdf', () => ({
  renderPdf: async () => Buffer.from('%PDF-1.4 test'),
  pdfSeitenzahl: () => 2,
  lokalerChromePfad: () => null,
  schliesseBrowser: async () => undefined,
  PDF_TIMEOUT_MS: 20_000,
}));

import { eq } from 'drizzle-orm';
import { istJobName, mitJobSperre, slotFuer, JOBS } from './runner';
import { versandJob } from './versand';
import { testUhr } from '@/lib/services/zeit';
import { getDb } from '@/db/client';
import { versandauftrag } from '@/db/schema';
import { positionAusBaustein } from '@/lib/services/calculation';
import { freigeben, ladeTerminfenster, speichereInternAnfrage } from '@/lib/services/estimates';
import { geraeteVorschlag, heizlastSchaetzen, leeresGebaeude, speicherVorschlag } from '@/lib/services/heizlast';
import { ladeKalkulationsdaten } from '@/lib/services/kalkulationsdaten';
import { fakeMailer, fakeStorage, frischeDb, type FakeMailer } from '../../../test/db';
import type { InternAnfrage, SessionInfo } from '@/lib/types';

describe('Jobs Runner & Slotting', () => {
  it('erkennt alle 5 konfigurierten Job-Namen', () => {
    expect(JOBS).toEqual(['versand', 'wiedervorlage', 'eingang', 'speicherfrist', 'bereinigung']);
    expect(istJobName('versand')).toBe(true);
    expect(istJobName('wiedervorlage')).toBe(true);
    expect(istJobName('eingang')).toBe(true);
    expect(istJobName('speicherfrist')).toBe(true);
    expect(istJobName('bereinigung')).toBe(true);
    expect(istJobName('unbekannt')).toBe(false);
    expect(istJobName('')).toBe(false);
  });

  it('erzeugt für versand Minuten-Slots und für Tagesjobs Tages-Slots', () => {
    const uhr = testUhr('2026-09-04T18:30:00.000Z');
    const jetzt = uhr.now();
    const versandSlot = slotFuer('versand', jetzt);
    expect(versandSlot).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

    const wiedervorlageSlot = slotFuer('wiedervorlage', jetzt);
    expect(wiedervorlageSlot).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const eingangSlot = slotFuer('eingang', jetzt);
    expect(eingangSlot).toBe(wiedervorlageSlot);

    const speicherSlot = slotFuer('speicherfrist', jetzt);
    expect(speicherSlot).toBe(wiedervorlageSlot);

    const bereinigungSlot = slotFuer('bereinigung', jetzt);
    expect(bereinigungSlot).toBe(wiedervorlageSlot);
  });
});

// ---------------------------------------------------------------------------
// Versandjob gegen die Datenbank (Plan AP7, Fall 5)
// ---------------------------------------------------------------------------

let post: FakeMailer;
let session: SessionInfo;

/** Versandfertiger Vorgang mit Demo-Preisen, persönlichem Satz und zwei Terminfenstern. */
async function versandfertigerVorgang(): Promise<string> {
  const { vorlagen, matrix } = await ladeKalkulationsdaten();
  const vorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
  if (!vorlage) throw new Error('Vorlage waermepumpe_gas fehlt im Seed.');
  const gebaeude = leeresGebaeude();
  gebaeude.wohnflaeche = 150;
  gebaeude.baujahr = 1965;
  gebaeude.personen = 2;
  gebaeude.bestand.energieart = 'gas';
  gebaeude.bestand.verbrauchJahr = 22000;
  gebaeude.bestand.verbrauchEinheit = 'kwh';
  gebaeude.bestand.heizungsalterJahre = 25;
  const schaetzung = heizlastSchaetzen(gebaeude);
  const positionen = vorlage.bausteine.map((b) => {
    const vorschlag = schaetzung ? geraeteVorschlag(schaetzung.kwEmpfohlen, b.groessenVarianten, 'bosch') : null;
    const variante = b.groessenVarianten?.find((v) => v.matrixNr === vorschlag?.matrixNr) ?? null;
    const speicher = vorschlag ? speicherVorschlag(gebaeude.personen, variante?.speicherLiterOptionen) : null;
    return positionAusBaustein(b, matrix, {
      varianteMatrixNr: vorschlag?.matrixNr ?? null, kW: vorschlag?.geraetKw, liter: speicher?.liter,
    });
  });
  const fenster = await ladeTerminfenster();
  const eingabe: InternAnfrage = {
    modus: 'intern', aktion: 'entwurf', quelle: 'intern', vorlageIds: ['waermepumpe_gas'],
    kontakt: {
      anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', email: 'max.mustermann@example.de',
      telefon: '06441 123456', strasse: 'Musterweg 4', plzOrt: '35578 Wetzlar', kenntnisnahme: true,
    },
    objekt: { adresse: 'Musterweg 4', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
    gebaeude,
    dringlichkeit: 'wochen_4',
    vorhabenKurz: 'Luft/Wasser Wärmepumpe statt Gasheizung',
    positionen,
    kalkulation: {},
    foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: null },
    persoenlicherSatz: 'Nach unserem Telefonat haben wir Ihnen die Zahlen für die Wärmepumpe zusammengestellt.',
    annahmen: [], vorbehalte: [], ausfuehrungSatz: 'Wir führen die Arbeiten in etwa einer Woche aus.',
    terminfensterIds: fenster.slice(0, 2).map((f) => f.id),
    notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: '' },
    skizzen: [], fotos: [],
  };
  const anlage = await speichereInternAnfrage(eingabe, session);
  return anlage.anfrageId;
}

describe('Versandjob mit Fälligkeit und Einzelläufer-Sperre', () => {
  beforeEach(async () => {
    ({ session } = await frischeDb({ demoPreise: true }));
    post = fakeMailer();
    fakeStorage();
  });

  it('meldet ohne fällige Aufträge „Nichts fällig.“', async () => {
    const ergebnis = await versandJob(new Date());
    expect(ergebnis).toEqual({ verarbeitet: 0, blockiert: 0, zusammenfassung: 'Nichts fällig.' });
    expect(post.mails).toHaveLength(0);
  });

  it('versendet einen freigegebenen Auftrag erst nach seiner Fälligkeit und nur einmal je Slot', async () => {
    const anfrageId = await versandfertigerVorgang();

    const freigabe = await freigeben(anfrageId, session, { sofort: false });
    expect(freigabe.ok).toBe(true);

    const db = await getDb();
    const auftrag = (await db.select().from(versandauftrag).where(eq(versandauftrag.anfrageId, anfrageId)))[0];
    expect(auftrag.status).toBe('freigegeben');
    expect(auftrag.faelligAm).not.toBeNull();
    const faelligAm = auftrag.faelligAm as Date;

    // Vor der Versandzeit passiert nichts.
    const vorher = await versandJob(new Date(faelligAm.getTime() - 60_000));
    expect(vorher.verarbeitet).toBe(0);
    expect(post.mails).toHaveLength(0);

    // Nach der Versandzeit: genau ein Lauf, Kundenmail und Dossier.
    const jetzt = new Date(faelligAm.getTime() + 60_000);
    const lauf1 = await mitJobSperre('versand', 'cron', jetzt, () => versandJob(jetzt));
    expect(post.mails).toHaveLength(2);
    expect(post.an('max.mustermann@example.de')).toHaveLength(1);
    expect(post.an('info@bad-energie.de')).toHaveLength(1);

    // Zweiter Lauf im selben Minuten-Slot: gesperrt, kein zweiter Versand.
    const lauf2 = await mitJobSperre('versand', 'cron', jetzt, () => versandJob(jetzt));
    expect(lauf2.ok).toBe(false);
    if (!lauf2.ok) expect(lauf2.grund).toBe('gesperrt');
    expect(lauf2.slot).toBe(lauf1.slot);
    expect(post.mails).toHaveLength(2);

    // Ein späterer Slot läuft wieder, findet aber nichts mehr.
    const spaeter = new Date(faelligAm.getTime() + 5 * 60_000);
    const lauf3 = await mitJobSperre('versand', 'cron', spaeter, () => versandJob(spaeter));
    expect(lauf3.ok).toBe(true);
    if (lauf3.ok) expect(lauf3.verarbeitet).toBe(0);
    expect(post.mails).toHaveLength(2);

    expect(lauf1.ok).toBe(true);
    if (lauf1.ok) {
      expect(lauf1.verarbeitet).toBe(1);
      expect(lauf1.blockiert).toBe(0);
      expect(lauf1.zusammenfassung).toContain('erstkontakt versendet');
    }
  });
});
