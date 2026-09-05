import 'server-only';
import type {
  Baustein, FoerderungEingabe, GebaeudeDaten, Gewerk, Hersteller, JourneyAntworten, Kalkulationsdaten, Position, Vorlage,
} from '../types';
import { positionAusBaustein } from './calculation';
import {
  betriebskosten as berechneBetriebskosten, gebaeudeAusJourney, geraeteVorschlag, heizlastSchaetzen, speicherVorschlag,
  type BetriebskostenErgebnis, type HeizlastErgebnis,
} from './heizlast';

/**
 * Übersetzt die Antworten des öffentlichen Trichters in Vorlagen und vorbelegte Positionen (Plan 4.7).
 * Es entstehen nie Preise: Werte kommen ausschließlich aus der Richtpreis-Matrix.
 * Fehlt eine Größenvariante, bleibt sie offen und die Anfrage läuft in den Vorangebots-Pfad.
 */

export type MappingErgebnis = {
  vorlageIds: string[];
  positionen: Position[];
  foerderung: FoerderungEingabe | null;
  vorhabenKurz: string;
  gewerkHaupt: Gewerk | null;
  annahmen: string[];
  /** Gebäude und bestehende Heizung aus den Antworten (Vorbelegung für den Meister-Modus). */
  gebaeude: GebaeudeDaten | null;
  heizlast: HeizlastErgebnis | null;
  betriebskosten: BetriebskostenErgebnis | null;
};

const LEER: MappingErgebnis = {
  vorlageIds: [], positionen: [], foerderung: null, vorhabenKurz: '', gewerkHaupt: null, annahmen: [],
  gebaeude: null, heizlast: null, betriebskosten: null,
};

function vorlageVon(daten: Kalkulationsdaten, id: string): Vorlage | null {
  return daten.vorlagen.find((v) => v.id === id) ?? null;
}

function bausteinMitMatrix(v: Vorlage, nr: number): Baustein | null {
  return v.bausteine.find((b) => b.matrixNr === nr) ?? null;
}

function bausteinMitVarianten(v: Vorlage): Baustein | null {
  return v.bausteine.find((b) => (b.groessenVarianten?.length ?? 0) > 0) ?? null;
}

/**
 * Variante nach Wohnfläche; null, wenn keine Variante eine passende Spanne pflegt.
 * Nicht mehr als Rückfall für die Wärmepumpe: ohne belastbare Heizlast wird bewusst keine Größe gesetzt.
 */
export function variantenNrNachWohnflaeche(b: Baustein | null, wohnflaeche: number): number | null {
  if (!b?.groessenVarianten?.length) return null;
  for (const v of b.groessenVarianten) {
    const von = v.wohnflaecheM2Von;
    const bis = v.wohnflaecheM2Bis;
    if (von === undefined && bis === undefined) continue;
    if (wohnflaeche >= (von ?? 0) && wohnflaeche <= (bis ?? Number.POSITIVE_INFINITY)) return v.matrixNr;
  }
  return null;
}

/** Klima: 2 bis 3 Räume → Matrix 11, 4 bis 5 Räume → Matrix 12. */
export function variantenNrNachRaeumen(b: Baustein | null, raeume: number): number | null {
  if (!b?.groessenVarianten?.length) return null;
  const gewuenscht = raeume <= 3 ? 11 : 12;
  return b.groessenVarianten.some((v) => v.matrixNr === gewuenscht) ? gewuenscht : null;
}

type Aufbau = {
  vorlage: Vorlage;
  /** Optionen je Matrixnummer (Menge, Platzhalter, aktiv). */
  optionen?: Partial<Record<number, { menge?: number; anzahl?: number; lfm?: number; liter?: number; aktiv?: boolean; varianteMatrixNr?: number | null }>>;
  varianteFuerGroesse?: number | null;
  /** Gerätegröße und Speicher für den Baustein mit Größenvarianten ([kW], [Liter]). */
  kwFuerGroesse?: number | string;
  literFuerGroesse?: number;
  /** Marke im Vorlagentext ([Hersteller]); ohne Angabe die Standardmarke. */
  hersteller?: Hersteller;
};

function positionenAus(daten: Kalkulationsdaten, aufbau: Aufbau): Position[] {
  const positionen: Position[] = [];
  const groessenBaustein = bausteinMitVarianten(aufbau.vorlage);
  for (const b of aufbau.vorlage.bausteine) {
    const opt = (b.matrixNr !== null ? aufbau.optionen?.[b.matrixNr] : undefined) ?? {};
    const istGroesse = groessenBaustein !== null && b.id === groessenBaustein.id;
    positionen.push(positionAusBaustein(b, daten.matrix, {
      id: b.id,
      menge: opt.menge,
      anzahl: opt.anzahl,
      lfm: opt.lfm,
      liter: istGroesse ? (aufbau.literFuerGroesse ?? opt.liter) : opt.liter,
      kW: istGroesse ? aufbau.kwFuerGroesse : undefined,
      aktiv: opt.aktiv,
      hersteller: aufbau.hersteller,
      varianteMatrixNr: istGroesse ? (aufbau.varianteFuerGroesse ?? opt.varianteMatrixNr ?? null) : (opt.varianteMatrixNr ?? null),
    }));
  }
  return positionen;
}

