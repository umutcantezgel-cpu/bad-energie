/**
 * Berechnungs- und Validierungslogik für Kostenschätzungen.
 * Reine Funktionen ohne Datenzugriff; läuft serverseitig und (nach Anmeldung) in der Live-Kalkulationsleiste.
 *
 * Fachregeln: keine erfundenen Preise (fehlende Matrixwerte blockieren), Spannen von…bis,
 * Brutto = Netto × 1,19, Förderung nach Satzstapel und Deckel, Eigenanteil gerundet nach Einstellung.
 */
import type {
  Baustein,
  Einheit,
  FoerderRegeln,
  FoerderungEingabe,
  FoerderungErgebnis,
  Hinweis,
  Kalkulationsfaktoren,
  KalkulationsErgebnis,
  OeffentlicheErgebnisDTO,
  Position,
  PositionErgebnis,
  Richtpreis,
  Spanne,
} from '../types';

export const MWST_FAKTOR = 1.19;
export const OEFFENTLICHE_RUNDUNG = 500;
export const PLATZHALTER_REGEX = /\[(kW|Liter|Anzahl|lfm)\]/g;

// ---------------------------------------------------------------------------
// Rundung und Formatierung
// ---------------------------------------------------------------------------

/** Kaufmännische Rundung auf ganze Euro (halb aufrunden). Bewusste Abweichung von render.py (Banker's Rounding). */
export function rundeEuro(n: number): number {
  return Math.floor(n + 0.5);
}

/** Rundet kaufmännisch auf ein Vielfaches von `schritt`. */
export function rundeAuf(n: number, schritt: number): number {
  if (schritt <= 0) return rundeEuro(n);
  return Math.floor(n / schritt + 0.5) * schritt;
}

