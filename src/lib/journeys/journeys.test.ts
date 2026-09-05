import { describe, expect, it } from 'vitest';
import { foerderSatzText, heizkostenSatz } from '@/components/calculator/konfigurator-utils';
import {
  badAntwortenSchema,
  dringlichkeitSchema,
  heizungAntwortenSchema,
  objektSchema,
  wpAntwortenSchema,
  type OeffentlicheErgebnisDTO,
} from '@/lib/types';
import {
  JOURNEYS,
  JOURNEY_IDS,
  antwortenSchemaFuer,
  eignung,
  leererZustand,
  pruefeAlle,
  pruefeSchritt,
  schreibeWert,
  sichtbareTexte,
  verboteneBegriffe,
} from './index';
import type { AuswahlFrage, Journey, JourneyId } from './typen';

const ERWARTETE_SCHRITTE: Record<JourneyId, number> = { bad: 6, heizung: 7, waermepumpe: 7 };

function auswahlFragen(journey: Journey): AuswahlFrage[] {
  return journey.schritte
    .flatMap((schritt) => schritt.fragen)
    .filter((frage): frage is AuswahlFrage => frage.art === 'einzelauswahl' || frage.art === 'mehrfachauswahl');
}

describe('Journeys: Aufbau', () => {
  it('kennt genau drei Journeys', () => {
    expect(JOURNEY_IDS).toEqual(['bad', 'heizung', 'waermepumpe']);
  });

  for (const id of JOURNEY_IDS) {
    it(`${id}: hat ${ERWARTETE_SCHRITTE[id]} Schritte und schliesst mit dem Kontaktschritt`, () => {
      const journey = JOURNEYS[id];
      expect(journey.schritte).toHaveLength(ERWARTETE_SCHRITTE[id]);
      expect(journey.schritte[journey.schritte.length - 1].art).toBe('kontakt');
      expect(journey.schritte.filter((s) => s.art === 'kontakt')).toHaveLength(1);
    });

    it(`${id}: Schritt- und Frage-IDs sind eindeutig`, () => {
      const journey = JOURNEYS[id];
      const schrittIds = journey.schritte.map((s) => s.id);
      expect(new Set(schrittIds).size).toBe(schrittIds.length);
      const frageIds = journey.schritte.flatMap((s) => s.fragen).map((f) => f.id);
      expect(new Set(frageIds).size).toBe(frageIds.length);
    });
  }
});

describe('Journeys: Optionswerte sind gegen die Zod-Schemata gueltig', () => {
  for (const id of JOURNEY_IDS) {
    const journey = JOURNEYS[id];

    it(`${id}: die Standardantworten erfuellen das Schema`, () => {
      expect(antwortenSchemaFuer(id).safeParse(journey.standardAntworten).success).toBe(true);
    });

    it(`${id}: jede Option der Journey-Antworten ist gueltig`, () => {
      const schema = antwortenSchemaFuer(id);
      for (const frage of auswahlFragen(journey).filter((f) => f.ziel === 'antworten')) {
        for (const option of frage.optionen) {
          const wert = frage.art === 'mehrfachauswahl' ? [option.wert] : option.wert;
          const ergebnis = schema.safeParse({ ...journey.standardAntworten, [frage.feld]: wert });
          expect(ergebnis.success, `${id}.${frage.feld} = ${String(option.wert)}`).toBe(true);
        }
      }
    });

    it(`${id}: jede Option zu Objekt und Dringlichkeit ist gueltig`, () => {
      for (const frage of auswahlFragen(journey).filter((f) => f.ziel !== 'antworten')) {
        for (const option of frage.optionen) {
          if (frage.ziel === 'objekt') {
            const ergebnis = objektSchema.safeParse({ adresse: '', plz: '35576', eigentum: 'unklar', wohneinheiten: 1, [frage.feld]: option.wert });
            expect(ergebnis.success, `${id}.objekt.${frage.feld}`).toBe(true);
          } else {
            expect(dringlichkeitSchema.safeParse(option.wert).success, `${id}.${frage.feld}`).toBe(true);
          }
        }
      }
    });

    it(`${id}: Zahlengrenzen liegen innerhalb des Schemas`, () => {
      const schema = antwortenSchemaFuer(id);
      const zahlen = journey.schritte
        .flatMap((s) => s.fragen)
        .filter((f) => f.art === 'zahl' || f.art === 'anzahl');
      for (const frage of zahlen) {
        if (frage.ziel !== 'antworten') continue;
        const grenzen = frage as unknown as { min: number; max: number; feld: string };
        for (const wert of [grenzen.min, grenzen.max]) {
          const ergebnis = schema.safeParse({ ...journey.standardAntworten, [grenzen.feld]: wert });
          expect(ergebnis.success, `${id}.${grenzen.feld} = ${wert}`).toBe(true);
        }
      }
    });
  }

  it('die Schemata sind den Journeys richtig zugeordnet', () => {
    expect(antwortenSchemaFuer('bad')).toBe(badAntwortenSchema);
    expect(antwortenSchemaFuer('heizung')).toBe(heizungAntwortenSchema);
    expect(antwortenSchemaFuer('waermepumpe')).toBe(wpAntwortenSchema);
  });
});

