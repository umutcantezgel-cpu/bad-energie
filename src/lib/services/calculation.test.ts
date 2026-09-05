import { describe, expect, it } from 'vitest';
import ks31 from '../../../test/fixtures/ks-2026-0031.json';
import ks32 from '../../../test/fixtures/ks-2026-0032.json';
import type { FoerderRegeln, Position, Richtpreis } from '../types';
import {
  berechne, bruttoAusNetto, enthaeltVerboteneFelder, euro, foerderSatz, oeffentlicheSpanne,
  offenePlatzhalter, platzhalterEinsetzen, rundeAuf, rundeEuro, positionAusBaustein,
  foerderBausteine,
} from './calculation';

const REGELN: FoerderRegeln = {
  grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 30, einkommenGrenze: 40000, deckel: 70,
  kostenWe1: 30000, kostenJeWeitere: 15000, maxWe: 6, standardsatz: null, eigenanteilRundung: 1000,
};

type LegacyRow = { titel: string; gewerk: string; text: string; von: number | null; bis: number | null };
const positionenAus = (rows: LegacyRow[]): Position[] => rows.map((r, i) => ({
  id: `p${i}`, titel: r.titel, gewerk: r.gewerk as Position['gewerk'], text: r.text, menge: 1, einheit: 'pauschal',
  von: r.von, bis: r.bis, matrixNr: null, vorlageZeileId: null, varianteMatrixNr: null, zuschlag: false, aktiv: true,
  quelle: 'manuell', notizIntern: '', intern: {},
}));

describe('Formatierung und Rundung', () => {
  it('formatiert wie render.py: 21400 → 21.400', () => {
    expect(euro(21400)).toBe('21.400');
    expect(euro(25466)).toBe('25.466');
    expect(euro(999)).toBe('999');
    expect(euro(1234567)).toBe('1.234.567');
    expect(euro(null)).toBe('');
  });
  it('rundet kaufmännisch (dokumentierte Abweichung von Banker\'s Rounding)', () => {
    expect(rundeEuro(178.5)).toBe(179);
    expect(rundeEuro(178.4)).toBe(178);
    expect(bruttoAusNetto(150)).toBe(179);
    expect(rundeAuf(14916, 1000)).toBe(15000);
    expect(rundeAuf(23127, 1000)).toBe(23000);
    expect(rundeAuf(15000, 1000)).toBe(15000);
  });
});

describe('Parität zu den Beispielmappen', () => {
  it('KS-2026-0031: Netto 21.400/28.300 → Brutto 25.466/33.677, keine Förderung', () => {
    const e = berechne({ positionen: positionenAus(ks31.rows), foerderRegeln: REGELN, foerderung: null });
    expect(e.nettoVon).toBe(21400);
    expect(e.nettoBis).toBe(28300);
    expect(e.bruttoVon).toBe(25466);
    expect(e.bruttoBis).toBe(33677);
    expect(e.foerderung).toBeNull();
    expect(e.vollstaendig).toBe(true);
  });
  it('KS-2026-0032: Zeilensumme 26.400/33.300 → 31.416/39.627, Förderung 55 % → 16.500, Eigenanteil 15.000/23.000', () => {
    const e = berechne({
      positionen: positionenAus(ks32.rows), foerderRegeln: REGELN,
      foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true },
    });
    expect(e.nettoVon).toBe(26400);
    expect(e.nettoBis).toBe(33300);
    expect(e.bruttoVon).toBe(31416);
    expect(e.bruttoBis).toBe(39627);
    expect(e.foerderung).toEqual(expect.objectContaining({ satz: 55, kosten: 30000, zuschuss: 16500, eigenanteilVon: 15000, eigenanteilBis: 23000 }));
    expect(ks32.foerderung).toEqual(expect.objectContaining({ satz: 55, zuschuss: 16500, eigenanteil_von: 15000, eigenanteil_bis: 23000 }));
  });
});

