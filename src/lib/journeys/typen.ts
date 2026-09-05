/**
 * Datenmodell der oeffentlichen Journeys (Kunden-Modus des TouchConfigurators).
 *
 * Journeys sind reine Daten: Schritte, Fragen, Optionen, Piktogramm-Namen und
 * Texte in Kundensprache. Sie enthalten keine Matrixnummern, keine Betraege und
 * keine Fachbegriffe. Jede Option traegt einen Wert, der gegen die Zod-Schemata
 * aus `src/lib/types.ts` gueltig ist.
 */
import type { Quelle } from '@/lib/types';

/** Namen des Inline-SVG-Sets in `src/components/calculator/piktogramme.tsx`. */
export type PiktogrammName =
  | 'bad-komplett'
  | 'bad-teil'
  | 'dusche'
  | 'barrierefrei'
  | 'wc'
  | 'grundriss-schmal'
  | 'grundriss-quadratisch'
  | 'grundriss-l'
  | 'stufe-1'
  | 'stufe-2'
  | 'stufe-3'
  | 'walkin'
  | 'wanne'
  | 'dusch-wc'
  | 'doppelwaschtisch'
  | 'fussbodenheizung'
  | 'heizkoerper'
  | 'spiegel'
  | 'wand'
  | 'warmwasser'
  | 'gas'
  | 'oel'
  | 'strom'
  | 'holz'
  | 'gasheizung'
  | 'waermepumpe'
  | 'klima'
  | 'zeit-1'
  | 'zeit-2'
  | 'zeit-3'
  | 'haus'
  | 'doppelhaus'
  | 'reihenhaus'
  | 'mehrfamilienhaus'
  | 'baujahr-alt'
  | 'baujahr-mittel'
  | 'baujahr-neu'
  | 'baujahr-neubau'
  | 'gemischt'
  | 'waerme'
  | 'kuehlen'
  | 'eigentum'
  | 'miete'
  | 'euro'
  | 'fragezeichen'
  | 'sofort'
  | 'kalender'
  | 'uhr'
  | 'haken'
  | 'ja'
  | 'nein'
  | 'keller'
  | 'erdgeschoss'
  | 'dachgeschoss'
  | 'anbau'
  | 'aussen';

/** Wohin der Wert einer Frage geschrieben wird. */
export type FrageZiel = 'antworten' | 'objekt' | 'meta';

export type OptionWert = string | number | boolean;

export type JourneyOption = {
  wert: OptionWert;
  titel: string;
  untertitel?: string;
  piktogramm: PiktogrammName;
};

export type FrageBasis = {
  id: string;
  ziel: FrageZiel;
  feld: string;
  frage: string;
  erklaerung?: string;
  /** Meldung, wenn die Frage unbeantwortet bleibt. */
  fehler?: string;
  /** Frage darf leer bleiben. */
  optional?: boolean;
  /** Wird nur gezeigt, wenn `feld` einen der Werte traegt. */
  sichtbarWenn?: { feld: string; werte: OptionWert[] };
};

export type AuswahlFrage = FrageBasis & {
  art: 'einzelauswahl' | 'mehrfachauswahl';
  optionen: JourneyOption[];
  /** Spalten im Kachelraster ab Tablet. */
  spalten?: 2 | 3;
};

export type ZahlFrage = FrageBasis & {
  art: 'zahl';
  min: number;
  max: number;
  schritt: number;
  einheit: string;
  /** Werte, auf die der Regler einrastet. */
  rasten?: number[];
  nachkommastellen?: number;
  /**
   * Darstellung: `regler` (Standard) zeigt den Schieberegler, `feld` ein
   * Zahlenfeld. Ein Feld darf zusammen mit `optional` leer bleiben; der Wert
   * ist dann `null`.
   */
  eingabe?: 'regler' | 'feld';
};

export type AnzahlFrage = FrageBasis & {
  art: 'anzahl';
  min: number;
  max: number;
  einheit: string;
};

export type TextFrage = FrageBasis & {
  art: 'text';
  platzhalter?: string;
  maxLaenge?: number;
  eingabemodus?: 'text' | 'numeric';
};

export type Frage = AuswahlFrage | ZahlFrage | AnzahlFrage | TextFrage;

// ---------------------------------------------------------------------------
// Gemeinsame Optionslisten (Heizung und Wärmepumpen-Check fragen dasselbe ab)
// ---------------------------------------------------------------------------