describe('Journeys: Sprache', () => {
  for (const id of JOURNEY_IDS) {
    it(`${id}: kein verbotener Fachbegriff in Beschriftungen und Erklaerungen`, () => {
      const treffer = sichtbareTexte(JOURNEYS[id])
        .map((text) => ({ text, begriffe: verboteneBegriffe(text) }))
        .filter((eintrag) => eintrag.begriffe.length > 0);
      expect(treffer).toEqual([]);
    });

    it(`${id}: kein Eurobetrag und keine Matrixnummer in den Daten`, () => {
      const roh = JSON.stringify(JOURNEYS[id]);
      expect(roh).not.toMatch(/€/);
      expect(roh).not.toMatch(/matrix/i);
    });
  }

  it('erkennt verbotene Begriffe', () => {
    expect(verboteneBegriffe('Wir pruefen die Heizlast im Haus')).toContain('Heizlast');
    expect(verboteneBegriffe('Leistung 12 kW')).toContain('kW');
    expect(verboteneBegriffe('Nach GEG erforderlich')).toContain('GEG');
  });

  it('haelt harmlose Woerter fuer sauber', () => {
    expect(verboteneBegriffe('Die Rueckwand wird gefliest')).toEqual([]);
    expect(verboteneBegriffe('Wir haben dagegen nichts einzuwenden')).toEqual([]);
  });
});

describe('Journeys: Schrittpruefung', () => {
  it('bad: der erste Schritt meldet die fehlende Auswahl', () => {
    const journey = JOURNEYS.bad;
    const zustand = leererZustand(journey);
    zustand.antworten.vorhaben = undefined;
    expect(pruefeSchritt(journey, 0, zustand)).toHaveProperty('vorhaben');
  });

  it('bad: der erste Schritt ist mit Auswahl sauber', () => {
    const journey = JOURNEYS.bad;
    const zustand = leererZustand(journey);
    expect(pruefeSchritt(journey, 0, zustand)).toEqual({});
  });

  it('bad: eine unvollstaendige Postleitzahl wird gemeldet', () => {
    const journey = JOURNEYS.bad;
    let zustand = leererZustand(journey);
    zustand.objekt.plz = '355';
    zustand.objekt.eigentum = 'eigentum';
    zustand.dringlichkeit = 'wochen_4';
    const fehler = pruefeSchritt(journey, 4, zustand);
    expect(fehler).toHaveProperty('plz');

    zustand = { ...zustand, objekt: { ...zustand.objekt, plz: '35576' } };
    expect(pruefeSchritt(journey, 4, zustand)).toEqual({});
  });

  it('heizung: die Tankfrage erscheint nur bei Oel', () => {
    const journey = JOURNEYS.heizung;
    const zustand = leererZustand(journey);
    zustand.antworten.tanks = undefined;
    expect(pruefeSchritt(journey, 0, zustand)).toEqual({});
    zustand.antworten.heutig = 'oel';
    expect(pruefeSchritt(journey, 0, zustand)).toHaveProperty('tanks');
  });

  it('waermepumpe: der vollstaendige Zustand laeuft durch', () => {
    const journey = JOURNEYS.waermepumpe;
    let zustand = leererZustand(journey);
    const zeitSchritt = journey.schritte[5];
    for (const frage of zeitSchritt.fragen) {
      if (frage.feld === 'plz') zustand = schreibeWert(zustand, frage, '35576');
      if (frage.feld === 'eigentum') zustand = schreibeWert(zustand, frage, 'eigentum');
      if (frage.feld === 'dringlichkeit') zustand = schreibeWert(zustand, frage, 'sofort');
    }
    expect(pruefeAlle(journey, zustand)).toBeNull();
  });
});

