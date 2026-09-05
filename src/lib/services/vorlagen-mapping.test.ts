import { describe, expect, it } from 'vitest';
import { BETRIEBSKOSTEN_STANDARD, type Baustein, type FoerderRegeln, type JourneyAntworten, type Kalkulationsdaten, type Richtpreis, type Vorlage } from '../types';
import { berechne, offenePlatzhalter, oeffentlicheSpanne } from './calculation';
import { mappeJourney } from './vorlagen-mapping';

/**
 * Der Web-Trichter darf nie eine Gerätegröße erfinden. Diese Läufe halten fest, wann eine Größe
 * gesetzt wird (belastbare Heizlast) und wann die Anfrage bewusst in den Vorangebots-Pfad läuft.
 */

const REGELN: FoerderRegeln = {
  grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 30, einkommenGrenze: 40000, deckel: 70,
  kostenWe1: 30000, kostenJeWeitere: 15000, maxWe: 6, standardsatz: null, eigenanteilRundung: 1000,
};

const MATRIX: Richtpreis[] = [
  { nr: 1, leistung: 'Wärmepumpe 5 bis 7 kW', von: 17800, bis: 21400, einheit: 'pauschal', hinweis: null },
  { nr: 2, leistung: 'Wärmepumpe 10 kW', von: 19800, bis: 23400, einheit: 'pauschal', hinweis: null },
  { nr: 3, leistung: 'Wärmepumpe 12 kW und mehr', von: 22800, bis: 27400, einheit: 'pauschal', hinweis: null },
  { nr: 4, leistung: 'Demontage Gasheizung', von: 900, bis: 1500, einheit: 'pauschal', hinweis: null },
  { nr: 6, leistung: 'Rohrleitungen', von: 2600, bis: 3600, einheit: 'pauschal', hinweis: null },
  { nr: 9, leistung: 'Heizkörpertausch', von: 650, bis: 950, einheit: 'je_stueck', hinweis: null },
  { nr: 10, leistung: 'Zählerschrank', von: 1800, bis: 2800, einheit: 'pauschal', hinweis: null },
];

function baustein(teil: Partial<Baustein> & Pick<Baustein, 'id' | 'titel' | 'text'>): Baustein {
  return {
    vorlageId: 'waermepumpe_gas', position: 1, gewerk: 'waermepumpe', matrixNr: null, zuschlag: false,
    mengeDefault: 1, einheit: 'pauschal', groessenVarianten: null, matrixHinweis: null, spanne: null, ...teil,
  };
}

const WP_VORLAGE: Vorlage = {
  id: 'waermepumpe_gas',
  name: 'Wärmepumpe statt Gasheizung',
  vorhabenKurz: 'Luft/Wasser Wärmepumpe statt Gasheizung',
  mailBetreff: 'Ihre Kostenschätzung',
  mailPreheader: '',
  foerderungStandard: true,
  hinweis: null,
  annahmenStandard: ['Die vorhandenen Heizkörper bleiben und reichen bei der bisherigen Betriebsweise aus.'],
  vorbehaltIds: [],
  gewerkHaupt: 'waermepumpe',
  bausteine: [
    baustein({
      id: 'z1', titel: 'Wärmepumpe und Speicher',
      text: '[Hersteller] Luft/Wasser Wärmepumpe [kW] kW mit Inneneinheit, Regelung und [Liter] Liter Trinkwasserspeicher',
      groessenVarianten: [
        { matrixNr: 1, label: '5 bis 7 kW', heizlastKwVon: 0, heizlastKwBis: 7, kwLabel: '5 bis 7', speicherLiterOptionen: [200, 300], speicherLiterDefault: 200 },
        { matrixNr: 2, label: '10 kW', heizlastKwVon: 8, heizlastKwBis: 11, kwLabel: '10', speicherLiterOptionen: [200, 300], speicherLiterDefault: 300 },
        { matrixNr: 3, label: '12 kW und mehr', heizlastKwVon: 12, kwLabel: '12', speicherLiterOptionen: [300, 500], speicherLiterDefault: 300 },
      ],
    }),
    baustein({ id: 'z2', position: 2, titel: 'Demontage Gasheizung', gewerk: 'heizung', text: 'Alte Gasheizung ausbauen und entsorgen', matrixNr: 4 }),
    baustein({ id: 'z3', position: 3, titel: 'Rohrleitungen', gewerk: 'heizung', text: 'Leitungen, Armaturen, Befüllung', matrixNr: 6 }),
    baustein({ id: 'z4', position: 4, titel: 'Heizkörpertausch', gewerk: 'heizung', text: 'Heizkörper tauschen, [Anzahl] Stück', matrixNr: 9, zuschlag: true, einheit: 'je_stueck' }),
    baustein({ id: 'z5', position: 5, titel: 'Zählerschrank', gewerk: 'elektro', text: 'Zählerschrank erneuern', matrixNr: 10, zuschlag: true }),
  ],
};

