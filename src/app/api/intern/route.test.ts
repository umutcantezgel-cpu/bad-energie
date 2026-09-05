/**
 * Route-Tests des einen Intern-Endpunkts (`src/app/api/intern/[...slug]/route.ts`) gegen PGlite (Plan AP7).
 *
 * Sitzung: `@/lib/services/auth` ist gemockt. Der echte Weg über POST `anmelden` scheidet aus,
 * weil `setzeSitzungsCookie` `cookies()` aus `next/headers` ruft und das außerhalb eines
 * Next-Request-Kontexts wirft; der Mock ist der robustere Weg und bildet genau die beiden
 * Stellen nach, die der Handler nutzt (`verifySessionApi`, `aktuelleSession`).
 * „Fehlendes Cookie“ wird deshalb als „keine Sitzung“ geprüft.
 *
 * PDF: gemockt (kein Chrome im Testlauf). Mailer und Ablage: Fakes aus `test/db.ts`.
 * `after()` aus `next/server` wirft außerhalb eines Request-Kontexts und ist deshalb ersetzt.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionInfo } from '@/lib/types';

const zustand = vi.hoisted(() => ({ session: null as SessionInfo | null }));

vi.mock('@/lib/services/auth', async (importOriginal) => {
  const echt = await importOriginal<typeof import('@/lib/services/auth')>();
  return {
    ...echt,
    verifySessionApi: async () => zustand.session,
    aktuelleSession: async () => zustand.session,
  };
});

vi.mock('@/lib/services/pdf', () => ({
  renderPdf: async () => Buffer.from('%PDF-1.4 test'),
  pdfSeitenzahl: () => 2,
  lokalerChromePfad: () => null,
  schliesseBrowser: async () => undefined,
  PDF_TIMEOUT_MS: 20_000,
}));

vi.mock('next/server', async (importOriginal) => {
  const echt = await importOriginal<typeof import('next/server')>();
  return { ...echt, after: (arbeit: unknown) => { void arbeit; } };
});

import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { GET, POST } from '@/app/api/intern/[...slug]/route';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, kunde as kundeTabelle, richtpreis } from '@/db/schema';
import { ladeEinstellungen, ladeFoerderRegeln, ladeKalkulationsdaten } from '@/lib/services/kalkulationsdaten';
import { enthaeltVerboteneFelder, positionAusBaustein } from '@/lib/services/calculation';
import { geraeteVorschlag, heizlastSchaetzen, leeresGebaeude, speicherVorschlag } from '@/lib/services/heizlast';
import { parseDispatchText } from '@/lib/services/dispatch-parser';
import { ladeInternAnfrage } from '@/lib/services/estimates';
import { adapterZuruecksetzen, fakeMailer, fakeStorage, frischeDb, legeBenutzerAn, type FakeMailer } from '../../../../test/db';

// ---------------------------------------------------------------------------
// Aufrufhilfen
// ---------------------------------------------------------------------------

function anfrage(slug: string[], body: unknown, kopf: Record<string, string> = {}): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/intern/${slug.join('/')}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', ...kopf },
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ slug }) });
}

function lesen(slug: string[], kopf: Record<string, string> = {}): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/intern/${slug.join('/')}`, {
    method: 'GET',
    headers: { 'sec-fetch-site': 'same-origin', ...kopf },
  });
  return GET(request, { params: Promise.resolve({ slug }) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(antwort: Response): Promise<any> {
  return antwort.json();
}

// ---------------------------------------------------------------------------
// Nutzlasten
// ---------------------------------------------------------------------------

/** Heizungs-Journey des Vorführ-Ablaufs (Plan 11.1): Gas, über 20 Jahre, 150 m², 1965, 22.000 kWh. */
function kundenAnfrage(zusatz: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    modus: 'kunde',
    quelle: 'web_heizung',
    antworten: {
      journey: 'heizung',
      heutig: 'gas',
      alter: 'ueber_20',
      tanks: 0,
      gebaeude: 'efh',
      wohnflaeche: 150,
      baujahr: 'vor_1978',
      verteilung: 'heizkoerper',
      heizkoerperTausch: 0,
      ziel: 'waermepumpe',
      raeume: 3,
      selbstBewohnt: true,
      einkommenUnterGrenze: false,
      personen: 2,
      verbrauchJahr: 22000,
      standortHeizung: 'keller',
    },
    freitext: '',
    objekt: { adresse: 'Musterweg 4', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
    dringlichkeit: 'wochen_4',
    wunschtermine: [],
    kontakt: {
      anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', email: 'max.mustermann@example.de',
      telefon: '06441 123456', strasse: 'Musterweg 4', plzOrt: '35578 Wetzlar', kenntnisnahme: true,
    },
    honig: '',
    gestartetUm: Date.now() - 10_000,
    ...zusatz,
  };
}