describe('Journeys: Portal-Felder', () => {
  it('heizung und waermepumpe fragen Personen, Verbrauch und Standort ab', () => {
    for (const id of ['heizung', 'waermepumpe'] as const) {
      const felder = JOURNEYS[id].schritte.flatMap((s) => s.fragen).map((f) => f.feld);
      expect(felder, id).toContain('personen');
      expect(felder, id).toContain('verbrauchJahr');
      expect(felder, id).toContain('standortHeizung');
    }
  });

  it('waermepumpe fragt Alter, Selbstbewohnung und Einkommen ab', () => {
    const felder = JOURNEYS.waermepumpe.schritte.flatMap((s) => s.fragen).map((f) => f.feld);
    expect(felder).toContain('alter');
    expect(felder).toContain('selbstBewohnt');
    expect(felder).toContain('einkommenUnterGrenze');
    expect(JOURNEYS.waermepumpe.schritte.map((s) => s.id)).toEqual([
      'heute',
      'haus',
      'verteilung',
      'komfort',
      'foerderung',
      'zeit',
      'kontakt',
    ]);
  });

  it('die Verbrauchsfrage ist ein optionales Zahlenfeld mit passender Einheit je Brennstoff', () => {
    for (const id of ['heizung', 'waermepumpe'] as const) {
      const fragen = JOURNEYS[id].schritte
        .flatMap((s) => s.fragen)
        .filter((f) => f.feld === 'verbrauchJahr' && f.art === 'zahl');
      expect(fragen, id).toHaveLength(3);
      for (const frage of fragen) {
        expect(frage.optional, id).toBe(true);
        expect((frage as { eingabe?: string }).eingabe, id).toBe('feld');
      }
      const einheiten = fragen.map((f) => (f as { einheit: string }).einheit);
      expect(einheiten, id).toContain('kWh im Jahr');
      expect(einheiten, id).toContain('Liter im Jahr');
      expect(einheiten, id).toContain('Raummeter im Jahr');
    }
  });

  it('jede Verbrauchsfrage gilt fuer genau eine Gruppe von Brennstoffen', () => {
    for (const id of ['heizung', 'waermepumpe'] as const) {
      const fragen = JOURNEYS[id].schritte
        .flatMap((s) => s.fragen)
        .filter((f) => f.feld === 'verbrauchJahr' && f.art === 'zahl');
      const werte = fragen.flatMap((f) => f.sichtbarWenn?.werte ?? []);
      // Kilowattstunden nur dort, wo die Abrechnung sie ausweist; Holz hat eine eigene Einheit.
      expect(new Set(werte).size, id).toBe(werte.length);
      expect(werte.sort(), id).toEqual(['gas', 'holz', 'oel', 'sonstiges', 'strom']);
      const holz = fragen.find((f) => (f as { einheit: string }).einheit === 'Raummeter im Jahr');
      expect(holz?.sichtbarWenn?.werte, id).toEqual(['holz']);
    }
  });

  it('eine leere Verbrauchsangabe ist gueltig, eine gefuellte ebenso', () => {
    for (const id of ['heizung', 'waermepumpe'] as const) {
      const journey = JOURNEYS[id];
      const zustand = leererZustand(journey);
      expect(zustand.antworten.verbrauchJahr, id).toBeNull();
      expect(pruefeSchritt(journey, 0, zustand), id).toEqual({});

      const gefuellt = { ...zustand, antworten: { ...zustand.antworten, verbrauchJahr: 22_000 } };
      expect(pruefeSchritt(journey, 0, gefuellt), id).toEqual({});
      expect(antwortenSchemaFuer(id).safeParse(gefuellt.antworten).success, id).toBe(true);
    }
  });

  it('die Standardantworten der Oel-Strecke bleiben gueltig', () => {
    const journey = JOURNEYS.heizung;
    const zustand = leererZustand(journey);
    zustand.antworten.heutig = 'oel';
    zustand.antworten.verbrauchJahr = null;
    expect(pruefeSchritt(journey, 0, zustand)).toEqual({});
  });
});