function foerderungAus(vorlagen: Vorlage[], antworten: { selbstBewohnt?: boolean; einkommenUnterGrenze?: boolean; heutig?: string }, wohneinheiten: number): FoerderungEingabe | null {
  if (!vorlagen.some((v) => v.foerderungStandard)) return null;
  return {
    aktiv: true,
    wohneinheiten,
    selbstBewohnt: antworten.selbstBewohnt ?? true,
    altOelOderGas: antworten.heutig === 'gas' || antworten.heutig === 'oel',
    einkommenUnterGrenze: antworten.einkommenUnterGrenze ?? false,
    natuerlichesKaeltemittel: true,
    satzManuell: null,
  };
}

function zusammen(
  vorlagen: Vorlage[],
  positionen: Position[],
  foerderung: FoerderungEingabe | null,
  annahmenExtra: string[],
  extras: Partial<Pick<MappingErgebnis, 'gebaeude' | 'heizlast' | 'betriebskosten'>> = {},
): MappingErgebnis {
  return {
    vorlageIds: vorlagen.map((v) => v.id),
    positionen,
    foerderung,
    vorhabenKurz: vorlagen.map((v) => v.vorhabenKurz).join(' plus '),
    gewerkHaupt: vorlagen[0]?.gewerkHaupt ?? null,
    annahmen: [...new Set([...vorlagen.flatMap((v) => v.annahmenStandard), ...annahmenExtra])],
    gebaeude: extras.gebaeude ?? null,
    heizlast: extras.heizlast ?? null,
    betriebskosten: extras.betriebskosten ?? null,
  };
}

// ---------------------------------------------------------------------------
// Journeys
// ---------------------------------------------------------------------------

function mappeBad(a: Extract<JourneyAntworten, { journey: 'bad' }>, daten: Kalkulationsdaten): MappingErgebnis {
  const einfach = a.qm <= 4 && a.ausstattung === 'basic';
  const slug = einfach ? 'bad_einfach' : a.qm <= 6 ? 'bad_komplett' : null;
  if (!slug) return { ...LEER, vorhabenKurz: 'Badmodernisierung', gewerkHaupt: 'bad' };
  const v = vorlageVon(daten, slug);
  if (!v) return { ...LEER, vorhabenKurz: 'Badmodernisierung', gewerkHaupt: 'bad' };

  const warmwasser = a.wuensche.includes('durchlauferhitzer');
  const vorwand = a.wuensche.includes('vorwand');
  const positionen = positionenAus(daten, {
    vorlage: v,
    optionen: {
      // Warmwasser am Waschbecken: Matrix 16 aktiv
      16: { aktiv: warmwasser },
      // Wand für versteckte Rohre: Matrix 17 als Zuschlag ohne Menge, bleibt inaktiv
      17: { aktiv: false },
    },
  });
  const annahmen: string[] = [];
  if (vorwand) annahmen.push('Die Wand für die versteckten Rohre wird vor Ort aufgemessen und gesondert bewertet.');
  return zusammen([v], positionen, null, annahmen);
}

type HeizungsAntworten = {
  heutig: 'gas' | 'oel' | 'strom' | 'holz' | 'sonstiges';
  wohnflaeche: number;
  tanks?: number;
  heizkoerperTausch?: number;
  ziel: 'waermepumpe' | 'klima' | 'gas_neu' | 'unklar';
  raeume?: number;
  selbstBewohnt?: boolean;
  einkommenUnterGrenze?: boolean;
  /** Weitere Antworten (Baujahr, Alter, Personen, Verbrauch, Standort) für die Gebäudedaten. */
  roh?: Record<string, unknown>;
};

