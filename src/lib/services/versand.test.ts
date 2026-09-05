/**
 * Versand gegen die Datenbank (Plan AP7): Auftrag bereitstellen, Kundenmail mit PDF,
 * Büro-Dossier, Wiederholung nach Fehler, Eingangsbestätigung mit Drosselung.
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

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, einstellung, versandauftrag } from '@/db/schema';
import { ladeKalkulationsdaten } from './kalkulationsdaten';
import { positionAusBaustein } from './calculation';
import { geraeteVorschlag, heizlastSchaetzen, leeresGebaeude, speicherVorschlag } from './heizlast';
import { ladeTerminfenster, speichereInternAnfrage } from './estimates';
import { pdfDateiname } from './mail';
import {
  BACKOFF_MINUTEN, sendeBueroHinweis, sendeEingangsbestaetigung, stelleAuftragBereit, versendeAuftrag,
} from './versand';
import { fakeMailer, fakeStorage, frischeDb, type FakeMailer } from '../../../test/db';
import type { InternAnfrage, SessionInfo } from '../types';

let post: FakeMailer;
let session: SessionInfo;

/** Gebäudedaten des Vorführfalls (150 m², 1965, Gas, 22.000 kWh, zwei Personen). */
function vorfuehrGebaeude() {
  const g = leeresGebaeude();
  g.wohnflaeche = 150;
  g.baujahr = 1965;
  g.lage = 'freistehend';
  g.personen = 2;
  g.bestand.energieart = 'gas';
  g.bestand.verbrauchJahr = 22000;
  g.bestand.verbrauchEinheit = 'kwh';
  g.bestand.heizungsalterJahre = 25;
  return g;
}

/** Versandfertiger Vorgang: Positionen mit Demo-Preisen, persönlicher Satz, zwei Terminfenster. */
async function versandfertigerVorgang(): Promise<{ anfrageId: string; ksNummer: string }> {
  const { vorlagen, matrix } = await ladeKalkulationsdaten();
  const vorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
  if (!vorlage) throw new Error('Vorlage waermepumpe_gas fehlt im Seed.');
  const gebaeude = vorfuehrGebaeude();
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
  expect(anlage.status).toBe('geplant');
  return { anfrageId: anlage.anfrageId, ksNummer: anlage.ksNummer };
}

beforeEach(async () => {
  ({ session } = await frischeDb({ demoPreise: true }));
  post = fakeMailer();
  fakeStorage();
});

describe('stelleAuftragBereit', () => {
  it('legt je Art höchstens einen offenen Auftrag an', async () => {
    const { anfrageId } = await versandfertigerVorgang();
    const eins = await stelleAuftragBereit(anfrageId, 'erstkontakt', { empfaenger: 'max.mustermann@example.de' });
    const zwei = await stelleAuftragBereit(anfrageId, 'erstkontakt', { empfaenger: 'max.mustermann@example.de' });
    expect(zwei.id).toBe(eins.id);
    expect(eins.status).toBe('entwurf');

    const db = await getDb();
    const alle = await db.select().from(versandauftrag).where(eq(versandauftrag.anfrageId, anfrageId));
    expect(alle).toHaveLength(1);
  });
});

