import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { getDb } from './client';
import {
  richtpreis, foerderRegel, vorlage, vorlageZeile, einstellung, terminfenster, plzRadius, vorbehalt,
  type GroessenVariante,
} from './schema';

const LEGACY = path.resolve(process.cwd(), 'legacy/kostenschaetzung-altsystem/Kostenschaetzung/00 Vorlagen');

type Einheit = 'pauschal' | 'je_stueck' | 'je_lfm' | 'je_tank';
type Gewerk = 'heizung' | 'bad' | 'wasser' | 'waermepumpe' | 'solar' | 'pv' | 'klima' | 'lueftung' | 'elektro';

/** Die 17 Zeilen aus richtpreis-matrix.md, alle Beträge leer (füllt der Chef). */
const MATRIX: { nr: number; leistung: string; einheit: Einheit; hinweis: string }[] = [
  { nr: 1, leistung: 'Wärmepumpe Luft/Wasser 5 bis 7 kW, Gasbestand, mit Speicher', einheit: 'pauschal', hinweis: 'vorlage_waermepumpe_gas, Zeile 1, klein' },
  { nr: 2, leistung: 'Wärmepumpe Luft/Wasser 10 kW, Gasbestand, mit Speicher', einheit: 'pauschal', hinweis: 'vorlage_waermepumpe_gas, Zeile 1' },
  { nr: 3, leistung: 'Wärmepumpe Luft/Wasser 12 kW und mehr, 2 Wohneinheiten', einheit: 'pauschal', hinweis: 'vorlage_waermepumpe_gas, Zeile 1, groß' },
  { nr: 4, leistung: 'Demontage Gasheizung inkl. Gasleitung und Abmeldung', einheit: 'pauschal', hinweis: 'vorlage_waermepumpe_gas, Zeile 2' },
  { nr: 5, leistung: 'Demontage Ölheizung inkl. Tank entleeren, reinigen, entsorgen', einheit: 'je_tank', hinweis: 'vorlage_waermepumpe_oel, Zeile 2, je Tank' },
  { nr: 6, leistung: 'Rohrleitungen, Armaturen, Befüllung', einheit: 'pauschal', hinweis: 'beide Wärmepumpen-Vorlagen, Zeile 3' },
  { nr: 7, leistung: 'Elektro, Anmeldung §14a, Zuleitung', einheit: 'pauschal', hinweis: 'beide Wärmepumpen-Vorlagen, Zeile 4' },
  { nr: 8, leistung: 'Heizlast, Abgleich, Förderservice, Inbetriebnahme', einheit: 'pauschal', hinweis: 'beide Wärmepumpen-Vorlagen, Zeile 5' },
  { nr: 9, leistung: 'Zuschlag Heizkörpertausch', einheit: 'je_stueck', hinweis: 'je Stück, Zuschlagszeile' },
  { nr: 10, leistung: 'Zuschlag Zählerschrank oder Unterverteilung erneuern', einheit: 'pauschal', hinweis: 'Zuschlagszeile' },
  { nr: 11, leistung: 'Multisplit Klima 1 Außen, 2 bis 3 Innen', einheit: 'pauschal', hinweis: 'vorlage_klima_multisplit, Zeile 1, klein' },
  { nr: 12, leistung: 'Multisplit Klima 1 Außen, 4 bis 5 Innen', einheit: 'pauschal', hinweis: 'vorlage_klima_multisplit, Zeile 1' },
  { nr: 13, leistung: 'Demontage Bestandsheizung bei Klima', einheit: 'pauschal', hinweis: 'vorlage_klima_multisplit, Zeile 2' },
  { nr: 14, leistung: 'Bad einfach, Fliese auf Fliese, bis 4 m², Hausmarke', einheit: 'pauschal', hinweis: 'vorlage_bad_einfach, Zeile 1' },
  { nr: 15, leistung: 'Bad komplett, bis 6 m², mit Abriss und Neufliesen', einheit: 'pauschal', hinweis: 'vorlage_bad_komplett, Zeile 1' },
  { nr: 16, leistung: 'Durchlauferhitzer inklusive Starkstromzuleitung', einheit: 'pauschal', hinweis: 'Zuschlagszeile, Bad und Klima' },
  { nr: 17, leistung: 'Trockenbau Vorwand oder Rückwand', einheit: 'je_lfm', hinweis: 'je lfm, Zuschlagszeile' },
];