/** Positionen der Wärmepumpen-Vorlage wie im Meister-Modus (Variante aus der Heizlast). */
async function wpPositionen(gebaeude = leeresGebaeude()) {
  const { vorlagen, matrix } = await ladeKalkulationsdaten();
  const vorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
  if (!vorlage) throw new Error('Vorlage waermepumpe_gas fehlt im Seed.');
  const schaetzung = heizlastSchaetzen(gebaeude);
  return vorlage.bausteine.map((b) => {
    const vorschlag = schaetzung ? geraeteVorschlag(schaetzung.kwEmpfohlen, b.groessenVarianten, 'bosch') : null;
    const variante = b.groessenVarianten?.find((v) => v.matrixNr === vorschlag?.matrixNr) ?? null;
    const speicher = vorschlag ? speicherVorschlag(gebaeude.personen, variante?.speicherLiterOptionen) : null;
    return positionAusBaustein(b, matrix, {
      varianteMatrixNr: vorschlag?.matrixNr ?? null,
      kW: vorschlag?.geraetKw,
      liter: speicher?.liter,
    });
  });
}

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
  g.bestand.standort = 'keller';
  return g;
}

function internAnfrage(zusatz: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    modus: 'intern',
    aktion: 'entwurf',
    quelle: 'intern',
    vorlageIds: ['waermepumpe_gas'],
    kontakt: {
      anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', email: 'max.mustermann@example.de',
      telefon: '06441 123456', strasse: 'Musterweg 4', plzOrt: '35578 Wetzlar', kenntnisnahme: true,
    },
    objekt: { adresse: 'Musterweg 4', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
    gebaeude: vorfuehrGebaeude(),
    dringlichkeit: 'wochen_4',
    vorhabenKurz: 'Luft/Wasser Wärmepumpe statt Gasheizung',
    positionen: [],
    kalkulation: {},
    foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true },
    persoenlicherSatz: '',
    annahmen: [],
    vorbehalte: [],
    ausfuehrungSatz: 'Wir führen die Arbeiten in etwa einer Woche aus.',
    terminfensterIds: [],
    notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: '' },
    skizzen: [],
    fotos: [],
    ...zusatz,
  };
}

const EINSTELLUNGEN_VOLL = {
  versandzeit: '18:00',
  wiedervorlageTage: 5,
  erinnerungTage: 7,
  radiusKm: 40,
  minQm: 50,
  speicherfristMonate: 24,
  eingangsbestaetigung: false,
  bueroEmail: 'info@bad-energie.de',
  absender: { name: 'Sabri Demir', email: 'info@bad-energie.de' },
  briefbogen: {
    firma: 'Bad & Energie GmbH', strasse: 'Siegmund-Hiepe-Straße 20', plzOrt: '35578 Wetzlar',
    telefon: '06441 2039053', telefonLink: '+4964412039053', email: 'info@bad-energie.de',
    web: 'bad-energie.de', geschaeftsfuehrer: 'Sabri Demir', register: 'Amtsgericht Wetzlar HRB 2449', ustId: 'DE215933612',
  },
};

let post: FakeMailer;

