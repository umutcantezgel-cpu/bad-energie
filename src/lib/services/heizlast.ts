/**
 * Heizlast-Schnellschätzung, Gerätevorschlag, Speichervorschlag und Betriebskostenvergleich
 * nach der Arbeitsweise des Chefs (Datenerfassungsbogen Wärmepumpe und Notizzettel).
 *
 * Reine Funktionen ohne Datenzugriff; laufen im Meister-Client, im Web-Mapping und in der Dokumentenerzeugung.
 * Zwei Wege zur Heizlast: (a) Jahresverbrauch × Jahresnutzungsgrad / Volllaststunden,
 * (b) Wohnfläche × spezifischer Wärmebedarf nach Baujahr × Lagefaktor × Dämmungs-Bonus/Malus + Warmwasser.
 * Das Ergebnis ist eine Schnellschätzung; die raumweise Auslegung folgt vor Ort (Matrixzeile 8).
 */
import {
  gebaeudeSchema,
  type BaujahrKlasse,
  type BetriebskostenEinstellungen,
  type Energieart,
  type Fenster,
  type GebaeudeDaten,
  type GroessenVariante,
  type Hersteller,
  type Kesseltyp,
  type Lage,
  type VerbrauchEinheit,
} from '../types';
import { rundeAuf, rundeEuro } from './calculation';

// ---------------------------------------------------------------------------
// Tabellen des Bogens
// ---------------------------------------------------------------------------

export const VOLLLASTSTUNDEN = 1800;

export const JAHRESNUTZUNGSGRAD: Record<Kesseltyp, number> = {
  standard: 0.75, niedertemperatur: 0.85, brennwert: 0.95, holz: 0.65, nachtspeicher: 1.0, blockspeicher: 0.9, unbekannt: 0.75,
};

export const HEIZWERT: Record<Energieart, { kwhJeEinheit: number; einheit: VerbrauchEinheit }> = {
  gas: { kwhJeEinheit: 1, einheit: 'kwh' },
  oel: { kwhJeEinheit: 10, einheit: 'liter' },
  fluessiggas: { kwhJeEinheit: 7.2, einheit: 'liter' },
  strom: { kwhJeEinheit: 1, einheit: 'kwh' },
  nachtspeicher: { kwhJeEinheit: 1, einheit: 'kwh' },
  holz_weich: { kwhJeEinheit: 1200, einheit: 'm3' },
  holz_hart: { kwhJeEinheit: 1700, einheit: 'm3' },
  hackschnitzel: { kwhJeEinheit: 750, einheit: 'm3' },
  pellets: { kwhJeEinheit: 5, einheit: 'kg' },
  sonstiges: { kwhJeEinheit: 1, einheit: 'kwh' },
};

/** Spezifischer Wärmebedarf in W/m² nach Baujahrklasse. */
export const SPEZ_WAERMEBEDARF_W_M2: Record<BaujahrKlasse, number> = {
  vor_1977: 120, vor_1982: 100, vor_1995: 80, vor_2002: 60, nach_2002: 50, kfw70: 40, kfw55: 30, passivhaus: 15,
};

export const LAGEFAKTOR: Record<Lage, number> = { berg: 1.1, freistehend: 1.05, siedlung: 1.0, reiheneck: 0.95, reihenhaus: 0.9 };

/** Bonus/Malus in Prozent; die erste Stufe, deren Zentimeter erreicht sind, gilt. */
export const AUSSENWAND_MALUS: ReadonlyArray<readonly [cm: number, prozent: number]> = [[15, -35], [10, -25], [5, -15]];
export const DACH_MALUS: ReadonlyArray<readonly [cm: number, prozent: number]> = [[25, -25], [20, -20], [15, -15]];
export const FENSTER_MALUS: Record<Fenster, number> = { einfach: 0, zweifach: -15, dreifach: -20, unbekannt: 0 };
export const MALUS_UNTERGRENZE = -60;

export const WARMWASSER_W = { dusche: 500, wanne: 1000 } as const;

export const BAUREIHE_KW: Record<Hersteller, number[]> = { bosch: [4, 5, 7, 10, 12], buderus: [6, 8, 10, 13, 16, 18] };

