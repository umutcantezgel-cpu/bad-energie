/**
 * Zentrales Datenmodell des Vertriebs- und Kalkulationsmoduls.
 * Reine Typen und Zod-Schemata, ohne Serverabhängigkeiten (auch im Client nutzbar).
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Grundtypen und Enums (Werte identisch mit src/db/schema.ts)
// ---------------------------------------------------------------------------
export const GEWERKE = ['heizung', 'bad', 'wasser', 'waermepumpe', 'solar', 'pv', 'klima', 'lueftung', 'elektro'] as const;
export type Gewerk = (typeof GEWERKE)[number];

export const EINHEITEN = ['pauschal', 'je_stueck', 'je_lfm', 'je_tank'] as const;
export type Einheit = (typeof EINHEITEN)[number];

export const ANFRAGE_STATUS = ['eingang', 'geplant', 'blockiert', 'versendet', 'erinnert', 'antwort', 'termin', 'verworfen'] as const;
export type AnfrageStatus = (typeof ANFRAGE_STATUS)[number];

export const QUELLEN = ['web_bad', 'web_budget', 'web_heizung', 'web_wp', 'termin', 'rueckruf', 'intern', 'schnellerfassung', 'dispatch'] as const;
export type Quelle = (typeof QUELLEN)[number];

export const DRINGLICHKEITEN = ['sofort', 'wochen_4', 'monate_3', 'unklar'] as const;
export type Dringlichkeit = (typeof DRINGLICHKEITEN)[number];

export const VERSAND_ARTEN = ['erstkontakt', 'erinnerung', 'terminmail', 'dossier', 'eingangsbestaetigung'] as const;
export type VersandArt = (typeof VERSAND_ARTEN)[number];

export const VERSAND_STATUS = ['entwurf', 'freigegeben', 'versendet', 'fehlgeschlagen', 'storniert'] as const;
export type VersandStatus = (typeof VERSAND_STATUS)[number];

export const ANHANG_ARTEN = ['foto', 'skizze', 'foto_annotiert', 'sprachnotiz', 'pdf', 'sonstiges'] as const;
export type AnhangArt = (typeof ANHANG_ARTEN)[number];

export const ROLLEN = ['chef', 'bauleiter', 'buero'] as const;
export type Rolle = (typeof ROLLEN)[number];

export type Modus = 'kunde' | 'intern';

// Gebäude und Heizung (Datenerfassungsbogen des Chefs)
export const ENERGIEARTEN = ['gas', 'oel', 'fluessiggas', 'strom', 'nachtspeicher', 'holz_weich', 'holz_hart', 'hackschnitzel', 'pellets', 'sonstiges'] as const;
export type Energieart = (typeof ENERGIEARTEN)[number];
export const KESSELTYPEN = ['standard', 'niedertemperatur', 'brennwert', 'holz', 'nachtspeicher', 'blockspeicher', 'unbekannt'] as const;
export type Kesseltyp = (typeof KESSELTYPEN)[number];
export const VERBRAUCH_EINHEITEN = ['kwh', 'liter', 'm3', 'kg'] as const;
export type VerbrauchEinheit = (typeof VERBRAUCH_EINHEITEN)[number];
export const BAUJAHR_KLASSEN = ['vor_1977', 'vor_1982', 'vor_1995', 'vor_2002', 'nach_2002', 'kfw70', 'kfw55', 'passivhaus'] as const;
export type BaujahrKlasse = (typeof BAUJAHR_KLASSEN)[number];
export const LAGEN = ['berg', 'freistehend', 'siedlung', 'reiheneck', 'reihenhaus'] as const;
export type Lage = (typeof LAGEN)[number];
export const FENSTER = ['einfach', 'zweifach', 'dreifach', 'unbekannt'] as const;
export type Fenster = (typeof FENSTER)[number];
export const VERTEILUNGEN = ['heizkoerper', 'fussboden', 'gemischt'] as const;
export type Verteilung = (typeof VERTEILUNGEN)[number];
export const HERSTELLER = ['bosch', 'buderus'] as const;
export type Hersteller = (typeof HERSTELLER)[number];
export const HEIZUNGS_STANDORTE = ['keller', 'erdgeschoss', 'dachgeschoss', 'anbau', 'aussen', 'unbekannt'] as const;
export type HeizungsStandort = (typeof HEIZUNGS_STANDORTE)[number];
export const SANIERUNGEN = ['dach', 'fenster', 'fassade', 'kellerdecke'] as const;
export type Sanierung = (typeof SANIERUNGEN)[number];

/** Beträge sind ganze Euro (netto in der Matrix, brutto in Dokumenten). */
export type Spanne = { von: number; bis: number };