beforeEach(() => {
  zustand.session = null;
  post = fakeMailer();
  fakeStorage();
  delete process.env.RESEND_WEBHOOK_SECRET;
  delete process.env.CRON_SECRET;
});

afterAll(() => {
  adapterZuruecksetzen();
});

// ---------------------------------------------------------------------------
// 1. Kundenstrecke
// ---------------------------------------------------------------------------

describe('POST estimate, Kunden-Modus (Heizungs-Journey des Vorführ-Ablaufs)', () => {
  it('liefert die Bruttospanne der 10-kW-Variante, Förderbausteine und Heizkosten', async () => {
    await frischeDb({ demoPreise: true });

    const antwort = await anfrage(['estimate'], kundenAnfrage(), { 'x-real-ip': '203.0.113.1' });
    expect(antwort.status).toBe(200);
    const body = await json(antwort);

    expect(body.ok).toBe(true);
    expect(body.ksNummer).toMatch(/^KS-\d{4}-0001$/);

    const e = body.ergebnis;
    expect(e.pfad).toBe('spanne');
    // Referenzmappe, Variante 10 kW: netto 26.400 bis 33.300, brutto 31.416 bis 39.627.
    expect(e.bruttoVonGerundet % 500).toBe(0);
    expect(e.bruttoBisGerundet % 500).toBe(0);
    expect(e.bruttoVonGerundet).toBe(31_000);
    expect(e.bruttoBisGerundet).toBe(40_000);
    expect(e.bruttoVonGerundet).toBeLessThanOrEqual(31_416);
    expect(e.bruttoBisGerundet).toBeGreaterThanOrEqual(39_627);

    expect(e.foerderSatz).toBe(55);
    expect(e.foerderBausteine).toContain('Grundförderung 30 %');
    expect(e.foerderBausteine).toContain('Alte Gas- oder Ölheizung 20 %');

    expect(e.heizkostenHeuteJahr).toBe(2420);
    expect(e.heizkostenWpJahr).toBe(1510);
    expect(e.heizkostenWpMonat).toBe(125);

    // Regel: keine internen Felder in der öffentlichen Antwort.
    expect(enthaeltVerboteneFelder(e)).toEqual([]);

    const db = await getDb();
    const zeilen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, body.ksNummer));
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0].status).toBe('eingang');
    expect(zeilen[0].eigentum).toBe('eigentum');
    expect(zeilen[0].gebaeude?.wohnflaeche).toBe(150);
    expect(zeilen[0].gebaeude?.bestand.verbrauchJahr).toBe(22000);
  });

  it('weist eine gefüllte Honigfalle mit 400 ab', async () => {
    await frischeDb({ demoPreise: true });
    const antwort = await anfrage(['estimate'], kundenAnfrage({ honig: 'bot@example.com' }), { 'x-real-ip': '203.0.113.2' });
    expect(antwort.status).toBe(400);
    const db = await getDb();
    expect(await db.select().from(anfrageTabelle)).toHaveLength(0);
  });

  it('weist ein sofort abgeschicktes Formular mit 400 ab (Zeitfalle)', async () => {
    await frischeDb({ demoPreise: true });
    const antwort = await anfrage(['estimate'], kundenAnfrage({ gestartetUm: Date.now() }), { 'x-real-ip': '203.0.113.3' });
    expect(antwort.status).toBe(400);
    expect((await json(antwort)).fehler).toMatch(/Moment Zeit/);
  });

  it('lässt 20 Anfragen je IP zu und antwortet auf die 21. mit 429', async () => {
    await frischeDb({ demoPreise: true });
    const kopf = { 'x-real-ip': '203.0.113.4' };
    const stati: number[] = [];
    for (let i = 0; i < 21; i += 1) {
      const antwort = await anfrage(['estimate'], kundenAnfrage(), kopf);
      stati.push(antwort.status);
    }
    expect(stati.slice(0, 20)).toEqual(Array(20).fill(200));
    expect(stati[20]).toBe(429);
  });
});