export const ENERGIEART_LABEL: Record<Energieart, string> = {
  gas: 'Gas', oel: 'Heizöl', fluessiggas: 'Flüssiggas', strom: 'Strom', nachtspeicher: 'Nachtspeicher',
  holz_weich: 'Weichholz', holz_hart: 'Hartholz', hackschnitzel: 'Hackschnitzel', pellets: 'Pellets', sonstiges: 'Sonstiges',
};
export const KESSELTYP_LABEL: Record<Kesseltyp, string> = {
  standard: 'Alter Standardkessel', niedertemperatur: 'Niedertemperaturkessel', brennwert: 'Brennwertkessel',
  holz: 'Stückholz oder Hackschnitzel', nachtspeicher: 'Nachtspeicher', blockspeicher: 'Blockspeicher', unbekannt: 'Unbekannt',
};
export const BAUJAHR_KLASSE_LABEL: Record<BaujahrKlasse, string> = {
  vor_1977: 'vor 1977', vor_1982: '1977 bis 1981', vor_1995: '1982 bis 1994', vor_2002: '1995 bis 2001',
  nach_2002: 'ab 2002', kfw70: 'KfW 70', kfw55: 'KfW 55', passivhaus: 'Passivhaus',
};
export const LAGE_LABEL: Record<Lage, string> = {
  berg: 'Exponiert am Berg', freistehend: 'Freistehend', siedlung: 'In der Siedlung', reiheneck: 'Reiheneckhaus', reihenhaus: 'Reihenhaus',
};
export const FENSTER_LABEL: Record<Fenster, string> = { einfach: 'Einfachglas', zweifach: 'Zweifach', dreifach: 'Dreifach', unbekannt: 'Unbekannt' };
export const HERSTELLER_LABEL: Record<Hersteller, string> = { bosch: 'Bosch', buderus: 'Buderus' };

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function kwRunden(kw: number): number {
  return Math.round(kw * 10) / 10;
}

function malusFuer(stufen: ReadonlyArray<readonly [number, number]>, cm: number | null | undefined): number {
  if (cm === null || cm === undefined || cm <= 0) return 0;
  for (const [grenze, prozent] of stufen) if (cm >= grenze) return prozent;
  return 0;
}

export function baujahrKlasseAus(jahr: number): BaujahrKlasse {
  if (jahr < 1977) return 'vor_1977';
  if (jahr < 1982) return 'vor_1982';
  if (jahr < 1995) return 'vor_1995';
  if (jahr < 2002) return 'vor_2002';
  return 'nach_2002';
}

export function baujahrKlasseFuer(g: Pick<GebaeudeDaten, 'baujahr' | 'baujahrKlasse'>): BaujahrKlasse | null {
  if (g.baujahrKlasse) return g.baujahrKlasse;
  if (g.baujahr) return baujahrKlasseAus(g.baujahr);
  return null;
}

/** Kesseltyp: gesetzter Wert, sonst aus Energieart und Alter vermutet (unter 10 Jahre Brennwert, unter 20 Niedertemperatur). */
export function kesseltypVermutet(b: GebaeudeDaten['bestand']): Kesseltyp {
  if (b.kesseltyp) return b.kesseltyp;
  const art = b.energieart;
  if (art === 'holz_weich' || art === 'holz_hart' || art === 'hackschnitzel' || art === 'pellets') return 'holz';
  if (art === 'nachtspeicher') return 'nachtspeicher';
  if (art === 'strom') return 'nachtspeicher';
  if (art === 'gas' || art === 'oel' || art === 'fluessiggas') {
    const alter = b.heizungsalterJahre;
    if (alter === null) return 'unbekannt';
    if (alter < 10) return 'brennwert';
    if (alter < 20) return 'niedertemperatur';
    return 'standard';
  }
  return 'unbekannt';
}

/** Jahresverbrauch in kWh Endenergie; null ohne Verbrauch oder Energieart. */
export function verbrauchKwh(b: GebaeudeDaten['bestand']): number | null {
  if (!b.energieart || b.verbrauchJahr === null || b.verbrauchJahr <= 0) return null;
  const heizwert = HEIZWERT[b.energieart];
  const einheit = b.verbrauchEinheit ?? heizwert.einheit;
  if (einheit === 'kwh') return Math.round(b.verbrauchJahr);
  if (einheit === heizwert.einheit) return Math.round(b.verbrauchJahr * heizwert.kwhJeEinheit);
  // Einheit passt nicht zur Energieart (etwa Liter bei Gas): nicht raten.
  return null;
}

/** Weg (a): Verbrauch × Jahresnutzungsgrad / Volllaststunden. */
export function heizlastAusVerbrauch(b: GebaeudeDaten['bestand']): number | null {
  const kwh = verbrauchKwh(b);
  if (kwh === null) return null;
  return kwRunden((kwh * JAHRESNUTZUNGSGRAD[kesseltypVermutet(b)]) / VOLLLASTSTUNDEN);
}