/** Gewerk → Piktogramm-Schlüssel des Altsystems (render.py GEWERK_ICON, ergänzt um elektro). */
export const GEWERK_ICON: Record<Gewerk, 'flamme' | 'wasser' | 'sonne' | 'luft' | 'elektro'> = {
  heizung: 'flamme', bad: 'wasser', wasser: 'wasser', waermepumpe: 'sonne', solar: 'sonne', pv: 'sonne',
  klima: 'luft', lueftung: 'luft', elektro: 'elektro',
};
export const GEWERK_LABEL: Record<'flamme' | 'wasser' | 'sonne' | 'luft' | 'elektro', string> = {
  flamme: 'Heizung', wasser: 'Bad und Wasser', sonne: 'Wärmepumpe und Solar', luft: 'Klima und Lüftung', elektro: 'Elektro',
};
/** Farben des Briefbogens (PDF und Mail). */
export const GEWERK_FARBE_DOKUMENT: Record<'flamme' | 'wasser' | 'sonne' | 'luft' | 'elektro', string> = {
  flamme: '#EE6C1F', wasser: '#1FA0DC', sonne: '#F0C000', luft: '#8E959E', elektro: '#475569',
};
export const EINHEIT_LABEL: Record<Einheit, string> = { pauschal: 'pauschal', je_stueck: 'je Stück', je_lfm: 'je lfm', je_tank: 'je Tank' };

// ---------------------------------------------------------------------------
// Preise, Vorlagen, Bausteine
// ---------------------------------------------------------------------------
export type Richtpreis = { nr: number; leistung: string; von: number | null; bis: number | null; einheit: Einheit; hinweis: string | null };

export type GroessenVariante = {
  matrixNr: number;
  label: string;
  heizlastKwVon?: number;
  heizlastKwBis?: number;
  kwLabel?: string;
  speicherLiterOptionen?: number[];
  speicherLiterDefault?: number;
  wohnflaecheM2Von?: number;
  wohnflaecheM2Bis?: number;
};

/** Eine Vorlagenzeile, angereichert um die aktuelle Matrixspanne (Kachel im Meister-Modus). */
export type Baustein = {
  id: string;
  vorlageId: string;
  position: number;
  titel: string;
  gewerk: Gewerk;
  text: string;
  matrixNr: number | null;
  zuschlag: boolean;
  mengeDefault: number;
  einheit: Einheit;
  groessenVarianten: GroessenVariante[] | null;
  matrixHinweis: string | null;
  /** Spanne der Matrixzeile (bzw. der Standardvariante); null, wenn die Matrix leer ist. */
  spanne: Spanne | null;
};

export type Vorlage = {
  id: string;
  name: string;
  vorhabenKurz: string;
  mailBetreff: string;
  mailPreheader: string;
  foerderungStandard: boolean;
  hinweis: string | null;
  annahmenStandard: string[];
  vorbehaltIds: number[];
  gewerkHaupt: Gewerk;
  bausteine: Baustein[];
};

export type Vorbehalt = { id: number; text: string; gewerk: Gewerk | null };

export type FoerderRegeln = {
  grund: number;
  effizienz: number;
  klimageschwindigkeit: number;
  einkommen: number;
  einkommenGrenze: number;
  deckel: number;
  kostenWe1: number;
  kostenJeWeitere: number;
  maxWe: number;
  standardsatz: number | null;
  eigenanteilRundung: number;
};

/** Alles, was der Meister-Client für die Live-Kalkulation braucht (nur nach verifySession). */
export type Kalkulationsdaten = {
  matrix: Richtpreis[];
  vorlagen: Vorlage[];
  foerderRegeln: FoerderRegeln;
  vorbehalte: Vorbehalt[];
  /** Energiepreise und Jahresarbeitszahl für den Betriebskostenvergleich. */
  betriebskosten: BetriebskostenEinstellungen;
};

