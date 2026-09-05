/**
 * Registry und Prüflogik der öffentlichen Journeys.
 * Die Prüfung nutzt ausschließlich die Zod-Schemata aus `src/lib/types.ts`,
 * damit Oberfläche und Server dieselbe Wahrheit haben.
 */
import { z } from 'zod';
import {
  badAntwortenSchema,
  dringlichkeitSchema,
  heizungAntwortenSchema,
  objektSchema,
  wpAntwortenSchema,
} from '@/lib/types';
import { badJourney } from './bad';
import { heizungJourney } from './heizung';
import { waermepumpeJourney } from './waermepumpe';
import type { Frage, Journey, JourneyId, OptionWert, Schritt } from './typen';

export * from './typen';
export { badJourney, heizungJourney, waermepumpeJourney };

export const JOURNEYS: Record<JourneyId, Journey> = {
  bad: badJourney,
  heizung: heizungJourney,
  waermepumpe: waermepumpeJourney,
};

export const JOURNEY_IDS: JourneyId[] = ['bad', 'heizung', 'waermepumpe'];

export function journeyFuer(id: JourneyId): Journey {
  return JOURNEYS[id];
}

/** Zod-Schema der Journey-Antworten. */
export function antwortenSchemaFuer(id: JourneyId) {
  if (id === 'bad') return badAntwortenSchema;
  if (id === 'heizung') return heizungAntwortenSchema;
  return wpAntwortenSchema;
}

/** Zustand des Kunden-Modus, so wie er in den Request-Body wandert. */
export type JourneyZustand = {
  antworten: Record<string, unknown>;
  objekt: Record<string, unknown>;
  dringlichkeit: string;
};

export function leererZustand(journey: Journey): JourneyZustand {
  return {
    antworten: { ...journey.standardAntworten },
    objekt: { adresse: '', plz: '', eigentum: 'unklar', wohneinheiten: 1 },
    dringlichkeit: 'unklar',
  };
}

/** Alle Fragen eines Schritts, die nach den bisherigen Antworten sichtbar sind. */
export function sichtbareFragen(schritt: Schritt, zustand: JourneyZustand): Frage[] {
  return schritt.fragen.filter((frage) => {
    if (!frage.sichtbarWenn) return true;
    const wert = leseFeld(zustand, frage.ziel === 'antworten' ? 'antworten' : frage.ziel, frage.sichtbarWenn.feld);
    return frage.sichtbarWenn.werte.includes(wert as OptionWert);
  });
}

function leseFeld(zustand: JourneyZustand, ziel: Frage['ziel'], feld: string): unknown {
  if (ziel === 'objekt') return zustand.objekt[feld];
  if (ziel === 'meta') return feld === 'dringlichkeit' ? zustand.dringlichkeit : undefined;
  return zustand.antworten[feld];
}

export function leseWert(zustand: JourneyZustand, frage: Frage): unknown {
  return leseFeld(zustand, frage.ziel, frage.feld);
}

export function schreibeWert(zustand: JourneyZustand, frage: Frage, wert: unknown): JourneyZustand {
  if (frage.ziel === 'objekt') return { ...zustand, objekt: { ...zustand.objekt, [frage.feld]: wert } };
  if (frage.ziel === 'meta') return { ...zustand, dringlichkeit: String(wert) };
  return { ...zustand, antworten: { ...zustand.antworten, [frage.feld]: wert } };
}

function istLeer(wert: unknown): boolean {
  if (wert === undefined || wert === null) return true;
  if (typeof wert === 'string') return wert.trim() === '';
  if (typeof wert === 'number') return Number.isNaN(wert);
  if (Array.isArray(wert)) return wert.length === 0;
  return false;
}

function ersterFehlerImSchema(schema: z.ZodType, daten: unknown, feld: string): boolean {
  const ergebnis = schema.safeParse(daten);
  if (ergebnis.success) return false;
  return ergebnis.error.issues.some((issue) => issue.path[0] === feld);
}

