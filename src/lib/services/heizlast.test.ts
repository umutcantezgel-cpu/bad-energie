import { describe, expect, it } from 'vitest';
import { BETRIEBSKOSTEN_STANDARD, type GebaeudeDaten, type GroessenVariante } from '../types';
import {
  baujahrKlasseAus, betriebskosten, gebaeudeAusJourney, geraeteVorschlag, heizlastAusFlaeche, heizlastAusVerbrauch,
  heizlastSchaetzen, kesseltypVermutet, leeresGebaeude, proMonat, speicherVorschlag, verbrauchKwh,
} from './heizlast';

const WP_VARIANTEN: GroessenVariante[] = [
  { matrixNr: 1, label: '5 bis 7 kW', heizlastKwVon: 0, heizlastKwBis: 7, kwLabel: '5 bis 7', speicherLiterOptionen: [200, 300], speicherLiterDefault: 200 },
  { matrixNr: 2, label: '10 kW', heizlastKwVon: 8, heizlastKwBis: 11, kwLabel: '10', speicherLiterOptionen: [200, 300], speicherLiterDefault: 300 },
  { matrixNr: 3, label: '12 kW und mehr', heizlastKwVon: 12, kwLabel: '12', speicherLiterOptionen: [300, 500], speicherLiterDefault: 300 },
];

function gebaeude(teil: Omit<Partial<GebaeudeDaten>, 'bestand'> & { bestand?: Partial<GebaeudeDaten['bestand']> }): GebaeudeDaten {
  const g = leeresGebaeude();
  const { bestand, ...rest } = teil;
  Object.assign(g, rest);
  if (bestand) Object.assign(g.bestand, bestand);
  return g;
}

describe('Heizlast nach dem Bogen des Chefs', () => {
  it('Beleg 10: 96 m², Baujahr 1955, freistehend, Dach 20 cm, Fenster dreifach, zwei Duschen → 8,3 kW über die Fläche', () => {
    const g = gebaeude({ wohnflaeche: 96, baujahr: 1955, lage: 'freistehend', dachDaemmungCm: 20, fenster: 'dreifach', duschen: 2 });
    expect(baujahrKlasseAus(1955)).toBe('vor_1977');
    expect(heizlastAusFlaeche(g)).toBe(8.3);
  });

  it('Beleg 10: 2.000 Liter Öl mit altem Standardkessel → 8,3 kW über den Verbrauch', () => {
    const g = gebaeude({ bestand: { energieart: 'oel', kesseltyp: 'standard', verbrauchJahr: 2000, verbrauchEinheit: 'liter' } });
    expect(verbrauchKwh(g.bestand)).toBe(20000);
    expect(heizlastAusVerbrauch(g.bestand)).toBe(8.3);
  });

  it('Beleg 2: 12.000 kWh Gas, alte Heizung → 5,0 kW', () => {
    const g = gebaeude({ bestand: { energieart: 'gas', verbrauchJahr: 12000, heizungsalterJahre: 25 } });
    expect(kesseltypVermutet(g.bestand)).toBe('standard');
    expect(heizlastAusVerbrauch(g.bestand)).toBe(5);
  });

  it('Pellets: 4.000 kg → 20.000 kWh × 0,65 / 1.800 = 7,2 kW', () => {
    const g = gebaeude({ bestand: { energieart: 'pellets', verbrauchJahr: 4000 } });
    expect(heizlastAusVerbrauch(g.bestand)).toBe(7.2);
  });

  it('beide Wege liefern einen Bereich und warnen bei großer Abweichung', () => {
    const g = gebaeude({ wohnflaeche: 96, baujahr: 1955, lage: 'freistehend', dachDaemmungCm: 20, fenster: 'dreifach', duschen: 2, bestand: { energieart: 'oel', kesseltyp: 'standard', verbrauchJahr: 2000 } });
    const e = heizlastSchaetzen(g);
    expect(e).not.toBeNull();
    expect(e?.methode).toBe('beide');
    expect(e?.kwVon).toBe(8.3);
    expect(e?.kwBis).toBe(8.3);
    expect(e?.kwEmpfohlen).toBe(8.3);
    expect(e?.hinweise).toHaveLength(0);
    const weit = gebaeude({ wohnflaeche: 200, baujahr: 1955, bestand: { energieart: 'gas', verbrauchJahr: 8000, kesseltyp: 'brennwert' } });
    expect(heizlastSchaetzen(weit)?.hinweise.length).toBe(1);
    // Web-Lead ohne Dämmungsangaben: die Fläche allein überschätzt, der Verbrauch ist maßgeblich (Belege 2 und 3).
    const web = gebaeude({ wohnflaeche: 150, baujahrKlasse: 'vor_1977', lage: 'freistehend', bestand: { energieart: 'gas', verbrauchJahr: 22000, heizungsalterJahre: 25 } });
    const w = heizlastSchaetzen(web);
    expect(w?.kwFlaeche).toBe(18.9);
    expect(w?.kwVerbrauch).toBe(9.2);
    expect(w?.kwEmpfohlen).toBe(9.2);
    expect(geraeteVorschlag(w?.kwEmpfohlen ?? 0, WP_VARIANTEN)?.matrixNr).toBe(2);
  });

  it('ohne Daten keine Schätzung, mit einem Weg ein Hinweis', () => {
    expect(heizlastSchaetzen(leeresGebaeude())).toBeNull();
    const nurFlaeche = heizlastSchaetzen(gebaeude({ wohnflaeche: 150, baujahrKlasse: 'vor_1977' }));
    expect(nurFlaeche?.methode).toBe('flaeche');
    expect(nurFlaeche?.hinweise[0]).toMatch(/Verbrauch ergänzen/);
  });

  it('Verbrauchseinheit, die nicht zur Energieart passt, wird nicht geraten', () => {
    const g = gebaeude({ bestand: { energieart: 'gas', verbrauchJahr: 2000, verbrauchEinheit: 'liter' } });
    expect(verbrauchKwh(g.bestand)).toBeNull();
  });
});