describe('Ergebnistexte: Sprache', () => {
  const dto: OeffentlicheErgebnisDTO = {
    pfad: 'spanne',
    bruttoVonGerundet: 22_000,
    bruttoBisGerundet: 27_000,
    foerderzuschuss: 14_850,
    foerderSatz: 55,
    foerderBausteine: ['Grundförderung 30 %', 'Alte Gas- oder Ölheizung 20 %', 'Natürliches Kältemittel (R290) 5 %'],
    eigenanteilVon: 7_000,
    eigenanteilBis: 12_000,
    heizkostenHeuteJahr: 2_420,
    heizkostenWpJahr: 1_510,
    heizkostenWpMonat: 125,
    ersparnisJahr: 910,
    energieartLabel: 'Gas',
    nichtEnthalten: [],
  };

  it('der Heizkostensatz nennt beide Betraege, den Monat und die Ersparnis', () => {
    const satz = heizkostenSatz(dto);
    expect(satz).toContain('2.420 € im Jahr');
    expect(satz).toContain('1.510 € im Jahr');
    expect(satz).toContain('125 € im Monat');
    expect(satz).toContain('910 € im Jahr');
    expect(satz).toContain('(Gas)');
  });

  it('der Foerdertext nennt Satz und Bausteine', () => {
    const text = foerderSatzText(dto);
    expect(text).toContain('55 Prozent');
    expect(text).toContain('Darin enthalten: Grundförderung 30 %');
  });

  it('beide Texte tragen keinen verbotenen Fachbegriff', () => {
    expect(verboteneBegriffe(heizkostenSatz(dto))).toEqual([]);
    expect(verboteneBegriffe(foerderSatzText(dto))).toEqual([]);
  });

  it('ohne Heizkosten bleibt der Satz leer', () => {
    expect(heizkostenSatz({ pfad: 'vorangebot', nichtEnthalten: [] })).toBe('');
    expect(foerderSatzText({ pfad: 'vorangebot', nichtEnthalten: [] })).toBe('');
  });
});

describe('Waermepumpen-Check: Eignung', () => {
  it('Neubau mit Flaechenheizung passt gut', () => {
    expect(eignung({ baujahr: 'ab_2016', verteilung: 'fussboden', wohnflaeche: 150 }).stufe).toBe('gut');
  });

  it('Altbau mit Heizkoerpern braucht einen Ortstermin', () => {
    expect(eignung({ baujahr: 'vor_1978', verteilung: 'heizkoerper', wohnflaeche: 180 }).stufe).toBe('ortstermin');
  });

  it('Mittleres Baualter braucht Anpassungen', () => {
    expect(eignung({ baujahr: '1978_1995', verteilung: 'gemischt', wohnflaeche: 140 }).stufe).toBe('anpassungen');
  });

  it('die Einschaetzung nennt keinen Fachbegriff', () => {
    for (const daten of [
      { baujahr: 'ab_2016', verteilung: 'fussboden', wohnflaeche: 120 },
      { baujahr: '1978_1995', verteilung: 'gemischt', wohnflaeche: 140 },
      { baujahr: 'vor_1978', verteilung: 'heizkoerper', wohnflaeche: 400 },
    ]) {
      const treffer = eignung(daten);
      expect(verboteneBegriffe(`${treffer.titel} ${treffer.text}`)).toEqual([]);
    }
  });
});
