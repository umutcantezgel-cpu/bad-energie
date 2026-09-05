/**
 * Hilfsfunktionen des öffentlichen Konfigurators.
 * Reine Funktionen ohne Serverzugriff; laufen im Browser.
 */
import type { CSSProperties } from 'react';
import { MUSTERBAEDER } from '@/config/musterbaeder';
import { euro } from '@/lib/services/calculation';
import type { JourneyId, JourneyZustand } from '@/lib/journeys';
import type { Gewerk, OeffentlicheErgebnisDTO } from '@/lib/types';

// ---------------------------------------------------------------------------
// Gewerke-Farben (Tripel aus styles/tokens.css)
// ---------------------------------------------------------------------------
export type GewerkFarbe = 'wasser' | 'heizung' | 'solar' | 'luft' | 'elektro';

/** CSS-Variablen für Fläche, Text und Tint eines Gewerks. */
export function gewerkStil(gewerk: GewerkFarbe): CSSProperties {
  const stil: Record<string, string> = {
    '--gewerk-flaeche': `var(--gewerk-${gewerk}-flaeche)`,
    '--gewerk-text': `var(--gewerk-${gewerk}-text)`,
    '--gewerk-tint': `var(--gewerk-${gewerk}-tint)`,
  };
  return stil as CSSProperties;
}

export const GEWERK_ZU_FARBE: Record<Gewerk, GewerkFarbe> = {
  bad: 'wasser',
  wasser: 'wasser',
  heizung: 'heizung',
  waermepumpe: 'solar',
  solar: 'solar',
  pv: 'solar',
  klima: 'luft',
  lueftung: 'luft',
  elektro: 'elektro',
};

// ---------------------------------------------------------------------------
// Zahlen und Anzeige
// ---------------------------------------------------------------------------

/** Deutsche Zahl mit fester Nachkommastelle: 4.6 → "4,6". */
export function zahl(wert: number, nachkommastellen = 0): string {
  return wert.toLocaleString('de-DE', {
    minimumFractionDigits: nachkommastellen,
    maximumFractionDigits: nachkommastellen,
  });
}

/** Rastet einen Reglerwert auf die nächstgelegene Raste, wenn sie nah genug liegt. */
export function raste(wert: number, rasten: number[] | undefined, toleranz = 0.35): number {
  if (!rasten || rasten.length === 0) return wert;
  let beste = wert;
  let abstand = Number.POSITIVE_INFINITY;
  for (const kandidat of rasten) {
    const d = Math.abs(kandidat - wert);
    if (d < abstand) {
      abstand = d;
      beste = kandidat;
    }
  }
  return abstand <= toleranz ? beste : wert;
}

// ---------------------------------------------------------------------------
// Ausstellungspreis (Musterbäder)
// ---------------------------------------------------------------------------
type Musterbad = {
  id: string;
  slug: string;
  sqm: number;
  tier: string;
  title: string;
  headline: string;
  priceNumber: number;
  image: string;
};

const BAEDER = MUSTERBAEDER as unknown as Musterbad[];

/** Ausstattungsstufe der Journey → Bezeichnung im Musterbad-Katalog. */
const STUFE_ZU_TIER: Record<string, string> = { basic: 'Basic', komfort: 'Premium', luxus: 'Luxus' };

export const RASTEN_QM = [4.6, 7, 8.2, 15.9];

/** Nächstgelegene Ausstellungsgröße zu einer Quadratmeterangabe. */
export function naechsteAusstellungsgroesse(qm: number): number {
  return RASTEN_QM.reduce((beste, kandidat) =>
    Math.abs(kandidat - qm) < Math.abs(beste - qm) ? kandidat : beste,
  );
}

export type Ausstellungsbad = {
  slug: string;
  titel: string;
  kurztext: string;
  bild: string;
  preis: number;
  quadratmeter: number;
};

/**
 * Musterbad zur gewählten Stufe und Raumgröße. Der Preis ist der
 * Ausstellungspreis der Badeinrichtung ohne Montage.
 */
export function ausstellungsbad(stufe: string, qm: number): Ausstellungsbad | null {
  const tier = STUFE_ZU_TIER[stufe];
  if (!tier) return null;
  const groesse = naechsteAusstellungsgroesse(qm);
  const treffer =
    BAEDER.find((bad) => bad.tier.startsWith(tier) && bad.sqm === groesse) ??
    BAEDER.find((bad) => bad.tier.startsWith(tier));
  if (!treffer) return null;
  return {
    slug: treffer.slug,
    titel: treffer.title,
    kurztext: treffer.headline,
    bild: treffer.image,
    preis: treffer.priceNumber,
    quadratmeter: treffer.sqm,
  };
}

export const AUSSTELLUNGSPREIS_LABEL = 'Ausstellungspreis Badeinrichtung, ohne Montage';

// ---------------------------------------------------------------------------
// Textbausteine der Ergebnisseite (rein, damit der Sprach-Lint sie prueft)
// ---------------------------------------------------------------------------

/**
 * Satz zum Betriebskostenvergleich.
 * Leerer Text, wenn die Serverantwort keine Heizkosten traegt.
 */