describe('Förderung', () => {
  it('stapelt Boni und deckelt bei 70 %', () => {
    expect(foerderSatz(REGELN, { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: true, natuerlichesKaeltemittel: true }).satz).toBe(70);
    expect(foerderSatz(REGELN, { aktiv: true, wohneinheiten: 1, selbstBewohnt: false, altOelOderGas: true, einkommenUnterGrenze: true, natuerlichesKaeltemittel: true }).satz).toBe(35);
    expect(foerderSatz(REGELN, { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: false, einkommenUnterGrenze: false, natuerlichesKaeltemittel: false }).satz).toBe(30);
  });
  it('deckelt förderfähige Kosten je Wohneinheit', () => {
    const e = berechne({
      positionen: positionenAus([{ titel: 'WP', gewerk: 'waermepumpe', text: '', von: 60000, bis: 70000 }]),
      foerderRegeln: REGELN,
      foerderung: { aktiv: true, wohneinheiten: 3, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true },
    });
    expect(e.foerderung?.kosten).toBe(60000);
    expect(e.foerderung?.zuschuss).toBe(33000);
  });
});

describe('Block-Regel und Platzhalter', () => {
  const matrix: Richtpreis[] = [
    { nr: 9, leistung: 'Heizkörpertausch', von: 300, bis: 500, einheit: 'je_stueck', hinweis: null },
    { nr: 14, leistung: 'Bad einfach', von: null, bis: null, einheit: 'pauschal', hinweis: null },
  ];
  it('blockiert bei leerer Matrixzeile und benennt sie', () => {
    const e = berechne({ positionen: [{ ...positionenAus([{ titel: 'Badrenovierung', gewerk: 'bad', text: '', von: null, bis: null }])[0], matrixNr: 14, quelle: 'vorlage' }], matrix, foerderRegeln: REGELN });
    expect(e.vollstaendig).toBe(false);
    expect(e.blockiert[0]).toEqual(expect.objectContaining({ code: 'matrix_fehlt', matrixNr: 14 }));
    expect(oeffentlicheSpanne(e).pfad).toBe('vorangebot');
  });
  it('rechnet Mengen je Stück und liest Werte aus der Matrix', () => {
    const e = berechne({ positionen: [{ ...positionenAus([{ titel: 'Heizkörper', gewerk: 'heizung', text: '', von: null, bis: null }])[0], matrixNr: 9, einheit: 'je_stueck', menge: 3, quelle: 'vorlage' }], matrix, foerderRegeln: REGELN });
    expect(e.nettoVon).toBe(900);
    expect(e.nettoBis).toBe(1500);
  });
  it('erkennt offene Platzhalter und setzt sie ein', () => {
    expect(offenePlatzhalter('Wärmepumpe [kW] kW mit [Liter] Liter')).toEqual(['kW', 'Liter']);
    expect(platzhalterEinsetzen('[kW] kW, [Liter] Liter, [Anzahl] Stück', { kW: '10', Liter: 300 })).toBe('10 kW, 300 Liter, [Anzahl] Stück');
    const e = berechne({ positionen: positionenAus([{ titel: 'WP', gewerk: 'waermepumpe', text: 'WP [kW] kW', von: 100, bis: 200 }]), foerderRegeln: REGELN });
    expect(e.blockiert[0].code).toBe('platzhalter_offen');
  });
  it('ignoriert deaktivierte Positionen', () => {
    const p = positionenAus([{ titel: 'A', gewerk: 'bad', text: '', von: 100, bis: 200 }, { titel: 'B', gewerk: 'bad', text: '', von: null, bis: null }]);
    p[1].aktiv = false;
    const e = berechne({ positionen: p, foerderRegeln: REGELN });
    expect(e.vollstaendig).toBe(true);
    expect(e.nettoVon).toBe(100);
  });
  it('wendet den Rabatt auf Netto an', () => {
    const e = berechne({ positionen: positionenAus([{ titel: 'A', gewerk: 'bad', text: '', von: 1000, bis: 2000 }]), faktoren: { rabattProzent: 10 }, foerderRegeln: REGELN });
    expect(e.nettoVon).toBe(900);
    expect(e.bruttoBis).toBe(2142);
  });
});