/** Ganze Euro mit Tausenderpunkt: 21400 → "21.400". Leer bei null. */
export function euro(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const ganz = rundeEuro(Number(n));
  const vorzeichen = ganz < 0 ? '-' : '';
  const ziffern = String(Math.abs(ganz));
  return vorzeichen + ziffern.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function bruttoAusNetto(netto: number): number {
  return rundeEuro(netto * MWST_FAKTOR);
}

// ---------------------------------------------------------------------------
// Platzhalter und Matrix
// ---------------------------------------------------------------------------

/** Unaufgelöste Platzhalter im Positionstext ([kW], [Liter], [Anzahl], [lfm]). */
export function offenePlatzhalter(text: string): string[] {
  const treffer = new Set<string>();
  for (const m of text.matchAll(PLATZHALTER_REGEX)) treffer.add(m[1]);
  return [...treffer];
}

export function platzhalterEinsetzen(text: string, werte: Partial<Record<'kW' | 'Liter' | 'Anzahl' | 'lfm', string | number | null | undefined>>): string {
  return text.replace(PLATZHALTER_REGEX, (ganz, name: 'kW' | 'Liter' | 'Anzahl' | 'lfm') => {
    const wert = werte[name];
    return wert === undefined || wert === null || wert === '' ? ganz : String(wert);
  });
}

export function matrixSpanne(matrix: Richtpreis[], nr: number | null | undefined): Spanne | null {
  if (nr === null || nr === undefined) return null;
  const zeile = matrix.find((m) => m.nr === nr);
  if (!zeile || zeile.von === null || zeile.bis === null) return null;
  return { von: zeile.von, bis: zeile.bis };
}

export function matrixEinheit(matrix: Richtpreis[], nr: number | null | undefined): Einheit | null {
  if (nr === null || nr === undefined) return null;
  return matrix.find((m) => m.nr === nr)?.einheit ?? null;
}

/**
 * Erzeugt aus einem Baustein (Vorlagenzeile) eine Position. Größenvariante, Menge und
 * Platzhalterwerte kommen aus der Kachel bzw. dem Konfigurator-Mapping.
 */
export function positionAusBaustein(
  b: Baustein,
  matrix: Richtpreis[],
  optionen: { id?: string; varianteMatrixNr?: number | null; menge?: number; kW?: string | number; liter?: number; anzahl?: number; lfm?: number; aktiv?: boolean } = {},
): Position {
  const variante = b.groessenVarianten?.find((v) => v.matrixNr === optionen.varianteMatrixNr) ?? null;
  const matrixNr = variante ? variante.matrixNr : b.groessenVarianten?.length ? (optionen.varianteMatrixNr ?? null) : b.matrixNr;
  const spanne = matrixSpanne(matrix, matrixNr);
  const text = platzhalterEinsetzen(b.text, {
    kW: optionen.kW ?? variante?.kwLabel,
    Liter: optionen.liter ?? variante?.speicherLiterDefault,
    Anzahl: optionen.anzahl,
    lfm: optionen.lfm,
  });
  return {
    id: optionen.id ?? b.id,
    titel: b.titel,
    gewerk: b.gewerk,
    text,
    menge: optionen.menge ?? b.mengeDefault ?? 1,
    einheit: b.einheit,
    von: spanne?.von ?? null,
    bis: spanne?.bis ?? null,
    matrixNr,
    vorlageZeileId: b.id,
    varianteMatrixNr: variante?.matrixNr ?? null,
    zuschlag: b.zuschlag,
    aktiv: optionen.aktiv ?? !b.zuschlag,
    quelle: 'vorlage',
    notizIntern: '',
    intern: {},
  };
}

// ---------------------------------------------------------------------------
// Förderung
// ---------------------------------------------------------------------------

export function foerderSatz(regeln: FoerderRegeln, eingabe: FoerderungEingabe): { satz: number; boni: FoerderungErgebnis['boni'] } {
  const boni = {
    grund: regeln.grund,
    effizienz: eingabe.natuerlichesKaeltemittel ? regeln.effizienz : 0,
    klimageschwindigkeit: eingabe.selbstBewohnt && eingabe.altOelOderGas ? regeln.klimageschwindigkeit : 0,
    einkommen: eingabe.selbstBewohnt && eingabe.einkommenUnterGrenze ? regeln.einkommen : 0,
  };
  const summe = boni.grund + boni.effizienz + boni.klimageschwindigkeit + boni.einkommen;
  return { satz: Math.min(summe, regeln.deckel), boni };
}

/** Förderbausteine in der Sprache des Chefs (Beleg 1): nur die wirksamen Boni, mit Prozent. */
export function foerderBausteine(boni: FoerderungErgebnis['boni'], regeln: FoerderRegeln): string[] {
  const liste: string[] = [];
  if (boni.grund > 0) liste.push(`Grundförderung ${boni.grund} %`);
  if (boni.effizienz > 0) liste.push(`Natürliches Kältemittel (R290) ${boni.effizienz} %`);
  if (boni.klimageschwindigkeit > 0) liste.push(`Alte Gas- oder Ölheizung ${boni.klimageschwindigkeit} %`);
  if (boni.einkommen > 0) liste.push(`Einkommen bis ${euro(regeln.einkommenGrenze)} € ${boni.einkommen} %`);
  return liste;
}

export function foerderfaehigeKosten(regeln: FoerderRegeln, wohneinheiten: number, bruttoBis: number): number {
  const we = Math.max(1, Math.min(wohneinheiten || 1, regeln.maxWe));
  const deckel = regeln.kostenWe1 + regeln.kostenJeWeitere * (we - 1);
  return Math.min(Math.max(0, bruttoBis), deckel);
}

export function berechneFoerderung(
  regeln: FoerderRegeln,
  eingabe: FoerderungEingabe,
  brutto: Spanne,
): { ergebnis: FoerderungErgebnis | null; hinweis: Hinweis | null } {
  let satz: number;
  let boni: FoerderungErgebnis['boni'];
  if (eingabe.satzManuell !== null && eingabe.satzManuell !== undefined) {
    satz = Math.min(Math.max(0, eingabe.satzManuell), regeln.deckel);
    boni = { grund: satz, effizienz: 0, klimageschwindigkeit: 0, einkommen: 0 };
  } else {
    ({ satz, boni } = foerderSatz(regeln, eingabe));
  }
  if (satz <= 0) return { ergebnis: null, hinweis: { code: 'foerdersatz_fehlt', text: 'Kein Fördersatz ermittelbar.' } };
  const kosten = foerderfaehigeKosten(regeln, eingabe.wohneinheiten, brutto.bis);
  const zuschuss = rundeEuro((kosten * satz) / 100);
  const rundung = regeln.eigenanteilRundung || 1;
  const eigenanteilVon = Math.max(0, rundeAuf(brutto.von - zuschuss, rundung));
  const eigenanteilBis = Math.max(0, rundeAuf(brutto.bis - zuschuss, rundung));
  return { ergebnis: { satz, kosten, zuschuss, eigenanteilVon, eigenanteilBis, boni }, hinweis: null };
}

// ---------------------------------------------------------------------------
// Kalkulation
// ---------------------------------------------------------------------------

export type KalkulationsEingabe = {
  positionen: Position[];
  matrix?: Richtpreis[];
  faktoren?: Kalkulationsfaktoren;
  foerderung?: FoerderungEingabe | null;
  foerderRegeln: FoerderRegeln;
};

function positionBewerten(p: Position, matrix: Richtpreis[] | undefined): { ergebnis: PositionErgebnis; hinweise: Hinweis[] } {
  const hinweise: Hinweis[] = [];
  let einzelVon = p.von;
  let einzelBis = p.bis;
  const effektiveNr = p.varianteMatrixNr ?? p.matrixNr;
  if ((einzelVon === null || einzelBis === null) && matrix && effektiveNr !== null) {
    const s = matrixSpanne(matrix, effektiveNr);
    if (s) { einzelVon = s.von; einzelBis = s.bis; }
  }
  if (p.aktiv) {
    if (einzelVon === null || einzelBis === null) {
      if (p.quelle === 'vorlage' && p.matrixNr === null && p.varianteMatrixNr === null) {
        hinweise.push({ code: 'variante_fehlt', text: `Größe für „${p.titel}“ wählen.`, positionId: p.id });
      } else if (effektiveNr !== null) {
        hinweise.push({ code: 'matrix_fehlt', text: `Matrixzeile ${effektiveNr} („${p.titel}“) hat keine Spanne.`, positionId: p.id, matrixNr: effektiveNr });
      } else {
        hinweise.push({ code: 'wert_fehlt', text: `„${p.titel}“ braucht von und bis.`, positionId: p.id });
      }
    }
    const offen = offenePlatzhalter(p.text);
    if (offen.length) hinweise.push({ code: 'platzhalter_offen', text: `„${p.titel}“: ${offen.map((o) => `[${o}]`).join(', ')} offen.`, positionId: p.id });
    if (p.einheit !== 'pauschal' && !(p.menge > 0)) hinweise.push({ code: 'menge_fehlt', text: `Menge für „${p.titel}“ fehlt.`, positionId: p.id });
  }
  if (einzelVon !== null && einzelBis !== null && einzelVon > einzelBis) {
    hinweise.push({ code: 'wert_fehlt', text: `„${p.titel}“: von ist größer als bis.`, positionId: p.id });
  }
  const blockiert = p.aktiv && hinweise.length > 0;
  const menge = p.einheit === 'pauschal' ? (p.menge > 0 ? p.menge : 1) : p.menge;
  const von = !blockiert && einzelVon !== null ? rundeEuro(einzelVon * menge) : null;
  const bis = !blockiert && einzelBis !== null ? rundeEuro(einzelBis * menge) : null;
  return {
    ergebnis: {
      positionId: p.id, titel: p.titel, gewerk: p.gewerk, text: p.text, menge, einheit: p.einheit,
      einzelVon, einzelBis, von, bis, blockiert, zuschlag: p.zuschlag,
    },
    hinweise: p.aktiv ? hinweise : [],
  };
}

export function berechne(eingabe: KalkulationsEingabe): KalkulationsErgebnis {
  const blockiert: Hinweis[] = [];
  const positionen: PositionErgebnis[] = [];
  let nettoVon = 0;
  let nettoBis = 0;
  for (const p of eingabe.positionen) {
    const { ergebnis, hinweise } = positionBewerten(p, eingabe.matrix);
    positionen.push(ergebnis);
    blockiert.push(...hinweise);
    if (p.aktiv && !ergebnis.blockiert && ergebnis.von !== null && ergebnis.bis !== null) {
      nettoVon += ergebnis.von;
      nettoBis += ergebnis.bis;
    }
  }
  const rabattProzent = Math.min(Math.max(eingabe.faktoren?.rabattProzent ?? 0, 0), 100);
  if (rabattProzent > 0) {
    nettoVon = rundeEuro(nettoVon * (1 - rabattProzent / 100));
    nettoBis = rundeEuro(nettoBis * (1 - rabattProzent / 100));
  }
  const bruttoVon = bruttoAusNetto(nettoVon);
  const bruttoBis = bruttoAusNetto(nettoBis);

  let foerderung: FoerderungErgebnis | null = null;
  if (eingabe.foerderung?.aktiv && bruttoBis > 0) {
    const f = berechneFoerderung(eingabe.foerderRegeln, eingabe.foerderung, { von: bruttoVon, bis: bruttoBis });
    foerderung = f.ergebnis;
    if (f.hinweis) blockiert.push(f.hinweis);
  }
  return {
    positionen, nettoVon, nettoBis, rabattProzent, bruttoVon, bruttoBis, foerderung, blockiert,
    vollstaendig: blockiert.length === 0,
  };
}

/** Vorschlag für eine manuelle Position aus Stunden × Stundensatz + Material × (1 + Aufschlag). Nie ein Dokumentwert. */
export function vorschlagManuell(intern: Position['intern'], faktoren: Kalkulationsfaktoren): number | null {
  const stundensatz = intern.stundensatz ?? faktoren.stundensatz;
  const stunden = intern.stunden ?? 0;
  const material = intern.material ?? 0;
  const aufschlag = intern.aufschlagProzent ?? faktoren.materialZuschlagProzent ?? 0;
  if (!stundensatz && !material) return null;
  return rundeEuro(stunden * (stundensatz ?? 0) + material * (1 + aufschlag / 100));
}

// ---------------------------------------------------------------------------
// Öffentliche Spanne (Kunden-Modus)
// ---------------------------------------------------------------------------

/**
 * Liefert die öffentliche Sicht: gerundete Bruttospanne nur, wenn keine Basisposition blockiert ist.
 * Zuschläge ohne Menge fließen nicht ein und werden benannt. Nie Netto, nie Zeilenwerte, nie Faktoren.
 */
export type OeffentlicheExtras = {
  /** Betriebskostenvergleich; unabhängig von der Matrix, erscheint auch im Vorangebots-Pfad. */
  betriebskosten?: { energieartLabel: string; heuteJahr: number | null; wpJahr: number; ersparnisJahr: number | null; proMonat: number } | null;
  foerderRegeln?: FoerderRegeln;
};

export function oeffentlicheSpanne(ergebnis: KalkulationsErgebnis, extras: OeffentlicheExtras = {}): OeffentlicheErgebnisDTO {
  const basisBlockiert = ergebnis.positionen.some((p) => !p.zuschlag && p.blockiert);
  const nichtEnthalten = ergebnis.positionen.filter((p) => p.zuschlag && (p.blockiert || p.von === null)).map((p) => p.titel);
  const dto: OeffentlicheErgebnisDTO = basisBlockiert || ergebnis.bruttoBis <= 0
    ? { pfad: 'vorangebot', nichtEnthalten }
    : {
      pfad: 'spanne',
      bruttoVonGerundet: Math.floor(ergebnis.bruttoVon / OEFFENTLICHE_RUNDUNG) * OEFFENTLICHE_RUNDUNG,
      bruttoBisGerundet: Math.ceil(ergebnis.bruttoBis / OEFFENTLICHE_RUNDUNG) * OEFFENTLICHE_RUNDUNG,
      nichtEnthalten,
    };
  if (dto.pfad === 'spanne' && ergebnis.foerderung) {
    dto.foerderzuschuss = ergebnis.foerderung.zuschuss;
    dto.foerderSatz = ergebnis.foerderung.satz;
    if (extras.foerderRegeln) dto.foerderBausteine = foerderBausteine(ergebnis.foerderung.boni, extras.foerderRegeln);
    dto.eigenanteilVon = Math.floor(ergebnis.foerderung.eigenanteilVon / OEFFENTLICHE_RUNDUNG) * OEFFENTLICHE_RUNDUNG;
    dto.eigenanteilBis = Math.ceil(ergebnis.foerderung.eigenanteilBis / OEFFENTLICHE_RUNDUNG) * OEFFENTLICHE_RUNDUNG;
  }
  const b = extras.betriebskosten;
  if (b && b.heuteJahr !== null && b.ersparnisJahr !== null && b.ersparnisJahr > 0) {
    dto.heizkostenHeuteJahr = b.heuteJahr;
    dto.heizkostenWpJahr = b.wpJahr;
    dto.heizkostenWpMonat = b.proMonat;
    dto.ersparnisJahr = b.ersparnisJahr;
    dto.energieartLabel = b.energieartLabel;
  }
  return dto;
}

/** Feldnamen, die eine öffentliche Antwort nie tragen darf. */
export const OEFFENTLICHE_DENY_LISTE = ['stundensatz', 'materialZuschlagProzent', 'rabattProzent', 'margeHinweis', 'von', 'bis', 'netto', 'intern', 'notizIntern'] as const;

export function enthaeltVerboteneFelder(obj: unknown, pfad = ''): string[] {
  const treffer: string[] = [];
  if (!obj || typeof obj !== 'object') return treffer;
  for (const [key, wert] of Object.entries(obj as Record<string, unknown>)) {
    const voll = pfad ? `${pfad}.${key}` : key;
    if ((OEFFENTLICHE_DENY_LISTE as readonly string[]).includes(key)) treffer.push(voll);
    if (wert && typeof wert === 'object') treffer.push(...enthaeltVerboteneFelder(wert, voll));
  }
  return treffer;
}