export function heizkostenSatz(dto: OeffentlicheErgebnisDTO): string {
  const heute = dto.heizkostenHeuteJahr;
  const mitPumpe = dto.heizkostenWpJahr;
  if (typeof heute !== 'number' || typeof mitPumpe !== 'number') return '';

  const energieart = dto.energieartLabel ? ` (${dto.energieartLabel})` : '';
  let satz = `Heute etwa ${euro(heute)} € im Jahr${energieart}, mit Wärmepumpe etwa ${euro(mitPumpe)} € im Jahr`;
  satz += typeof dto.heizkostenWpMonat === 'number' ? `, also rund ${euro(dto.heizkostenWpMonat)} € im Monat.` : '.';
  if (typeof dto.ersparnisJahr === 'number' && dto.ersparnisJahr > 0) {
    satz += ` Ersparnis etwa ${euro(dto.ersparnisJahr)} € im Jahr.`;
  }
  return satz;
}

/**
 * Zusatz zum Foerderkasten: Satz in Prozent und die einzelnen Bausteine
 * in der Sprache des Betriebs.
 */
export function foerderSatzText(dto: OeffentlicheErgebnisDTO): string {
  const teile: string[] = [];
  if (typeof dto.foerderSatz === 'number' && dto.foerderSatz > 0) {
    teile.push(`Das sind ${zahl(dto.foerderSatz)} Prozent der Kosten, die gefördert werden.`);
  }
  if (dto.foerderBausteine && dto.foerderBausteine.length > 0) {
    teile.push(`Darin enthalten: ${dto.foerderBausteine.join(', ')}.`);
  }
  return teile.join(' ');
}

/** Auszeichnung des Herstellers, als Textzeile im Vertrauensblock. */
export const VERTRAUEN_SIEGEL = 'Bosch Premium Partner 2026';

/**
 * Rechtlicher Unverbindlichkeitshinweis (Fachregel 4), wörtlich wie im Kostenschätzungs-Template.
 * Er steht überall dort, wo dem Kunden Beträge gezeigt werden, also auch auf der Ergebnisseite.
 *
 * Rechtstext: von der Bindestrich- und Fachbegriffsregel für Kundentexte ausgenommen; er wird
 * nicht umformuliert, weil beide Fassungen wortgleich sein müssen (Test in konfigurator-utils.test.ts).
 */
export const UNVERBINDLICHKEITS_HINWEIS =
  'Diese Kostenschätzung ist unverbindlich und kein Angebot im Sinne des § 145 BGB. '
  + 'Verbindlich sind allein die Preise des schriftlichen Angebots nach dem Termin vor Ort. '
  + 'Materialpreise mit Rohstoffbindung können sich bis dahin ändern.';

// ---------------------------------------------------------------------------
// Persistenz: nur anonyme Antworten, nie der Kontaktschritt
// ---------------------------------------------------------------------------
export function speicherSchluessel(journey: JourneyId): string {
  return `be-konfigurator:${journey}`;
}

type GespeicherterStand = { schritt: number; zustand: JourneyZustand; zeitpunkt: number };

/** Höchstalter eines wiederaufgenommenen Standes: sieben Tage. */
const HOECHSTALTER_MS = 7 * 24 * 60 * 60 * 1000;

export function ladeStand(journey: JourneyId): GespeicherterStand | null {
  if (typeof window === 'undefined') return null;
  try {
    const roh = window.sessionStorage.getItem(speicherSchluessel(journey));
    if (!roh) return null;
    const stand = JSON.parse(roh) as GespeicherterStand;
    if (!stand || typeof stand.schritt !== 'number' || !stand.zustand) return null;
    if (Date.now() - (stand.zeitpunkt ?? 0) > HOECHSTALTER_MS) return null;
    return stand;
  } catch {
    return null;
  }
}

export function speichereStand(journey: JourneyId, schritt: number, zustand: JourneyZustand): void {
  if (typeof window === 'undefined') return;
  try {
    const stand: GespeicherterStand = { schritt, zustand, zeitpunkt: Date.now() };
    window.sessionStorage.setItem(speicherSchluessel(journey), JSON.stringify(stand));
  } catch {
    // Speicher voll oder gesperrt: der Konfigurator läuft ohne Persistenz weiter.
  }
}

export function loescheStand(journey: JourneyId): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(speicherSchluessel(journey));
  } catch {
    // Nichts zu tun.
  }
}

// ---------------------------------------------------------------------------
// Wischgeste
// ---------------------------------------------------------------------------
export const WISCH_SCHWELLE = 60;
/** Waagerechte Bewegung muss deutlich größer sein als die senkrechte. */
export const WISCH_RICHTUNG = 1.4;

export function wischRichtung(dx: number, dy: number): 'vor' | 'zurueck' | null {
  if (Math.abs(dx) < WISCH_SCHWELLE) return null;
  if (Math.abs(dx) < Math.abs(dy) * WISCH_RICHTUNG) return null;
  return dx < 0 ? 'vor' : 'zurueck';
}

/** Was der Kunde auf der Ergebnisseite als enthalten sieht, je Strecke (Bad oder Heizung). */
export function enthaltenFuer(journey: 'bad' | 'heizung' | 'waermepumpe'): string[] {
  if (journey === 'bad') {
    return [
      'Abbau und Entsorgung der alten Einrichtung',
      'Material und Montage durch unsere Meister',
      'Anschluss an Wasser, Abwasser und Strom',
      'Endreinigung der Baustelle',
    ];
  }
  return [
    'Abbau und Entsorgung der alten Heizung',
    'Material und Montage durch unsere Meister',
    'Anschluss an Heizung, Warmwasser und Strom',
    'Inbetriebnahme, Einweisung und Förderservice',
  ];
}