type LegacyRow = { titel: string; gewerk: Gewerk; text: string; von: number | null; bis: number | null; zuschlag?: boolean; _matrix?: string };
type LegacyVorlage = {
  _hinweis?: string; vorhaben_kurz: string; mail_betreff: string; mail_preheader?: string;
  foerderung_standard?: boolean; rows: LegacyRow[]; annahmen_standard?: string[];
};

const VORLAGEN: { slug: string; datei: string; name: string; gewerkHaupt: Gewerk; position: number }[] = [
  { slug: 'waermepumpe_gas', datei: 'vorlage_waermepumpe_gas.json', name: 'Wärmepumpe statt Gasheizung', gewerkHaupt: 'waermepumpe', position: 1 },
  { slug: 'waermepumpe_oel', datei: 'vorlage_waermepumpe_oel.json', name: 'Wärmepumpe statt Ölheizung', gewerkHaupt: 'waermepumpe', position: 2 },
  { slug: 'klima_multisplit', datei: 'vorlage_klima_multisplit.json', name: 'Klimaanlage mit Heizfunktion', gewerkHaupt: 'klima', position: 3 },
  { slug: 'bad_einfach', datei: 'vorlage_bad_einfach.json', name: 'Badrenovierung einfach', gewerkHaupt: 'bad', position: 4 },
];

/**
 * Demo-Preissatz für die Vorführung (netto). R = aus den Referenzmappen KS-2026-0031/0032 des Altsystems,
 * D = plausible Demo-Annahme. Wird nur mit `--demo` eingespielt und im System als Demo gekennzeichnet.
 */
export const DEMO_MATRIX: Record<number, { von: number; bis: number; quelle: 'R' | 'D' }> = {
  1: { von: 17800, bis: 21400, quelle: 'D' },
  2: { von: 19800, bis: 23400, quelle: 'R' },
  3: { von: 22800, bis: 27400, quelle: 'D' },
  4: { von: 900, bis: 1500, quelle: 'R' },
  5: { von: 1200, bis: 1800, quelle: 'D' },
  6: { von: 2600, bis: 3600, quelle: 'R' },
  7: { von: 1200, bis: 2400, quelle: 'R' },
  8: { von: 1900, bis: 2400, quelle: 'R' },
  9: { von: 650, bis: 950, quelle: 'D' },
  10: { von: 1800, bis: 2800, quelle: 'D' },
  11: { von: 7900, bis: 9800, quelle: 'D' },
  12: { von: 11800, bis: 14600, quelle: 'R' },
  13: { von: 1400, bis: 2600, quelle: 'R' },
  14: { von: 4500, bis: 6500, quelle: 'D' },
  15: { von: 6900, bis: 9200, quelle: 'R' },
  16: { von: 1300, bis: 1900, quelle: 'R' },
  17: { von: 180, bis: 260, quelle: 'D' },
};
export const DEMO_STANDARDSATZ = 55;

const WP_VARIANTEN: GroessenVariante[] = [
  { matrixNr: 1, label: '5 bis 7 kW', heizlastKwVon: 0, heizlastKwBis: 7, kwLabel: '5 bis 7', speicherLiterOptionen: [200, 300], speicherLiterDefault: 200 },
  { matrixNr: 2, label: '10 kW', heizlastKwVon: 8, heizlastKwBis: 11, kwLabel: '10', speicherLiterOptionen: [200, 300], speicherLiterDefault: 300 },
  { matrixNr: 3, label: '12 kW und mehr', heizlastKwVon: 12, kwLabel: '12', speicherLiterOptionen: [300, 500], speicherLiterDefault: 300 },
];
const KLIMA_VARIANTEN: GroessenVariante[] = [
  { matrixNr: 11, label: '2 bis 3 Innengeräte', heizlastKwVon: 2, heizlastKwBis: 3 },
  { matrixNr: 12, label: '4 bis 5 Innengeräte', heizlastKwVon: 4, heizlastKwBis: 5 },
];

function matrixParsen(ref: string | undefined): { matrixNr: number | null; einheit: Einheit; varianten: GroessenVariante[] | null } {
  if (!ref) return { matrixNr: null, einheit: 'pauschal', varianten: null };
  const nummern = [...ref.matchAll(/\d+/g)].map((m) => Number(m[0]));
  const matrixNr = nummern[0] ?? null;
  const einheit: Einheit = /je Stück/i.test(ref) ? 'je_stueck' : /je lfm/i.test(ref) ? 'je_lfm' : /je Tank/i.test(ref) ? 'je_tank' : 'pauschal';
  let varianten: GroessenVariante[] | null = null;
  if (/1 bis 3/.test(ref)) varianten = WP_VARIANTEN;
  if (/11 oder 12/.test(ref)) varianten = KLIMA_VARIANTEN;
  return { matrixNr, einheit, varianten };
}