// ---------------------------------------------------------------------------
// 2. Meister-Modus, Entwurf
// ---------------------------------------------------------------------------

describe('POST estimate, Meister-Modus mit aktion entwurf', () => {
  it('legt einen geplanten Vorgang mit KS-Nummer, Gebäudedaten und Wohneinheiten an', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const positionen = await wpPositionen(vorfuehrGebaeude());
    const antwort = await anfrage(['estimate'], internAnfrage({
      positionen,
      objekt: { adresse: 'Musterweg 4', plz: '35578', eigentum: 'eigentum', wohneinheiten: 2 },
    }));
    expect(antwort.status).toBe(200);
    const body = await json(antwort);

    expect(body.ok).toBe(true);
    expect(body.modus).toBe('intern');
    expect(body.aktion).toBe('entwurf');
    expect(body.status).toBe('geplant');
    expect(body.hinweise).toEqual([]);
    expect(body.ksNummer).toMatch(/^KS-\d{4}-\d{4}$/);

    const dto = await ladeInternAnfrage(body.anfrageId);
    expect(dto?.gebaeude.wohnflaeche).toBe(150);
    expect(dto?.gebaeude.bestand.standort).toBe('keller');
    expect(dto?.objekt.wohneinheiten).toBe(2);
    // Förderstaffel folgt dem Objekt, nicht dem mitgeschickten Förderblock.
    expect(dto?.foerderung.wohneinheiten).toBe(2);
    expect(dto?.gebaeude.wohneinheiten).toBe(2);
  });

  it('nimmt die 10-kW-Variante aus der Heizlast und füllt die Platzhalter', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const positionen = await wpPositionen(vorfuehrGebaeude());
    const wp = positionen.find((p) => p.varianteMatrixNr !== null);
    expect(wp?.varianteMatrixNr).toBe(2);
    expect(wp?.text).toContain('10 kW');
    expect(wp?.text).not.toContain('[kW]');
    expect(wp?.text).not.toContain('[Liter]');

    const body = await json(await anfrage(['estimate'], internAnfrage({ positionen })));
    expect(body.status).toBe('geplant');
  });
});

// ---------------------------------------------------------------------------
// 6. Stammdaten: Matrix, Förderregeln, Einstellungen, Demo-Preise
// ---------------------------------------------------------------------------