/** Weg (b): Wohnfläche × spezifischer Wärmebedarf × Lage × (1 + Bonus/Malus) + Warmwasser. */
export function heizlastAusFlaeche(g: GebaeudeDaten): number | null {
  const klasse = baujahrKlasseFuer(g);
  if (!g.wohnflaeche || !klasse) return null;
  const grund = g.wohnflaeche * SPEZ_WAERMEBEDARF_W_M2[klasse];
  const lage = g.lage ? LAGEFAKTOR[g.lage] : 1;
  const malus = Math.max(
    MALUS_UNTERGRENZE,
    malusFuer(AUSSENWAND_MALUS, g.aussenwandDaemmungCm) + malusFuer(DACH_MALUS, g.dachDaemmungCm) + (g.fenster ? FENSTER_MALUS[g.fenster] : 0),
  );
  const warmwasser = g.duschen * WARMWASSER_W.dusche + g.wannen * WARMWASSER_W.wanne;
  const watt = grund * lage * (1 + malus / 100) + warmwasser;
  return kwRunden(watt / 1000);
}

export type HeizlastErgebnis = {
  kwVon: number;
  kwBis: number;
  /** Maßgeblicher Wert für die Gerätewahl: der Verbrauchsweg, wenn vorhanden (so arbeitet der Chef), sonst die Fläche. */
  kwEmpfohlen: number;
  kwVerbrauch: number | null;
  kwFlaeche: number | null;
  methode: 'verbrauch' | 'flaeche' | 'beide';
  hinweise: string[];
};

/** Beide Wege zusammengeführt; null, wenn keiner rechenbar ist. */
export function heizlastSchaetzen(g: GebaeudeDaten): HeizlastErgebnis | null {
  const kwVerbrauch = heizlastAusVerbrauch(g.bestand);
  const kwFlaeche = heizlastAusFlaeche(g);
  if (kwVerbrauch === null && kwFlaeche === null) return null;
  const hinweise: string[] = [];
  if (kwVerbrauch !== null && kwFlaeche !== null) {
    const kwVon = Math.min(kwVerbrauch, kwFlaeche);
    const kwBis = Math.max(kwVerbrauch, kwFlaeche);
    if (kwVon > 0 && (kwBis - kwVon) / kwVon > 0.25) {
      hinweise.push('Verbrauch und Gebäudedaten weichen deutlich voneinander ab. Vor Ort raumweise prüfen.');
    }
    return { kwVon, kwBis, kwEmpfohlen: kwVerbrauch, kwVerbrauch, kwFlaeche, methode: 'beide', hinweise };
  }
  const kw = (kwVerbrauch ?? kwFlaeche) as number;
  const methode = kwVerbrauch !== null ? 'verbrauch' : 'flaeche';
  hinweise.push(methode === 'verbrauch' ? 'Nur aus dem Verbrauch geschätzt; Gebäudedaten ergänzen.' : 'Nur aus den Gebäudedaten geschätzt; Verbrauch ergänzen, die Fläche allein überschätzt bei fehlender Dämmung.');
  return { kwVon: kw, kwBis: kw, kwEmpfohlen: kw, kwVerbrauch, kwFlaeche, methode, hinweise };
}

// ---------------------------------------------------------------------------
// Gerät und Speicher
// ---------------------------------------------------------------------------

/** Nächstgrößere Stufe der Baureihe; über der größten Stufe gilt die größte mit Kennzeichen. */
export function geraetAusBaureihe(kw: number, hersteller: Hersteller): { kw: number; ueberBaureihe: boolean } {
  const reihe = BAUREIHE_KW[hersteller];
  const passend = reihe.find((stufe) => stufe >= kw);
  if (passend !== undefined) return { kw: passend, ueberBaureihe: false };
  return { kw: reihe[reihe.length - 1], ueberBaureihe: true };
}

export type GeraeteVorschlag = {
  matrixNr: number;
  label: string;
  kwLabel: string;
  geraetKw: number;
  hersteller: Hersteller;
  ueberBaureihe: boolean;
};

