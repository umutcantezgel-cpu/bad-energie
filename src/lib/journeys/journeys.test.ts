import { describe, expect, it } from 'vitest';
import { badAntwortenSchema, dringlichkeitSchema, heizungAntwortenSchema, objektSchema, wpAntwortenSchema } from '@/lib/types';
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

const ERWARTETE_SCHRITTE: Record<JourneyId, number> = { bad: 6, heizung: 7, waermepumpe: 6 };

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
    const zeitSchritt = journey.schritte[4];
    for (const frage of zeitSchritt.fragen) {
      if (frage.feld === 'plz') zustand = schreibeWert(zustand, frage, '35576');
      if (frage.feld === 'eigentum') zustand = schreibeWert(zustand, frage, 'eigentum');
      if (frage.feld === 'dringlichkeit') zustand = schreibeWert(zustand, frage, 'sofort');
    }
    expect(pruefeAlle(journey, zustand)).toBeNull();
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