/** Preise für den Betriebskostenvergleich (Einstellungen, pflegt der Chef). */
export type BetriebskostenEinstellungen = {
  gasCtKwh: number;
  oelCtLiter: number;
  stromCtKwh: number;
  wpStromCtKwh: number;
  jazStandard: number;
  pvEigenanteilProzent: number;
  pelletsCtKg: number;
  holzEurM3: number;
};

export const BETRIEBSKOSTEN_STANDARD: BetriebskostenEinstellungen = {
  gasCtKwh: 11, oelCtLiter: 95, stromCtKwh: 29, wpStromCtKwh: 24, jazStandard: 3.5, pvEigenanteilProzent: 40, pelletsCtKg: 35, holzEurM3: 90,
};

// ---------------------------------------------------------------------------
// Positionen und Kalkulation
// ---------------------------------------------------------------------------
export type ZeileIntern = { stunden?: number; stundensatz?: number; material?: number; aufschlagProzent?: number };

export type Position = {
  id: string;
  titel: string;
  gewerk: Gewerk;
  text: string;
  menge: number;
  einheit: Einheit;
  von: number | null;
  bis: number | null;
  matrixNr: number | null;
  vorlageZeileId: string | null;
  varianteMatrixNr: number | null;
  zuschlag: boolean;
  aktiv: boolean;
  quelle: 'vorlage' | 'manuell';
  notizIntern: string;
  intern: ZeileIntern;
};

export type Kalkulationsfaktoren = {
  stundensatz?: number;
  materialZuschlagProzent?: number;
  rabattProzent?: number;
  margeHinweis?: string;
};

export type FoerderungEingabe = {
  aktiv: boolean;
  wohneinheiten: number;
  selbstBewohnt: boolean;
  altOelOderGas: boolean;
  einkommenUnterGrenze: boolean;
  natuerlichesKaeltemittel: boolean;
  /** Übersteuert den berechneten Satz (Cockpit). */
  satzManuell?: number | null;
};

export type FoerderungErgebnis = {
  satz: number;
  kosten: number;
  zuschuss: number;
  eigenanteilVon: number;
  eigenanteilBis: number;
  boni: { grund: number; effizienz: number; klimageschwindigkeit: number; einkommen: number };
};

export type HinweisCode =
  | 'matrix_fehlt'
  | 'platzhalter_offen'
  | 'wert_fehlt'
  | 'menge_fehlt'
  | 'variante_fehlt'
  | 'foerdersatz_fehlt';

export type Hinweis = { code: HinweisCode; text: string; positionId?: string; matrixNr?: number };

export type PositionErgebnis = {
  positionId: string;
  titel: string;
  gewerk: Gewerk;
  text: string;
  menge: number;
  einheit: Einheit;
  einzelVon: number | null;
  einzelBis: number | null;
  von: number | null;
  bis: number | null;
  blockiert: boolean;
  zuschlag: boolean;
};

export type KalkulationsErgebnis = {
  positionen: PositionErgebnis[];
  nettoVon: number;
  nettoBis: number;
  rabattProzent: number;
  bruttoVon: number;
  bruttoBis: number;
  foerderung: FoerderungErgebnis | null;
  blockiert: Hinweis[];
  /** true, wenn alle aktiven Basispositionen bewertet sind (Spanne belastbar). */
  vollstaendig: boolean;
};

// ---------------------------------------------------------------------------
// DTOs (Grenze zum Client)
// ---------------------------------------------------------------------------
export type OeffentlicheErgebnisDTO = {
  pfad: 'spanne' | 'vorangebot';
  bruttoVonGerundet?: number;
  bruttoBisGerundet?: number;
  foerderzuschuss?: number;
  foerderSatz?: number;
  /** Förderbausteine in der Sprache des Chefs („Grundförderung 30 %“). */
  foerderBausteine?: string[];
  eigenanteilVon?: number;
  eigenanteilBis?: number;
  /** Betriebskostenvergleich, gerundet; unabhängig von der Matrix. */
  heizkostenHeuteJahr?: number;
  heizkostenWpJahr?: number;
  heizkostenWpMonat?: number;
  ersparnisJahr?: number;
  energieartLabel?: string;
  nichtEnthalten: string[];
};