const DATEN: Kalkulationsdaten = {
  matrix: MATRIX, vorlagen: [WP_VORLAGE], foerderRegeln: REGELN, vorbehalte: [], betriebskosten: BETRIEBSKOSTEN_STANDARD,
};

type HeizungAntworten = Extract<JourneyAntworten, { journey: 'heizung' }>;

const BASIS: HeizungAntworten = {
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
  verbrauchJahr: null,
  standortHeizung: 'keller',
};

function mappe(teil: Partial<HeizungAntworten>) {
  return mappeJourney({ ...BASIS, ...teil }, DATEN, 1);
}

describe('Web-Trichter: Größe der Wärmepumpe', () => {
  it('22.000 kWh Gas ergeben Matrix 2 und den Text „Bosch Luft/Wasser Wärmepumpe 10 kW“', () => {
    const e = mappe({ verbrauchJahr: 22000 });
    const groesse = e.positionen[0];
    expect(groesse.varianteMatrixNr).toBe(2);
    expect(groesse.matrixNr).toBe(2);
    expect(groesse.text).toContain('Bosch Luft/Wasser Wärmepumpe 10 kW');
    // Speicher nach Personen: bis zwei 200 Liter, ab drei 300 Liter (Beleg 3).
    expect(groesse.text).toContain('200 Liter');
    expect(mappe({ verbrauchJahr: 22000, personen: 4 }).positionen[0].text).toContain('300 Liter');
    expect(offenePlatzhalter(groesse.text)).toEqual([]);
    expect(e.heizlast?.belastbar).toBe(true);
    const ergebnis = berechne({ positionen: e.positionen, matrix: MATRIX, foerderung: e.foerderung, foerderRegeln: REGELN });
    expect(oeffentlicheSpanne(ergebnis, { foerderRegeln: REGELN }).pfad).toBe('spanne');
    expect(e.annahmen).toContain('Die Größe der Wärmepumpe haben wir aus Ihrem Verbrauch abgeleitet, die genaue Auslegung folgt beim Termin vor Ort.');
  });

  it('ohne Verbrauch bleibt die Größe offen und die Anfrage läuft in den Vorangebots-Pfad', () => {
    const e = mappe({ verbrauchJahr: null });
    const groesse = e.positionen[0];
    expect(e.heizlast?.belastbar).toBe(false);
    expect(groesse.varianteMatrixNr).toBeNull();
    expect(groesse.matrixNr).toBeNull();
    expect(groesse.von).toBeNull();
    expect(offenePlatzhalter(groesse.text)).toEqual(['kW', 'Liter']);
    const ergebnis = berechne({ positionen: e.positionen, matrix: MATRIX, foerderung: e.foerderung, foerderRegeln: REGELN });
    expect(oeffentlicheSpanne(ergebnis, { foerderRegeln: REGELN }).pfad).toBe('vorangebot');
    expect(e.annahmen).toContain('Für die Größe der Wärmepumpe brauchen wir Ihren Jahresverbrauch; die genaue Auslegung folgt beim Termin vor Ort.');
    // Kundentext ohne Bindestrich im Fließtext.
    for (const a of e.annahmen) expect(a).not.toMatch(/[A-Za-zÄÖÜäöüß]-[A-Za-zÄÖÜäöüß]/);
  });

  it('ein Verbrauch über der Baureihe setzt keine Größe und nennt die Klärung vor Ort', () => {
    const e = mappe({ verbrauchJahr: 60000 });
    expect(e.heizlast?.belastbar).toBe(true);
    expect(e.positionen[0].varianteMatrixNr).toBeNull();
    expect(e.annahmen).toContain('Die berechnete Größe liegt über der größten Baureihe, die Auslegung klären wir vor Ort.');
  });

  it('Holz in Raummetern bläht den Verbrauch nicht auf', () => {
    const holz = mappe({ heutig: 'holz', verbrauchJahr: 12 });
    expect(holz.gebaeude?.bestand.verbrauchEinheit).toBe('m3');
    expect(holz.betriebskosten?.waermebedarfKwh).toBe(20400);
    expect(holz.heizlast?.kwVerbrauch).toBe(7.4);
    // Eine Kilowattstundenzahl im Holzfeld ist unplausibel und bleibt außer Betracht.
    const vertippt = mappe({ heutig: 'holz', verbrauchJahr: 20000 });
    expect(vertippt.heizlast?.kwVerbrauch).toBeNull();
    expect(vertippt.betriebskosten?.heuteJahr).toBeNull();
    expect(vertippt.positionen[0].varianteMatrixNr).toBeNull();
  });
});