/** Größenvariante nach Heizlast: erste Variante, deren obere kW-Grenze reicht; darüber die größte. */
export function geraeteVorschlag(kw: number, varianten: GroessenVariante[] | null | undefined, hersteller: Hersteller = 'bosch'): GeraeteVorschlag | null {
  if (!varianten?.length || !(kw > 0)) return null;
  const sortiert = [...varianten].sort((a, b) => (a.heizlastKwVon ?? 0) - (b.heizlastKwVon ?? 0));
  const variante = sortiert.find((v) => kw <= (v.heizlastKwBis ?? Number.POSITIVE_INFINITY)) ?? sortiert[sortiert.length - 1];
  const geraet = geraetAusBaureihe(kw, hersteller);
  return {
    matrixNr: variante.matrixNr,
    label: variante.label,
    kwLabel: variante.kwLabel ?? String(geraet.kw),
    geraetKw: geraet.kw,
    hersteller,
    ueberBaureihe: geraet.ueberBaureihe,
  };
}

/** Warmwasserspeicher: bis zwei Personen 200 Liter, ab drei 300 Liter, auf die Optionen der Variante gerastet. */
export function speicherVorschlag(personen: number | null | undefined, optionen: number[] = [200, 300]): { liter: number; optionen: number[] } {
  const wunsch = (personen ?? 2) <= 2 ? 200 : 300;
  const sortiert = [...optionen].sort((a, b) => a - b);
  const liter = sortiert.find((o) => o >= wunsch) ?? sortiert[sortiert.length - 1] ?? wunsch;
  return { liter, optionen: sortiert };
}

// ---------------------------------------------------------------------------
// Betriebskosten
// ---------------------------------------------------------------------------

export function jahresstrombedarfWp(waermebedarfKwh: number, jaz: number): number {
  if (!(jaz > 0)) return 0;
  return Math.round(waermebedarfKwh / jaz);
}

/** Jahresbetrag auf 5 € je Monat gerundet (980 €/a → 80 €/Monat wie auf dem Zettel). */
export function proMonat(jahr: number): number {
  return rundeAuf(jahr / 12, 5);
}

export type BetriebskostenErgebnis = {
  energieart: Energieart | null;
  energieartLabel: string;
  waermebedarfKwh: number;
  heuteJahr: number | null;
  stromKwhWp: number;
  wpJahr: number;
  wpMitPvJahr: number;
  ersparnisJahr: number | null;
  proMonat: number;
  jaz: number;
  quelle: 'verbrauch' | 'heizlast';
};

/** Heutige Heizkosten aus Verbrauch und Preis der Energieart; null, wenn kein Preis hinterlegt ist. */
export function heizkostenHeute(b: GebaeudeDaten['bestand'], preise: BetriebskostenEinstellungen): number | null {
  const kwh = verbrauchKwh(b);
  if (kwh === null || !b.energieart) return null;
  const art = b.energieart;
  if (art === 'gas' || art === 'sonstiges') return rundeAuf((kwh * preise.gasCtKwh) / 100, 10);
  if (art === 'strom' || art === 'nachtspeicher') return rundeAuf((kwh * preise.stromCtKwh) / 100, 10);
  if (art === 'oel') return rundeAuf(((kwh / HEIZWERT.oel.kwhJeEinheit) * preise.oelCtLiter) / 100, 10);
  if (art === 'pellets') return rundeAuf(((kwh / HEIZWERT.pellets.kwhJeEinheit) * preise.pelletsCtKg) / 100, 10);
  if (art === 'holz_weich' || art === 'holz_hart' || art === 'hackschnitzel') return rundeAuf((kwh / HEIZWERT[art].kwhJeEinheit) * preise.holzEurM3, 10);
  return null;
}

/**
 * Vergleich heute gegen Wärmepumpe. Wärmebedarf = Verbrauch in kWh (bewusst ohne Nutzungsgrad, konservativ),
 * sonst obere Heizlast × Volllaststunden. Wärmepumpenstrom = Wärmebedarf / JAZ.
 */