export type TokenSeiteDTO = {
  ksNummer: string;
  vorname: string;
  fenster: { id: string; beschriftung: string }[];
  eingeloest: boolean;
};

export type SkizzeExport = { name: string; dataUrl: string; breite: number; hoehe: number };

// ---------------------------------------------------------------------------
// Zod-Schemata für Request-Bodies
// ---------------------------------------------------------------------------
const emailSchema = z.string().trim().email().max(200);
const telefonSchema = z.string().trim().max(40).regex(/^[+0-9 ()/.-]*$/).optional().or(z.literal(''));

export const kontaktSchema = z.object({
  anrede: z.enum(['Frau', 'Herr', '']).default(''),
  vorname: z.string().trim().max(80).default(''),
  nachname: z.string().trim().min(2).max(80),
  email: emailSchema,
  telefon: telefonSchema.default(''),
  strasse: z.string().trim().max(120).default(''),
  plzOrt: z.string().trim().max(120).default(''),
  kenntnisnahme: z.literal(true),
  eingangsbestaetigung: z.boolean().default(false),
});
export type Kontakt = z.infer<typeof kontaktSchema>;

export const objektSchema = z.object({
  adresse: z.string().trim().max(200).default(''),
  plz: z.string().trim().regex(/^\d{5}$/).optional().or(z.literal('')),
  eigentum: z.enum(['eigentum', 'miete', 'unklar']).default('unklar'),
  wohneinheiten: z.number().int().min(1).max(12).default(1),
});

export const dringlichkeitSchema = z.enum(DRINGLICHKEITEN);

// Gebäude und Heizung (Meister-Modus, Portal-Leads, Vorbelegung aus dem Web)
export const gebaeudeBestandSchema = z.object({
  energieart: z.enum(ENERGIEARTEN).nullable().default(null),
  kesseltyp: z.enum(KESSELTYPEN).nullable().default(null),
  verbrauchJahr: z.number().min(0).max(1_000_000).nullable().default(null),
  verbrauchEinheit: z.enum(VERBRAUCH_EINHEITEN).nullable().default(null),
  heizungsalterJahre: z.number().int().min(0).max(80).nullable().default(null),
  heizkoerper: z.number().int().min(0).max(60).nullable().default(null),
  verteilung: z.enum(VERTEILUNGEN).nullable().default(null),
  vorlaufC: z.number().min(20).max(95).nullable().default(null),
  ruecklaufC: z.number().min(15).max(90).nullable().default(null),
  zirkulation: z.boolean().nullable().default(null),
  standort: z.enum(HEIZUNGS_STANDORTE).default('unbekannt'),
  solarthermie: z.boolean().default(false),
});
export const gebaeudePlatzSchema = z.object({
  tuerbreiteCm: z.number().int().min(40).max(250).nullable().default(null),
  heizraum: z.string().trim().max(200).default(''),
  aussenEinheitOrt: z.string().trim().max(200).default(''),
  abstaendeOk: z.boolean().nullable().default(null),
});
export const gebaeudeGeraetSchema = z.object({
  hersteller: z.enum(HERSTELLER).default('bosch'),
  kw: z.number().min(1).max(60).nullable().default(null),
  speicherLiter: z.number().int().min(50).max(1000).nullable().default(null),
  pvGewuenscht: z.boolean().default(false),
  pvKwp: z.number().min(0).max(100).nullable().default(null),
});
export const gebaeudeSchema = z.object({
  wohnflaeche: z.number().min(10).max(2000).nullable().default(null),
  baujahr: z.number().int().min(1800).max(2100).nullable().default(null),
  baujahrKlasse: z.enum(BAUJAHR_KLASSEN).nullable().default(null),
  lage: z.enum(LAGEN).nullable().default(null),
  aussenwandDaemmungCm: z.number().int().min(0).max(40).nullable().default(null),
  dachDaemmungCm: z.number().int().min(0).max(50).nullable().default(null),
  fenster: z.enum(FENSTER).nullable().default(null),
  sanierungen: z.array(z.enum(SANIERUNGEN)).default([]),
  personen: z.number().int().min(1).max(20).nullable().default(null),
  duschen: z.number().int().min(0).max(10).default(0),
  wannen: z.number().int().min(0).max(10).default(0),
  wohneinheiten: z.number().int().min(1).max(12).default(1),
  bestand: gebaeudeBestandSchema.prefault({}),
  platz: gebaeudePlatzSchema.prefault({}),
  geraet: gebaeudeGeraetSchema.prefault({}),
});
export type GebaeudeDaten = z.infer<typeof gebaeudeSchema>;