const VORBEHALTE: { text: string; gewerk?: Gewerk }[] = [
  { text: 'Verdeckte Mängel hinter Wand, Boden und Estrich sind nicht enthalten.' },
  { text: 'Schadstoffe wie Asbest werden gesondert bewertet und entsorgt.' },
  { text: 'Statische Eingriffe und Wanddurchbrüche sind nicht enthalten.' },
  { text: 'Der Zustand der Hausanschlussleitung für Strom wird vor Ort geprüft.', gewerk: 'elektro' },
  { text: 'Malerarbeiten und Tapezieren sind nicht enthalten.' },
  { text: 'Entsorgung über den genannten Umfang hinaus wird nach Aufwand berechnet.' },
  { text: 'Erschwerte Zugänglichkeit, etwa ohne Aufzug ab dem dritten Stock, kann Mehrkosten verursachen.' },
];

/** PLZ-Präfixe im Raum Wetzlar mit geschätzter Entfernung (im Intern-Bereich pflegbar). */
const PLZ: [string, string, number][] = [
  ['3557', 'Wetzlar', 0], ['3558', 'Wetzlar', 3], ['35614', 'Aßlar', 5], ['35633', 'Lahnau', 5], ['35606', 'Solms', 8],
  ['35619', 'Braunfels', 10], ['35625', 'Hüttenberg', 10], ['35641', 'Schöffengrund', 10], ['35638', 'Leun', 12],
  ['35630', 'Ehringshausen', 12], ['35644', 'Hohenahr', 15], ['35440', 'Linden', 18], ['35647', 'Waldsolms', 18],
  ['35764', 'Sinn', 18], ['35649', 'Bischoffen', 18], ['35745', 'Herborn', 20], ['35753', 'Greifenstein', 22],
  ['35756', 'Mittenaar', 22], ['3539', 'Gießen', 25], ['3568', 'Dillenburg', 25], ['3569', 'Dillenburg', 25],
  ['35415', 'Pohlheim', 28], ['35767', 'Breitscheid', 28], ['35708', 'Haiger', 30], ['35759', 'Driedorf', 30],
  ['35510', 'Butzbach', 35], ['6554', 'Limburg', 35], ['6555', 'Limburg', 35], ['35713', 'Eschenburg', 35],
  ['35716', 'Dietzhölztal', 35], ['3503', 'Marburg', 40], ['3504', 'Marburg', 40], ['61231', 'Bad Nauheim', 40],
  ['61169', 'Friedberg', 45],
];

/**
 * Kundentexte, die schon in Datenbanken stehen und nachgezogen werden muessen.
 * Der Seed legt Vorbehalte nur einmal an; ohne diesen Schritt bliebe der alte Wortlaut stehen.
 */
const VORBEHALT_TEXT_ANGLEICHUNG: [alt: string, neu: string][] = [
  [
    'Der Zustand der Elektro-Hausanschlussleitung wird vor Ort geprüft.',
    'Der Zustand der Hausanschlussleitung für Strom wird vor Ort geprüft.',
  ],
];

export type SeedOptionen = { demoPreise?: boolean };

/** Spielt den Demo-Preissatz ein oder entfernt ihn wieder; setzt die Einstellung `demo_preise`. */
export async function demoPreiseSetzen(an: boolean): Promise<void> {
  const db = await getDb();
  for (const [nrText, wert] of Object.entries(DEMO_MATRIX)) {
    const nr = Number(nrText);
    if (an) {
      await db.update(richtpreis)
        .set({ von: wert.von, bis: wert.bis, hinweis: sql`concat(coalesce(nullif(regexp_replace(${richtpreis.hinweis}, ' \\| Demo \\([RD]\\)$', ''), ''), ''), ' | Demo (', ${wert.quelle}::text, ')')`, geaendertAm: new Date() })
        .where(sql`${richtpreis.nr} = ${nr}`);
      continue;
    }
    // Nur Zeilen zuruecksetzen, die noch als Demo gekennzeichnet sind. Ein vom Chef gepflegter Preis
    // traegt das Kennzeichen nicht mehr und darf beim Abschalten der Demo nicht verloren gehen.
    await db.update(richtpreis)
      .set({ von: null, bis: null, hinweis: sql`regexp_replace(coalesce(${richtpreis.hinweis}, ''), ' \\| Demo \\([RD]\\)$', '')`, geaendertAm: new Date() })
      .where(sql`${richtpreis.nr} = ${nr} and coalesce(${richtpreis.hinweis}, '') ~ ' \\| Demo \\([RD]\\)$'`);
  }
  // Der Standardfördersatz wird von keiner Rechenfunktion gelesen und beim Abschalten nicht geleert:
  // ein von Hand eingetragener Wert soll nicht stillschweigend verschwinden.
  if (an) await db.update(foerderRegel).set({ standardsatz: DEMO_STANDARDSATZ }).where(sql`${foerderRegel.id} = 1`);
  await db.insert(einstellung).values({ key: 'demo_preise', wert: an }).onConflictDoUpdate({ target: einstellung.key, set: { wert: an, geaendertAm: new Date() } });
}