describe('Stammdaten-Endpunkte', () => {
  it('weist eine Matrixzeile mit von größer bis mit 400 ab', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;
    const antwort = await anfrage(['matrix', 'zeile'], { nr: 2, von: 30_000, bis: 10_000, einheit: 'pauschal', hinweis: '' });
    expect(antwort.status).toBe(400);
    expect((await json(antwort)).fehler).toMatch(/von ist größer als bis/);
  });

  it('speichert eine gültige Matrixzeile', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;
    const antwort = await anfrage(['matrix', 'zeile'], { nr: 2, von: 20_000, bis: 24_000, einheit: 'pauschal', hinweis: 'geprüft' });
    expect(antwort.status).toBe(200);
    const db = await getDb();
    const zeile = (await db.select().from(richtpreis).where(eq(richtpreis.nr, 2)))[0];
    expect(zeile.von).toBe(20_000);
    expect(zeile.bis).toBe(24_000);
  });

  it('speichert Förderregeln mit Standardsatz 55', async () => {
    const { session } = await frischeDb();
    zustand.session = session;
    const antwort = await anfrage(['matrix', 'foerderregeln'], {
      grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 30, einkommenGrenze: 40_000, deckel: 70,
      kostenWe1: 30_000, kostenJeWeitere: 15_000, maxWe: 6, standardsatz: 55, eigenanteilRundung: 1000,
    });
    expect(antwort.status).toBe(200);
    expect((await ladeFoerderRegeln()).standardsatz).toBe(55);
  });

  it('speichert Betriebskosten in den Einstellungen', async () => {
    const { session } = await frischeDb();
    zustand.session = session;
    const antwort = await anfrage(['einstellungen'], {
      ...EINSTELLUNGEN_VOLL,
      betriebskosten: { gasCtKwh: 13, oelCtLiter: 99, stromCtKwh: 31, wpStromCtKwh: 26, jazStandard: 3.8, pvEigenanteilProzent: 35, pelletsCtKg: 38, holzEurM3: 95 },
    });
    expect(antwort.status).toBe(200);
    const einst = await ladeEinstellungen();
    expect(einst.betriebskosten.gasCtKwh).toBe(13);
    expect(einst.betriebskosten.jazStandard).toBe(3.8);
  });

  it('schaltet Demo-Preise ab und wieder an', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;
    const db = await getDb();

    expect((await db.select().from(richtpreis).where(eq(richtpreis.nr, 2)))[0].von).toBe(19_800);

    expect((await anfrage(['matrix', 'demo'], { an: false })).status).toBe(200);
    const aus = (await db.select().from(richtpreis).where(eq(richtpreis.nr, 2)))[0];
    expect(aus.von).toBeNull();
    expect(aus.bis).toBeNull();
    expect((await ladeEinstellungen()).demoPreise).toBe(false);

    expect((await anfrage(['matrix', 'demo'], { an: true })).status).toBe(200);
    const an = (await db.select().from(richtpreis).where(eq(richtpreis.nr, 2)))[0];
    expect(an.von).toBe(19_800);
    expect(an.bis).toBe(23_400);
    expect((await ladeEinstellungen()).demoPreise).toBe(true);
  });

  it('lässt Stammdaten nur den Chef ändern', async () => {
    await frischeDb({ demoPreise: true });
    zustand.session = await legeBenutzerAn('buero');
    expect((await anfrage(['matrix', 'zeile'], { nr: 2, von: 1, bis: 2, einheit: 'pauschal', hinweis: '' })).status).toBe(403);
    expect((await anfrage(['matrix', 'demo'], { an: false })).status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// 9. Webhook
// ---------------------------------------------------------------------------

describe('Resend-Webhook', () => {
  it('lehnt ohne RESEND_WEBHOOK_SECRET mit 401 ab', async () => {
    await frischeDb();
    const antwort = await anfrage(['webhooks', 'resend'], { type: 'email.delivered', data: { email_id: 'abc' } });
    expect(antwort.status).toBe(401);
    expect((await json(antwort)).fehler).toMatch(/RESEND_WEBHOOK_SECRET/);
  });
});

// ---------------------------------------------------------------------------
// 7. Dispatch
// ---------------------------------------------------------------------------

/** WattFox-Lead aus Plan 9.1 (Belege 7 und 8), Wort für Wort. */
const WATTFOX = `Interesse an: Heizung (Wärmepumpe)
Art der Wärmepumpe: Luft-Wärmepumpe
Nutzung der Wärmepumpe: zum Heizen, zur Brauchwassererwärmung
Bisheriges Heizsystem: Gasheizung, Solarthermie
Gebäudetyp: Ein- / Zweifamilienhaus
Größe der zu beheizenden Fläche in qm: 150
Art der durchzuführenden Tätigkeit: Austausch / Modernisierung
Wie viele Personen leben im Haushalt?: 1-2 Personen
Baujahr des Gebäudes: 1965
Alter der Heizung in Jahren: 20
Art des Erwerbs: Kauf
Sonstiges: - Einfamilienhaus - Gebäude steht im Eigentum der anfragenden Person - Anfragende Person ist dort wohnhaft - Standort der Heizung: Keller`;

describe('POST dispatch', () => {
  it('legt aus dem Portal-Text einen Vorgang ohne erfundene Daten an', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const befehl = parseDispatchText(WATTFOX);
    expect(befehl.art).toBe('portal_lead');

    const antwort = await anfrage(['dispatch'], befehl);
    expect(antwort.status).toBe(200);
    const body = await json(antwort);
    expect(body.ok).toBe(true);
    expect(body.ksNummer).toMatch(/^KS-\d{4}-\d{4}$/);
    expect(body.rueckmeldung).toContain('Triage');

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, body.anfrageId)))[0];
    expect(a.gebaeude?.wohnflaeche).toBe(150);
    expect(a.gebaeude?.baujahr).toBe(1965);
    expect(a.gebaeude?.bestand.standort).toBe('keller');
    expect(a.interneNotizen).toContain('Portal-Lead');
    expect(a.interneNotizen).toContain('Größe der zu beheizenden Fläche in qm: 150');
    // Der Portal-Text darf nie im Kundendokument landen.
    expect(a.persoenlicherSatz).toBe('');
    // Keine erfundene PLZ.
    expect(a.objektPlz).toBe('');
    const k = (await db.select().from(kundeTabelle).where(eq(kundeTabelle.id, a.kundeId)))[0];
    expect(k.email).toBe('');
  });

  it('erfindet bei einer Freitext-Neuanlage ohne PLZ keine Adresse', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const befehl = parseDispatchText('Neue Anfrage. Frau Diflo, Klimaanlage mit Heizfunktion, 0171 1234567');
    expect(befehl.art).toBe('neuanlage');

    const body = await json(await anfrage(['dispatch'], befehl));
    expect(body.ok).toBe(true);

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, body.anfrageId)))[0];
    expect(a.objektPlz).toBe('');
    expect(a.objektPlz).not.toBe('35578');
  });

  it('fasst zwei Portal-Leads ohne E-Mail nicht zu einem Kunden zusammen', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;
    const befehl = parseDispatchText(WATTFOX);

    const eins = await json(await anfrage(['dispatch'], befehl));
    const zwei = await json(await anfrage(['dispatch'], befehl));
    expect(eins.ksNummer).not.toBe(zwei.ksNummer);

    const db = await getDb();
    const kunden = await db.select().from(kundeTabelle);
    expect(kunden).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// 3. und 4. Sofortversand und Terminmail
// ---------------------------------------------------------------------------

/** Zwei freie Terminfenster über den GET-Endpunkt holen (wie der Meister-Client). */
async function zweiTerminfenster(): Promise<string[]> {
  const fenster = await json(await lesen(['terminfenster']));
  expect(fenster.length).toBeGreaterThanOrEqual(2);
  return [fenster[0].id, fenster[1].id];
}

async function sofortSenden(zusatz: Record<string, unknown> = {}) {
  const positionen = await wpPositionen(vorfuehrGebaeude());
  const terminfensterIds = await zweiTerminfenster();
  return anfrage(['estimate'], internAnfrage({
    aktion: 'sofort',
    positionen,
    terminfensterIds,
    persoenlicherSatz: 'Nach unserem Telefonat haben wir Ihnen die Zahlen für die Wärmepumpe zusammengestellt.',
    ...zusatz,
  }));
}

describe('POST estimate, Meister-Modus mit aktion sofort', () => {
  it('versendet Kundenmail mit PDF und Dossier ans Büro und sendet beim zweiten Aufruf nichts doppelt', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const antwort = await sofortSenden();
    const body = await json(antwort);

    // Zuerst die Post: Kundenmail mit PDF, Dossier ans Büro mit Datenblatt und CSV.
    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle))[0];
    expect(post.mails).toHaveLength(2);

    const kundenmail = post.an('max.mustermann@example.de')[0];
    expect(kundenmail).toBeDefined();
    expect(kundenmail.anhaenge).toHaveLength(1);
    expect(kundenmail.anhaenge?.[0].dateiname).toBe(`Kostenschaetzung ${a.ksNummer} Bad und Energie.pdf`);
    expect(kundenmail.betreff).toContain(a.ksNummer);

    const dossier = post.an('info@bad-energie.de')[0];
    expect(dossier).toBeDefined();
    const namen = (dossier.anhaenge ?? []).map((x) => x.dateiname);
    expect(namen).toContain('datenblatt.json');
    expect(namen.some((n) => n.toLowerCase().endsWith('.csv'))).toBe(true);
    expect(namen).toContain(`Kostenschaetzung ${a.ksNummer} Bad und Energie.pdf`);

    // Dann die Antwort an den Meister und der Zustand des Vorgangs.
    expect(antwort.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.versand).toEqual({ kunde: 'versendet', dossier: 'versendet' });

    const nachher = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, a.id)))[0];
    expect(nachher.status).toBe('versendet');
    expect(nachher.wiedervorlageAm).not.toBeNull();
    expect(nachher.versendetAm).not.toBeNull();

    // Zweiter Aufruf auf denselben Vorgang: der Auftrag steht schon auf versendet.
    const zweite = await sofortSenden({ anfrageId: a.id });
    expect(zweite.status).toBe(422);
    expect((await json(zweite)).fehler).toMatch(/versendet/);
    expect(post.mails).toHaveLength(2);
  });

  it('blockiert den Versand ohne persönlichen Satz mit 422', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const antwort = await sofortSenden({ persoenlicherSatz: '' });
    expect(antwort.status).toBe(422);
    const body = await json(antwort);
    expect(body.ok).toBe(false);
    expect(body.fehler).toMatch(/Persönlicher Satz fehlt/);
    expect(body.ksNummer).toMatch(/^KS-\d{4}-\d{4}$/);
    expect(Array.isArray(body.hinweise)).toBe(true);
    expect(post.mails).toHaveLength(0);
  });

  it('lässt die Rolle buero nicht freigeben (403)', async () => {
    await frischeDb({ demoPreise: true });
    zustand.session = await legeBenutzerAn('buero');

    const antwort = await sofortSenden();
    expect(antwort.status).toBe(403);
    expect((await json(antwort)).fehler).toMatch(/Freigabeberechtigung/);
    expect(post.mails).toHaveLength(0);
  });

  it('weist eine Anfrage aus fremdem Kontext mit 403 ab', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const antwort = await anfrage(['estimate'], internAnfrage(), { 'sec-fetch-site': 'cross-site' });
    expect(antwort.status).toBe(403);
    const db = await getDb();
    expect(await db.select().from(anfrageTabelle)).toHaveLength(0);
  });

  it('antwortet ohne Sitzung mit 401', async () => {
    await frischeDb({ demoPreise: true });
    zustand.session = null;

    const antwort = await anfrage(['estimate'], internAnfrage());
    expect(antwort.status).toBe(401);
  });
});