export const betriebskostenSchema = z.object({
  gasCtKwh: z.number().min(0).max(100),
  oelCtLiter: z.number().min(0).max(500),
  stromCtKwh: z.number().min(0).max(100),
  wpStromCtKwh: z.number().min(0).max(100),
  jazStandard: z.number().min(1).max(6),
  pvEigenanteilProzent: z.number().min(0).max(100),
  pelletsCtKg: z.number().min(0).max(200),
  holzEurM3: z.number().min(0).max(500),
});

export const badAntwortenSchema = z.object({
  journey: z.literal('bad'),
  vorhaben: z.enum(['komplettbad', 'teilmodernisierung', 'dusche_statt_wanne', 'barrierefrei', 'gaeste_wc']),
  qm: z.number().min(2).max(40),
  grundriss: z.enum(['schmal', 'quadratisch', 'l_form']).default('quadratisch'),
  ausstattung: z.enum(['basic', 'komfort', 'luxus']),
  wuensche: z.array(z.enum(['walkin', 'wanne', 'dusch_wc', 'doppelwaschtisch', 'fussbodenheizung', 'design_heizkoerper', 'led_spiegel', 'vorwand', 'durchlauferhitzer'])).default([]),
});

export const heizungAntwortenSchema = z.object({
  journey: z.literal('heizung'),
  heutig: z.enum(['gas', 'oel', 'strom', 'holz', 'sonstiges']),
  alter: z.enum(['unter_10', '10_bis_20', 'ueber_20', 'unbekannt']).default('unbekannt'),
  tanks: z.number().int().min(0).max(6).default(0),
  gebaeude: z.enum(['efh', 'dhh', 'rh', 'mfh']).default('efh'),
  wohnflaeche: z.number().min(30).max(600),
  baujahr: z.enum(['vor_1978', '1978_1995', '1996_2015', 'ab_2016']),
  verteilung: z.enum(['heizkoerper', 'fussboden', 'gemischt']),
  heizkoerperTausch: z.number().int().min(0).max(30).default(0),
  ziel: z.enum(['waermepumpe', 'klima', 'gas_neu', 'unklar']),
  raeume: z.number().int().min(1).max(8).default(3),
  selbstBewohnt: z.boolean().default(true),
  einkommenUnterGrenze: z.boolean().default(false),
});

export const wpAntwortenSchema = z.object({
  journey: z.literal('waermepumpe'),
  heutig: z.enum(['gas', 'oel', 'strom', 'holz', 'sonstiges']),
  baujahr: z.enum(['vor_1978', '1978_1995', '1996_2015', 'ab_2016']),
  wohnflaeche: z.number().min(30).max(600),
  verteilung: z.enum(['heizkoerper', 'fussboden', 'gemischt']),
  komfort: z.enum(['heizen', 'heizen_kuehlen', 'heizen_kuehlen_warmwasser']).default('heizen'),
  selbstBewohnt: z.boolean().default(true),
  einkommenUnterGrenze: z.boolean().default(false),
});

export const journeyAntwortenSchema = z.discriminatedUnion('journey', [badAntwortenSchema, heizungAntwortenSchema, wpAntwortenSchema]);
export type JourneyAntworten = z.infer<typeof journeyAntwortenSchema>;

/** Kunden-Modus: Journey-Antworten plus Kontakt. */
export const kundenAnfrageSchema = z.object({
  modus: z.literal('kunde'),
  quelle: z.enum(QUELLEN).default('web_bad'),
  antworten: journeyAntwortenSchema.optional(),
  freitext: z.string().trim().max(2000).default(''),
  objekt: objektSchema.prefault({}),
  dringlichkeit: dringlichkeitSchema.default('unklar'),
  wunschtermine: z.array(z.string().trim().max(120)).max(2).default([]),
  kontakt: kontaktSchema,
  // Schutz gegen Automaten
  honig: z.string().max(0).default(''),
  gestartetUm: z.number().int().positive(),
});
export type KundenAnfrage = z.infer<typeof kundenAnfrageSchema>;