function mappeHeizung(a: HeizungsAntworten, daten: Kalkulationsdaten, wohneinheiten: number): MappingErgebnis {
  const gebaeude = gebaeudeAusJourney({ ...(a.roh ?? {}), heutig: a.heutig, wohnflaeche: a.wohnflaeche }, wohneinheiten);
  const heizlast = heizlastSchaetzen(gebaeude);
  const betriebskosten = berechneBetriebskosten(gebaeude, daten.betriebskosten, heizlast);
  const extras = { gebaeude, heizlast, betriebskosten };
  if (a.ziel === 'gas_neu' || a.ziel === 'unklar') {
    return { ...LEER, ...extras, vorhabenKurz: a.ziel === 'gas_neu' ? 'Neue Gasheizung' : 'Heizungstausch', gewerkHaupt: 'heizung' };
  }

  if (a.ziel === 'klima') {
    const v = vorlageVon(daten, 'klima_multisplit');
    if (!v) return { ...LEER, vorhabenKurz: 'Klimaanlage mit Heizfunktion', gewerkHaupt: 'klima' };
    const raeume = a.raeume ?? 3;
    const groesse = bausteinMitVarianten(v);
    const varianteNr = variantenNrNachRaeumen(groesse, raeume);
    const positionen = positionenAus(daten, {
      vorlage: v,
      varianteFuerGroesse: varianteNr,
      optionen: {
        // Innengeräte je Raum
        11: { anzahl: raeume },
        12: { anzahl: raeume },
        // Warmwasser läuft elektrisch: vorbelegt aktiv
        16: { aktiv: true },
        // Zählerschrank bleibt eine interne Option
        10: { aktiv: false },
      },
    });
    const annahmen = varianteNr === null ? ['Die Zahl der Innengeräte wird beim Ortstermin festgelegt.'] : [];
    return zusammen([v], positionen, null, annahmen, extras);
  }

  const slug = a.heutig === 'oel' ? 'waermepumpe_oel' : 'waermepumpe_gas';
  const v = vorlageVon(daten, slug);
  if (!v) return { ...LEER, ...extras, vorhabenKurz: 'Wärmepumpe', gewerkHaupt: 'waermepumpe' };
  const groesse = bausteinMitVarianten(v);
  const hersteller = gebaeude.geraet.hersteller;
  // Größe nach Heizlast (Arbeitsweise des Chefs). Ohne Verbrauch oder Dämmungsangabe überschätzt die
  // Fläche allein deutlich; dann bleibt die Größe offen und die Anfrage läuft in den Vorangebots-Pfad.
  const vorschlag = heizlast ? geraeteVorschlag(heizlast.kwEmpfohlen, groesse?.groessenVarianten ?? null, hersteller) : null;
  const groesseBelastbar = Boolean(heizlast?.belastbar && vorschlag && !vorschlag.ueberBaureihe);
  const varianteNr = groesseBelastbar ? (vorschlag as NonNullable<typeof vorschlag>).matrixNr : null;
  const varianteGewaehlt = groesse?.groessenVarianten?.find((x) => x.matrixNr === varianteNr) ?? null;
  const speicher = speicherVorschlag(gebaeude.personen, varianteGewaehlt?.speicherLiterOptionen ?? [200, 300]);
  const heizkoerper = a.heizkoerperTausch ?? 0;
  const tanks = a.tanks ?? 0;
  const positionen = positionenAus(daten, {
    vorlage: v,
    hersteller,
    varianteFuerGroesse: varianteNr,
    kwFuerGroesse: groesseBelastbar ? vorschlag?.geraetKw : undefined,
    literFuerGroesse: varianteNr !== null ? speicher.liter : undefined,
    optionen: {
      // Öl: Demontage je Tank
      5: { menge: tanks > 0 ? tanks : 1 },
      // Heizkörpertausch als Zuschlag mit Menge
      9: heizkoerper > 0 ? { aktiv: true, menge: heizkoerper, anzahl: heizkoerper } : { aktiv: false },
      10: { aktiv: false },
    },
  });
  const annahmen: string[] = [];
  if (varianteNr === null) {
    annahmen.push('Für die Größe der Wärmepumpe brauchen wir Ihren Jahresverbrauch; die genaue Auslegung folgt beim Termin vor Ort.');
    // Fachbegriffe bleiben aus Kundentexten heraus; der Wortlaut mit dem Fachbegriff steht im internen Dossier.
    if (vorschlag?.ueberBaureihe) annahmen.push('Die berechnete Größe liegt über der größten Baureihe, die Auslegung klären wir vor Ort.');
  } else {
    annahmen.push(heizlast?.methode === 'flaeche'
      ? 'Die Größe der Wärmepumpe haben wir aus Wohnfläche und Baujahr abgeleitet, die genaue Auslegung folgt beim Termin vor Ort.'
      : 'Die Größe der Wärmepumpe haben wir aus Ihrem Verbrauch abgeleitet, die genaue Auslegung folgt beim Termin vor Ort.');
  }
  if (a.heutig === 'oel' && tanks === 0) annahmen.push('Die Zahl der Öltanks wird beim Ortstermin aufgenommen.');
  return zusammen([v], positionen, foerderungAus([v], a, wohneinheiten), annahmen, extras);
}

/**
 * Journey-Antworten → Vorlagen, Positionen, Förderung, Kurzbeschreibung, Annahmen.
 * `wohneinheiten` kommt aus dem Objektschritt des Trichters.
 */
export function mappeJourney(antworten: JourneyAntworten | null | undefined, daten: Kalkulationsdaten, wohneinheiten = 1): MappingErgebnis {
  if (!antworten) return { ...LEER };
  if (antworten.journey === 'bad') return mappeBad(antworten, daten);
  if (antworten.journey === 'heizung') return mappeHeizung({ ...antworten, roh: antworten as unknown as Record<string, unknown> }, daten, wohneinheiten);
  // Wärmepumpen-Check: wie Heizung mit dem Ziel Wärmepumpe.
  return mappeHeizung(
    {
      heutig: antworten.heutig,
      wohnflaeche: antworten.wohnflaeche,
      ziel: 'waermepumpe',
      selbstBewohnt: antworten.selbstBewohnt,
      einkommenUnterGrenze: antworten.einkommenUnterGrenze,
      roh: antworten as unknown as Record<string, unknown>,
    },
    daten,
    wohneinheiten,
  );
}