export function betriebskosten(
  g: GebaeudeDaten,
  preise: BetriebskostenEinstellungen,
  heizlast?: HeizlastErgebnis | null,
): BetriebskostenErgebnis | null {
  const kwh = verbrauchKwh(g.bestand);
  const schaetzung = heizlast === undefined ? heizlastSchaetzen(g) : heizlast;
  let waermebedarfKwh: number;
  let quelle: BetriebskostenErgebnis['quelle'];
  if (kwh !== null) {
    waermebedarfKwh = kwh;
    quelle = 'verbrauch';
  } else if (schaetzung) {
    waermebedarfKwh = Math.round(schaetzung.kwBis * VOLLLASTSTUNDEN);
    quelle = 'heizlast';
  } else {
    return null;
  }
  const jaz = preise.jazStandard > 0 ? preise.jazStandard : 3.5;
  const stromKwhWp = jahresstrombedarfWp(waermebedarfKwh, jaz);
  const wpJahrRoh = (stromKwhWp * preise.wpStromCtKwh) / 100;
  const wpJahr = rundeAuf(wpJahrRoh, 10);
  const wpMitPvJahr = rundeAuf(wpJahrRoh * (1 - Math.min(Math.max(preise.pvEigenanteilProzent, 0), 100) / 100), 10);
  const heuteJahr = heizkostenHeute(g.bestand, preise);
  const ersparnisJahr = heuteJahr === null ? null : rundeEuro(heuteJahr - wpJahr);
  return {
    energieart: g.bestand.energieart,
    energieartLabel: g.bestand.energieart ? ENERGIEART_LABEL[g.bestand.energieart] : 'bisherige Heizung',
    waermebedarfKwh,
    heuteJahr,
    stromKwhWp,
    wpJahr,
    wpMitPvJahr,
    ersparnisJahr,
    proMonat: proMonat(wpJahrRoh),
    jaz,
    quelle,
  };
}

// ---------------------------------------------------------------------------
// Gebäude aus Journey-Antworten und leerer Datensatz
// ---------------------------------------------------------------------------

export function leeresGebaeude(): GebaeudeDaten {
  return gebaeudeSchema.parse({});
}

const BAUJAHR_AUS_JOURNEY: Record<string, BaujahrKlasse> = {
  vor_1978: 'vor_1977', '1978_1995': 'vor_1995', '1996_2015': 'vor_2002', ab_2016: 'kfw70',
};
const LAGE_AUS_JOURNEY: Record<string, Lage> = { efh: 'freistehend', dhh: 'reiheneck', rh: 'reihenhaus', mfh: 'siedlung' };
const ENERGIEART_AUS_JOURNEY: Record<string, Energieart> = { gas: 'gas', oel: 'oel', strom: 'strom', holz: 'holz_hart', sonstiges: 'sonstiges' };
const ALTER_AUS_JOURNEY: Record<string, number | null> = { unter_10: 5, '10_bis_20': 15, ueber_20: 25, unbekannt: null };
const STANDORT_AUS_JOURNEY = new Set(['keller', 'erdgeschoss', 'dachgeschoss', 'anbau', 'aussen', 'unbekannt']);

function zahlOderNull(wert: unknown): number | null {
  const n = typeof wert === 'number' ? wert : typeof wert === 'string' && wert.trim() ? Number(wert) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Vorbelegung aus den Antworten des öffentlichen Trichters (Heizung, Wärmepumpen-Check). */
export function gebaeudeAusJourney(antworten: Record<string, unknown> | null | undefined, wohneinheiten = 1): GebaeudeDaten {
  const g = leeresGebaeude();
  g.wohneinheiten = Math.max(1, Math.min(12, wohneinheiten || 1));
  if (!antworten) return g;
  const a = antworten;
  g.wohnflaeche = zahlOderNull(a.wohnflaeche);
  if (typeof a.baujahr === 'string' && a.baujahr in BAUJAHR_AUS_JOURNEY) g.baujahrKlasse = BAUJAHR_AUS_JOURNEY[a.baujahr];
  if (typeof a.gebaeude === 'string' && a.gebaeude in LAGE_AUS_JOURNEY) g.lage = LAGE_AUS_JOURNEY[a.gebaeude];
  g.personen = zahlOderNull(a.personen) ? Math.round(zahlOderNull(a.personen) as number) : null;
  if (typeof a.heutig === 'string' && a.heutig in ENERGIEART_AUS_JOURNEY) {
    g.bestand.energieart = ENERGIEART_AUS_JOURNEY[a.heutig];
    g.bestand.verbrauchEinheit = HEIZWERT[g.bestand.energieart].einheit;
  }
  if (typeof a.alter === 'string' && a.alter in ALTER_AUS_JOURNEY) g.bestand.heizungsalterJahre = ALTER_AUS_JOURNEY[a.alter];
  if (typeof a.verteilung === 'string' && (a.verteilung === 'heizkoerper' || a.verteilung === 'fussboden' || a.verteilung === 'gemischt')) g.bestand.verteilung = a.verteilung;
  const verbrauch = zahlOderNull(a.verbrauchJahr);
  if (verbrauch !== null && g.bestand.energieart) g.bestand.verbrauchJahr = verbrauch;
  if (typeof a.standortHeizung === 'string' && STANDORT_AUS_JOURNEY.has(a.standortHeizung)) g.bestand.standort = a.standortHeizung as GebaeudeDaten['bestand']['standort'];
  return g;
}