export const positionSchema = z.object({
  id: z.string().min(1).max(64),
  titel: z.string().trim().min(1).max(160),
  gewerk: z.enum(GEWERKE),
  text: z.string().trim().max(600).default(''),
  menge: z.number().min(0).max(999).default(1),
  einheit: z.enum(EINHEITEN).default('pauschal'),
  von: z.number().int().min(0).max(9_999_999).nullable(),
  bis: z.number().int().min(0).max(9_999_999).nullable(),
  matrixNr: z.number().int().nullable().default(null),
  vorlageZeileId: z.string().nullable().default(null),
  varianteMatrixNr: z.number().int().nullable().default(null),
  zuschlag: z.boolean().default(false),
  aktiv: z.boolean().default(true),
  quelle: z.enum(['vorlage', 'manuell']).default('vorlage'),
  notizIntern: z.string().trim().max(1000).default(''),
  intern: z.object({
    stunden: z.number().min(0).optional(),
    stundensatz: z.number().min(0).optional(),
    material: z.number().min(0).optional(),
    aufschlagProzent: z.number().min(0).max(300).optional(),
  }).prefault({}),
});

export const skizzeSchema = z.object({
  name: z.string().trim().max(80).default('Skizze'),
  dataUrl: z.string().startsWith('data:image/png;base64,').max(4_200_000),
  breite: z.number().int().positive(),
  hoehe: z.number().int().positive(),
});

export const fotoSchema = z.object({
  name: z.string().trim().max(120).default('Foto'),
  dataUrl: z.string().startsWith('data:image/').max(4_200_000),
  beschreibung: z.string().trim().max(200).default(''),
});

/** Meister-Modus: vollständige Anfrage mit Positionen und Aktion. */
export const internAnfrageSchema = z.object({
  modus: z.literal('intern'),
  aktion: z.enum(['entwurf', 'sofort', 'terminmail']),
  anfrageId: z.string().optional(),
  quelle: z.enum(QUELLEN).default('intern'),
  vorlageIds: z.array(z.string()).default([]),
  kontakt: kontaktSchema.omit({ kenntnisnahme: true, eingangsbestaetigung: true }).extend({ kenntnisnahme: z.boolean().default(true) }),
  objekt: objektSchema.prefault({}),
  gebaeude: gebaeudeSchema.prefault({}),
  dringlichkeit: dringlichkeitSchema.default('unklar'),
  vorhabenKurz: z.string().trim().max(200).default(''),
  gewerkHaupt: z.enum(GEWERKE).optional(),
  positionen: z.array(positionSchema).default([]),
  kalkulation: z.object({
    stundensatz: z.number().min(0).optional(),
    materialZuschlagProzent: z.number().min(0).max(300).optional(),
    rabattProzent: z.number().min(0).max(50).optional(),
    margeHinweis: z.string().max(300).optional(),
  }).prefault({}),
  foerderung: z.object({
    aktiv: z.boolean().default(false),
    wohneinheiten: z.number().int().min(1).max(12).default(1),
    selbstBewohnt: z.boolean().default(true),
    altOelOderGas: z.boolean().default(true),
    einkommenUnterGrenze: z.boolean().default(false),
    natuerlichesKaeltemittel: z.boolean().default(true),
    satzManuell: z.number().int().min(0).max(70).nullable().optional(),
  }).prefault({}),
  persoenlicherSatz: z.string().trim().max(400).default(''),
  annahmen: z.array(z.string().trim().max(300)).default([]),
  vorbehalte: z.array(z.string().trim().max(300)).default([]),
  ausfuehrungSatz: z.string().trim().max(400).default(''),
  terminfensterIds: z.array(z.string()).max(2).default([]),
  notizen: z.object({
    etage: z.number().int().min(-2).max(30).nullable().default(null),
    aufzug: z.boolean().nullable().default(null),
    montagehindernisse: z.string().trim().max(1000).default(''),
    leitungswege: z.string().trim().max(1000).default(''),
    intern: z.string().trim().max(3000).default(''),
  }).prefault({}),
  skizzen: z.array(skizzeSchema).max(6).default([]),
  fotos: z.array(fotoSchema).max(10).default([]),
});
export type InternAnfrage = z.infer<typeof internAnfrageSchema>;