describe('Öffentliche Spanne', () => {
  it('rundet auf 500 und nennt ausgeschlossene Zuschläge, ohne interne Felder', () => {
    const p = positionenAus([{ titel: 'Bad', gewerk: 'bad', text: '', von: 21400, bis: 28300 }, { titel: 'Trockenbau', gewerk: 'bad', text: '[lfm] lfm', von: null, bis: null }]);
    p[1].zuschlag = true;
    const dto = oeffentlicheSpanne(berechne({ positionen: p, foerderRegeln: REGELN }));
    expect(dto).toEqual({ pfad: 'spanne', bruttoVonGerundet: 25000, bruttoBisGerundet: 34000, nichtEnthalten: ['Trockenbau'] });
    expect(enthaeltVerboteneFelder(dto)).toEqual([]);
  });
  it('erkennt verbotene Felder', () => {
    expect(enthaeltVerboteneFelder({ a: { stundensatz: 1 }, positionen: [{ von: 1 }] })).toEqual(['a.stundensatz', 'positionen.0.von']);
  });
});

describe('positionAusBaustein', () => {
  const wpBaustein = () => ({
    id: 'z1', vorlageId: 'waermepumpe_gas', position: 1, titel: 'Wärmepumpe und Speicher', gewerk: 'waermepumpe' as const,
    text: '[Hersteller] Luft/Wasser Wärmepumpe [kW] kW mit [Liter] Liter Speicher', matrixNr: null, zuschlag: false, mengeDefault: 1,
    einheit: 'pauschal' as const, matrixHinweis: 'Matrix 1 bis 3', spanne: null,
    groessenVarianten: [{ matrixNr: 2, label: '10 kW', kwLabel: '10', speicherLiterDefault: 300 }],
  });
  const matrix: Richtpreis[] = [{ nr: 2, leistung: 'WP 10 kW', von: 19800, bis: 23400, einheit: 'pauschal', hinweis: null }];

  it('füllt Platzhalter aus der Größenvariante', () => {
    const p = positionAusBaustein(wpBaustein(), matrix, { varianteMatrixNr: 2 });
    expect(p.text).toBe('Bosch Luft/Wasser Wärmepumpe 10 kW mit 300 Liter Speicher');
    expect(p.von).toBe(19800);
    expect(p.matrixNr).toBe(2);
    expect(offenePlatzhalter(p.text)).toEqual([]);
  });

  it('setzt die gewählte Marke ein und blockiert nie an ihr', () => {
    const p = positionAusBaustein(wpBaustein(), matrix, { varianteMatrixNr: 2, hersteller: 'buderus' });
    expect(p.text).toBe('Buderus Luft/Wasser Wärmepumpe 10 kW mit 300 Liter Speicher');
    // Ohne Größenwahl bleiben [kW] und [Liter] offen und sperren, die Marke steht trotzdem im Text.
    const ohne = positionAusBaustein(wpBaustein(), matrix, {});
    expect(ohne.text.startsWith('Bosch ')).toBe(true);
    expect(offenePlatzhalter(ohne.text)).toEqual(['kW', 'Liter']);
    expect(offenePlatzhalter('[Hersteller] Wärmepumpe')).toEqual([]);
  });
});