describe('POST estimate, Meister-Modus mit aktion terminmail', () => {
  it('sendet eine Terminmail ohne Beträge', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const antwort = await sofortSenden({ aktion: 'terminmail' });
    const body = await json(antwort);

    const kundenmail = post.an('max.mustermann@example.de')[0];
    expect(kundenmail).toBeDefined();
    expect(kundenmail.betreff).toBe('Ihre Anfrage, Terminvorschlag');
    expect(kundenmail.text).not.toContain('€');
    expect(kundenmail.html).not.toContain('€');
    expect(kundenmail.anhaenge ?? []).toHaveLength(0);

    expect(antwort.status).toBe(200);
    expect(body.aktion).toBe('terminmail');
    expect(body.versand.kunde).toBe('versendet');
  });
});

// ---------------------------------------------------------------------------
// 8. Terminbestätigung über den Token aus der Kundenmail
// ---------------------------------------------------------------------------

describe('POST termin-bestaetigen', () => {
  it('bestätigt genau einmal und weist falsche Token ab', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;
    const fensterIds = await zweiTerminfenster();

    // Zuerst der Entwurf (liefert die Vorgangs-Nummer), dann der Sofortversand auf denselben Vorgang.
    // Die Antwort des Sofortversands prüft der Fall „aktion sofort“; hier zählt nur der Token in der Kundenmail.
    const entwurf = await json(await anfrage(['estimate'], internAnfrage({ positionen: await wpPositionen(vorfuehrGebaeude()) })));
    expect(entwurf.ok).toBe(true);
    await sofortSenden({ anfrageId: entwurf.anfrageId });

    const kundenmail = post.an('max.mustermann@example.de')[0];
    expect(kundenmail).toBeDefined();
    const treffer = /\/termin\/bestaetigen\/([A-Za-z0-9_-]+)/.exec(kundenmail.text);
    expect(treffer).not.toBeNull();
    const token = treffer?.[1] ?? '';

    zustand.session = null; // Die Token-Seite ist öffentlich.
    const erste = await anfrage(['termin-bestaetigen'], { token, fensterId: fensterIds[0] });
    expect(erste.status).toBe(200);
    expect((await json(erste)).ok).toBe(true);

    const db = await getDb();
    const a = (await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, entwurf.anfrageId)))[0];
    expect(a.status).toBe('antwort');
    expect(a.tokenEingeloestAm).not.toBeNull();

    const zweite = await anfrage(['termin-bestaetigen'], { token, fensterId: fensterIds[0] });
    expect((await json(zweite)).ok).toBe(false);

    const falsch = await anfrage(['termin-bestaetigen'], { token: 'unbekannt-1234', fensterId: fensterIds[0] });
    expect(falsch.status).toBe(400);
    expect((await json(falsch)).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Freigabe ohne Sofortversand und Job-Endpunkt
// ---------------------------------------------------------------------------

describe('POST freigeben und GET jobs', () => {
  it('gibt den Auftrag mit Fälligkeit zur Versandzeit frei, ohne zu senden', async () => {
    const { session } = await frischeDb({ demoPreise: true });
    zustand.session = session;

    const entwurf = await json(await anfrage(['estimate'], internAnfrage({
      positionen: await wpPositionen(vorfuehrGebaeude()),
      terminfensterIds: await zweiTerminfenster(),
      persoenlicherSatz: 'Nach unserem Telefonat haben wir Ihnen die Zahlen zusammengestellt.',
    })));
    expect(entwurf.ok).toBe(true);

    const antwort = await anfrage(['freigeben'], { anfrageId: entwurf.anfrageId, sofort: false });
    expect(antwort.status).toBe(200);
    const body = await json(antwort);
    expect(body.ok).toBe(true);
    expect(body.rueckmeldung).toContain('18:00');
    expect(post.mails).toHaveLength(0);

    const db = await getDb();
    const { versandauftrag } = await import('@/db/schema');
    const auftraege = await db.select().from(versandauftrag).where(eq(versandauftrag.anfrageId, entwurf.anfrageId));
    expect(auftraege).toHaveLength(1);
    expect(auftraege[0].status).toBe('freigegeben');
    expect(auftraege[0].art).toBe('erstkontakt');
    expect(auftraege[0].faelligAm).not.toBeNull();
    expect((auftraege[0].faelligAm as Date).getTime()).toBeGreaterThan(Date.now() - 1000);
  });

  it('lässt den Job-Endpunkt nur mit Bearer-Geheimnis oder Chef-Sitzung laufen', async () => {
    await frischeDb();
    zustand.session = null;
    process.env.CRON_SECRET = 'geheimes-cron-wort';

    const ohne = await lesen(['jobs', 'versand']);
    expect(ohne.status).toBe(401);
    expect((await json(ohne)).fehler).toMatch(/Nicht berechtigt/);

    const mit = await lesen(['jobs', 'versand'], { authorization: 'Bearer geheimes-cron-wort' });
    expect(mit.status).toBe(200);
    const body = await json(mit);
    expect(body.ok).toBe(true);
    expect(body.job).toBe('versand');
    expect(body.zusammenfassung).toBe('Nichts fällig.');
  });

  it('weist ein falsches Bearer-Geheimnis ab', async () => {
    await frischeDb();
    zustand.session = null;
    process.env.CRON_SECRET = 'geheimes-cron-wort';
    const antwort = await lesen(['jobs', 'versand'], { authorization: 'Bearer falsches-wort-mit-laenge' });
    expect(antwort.status).toBe(401);
  });
});