export const estimateRequestSchema = z.discriminatedUnion('modus', [kundenAnfrageSchema, internAnfrageSchema]);
export type EstimateRequest = z.infer<typeof estimateRequestSchema>;

/** Antwort von POST /api/estimate. */
export type EstimateResponse =
  | { ok: true; modus: 'kunde'; ksNummer: string; ergebnis: OeffentlicheErgebnisDTO }
  | { ok: true; modus: 'intern'; anfrageId: string; ksNummer: string; status: AnfrageStatus; aktion: 'entwurf' | 'sofort' | 'terminmail'; versand?: { kunde: VersandStatus; dossier: VersandStatus }; hinweise: Hinweis[]; rueckmeldung: string }
  | { ok: false; fehler: string; hinweise?: Hinweis[]; anfrageId?: string; ksNummer?: string; status?: AnfrageStatus };

// ---------------------------------------------------------------------------
// Intern-Bereich: Sitzung, Aktionen, DTOs
// ---------------------------------------------------------------------------
export type SessionInfo = { benutzerId: string; name: string; rolle: Rolle; funktion: string; signaturMail: string };

export type AnmeldeErgebnis = { ok: true } | { ok: false; fehler: string };

/** Karte in der Entwurfs- und Freigabeliste. */
export type EntwurfKarte = {
  anfrageId: string;
  ksNummer: string;
  kunde: string;
  vorhaben: string;
  bruttoVon: number | null;
  bruttoBis: number | null;
  status: AnfrageStatus;
  versandStatus: VersandStatus | null;
  versandArt: VersandArt | null;
  faelligAm: string | null;
  hinweise: Hinweis[];
  warnungen: string[];
  erstelltAm: string;
  bearbeiter: string;
  darfFreigeben: boolean;
};

export type AnhangMeta = { id: string; art: AnhangArt; dateiname: string; mime: string; groesse: number; beschreibung: string; erstelltAm: string; url: string; thumbUrl: string | null };

/** Vollständige Anfrage für den Meister-Modus (nur nach verifySession). */
export type InternAnfrageDTO = {
  anfrageId: string;
  ksNummer: string;
  status: AnfrageStatus;
  bemerkung: string;
  quelle: Quelle;
  vorlageIds: string[];
  kontakt: { anrede: string; vorname: string; nachname: string; email: string; telefon: string; strasse: string; plzOrt: string };
  objekt: { adresse: string; plz: string; eigentum: 'eigentum' | 'miete' | 'unklar'; wohneinheiten: number; entfernungKm: number | null };
  gebaeude: GebaeudeDaten;
  dringlichkeit: Dringlichkeit;
  vorhabenKurz: string;
  gewerkHaupt: Gewerk | null;
  positionen: Position[];
  kalkulation: Kalkulationsfaktoren;
  foerderung: FoerderungEingabe;
  persoenlicherSatz: string;
  annahmen: string[];
  vorbehalte: string[];
  ausfuehrungSatz: string;
  terminfensterIds: string[];
  notizen: { etage: number | null; aufzug: boolean | null; montagehindernisse: string; leitungswege: string; intern: string };
  konfiguratorAntworten: Record<string, unknown>;
  triageVorschlag: string;
  anhaenge: AnhangMeta[];
  versandauftraege: { id: string; art: VersandArt; status: VersandStatus; faelligAm: string | null; versendetAm: string | null; fehler: string | null }[];
  ereignisse: { typ: string; erstelltAm: string; benutzer: string | null }[];
  bearbeiter: string;
  erstelltAm: string;
};

export type TerminfensterOption = { id: string; beschriftung: string; frei: boolean };

export type FreigabeErgebnis =
  | { ok: true; anfrageId: string; versand?: { kunde: VersandStatus; dossier: VersandStatus }; rueckmeldung: string }
  | { ok: false; fehler: string; hinweise?: Hinweis[]; grund?: 'berechtigung' | 'blockiert' | 'status' | 'nicht_gefunden' };