describe('Förderbausteine und Betriebskosten in der öffentlichen Spanne', () => {
  it('benennt nur wirksame Boni in der Sprache des Chefs', () => {
    const regeln = { ...REGELN, einkommenGrenze: 40000 };
    expect(foerderBausteine({ satz: 55, boni: { grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 0 } }, regeln))
      .toEqual(['Grundförderung 30 %', 'Natürliches Kältemittel (R290) 5 %', 'Alte Gas- oder Ölheizung 20 %']);
    expect(foerderBausteine({ satz: 60, boni: { grund: 30, effizienz: 0, klimageschwindigkeit: 0, einkommen: 30 } }, regeln))
      .toEqual(['Grundförderung 30 %', 'Einkommen bis 40.000 € 30 %']);
  });

  it('ein von Hand gesetzter Satz erscheint als eigene Zeile, nie als Grundförderung', () => {
    const e = berechne({
      positionen: positionenAus(ks32.rows), foerderRegeln: REGELN,
      foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: 55 },
    });
    expect(e.foerderung?.satz).toBe(55);
    expect(e.foerderung?.manuell).toBe(true);
    expect(e.foerderung?.boni).toEqual({ grund: 0, effizienz: 0, klimageschwindigkeit: 0, einkommen: 0 });
    expect(foerderBausteine(e.foerderung!, REGELN)).toEqual(['Vom Fachbetrieb angesetzter Fördersatz 55 %']);
    expect(oeffentlicheSpanne(e, { foerderRegeln: REGELN }).foerderBausteine).toEqual(['Vom Fachbetrieb angesetzter Fördersatz 55 %']);
  });

  it('der gezeigte Eigenanteil ist derselbe wie im Kundendokument (Brutto minus Zuschuss, nach Einstellung gerundet)', () => {
    const e = berechne({
      positionen: positionenAus(ks32.rows), foerderRegeln: REGELN,
      foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true },
    });
    const dto = oeffentlicheSpanne(e, { foerderRegeln: REGELN });
    expect(dto.bruttoVonGerundet).toBe(31000);
    expect(dto.bruttoBisGerundet).toBe(40000);
    expect(dto.foerderzuschuss).toBe(16500);
    expect(dto.eigenanteilVon).toBe(15000);
    expect(dto.eigenanteilBis).toBe(23000);
    // Ergebnisseite und PDF nennen dieselben Zahlen; das PDF rechnet 31.416 − 16.500 = 14.916 → 15.000.
    expect(dto.eigenanteilVon).toBe(e.foerderung?.eigenanteilVon);
    expect(dto.eigenanteilBis).toBe(e.foerderung?.eigenanteilBis);
  });

  it('ein Zuschuss über dem Betrag lässt keinen negativen Eigenanteil entstehen', () => {
    const e = berechne({
      positionen: positionenAus([{ titel: 'WP', gewerk: 'waermepumpe', text: '', von: 1000, bis: 30000 }]),
      foerderRegeln: REGELN,
      foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: true, natuerlichesKaeltemittel: true },
    });
    const dto = oeffentlicheSpanne(e, { foerderRegeln: REGELN });
    expect(dto.eigenanteilVon).toBe(0);
    expect(dto.eigenanteilBis).toBeGreaterThanOrEqual(0);
  });

  it('trägt Betriebskosten auch im Vorangebots-Pfad und nie Preise oder Netto', () => {
    const ergebnis = berechne({ positionen: [], foerderRegeln: REGELN });
    const dto = oeffentlicheSpanne(ergebnis, { betriebskosten: { energieartLabel: 'Gas', heuteJahr: 2420, wpJahr: 1510, ersparnisJahr: 910, proMonat: 125 } });
    expect(dto.pfad).toBe('vorangebot');
    expect(dto.heizkostenHeuteJahr).toBe(2420);
    expect(dto.heizkostenWpMonat).toBe(125);
    expect(enthaeltVerboteneFelder(dto)).toEqual([]);
    const ohneErsparnis = oeffentlicheSpanne(ergebnis, { betriebskosten: { energieartLabel: 'Gas', heuteJahr: 1000, wpJahr: 1510, ersparnisJahr: -510, proMonat: 125 } });
    expect(ohneErsparnis.heizkostenWpJahr).toBeUndefined();
  });
});