describe('Gerät und Speicher', () => {
  it('Beleg 3: 22.000 kWh Gas → 7 kW → Vorschlag Bosch 10 kW, Matrix 2', () => {
    const g = gebaeude({ bestand: { energieart: 'gas', verbrauchJahr: 22000, heizungsalterJahre: 15 } });
    const kw = heizlastAusVerbrauch(g.bestand);
    expect(kw).toBe(10.4);
    const alt = gebaeude({ bestand: { energieart: 'gas', verbrauchJahr: 22000, kesseltyp: 'standard' } });
    expect(heizlastAusVerbrauch(alt.bestand)).toBe(9.2);
    const v = geraeteVorschlag(7, WP_VARIANTEN);
    expect(v?.matrixNr).toBe(1);
    expect(v?.geraetKw).toBe(7);
    const v10 = geraeteVorschlag(9.2, WP_VARIANTEN);
    expect(v10?.matrixNr).toBe(2);
    expect(v10?.geraetKw).toBe(10);
    expect(v10?.kwLabel).toBe('10');
  });

  it('Lücke zwischen den Varianten fällt nach oben, über der Baureihe Kennzeichen', () => {
    expect(geraeteVorschlag(7.5, WP_VARIANTEN)?.matrixNr).toBe(2);
    const gross = geraeteVorschlag(30, WP_VARIANTEN);
    expect(gross?.matrixNr).toBe(3);
    expect(gross?.ueberBaureihe).toBe(true);
    expect(gross?.geraetKw).toBe(12);
    expect(geraeteVorschlag(30, WP_VARIANTEN, 'buderus')?.geraetKw).toBe(18);
    expect(geraeteVorschlag(5, null)).toBeNull();
  });

  it('Speicher nach Personen: bis zwei 200 Liter, ab drei 300 Liter, gerastet auf die Optionen', () => {
    expect(speicherVorschlag(1).liter).toBe(200);
    expect(speicherVorschlag(2).liter).toBe(200);
    expect(speicherVorschlag(7).liter).toBe(300);
    expect(speicherVorschlag(3, [300, 500]).liter).toBe(300);
    expect(speicherVorschlag(1, [300, 500]).liter).toBe(300);
    expect(speicherVorschlag(null).liter).toBe(200);
  });
});