const STANDARD_FEHLER = 'Bitte ergänzen Sie diese Angabe.';

/**
 * Prüft einen Schritt. Ergebnis ist eine Zuordnung Frage-ID → Meldung;
 * ein leeres Objekt bedeutet, dass es weitergehen darf.
 */
export function pruefeSchritt(journey: Journey, schrittIndex: number, zustand: JourneyZustand): Record<string, string> {
  const schritt = journey.schritte[schrittIndex];
  const fehler: Record<string, string> = {};
  if (!schritt || schritt.art !== 'fragen') return fehler;

  for (const frage of sichtbareFragen(schritt, zustand)) {
    const wert = leseWert(zustand, frage);
    if (!frage.optional && istLeer(wert)) {
      fehler[frage.id] = frage.fehler ?? STANDARD_FEHLER;
      continue;
    }
    // Optionale Fragen duerfen leer bleiben (Zahlenfelder tragen dann `null`).
    if (istLeer(wert)) continue;

    let ungueltig = false;
    if (frage.ziel === 'antworten') {
      ungueltig = ersterFehlerImSchema(antwortenSchemaFuer(journey.id), zustand.antworten, frage.feld);
    } else if (frage.ziel === 'objekt') {
      ungueltig = ersterFehlerImSchema(objektSchema, zustand.objekt, frage.feld);
    } else {
      ungueltig = !dringlichkeitSchema.safeParse(zustand.dringlichkeit).success;
    }
    if (ungueltig) fehler[frage.id] = frage.fehler ?? STANDARD_FEHLER;
  }
  return fehler;
}

/** Prüft alle Fragenschritte auf einmal (vor dem Absenden). */
export function pruefeAlle(journey: Journey, zustand: JourneyZustand): { schrittIndex: number; fehler: Record<string, string> } | null {
  for (let i = 0; i < journey.schritte.length; i += 1) {
    const fehler = pruefeSchritt(journey, i, zustand);
    if (Object.keys(fehler).length > 0) return { schrittIndex: i, fehler };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Wärmepumpen-Check: deterministische Eignung, ohne Beträge
// ---------------------------------------------------------------------------
export type EignungStufe = 'gut' | 'anpassungen' | 'ortstermin';

export type Eignung = { stufe: EignungStufe; titel: string; text: string };

const BAUJAHR_PUNKTE: Record<string, number> = { vor_1978: 0, '1978_1995': 1, '1996_2015': 2, ab_2016: 3 };
const VERTEILUNG_PUNKTE: Record<string, number> = { heizkoerper: 0, gemischt: 1, fussboden: 2 };

/** Eignungseinschätzung aus den Antworten des Wärmepumpen-Checks. */
export function eignung(antworten: Record<string, unknown>): Eignung {
  const baujahr = BAUJAHR_PUNKTE[String(antworten.baujahr)] ?? 0;
  const verteilung = VERTEILUNG_PUNKTE[String(antworten.verteilung)] ?? 0;
  const flaeche = Number(antworten.wohnflaeche) > 300 ? -1 : 0;
  const punkte = baujahr + verteilung + flaeche;

  if (punkte >= 4) {
    return {
      stufe: 'gut',
      titel: 'Eine Wärmepumpe passt gut zu Ihrem Haus',
      text: 'Bauzeit und Wärmeverteilung sprechen dafür. Wir rechnen Ihnen den Zuschuss und die Kosten aus.',
    };
  }
  if (punkte >= 2) {
    return {
      stufe: 'anpassungen',
      titel: 'Eine Wärmepumpe passt mit kleinen Anpassungen',
      text: 'In einzelnen Räumen tauschen wir vermutlich die Heizkörper. Danach arbeitet die Anlage sparsam.',
    };
  }
  return {
    stufe: 'ortstermin',
    titel: 'Das schauen wir uns gemeinsam vor Ort an',
    text: 'Ihr Haus braucht eine genaue Betrachtung. Ein Meister kommt vorbei und sagt Ihnen ehrlich, was sinnvoll ist.',
  };
}