/** Alter der bestehenden Anlage. Werte gegen `alter` in den Antwort-Schemata. */
export const ANLAGENALTER_OPTIONEN: JourneyOption[] = [
  { wert: 'unter_10', titel: 'Jünger als zehn Jahre', piktogramm: 'zeit-1' },
  { wert: '10_bis_20', titel: 'Zehn bis zwanzig Jahre', piktogramm: 'zeit-2' },
  { wert: 'ueber_20', titel: 'Älter als zwanzig Jahre', piktogramm: 'zeit-3' },
  { wert: 'unbekannt', titel: 'Weiß ich nicht', piktogramm: 'fragezeichen' },
];

/** Standort der Heizung im Haus. Werte gegen `HEIZUNGS_STANDORTE` in `types.ts`. */
export const STANDORT_HEIZUNG_OPTIONEN: JourneyOption[] = [
  { wert: 'keller', titel: 'Im Keller', piktogramm: 'keller' },
  { wert: 'erdgeschoss', titel: 'Im Erdgeschoss', piktogramm: 'erdgeschoss' },
  { wert: 'dachgeschoss', titel: 'Im Dachgeschoss', piktogramm: 'dachgeschoss' },
  { wert: 'anbau', titel: 'In einem Anbau', piktogramm: 'anbau' },
  { wert: 'aussen', titel: 'Außerhalb des Hauses', piktogramm: 'aussen' },
  { wert: 'unbekannt', titel: 'Weiß ich nicht', piktogramm: 'fragezeichen' },
];

export type Schritt = {
  id: string;
  titel: string;
  /** `kontakt` rendert den Kontakt- und Ergebnisschritt statt der Fragen. */
  art: 'fragen' | 'kontakt';
  frage?: string;
  erklaerung?: string;
  fragen: Frage[];
};

export type JourneyId = 'bad' | 'heizung' | 'waermepumpe';

export type Journey = {
  id: JourneyId;
  name: string;
  pfad: string;
  quelle: Quelle;
  /** Gewerke-Tripel aus tokens.css: wasser, heizung, solar, luft, elektro. */
  gewerk: 'wasser' | 'heizung' | 'solar';
  ueberschrift: string;
  unterzeile: string;
  /** Zusage auf der Ergebnisseite, wenn keine Spanne berechenbar ist. */
  zusage: string;
  schritte: Schritt[];
  /** Vollstaendig gueltiger Antwortsatz (Startwerte und Testbasis). */
  standardAntworten: Record<string, unknown>;
};

/** Begriffe, die in Kundenoberflaechen nie erscheinen duerfen (Plan 4.7). */
export const VERBOTENE_BEGRIFFE = [
  'DIN',
  'VDI',
  'EnEV',
  'GEG',
  'Heizlast',
  'Vorlauftemperatur',
  'Nennweite',
  'kW',
  'Multisplit',
  'Brennwert',
  'hydraulischer Abgleich',
] as const;

/** Akronyme und Einheiten werden gross geschrieben geprueft, Woerter unabhaengig von der Schreibung. */
const NUR_GROSS = new Set<string>(['DIN', 'VDI', 'EnEV', 'GEG', 'kW']);

/** Findet verbotene Fachbegriffe in einem Text. Leeres Ergebnis heisst sauber. */
export function verboteneBegriffe(text: string): string[] {
  const treffer: string[] = [];
  for (const begriff of VERBOTENE_BEGRIFFE) {
    const muster = new RegExp(
      `(^|[^\\p{L}])${begriff.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`,
      NUR_GROSS.has(begriff) ? 'u' : 'iu',
    );
    if (muster.test(text)) treffer.push(begriff);
  }
  return treffer;
}

/** Alle sichtbaren Texte einer Journey (fuer den Sprach-Lint). */
export function sichtbareTexte(journey: Journey): string[] {
  const texte: string[] = [journey.name, journey.ueberschrift, journey.unterzeile, journey.zusage];
  for (const schritt of journey.schritte) {
    texte.push(schritt.titel);
    if (schritt.frage) texte.push(schritt.frage);
    if (schritt.erklaerung) texte.push(schritt.erklaerung);
    for (const frage of schritt.fragen) {
      texte.push(frage.frage);
      if (frage.erklaerung) texte.push(frage.erklaerung);
      if (frage.fehler) texte.push(frage.fehler);
      if (frage.art === 'einzelauswahl' || frage.art === 'mehrfachauswahl') {
        for (const option of frage.optionen) {
          texte.push(option.titel);
          if (option.untertitel) texte.push(option.untertitel);
        }
      }
      if (frage.art === 'zahl' || frage.art === 'anzahl') texte.push(frage.einheit);
      if (frage.art === 'text' && frage.platzhalter) texte.push(frage.platzhalter);
    }
  }
  return texte;
}