describe('Betriebskosten nach den Zetteln des Chefs', () => {
  it('Beleg 4: 22.000 kWh Gas, 11 ct → 2.420 €; JAZ 3,5 und 24 ct → 6.286 kWh, 1.510 €; mit PV 910 €; 125 € im Monat', () => {
    const g = gebaeude({ bestand: { energieart: 'gas', verbrauchJahr: 22000 } });
    const b = betriebskosten(g, BETRIEBSKOSTEN_STANDARD);
    expect(b?.heuteJahr).toBe(2420);
    expect(b?.stromKwhWp).toBe(6286);
    expect(b?.wpJahr).toBe(1510);
    expect(b?.wpMitPvJahr).toBe(910);
    expect(b?.ersparnisJahr).toBe(910);
    expect(b?.proMonat).toBe(125);
    expect(b?.quelle).toBe('verbrauch');
    expect(b?.energieartLabel).toBe('Gas');
  });

  it('Beleg 1: 980 € im Jahr sind 80 € im Monat', () => {
    expect(proMonat(986)).toBe(80);
    expect(proMonat(3400 * 0.29)).toBe(80);
  });

  it('Öl in Litern wird über den Literpreis bewertet', () => {
    const g = gebaeude({ bestand: { energieart: 'oel', verbrauchJahr: 2000 } });
    const b = betriebskosten(g, BETRIEBSKOSTEN_STANDARD);
    expect(b?.heuteJahr).toBe(1900);
    expect(b?.waermebedarfKwh).toBe(20000);
  });

  it('ohne Verbrauch aus der Heizlast, ohne Preis kein Heute-Wert', () => {
    const g = gebaeude({ wohnflaeche: 150, baujahrKlasse: 'vor_1977' });
    const b = betriebskosten(g, BETRIEBSKOSTEN_STANDARD);
    expect(b?.quelle).toBe('heizlast');
    expect(b?.heuteJahr).toBeNull();
    expect(b?.ersparnisJahr).toBeNull();
    expect(b?.wpJahr).toBeGreaterThan(0);
    expect(betriebskosten(leeresGebaeude(), BETRIEBSKOSTEN_STANDARD)).toBeNull();
  });
});

describe('Vorbelegung aus dem Web', () => {
  it('übernimmt Wohnfläche, Baujahrklasse, Lage, Energieart, Alter, Personen, Verbrauch und Standort', () => {
    const g = gebaeudeAusJourney({ journey: 'heizung', heutig: 'gas', alter: 'ueber_20', gebaeude: 'efh', wohnflaeche: 150, baujahr: 'vor_1978', verteilung: 'heizkoerper', personen: 2, verbrauchJahr: 22000, standortHeizung: 'keller' }, 1);
    expect(g.wohnflaeche).toBe(150);
    expect(g.baujahrKlasse).toBe('vor_1977');
    expect(g.lage).toBe('freistehend');
    expect(g.bestand.energieart).toBe('gas');
    expect(g.bestand.heizungsalterJahre).toBe(25);
    expect(g.bestand.verbrauchJahr).toBe(22000);
    expect(g.bestand.verbrauchEinheit).toBe('kwh');
    expect(g.bestand.standort).toBe('keller');
    expect(g.personen).toBe(2);
    expect(g.wohneinheiten).toBe(1);
  });

  it('bleibt bei unbekannten Werten leer', () => {
    const g = gebaeudeAusJourney({ heutig: 'wasserstoff', baujahr: 'irgendwann' }, 3);
    expect(g.bestand.energieart).toBeNull();
    expect(g.baujahrKlasse).toBeNull();
    expect(g.wohneinheiten).toBe(3);
    expect(gebaeudeAusJourney(null).wohnflaeche).toBeNull();
  });
});