export async function seeden(optionen: SeedOptionen = {}): Promise<void> {
  const db = await getDb();

  for (const m of MATRIX) {
    await db.insert(richtpreis).values(m).onConflictDoNothing();
  }
  await db.insert(foerderRegel).values({ id: 1 }).onConflictDoNothing();

  const vorbehaltIds: number[] = [];
  const vorhandene = await db.select({ id: vorbehalt.id }).from(vorbehalt);
  if (vorhandene.length === 0) {
    const eingefuegt = await db.insert(vorbehalt).values(VORBEHALTE.map((v, i) => ({ ...v, position: i + 1 }))).returning({ id: vorbehalt.id });
    vorbehaltIds.push(...eingefuegt.map((e) => e.id));
  } else {
    vorbehaltIds.push(...vorhandene.map((v) => v.id));
    for (const [alt, neu] of VORBEHALT_TEXT_ANGLEICHUNG) {
      await db.update(vorbehalt).set({ text: neu }).where(sql`${vorbehalt.text} = ${alt}`);
    }
  }

  for (const v of VORLAGEN) {
    const datei = path.join(LEGACY, v.datei);
    if (!existsSync(datei)) { console.warn(`Vorlage fehlt: ${datei}`); continue; }
    const legacy = JSON.parse(readFileSync(datei, 'utf8')) as LegacyVorlage;
    await db.insert(vorlage).values({
      id: v.slug,
      name: v.name,
      vorhabenKurz: legacy.vorhaben_kurz,
      mailBetreff: legacy.mail_betreff,
      mailPreheader: legacy.mail_preheader ?? '',
      foerderungStandard: Boolean(legacy.foerderung_standard),
      hinweis: legacy._hinweis ?? null,
      annahmenStandard: legacy.annahmen_standard ?? [],
      vorbehaltIds: vorbehaltIds.slice(0, 3),
      gewerkHaupt: v.gewerkHaupt,
      position: v.position,
    }).onConflictDoUpdate({
      // Die Kundentexte der Vorlage kommen aus der Quelldatei und werden nachgezogen; alles andere
      // (Vorbehalte, Reihenfolge, Aktivkennzeichen) bleibt so, wie der Betrieb es gepflegt hat.
      target: vorlage.id,
      set: { annahmenStandard: legacy.annahmen_standard ?? [] },
    });
    const vorhandeneZeilen = await db.select({ id: vorlageZeile.id }).from(vorlageZeile).where(sql`${vorlageZeile.vorlageId} = ${v.slug}`);
    if (vorhandeneZeilen.length > 0) {
      // Nur den Text angleichen. `vorlage_zeile` hat keinen fachlichen Schlüssel, die Position aus der
      // Quelldatei ist der stabile Bezug; Matrixzuordnung, Menge und Größenvarianten bleiben unberührt.
      for (const [i, r] of legacy.rows.entries()) {
        await db.update(vorlageZeile).set({ text: r.text })
          .where(sql`${vorlageZeile.vorlageId} = ${v.slug} and ${vorlageZeile.position} = ${i + 1}`);
      }
      continue;
    }
    await db.insert(vorlageZeile).values(legacy.rows.map((r, i) => {
      const { matrixNr, einheit, varianten } = matrixParsen(r._matrix);
      return {
        id: randomUUID(),
        vorlageId: v.slug,
        position: i + 1,
        titel: r.titel,
        gewerk: r.gewerk,
        text: r.text,
        matrixNr,
        zuschlag: Boolean(r.zuschlag),
        mengeDefault: '1',
        einheit,
        groessenVarianten: varianten,
        matrixHinweis: r._matrix ?? null,
      };
    }));
  }

  // Leere Vorlage für Matrixzeile 15 ("eigene Vorlage später")
  await db.insert(vorlage).values({
    id: 'bad_komplett',
    name: 'Bad komplett bis 6 m²',
    vorhabenKurz: 'Badsanierung komplett',
    mailBetreff: 'Ihre Kostenschätzung für das Bad',
    mailPreheader: 'Eine erste Einschätzung mit Zahlen und zwei Terminvorschlägen für den Ortstermin.',
    foerderungStandard: false,
    hinweis: 'Bad komplett, bis 6 m², mit Abriss und Neufliesen. Matrixzeile 15.',
    annahmenStandard: ['Fliesen werden nach Wahl gesondert angeboten.', 'Malerarbeiten, Spiegel und Zubehör sind nicht enthalten.'],
    vorbehaltIds: vorbehaltIds.slice(0, 3),
    gewerkHaupt: 'bad',
    position: 5,
  }).onConflictDoNothing();
  const badKomplettZeilen = await db.select({ id: vorlageZeile.id }).from(vorlageZeile).where(sql`${vorlageZeile.vorlageId} = 'bad_komplett'`);
  if (badKomplettZeilen.length === 0) {
    await db.insert(vorlageZeile).values([
      { id: randomUUID(), vorlageId: 'bad_komplett', position: 1, titel: 'Badsanierung komplett', gewerk: 'bad', text: 'Demontage, Abriss der alten Fliesen, Abdichtung, Wand und Boden neu gefliest, Dusche, Waschtisch und WC, Silikonfugen', matrixNr: 15, einheit: 'pauschal', mengeDefault: '1', matrixHinweis: 'Matrix 15' },
      { id: randomUUID(), vorlageId: 'bad_komplett', position: 2, titel: 'Warmwasser elektrisch', gewerk: 'wasser', text: 'Durchlauferhitzer mit Starkstromzuleitung', matrixNr: 16, zuschlag: true, einheit: 'pauschal', mengeDefault: '1', matrixHinweis: 'Matrix 16' },
      { id: randomUUID(), vorlageId: 'bad_komplett', position: 3, titel: 'Trockenbau Vorwand', gewerk: 'bad', text: 'Trockenbauwand mit Feuchtraumplatte für Unterputzleitungen, [lfm] lfm', matrixNr: 17, zuschlag: true, einheit: 'je_lfm', mengeDefault: '1', matrixHinweis: 'Matrix 17, je lfm' },
    ]);
  }

  const einstellungen: Record<string, unknown> = {
    versandzeit: '18:00',
    wiedervorlage_tage: 5,
    erinnerung_tage: 7,
    radius_km: 40,
    min_qm: 50,
    speicherfrist_monate: 24,
    eingangsbestaetigung: false,
    buero_email: 'info@bad-energie.de',
    absender: { name: 'Sabri Demir', email: 'info@bad-energie.de' },
    briefbogen: {
      firma: 'Bad & Energie GmbH',
      strasse: 'Siegmund-Hiepe-Straße 20',
      plzOrt: '35578 Wetzlar',
      telefon: '06441 2039053',
      telefonLink: '+4964412039053',
      email: 'info@bad-energie.de',
      web: 'bad-energie.de',
      geschaeftsfuehrer: 'Sabri Demir',
      register: 'Amtsgericht Wetzlar HRB 2449',
      ustId: 'DE215933612',
    },
    betriebskosten: { gasCtKwh: 11, oelCtLiter: 95, stromCtKwh: 29, wpStromCtKwh: 24, jazStandard: 3.5, pvEigenanteilProzent: 40, pelletsCtKg: 35, holzEurM3: 90 },
  };
  for (const [key, wert] of Object.entries(einstellungen)) {
    await db.insert(einstellung).values({ key, wert }).onConflictDoNothing();
  }

  const fensterDatei = path.join(LEGACY, 'terminfenster.txt');
  if (existsSync(fensterDatei)) {
    const vorhandeneFenster = await db.select({ id: terminfenster.id }).from(terminfenster);
    if (vorhandeneFenster.length === 0) {
      const zeilen = readFileSync(fensterDatei, 'utf8').split('\n').map((z) => z.trim()).filter(Boolean);
      if (zeilen.length) await db.insert(terminfenster).values(zeilen.map((beschriftung) => ({ id: randomUUID(), beschriftung })));
    }
  }

  for (const [plzPraefix, ort, entfernungKm] of PLZ) {
    await db.insert(plzRadius).values({ plzPraefix, ort, entfernungKm }).onConflictDoNothing();
  }

  if (optionen.demoPreise) await demoPreiseSetzen(true);
}