describe('versendeAuftrag, Erstkontakt', () => {
  it('sendet Kundenmail mit PDF und Dossier ans Büro und schließt den Vorgang ab', async () => {
    const { anfrageId, ksNummer } = await versandfertigerVorgang();
    const auftrag = await stelleAuftragBereit(anfrageId, 'erstkontakt', { empfaenger: 'max.mustermann@example.de' });

    const bericht = await versendeAuftrag(auftrag.id, { jetzt: new Date() });

    expect(bericht.status).toBe('versendet');
    expect(bericht.dossier?.status).toBe('versendet');
    expect(post.mails).toHaveLength(2);

    const kundenmail = post.an('max.mustermann@example.de')[0];
    expect(kundenmail.anhaenge?.[0].dateiname).toBe(pdfDateiname(ksNummer));
    expect(kundenmail.header?.['List-Unsubscribe']).toContain('mailto:info@bad-energie.de');
    expect(kundenmail.replyTo).toBeTruthy();

    const dossier = post.an('info@bad-energie.de')[0];
    expect((dossier.anhaenge ?? []).map((a) => a.dateiname)).toContain('datenblatt.json');

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)))[0];
    expect(a.status).toBe('versendet');
    expect(a.versendetAm).not.toBeNull();
    expect(a.wiedervorlageAm).not.toBeNull();
  });

  it('beansprucht den Auftrag genau einmal: der zweite Lauf sendet nichts nach', async () => {
    const { anfrageId } = await versandfertigerVorgang();
    const auftrag = await stelleAuftragBereit(anfrageId, 'erstkontakt', { empfaenger: 'max.mustermann@example.de' });

    // Der erste Lauf verschickt beide Mails; der Abschluss des Vorgangs wirft heute
    // (siehe Befund „Übergang eingang → versendet“), das ändert am Doppelversand-Schutz nichts.
    await versendeAuftrag(auftrag.id, { jetzt: new Date() }).catch(() => undefined);
    const nachErstem = post.mails.length;
    expect(nachErstem).toBe(2);

    const zweiter = await versendeAuftrag(auftrag.id, { jetzt: new Date() });
    expect(zweiter.status).toBe('versendet');
    expect(zweiter.fehler).toMatch(/nicht versandbereit/);
    expect(post.mails).toHaveLength(nachErstem);
  });

  it('merkt einen Mailfehler mit Versuchszähler und nächstem Versuch vor', async () => {
    const { anfrageId } = await versandfertigerVorgang();
    const auftrag = await stelleAuftragBereit(anfrageId, 'erstkontakt', { empfaenger: 'max.mustermann@example.de' });
    post.scheitereImmer('Resend: Domain nicht verifiziert');

    const jetzt = new Date();
    const bericht = await versendeAuftrag(auftrag.id, { jetzt });
    expect(bericht.status).toBe('fehlgeschlagen');
    expect(post.mails).toHaveLength(0);

    const db = await getDb();
    const a = (await db.select().from(versandauftrag).where(eq(versandauftrag.id, auftrag.id)))[0];
    expect(a.status).toBe('fehlgeschlagen');
    expect(a.versuch).toBe(1);
    expect(a.fehler).toContain('Domain nicht verifiziert');
    expect(a.naechsterVersuchAm).not.toBeNull();
    const wartezeitMinuten = ((a.naechsterVersuchAm as Date).getTime() - jetzt.getTime()) / 60_000;
    expect(Math.round(wartezeitMinuten)).toBe(BACKOFF_MINUTEN[0]);

    const vorgang = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)))[0];
    expect(vorgang.status).toBe('geplant');
  });
});

describe('Eingangsbestätigung und Büro-Hinweis', () => {
  it('sendet die Eingangsbestätigung nur bei aktivierter Einstellung und nur einmal je Adresse', async () => {
    const { anfrageId } = await versandfertigerVorgang();

    expect(await sendeEingangsbestaetigung(anfrageId, 'max.mustermann@example.de')).toBe('uebersprungen');
    expect(post.mails).toHaveLength(0);

    const db = await getDb();
    await db.insert(einstellung).values({ key: 'eingangsbestaetigung', wert: true })
      .onConflictDoUpdate({ target: einstellung.key, set: { wert: true } });

    expect(await sendeEingangsbestaetigung(anfrageId, 'max.mustermann@example.de')).toBe('versendet');
    expect(post.mails).toHaveLength(1);
    expect(post.mails[0].betreff).toContain('Ihre Anfrage ist eingegangen');
    expect(post.mails[0].anhaenge ?? []).toHaveLength(0);

    // Zweite Anfrage derselben Adresse am selben Tag: gedrosselt.
    expect(await sendeEingangsbestaetigung(anfrageId, 'max.mustermann@example.de')).toBe('uebersprungen');
    expect(post.mails).toHaveLength(1);
  });

  it('meldet einen neuen Web-Lead an die Büroadresse', async () => {
    const { anfrageId, ksNummer } = await versandfertigerVorgang();
    await sendeBueroHinweis(anfrageId);
    const hinweis = post.an('info@bad-energie.de')[0];
    expect(hinweis).toBeDefined();
    expect(hinweis.betreff).toBe(`Neue Anfrage ${ksNummer}`);
    expect(hinweis.text).toContain(ksNummer);
    expect(hinweis.header?.['Auto-Submitted']).toBe('auto-generated');
  });
});
