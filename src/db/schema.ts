import { sql } from 'drizzle-orm';
import type { GebaeudeDaten } from '../lib/types';
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Enums (deutsche Domänenbegriffe, Werte entsprechen dem Altsystem, wo vorhanden)
// ---------------------------------------------------------------------------
export const rolleEnum = pgEnum('rolle', ['chef', 'bauleiter', 'buero']);
export const anfrageStatusEnum = pgEnum('anfrage_status', [
  'eingang', 'geplant', 'blockiert', 'versendet', 'erinnert', 'antwort', 'termin', 'verworfen',
]);
export const quelleEnum = pgEnum('quelle', [
  'web_bad', 'web_budget', 'web_heizung', 'web_wp', 'termin', 'rueckruf', 'intern', 'schnellerfassung', 'dispatch',
]);
export const dringlichkeitEnum = pgEnum('dringlichkeit', ['sofort', 'wochen_4', 'monate_3', 'unklar']);
export const gewerkEnum = pgEnum('gewerk', [
  'heizung', 'bad', 'wasser', 'waermepumpe', 'solar', 'pv', 'klima', 'lueftung', 'elektro',
]);
export const einheitEnum = pgEnum('einheit', ['pauschal', 'je_stueck', 'je_lfm', 'je_tank']);
export const zeileQuelleEnum = pgEnum('zeile_quelle', ['vorlage', 'manuell']);
export const versandArtEnum = pgEnum('versand_art', [
  'erstkontakt', 'erinnerung', 'terminmail', 'dossier', 'eingangsbestaetigung',
]);
export const versandStatusEnum = pgEnum('versand_status', [
  'entwurf', 'freigegeben', 'versendet', 'fehlgeschlagen', 'storniert',
]);
export const anhangArtEnum = pgEnum('anhang_art', [
  'foto', 'skizze', 'foto_annotiert', 'sprachnotiz', 'pdf', 'sonstiges',
]);
export const dokumentArtEnum = pgEnum('dokument_art', [
  'kostenschaetzung_html', 'kostenschaetzung_pdf', 'mail_html', 'mail_txt',
  'erinnerung_html', 'erinnerung_txt', 'terminmail_html', 'terminmail_txt',
  'annahmen_md', 'abschlussbericht_md', 'dossier_html',
]);
export const jobAusloeserEnum = pgEnum('job_ausloeser', ['cron', 'manuell']);

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });
const erstelltAm = () => ts('erstellt_am').notNull().defaultNow();

// ---------------------------------------------------------------------------
// Benutzer, Sitzungen, Rate-Limit, Einstellungen
// ---------------------------------------------------------------------------
export const benutzer = pgTable('benutzer', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  pinHash: text('pin_hash').notNull(),
  rolle: rolleEnum('rolle').notNull().default('buero'),
  funktion: text('funktion').notNull().default('Bad & Energie GmbH'),
  signaturMail: text('signatur_mail').notNull().default('info@bad-energie.de'),
  aktiv: boolean('aktiv').notNull().default(true),
  fehlversuche: integer('fehlversuche').notNull().default(0),
  gesperrtBis: ts('gesperrt_bis'),
  letzterLoginAm: ts('letzter_login_am'),
  erstelltAm: erstelltAm(),
});

export const sitzung = pgTable('sitzung', {
  idHash: text('id_hash').primaryKey(),
  benutzerId: text('benutzer_id').notNull().references(() => benutzer.id, { onDelete: 'cascade' }),
  erstelltAm: erstelltAm(),
  laeuftAbAm: ts('laeuft_ab_am').notNull(),
  letzteNutzungAm: ts('letzte_nutzung_am').notNull().defaultNow(),
  widerrufenAm: ts('widerrufen_am'),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
}, (t) => [index('sitzung_benutzer_idx').on(t.benutzerId)]);

export const rateLimit = pgTable('rate_limit', {
  schluessel: text('schluessel').primaryKey(),
  fensterBeginn: ts('fenster_beginn').notNull(),
  zaehler: integer('zaehler').notNull().default(0),
});

export const einstellung = pgTable('einstellung', {
  key: text('key').primaryKey(),
  wert: jsonb('wert').notNull(),
  geaendertAm: ts('geaendert_am').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Preise, Förderung, Vorlagen
// ---------------------------------------------------------------------------
export const richtpreis = pgTable('richtpreis', {
  nr: integer('nr').primaryKey(),
  leistung: text('leistung').notNull(),
  von: integer('von'),
  bis: integer('bis'),
  einheit: einheitEnum('einheit').notNull().default('pauschal'),
  hinweis: text('hinweis'),
  geaendertAm: ts('geaendert_am').notNull().defaultNow(),
  geaendertVon: text('geaendert_von').references(() => benutzer.id, { onDelete: 'set null' }),
});

export const foerderRegel = pgTable('foerder_regel', {
  id: integer('id').primaryKey().default(1),
  grund: integer('grund').notNull().default(30),
  effizienz: integer('effizienz').notNull().default(5),
  klimageschwindigkeit: integer('klimageschwindigkeit').notNull().default(20),
  einkommen: integer('einkommen').notNull().default(30),
  einkommenGrenze: integer('einkommen_grenze').notNull().default(40000),
  deckel: integer('deckel').notNull().default(70),
  kostenWe1: integer('kosten_we1').notNull().default(30000),
  kostenJeWeitere: integer('kosten_je_weitere').notNull().default(15000),
  maxWe: integer('max_we').notNull().default(6),
  standardsatz: integer('standardsatz'),
  eigenanteilRundung: integer('eigenanteil_rundung').notNull().default(1000),
  geaendertAm: ts('geaendert_am').notNull().defaultNow(),
});

export const vorbehalt = pgTable('vorbehalt', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  gewerk: gewerkEnum('gewerk'),
  position: integer('position').notNull().default(0),
  aktiv: boolean('aktiv').notNull().default(true),
});

export const vorlage = pgTable('vorlage', {
  id: text('id').primaryKey(), // slug, z. B. waermepumpe_gas
  name: text('name').notNull(),
  vorhabenKurz: text('vorhaben_kurz').notNull(),
  mailBetreff: text('mail_betreff').notNull(),
  mailPreheader: text('mail_preheader').notNull().default(''),
  foerderungStandard: boolean('foerderung_standard').notNull().default(false),
  hinweis: text('hinweis'),
  annahmenStandard: jsonb('annahmen_standard').$type<string[]>().notNull().default([]),
  vorbehaltIds: jsonb('vorbehalt_ids').$type<number[]>().notNull().default([]),
  gewerkHaupt: gewerkEnum('gewerk_haupt').notNull().default('heizung'),
  position: integer('position').notNull().default(0),
  aktiv: boolean('aktiv').notNull().default(true),
});

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

export const vorlageZeile = pgTable('vorlage_zeile', {
  id: text('id').primaryKey(),
  vorlageId: text('vorlage_id').notNull().references(() => vorlage.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  titel: text('titel').notNull(),
  gewerk: gewerkEnum('gewerk').notNull(),
  text: text('text').notNull().default(''),
  matrixNr: integer('matrix_nr').references(() => richtpreis.nr, { onDelete: 'set null' }),
  zuschlag: boolean('zuschlag').notNull().default(false),
  mengeDefault: numeric('menge_default', { precision: 10, scale: 2 }).notNull().default('1'),
  einheit: einheitEnum('einheit').notNull().default('pauschal'),
  groessenVarianten: jsonb('groessen_varianten').$type<GroessenVariante[]>(),
  matrixHinweis: text('matrix_hinweis'),
}, (t) => [index('vorlage_zeile_vorlage_idx').on(t.vorlageId)]);

export const plzRadius = pgTable('plz_radius', {
  plzPraefix: text('plz_praefix').primaryKey(),
  ort: text('ort').notNull(),
  entfernungKm: integer('entfernung_km').notNull(),
});

// ---------------------------------------------------------------------------
// Kunden und Anfragen
// ---------------------------------------------------------------------------
export const kunde = pgTable('kunde', {
  id: text('id').primaryKey(),
  anrede: text('anrede').notNull().default(''),
  vorname: text('vorname').notNull().default(''),
  nachname: text('nachname').notNull(),
  email: text('email').notNull(),
  telefon: text('telefon').notNull().default(''),
  strasse: text('strasse').notNull().default(''),
  plzOrt: text('plz_ort').notNull().default(''),
  erstelltAm: erstelltAm(),
}, (t) => [index('kunde_email_idx').on(t.email)]);

export type Kalkulationsfaktoren = {
  stundensatz?: number;
  materialZuschlagProzent?: number;
  rabattProzent?: number;
  margeHinweis?: string;
};

export type FoerderungDaten = {
  kosten: number;
  satz: number;
  zuschuss: number;
  eigenanteilVon: number;
  eigenanteilBis: number;
  boni?: { effizienz?: boolean; klimageschwindigkeit?: boolean; einkommen?: boolean };
  wohneinheiten?: number;
};

export const anfrage = pgTable('anfrage', {
  id: text('id').primaryKey(),
  ksNummer: text('ks_nummer').notNull().unique(),
  jahr: integer('jahr').notNull(),
  laufnr: integer('laufnr').notNull(),
  status: anfrageStatusEnum('status').notNull().default('eingang'),
  bemerkung: text('bemerkung').notNull().default(''),
  quelle: quelleEnum('quelle').notNull(),
  kundeId: text('kunde_id').notNull().references(() => kunde.id, { onDelete: 'restrict' }),
  objektAdresse: text('objekt_adresse').notNull().default(''),
  objektPlz: text('objekt_plz').notNull().default(''),
  entfernungKm: integer('entfernung_km'),
  dringlichkeit: dringlichkeitEnum('dringlichkeit').notNull().default('unklar'),
  vorhabenKurz: text('vorhaben_kurz').notNull().default(''),
  gewerkHaupt: gewerkEnum('gewerk_haupt'),
  persoenlicherSatz: text('persoenlicher_satz').notNull().default(''),
  annahmen: jsonb('annahmen').$type<string[]>().notNull().default([]),
  vorbehalte: jsonb('vorbehalte').$type<string[]>().notNull().default([]),
  ausfuehrungSatz: text('ausfuehrung_satz').notNull().default(''),
  mailBetreff: text('mail_betreff').notNull().default(''),
  mailPreheader: text('mail_preheader').notNull().default(''),
  konfiguratorAntworten: jsonb('konfigurator_antworten').$type<Record<string, unknown>>().notNull().default({}),
  /** Gebäude und bestehende Heizung nach dem Erfassungsbogen (Meister-Modus, Portal-Leads, Vorbelegung aus dem Web). */
  gebaeude: jsonb('gebaeude').$type<GebaeudeDaten | null>(),
  triageVorschlag: text('triage_vorschlag').notNull().default(''),
  grundVerworfen: text('grund_verworfen'),
  etage: integer('etage'),
  aufzug: boolean('aufzug'),
  montagehindernisse: text('montagehindernisse').notNull().default(''),
  leitungswege: text('leitungswege').notNull().default(''),
  interneNotizen: text('interne_notizen').notNull().default(''),
  kalkulation: jsonb('kalkulation').$type<Kalkulationsfaktoren>().notNull().default({}),
  foerderung: jsonb('foerderung').$type<FoerderungDaten | null>(),
  summeNettoVon: integer('summe_netto_von'),
  summeNettoBis: integer('summe_netto_bis'),
  wohneinheiten: integer('wohneinheiten').notNull().default(1),
  /** Eigentum, Miete oder unklar (Triage nach Regel 10). */
  eigentum: text('eigentum').notNull().default('unklar'),
  bestaetigungsTokenHash: text('bestaetigungs_token_hash'),
  tokenGueltigBis: ts('token_gueltig_bis'),
  tokenEingeloestAm: ts('token_eingeloest_am'),
  bearbeiterId: text('bearbeiter_id').references(() => benutzer.id, { onDelete: 'set null' }),
  versendetAm: ts('versendet_am'),
  wiedervorlageAm: ts('wiedervorlage_am'),
  erinnertAm: ts('erinnert_am'),
  antwortAm: ts('antwort_am'),
  terminAm: ts('termin_am'),
  verworfenAm: ts('verworfen_am'),
  erstelltAm: erstelltAm(),
  geaendertAm: ts('geaendert_am').notNull().defaultNow(),
}, (t) => [
  uniqueIndex('anfrage_jahr_laufnr_uq').on(t.jahr, t.laufnr),
  index('anfrage_status_idx').on(t.status),
  index('anfrage_kunde_idx').on(t.kundeId),
  index('anfrage_token_idx').on(t.bestaetigungsTokenHash),
]);

export const anfrageVorlage = pgTable('anfrage_vorlage', {
  anfrageId: text('anfrage_id').notNull().references(() => anfrage.id, { onDelete: 'cascade' }),
  vorlageId: text('vorlage_id').notNull().references(() => vorlage.id, { onDelete: 'restrict' }),
  position: integer('position').notNull().default(0),
}, (t) => [primaryKey({ columns: [t.anfrageId, t.vorlageId] })]);

export type ZeileIntern = {
  stunden?: number;
  stundensatz?: number;
  material?: number;
  aufschlagProzent?: number;
};

export const anfrageZeile = pgTable('anfrage_zeile', {
  id: text('id').primaryKey(),
  anfrageId: text('anfrage_id').notNull().references(() => anfrage.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  titel: text('titel').notNull(),
  gewerk: gewerkEnum('gewerk').notNull(),
  text: text('text').notNull().default(''),
  menge: numeric('menge', { precision: 10, scale: 2 }).notNull().default('1'),
  einheit: einheitEnum('einheit').notNull().default('pauschal'),
  von: integer('von'),
  bis: integer('bis'),
  matrixNr: integer('matrix_nr'),
  vorlageZeileId: text('vorlage_zeile_id'),
  varianteMatrixNr: integer('variante_matrix_nr'),
  zuschlag: boolean('zuschlag').notNull().default(false),
  aktiv: boolean('aktiv').notNull().default(true),
  quelle: zeileQuelleEnum('quelle').notNull().default('vorlage'),
  notizIntern: text('notiz_intern').notNull().default(''),
  intern: jsonb('intern').$type<ZeileIntern>().notNull().default({}),
}, (t) => [index('anfrage_zeile_anfrage_idx').on(t.anfrageId)]);

// ---------------------------------------------------------------------------
// Versand, Anhänge, Dokumente
// ---------------------------------------------------------------------------
export const versandauftrag = pgTable('versandauftrag', {
  id: text('id').primaryKey(),
  anfrageId: text('anfrage_id').notNull().references(() => anfrage.id, { onDelete: 'cascade' }),
  art: versandArtEnum('art').notNull(),
  status: versandStatusEnum('status').notNull().default('entwurf'),
  faelligAm: ts('faellig_am'),
  naechsterVersuchAm: ts('naechster_versuch_am'),
  freigegebenVon: text('freigegeben_von').references(() => benutzer.id, { onDelete: 'set null' }),
  freigegebenAm: ts('freigegeben_am'),
  versendetAm: ts('versendet_am'),
  zugestelltAm: ts('zugestellt_am'),
  empfaenger: text('empfaenger').notNull().default(''),
  betreff: text('betreff').notNull().default(''),
  messageId: text('message_id'),
  inReplyTo: text('in_reply_to'),
  resendId: text('resend_id'),
  fehler: text('fehler'),
  versuch: integer('versuch').notNull().default(0),
  dokumentIds: jsonb('dokument_ids').$type<string[]>().notNull().default([]),
  erstelltAm: erstelltAm(),
}, (t) => [
  uniqueIndex('versandauftrag_aktiv_uq').on(t.anfrageId, t.art).where(sql`${t.status} <> 'storniert'`),
  index('versandauftrag_faellig_idx').on(t.status, t.faelligAm),
]);

export const anhang = pgTable('anhang', {
  id: text('id').primaryKey(),
  anfrageId: text('anfrage_id').notNull().references(() => anfrage.id, { onDelete: 'cascade' }),
  art: anhangArtEnum('art').notNull(),
  dateiname: text('dateiname').notNull().default(''),
  mime: text('mime').notNull(),
  groesse: integer('groesse').notNull().default(0),
  blobPfad: text('blob_pfad').notNull(),
  thumbBlobPfad: text('thumb_blob_pfad'),
  breite: integer('breite'),
  hoehe: integer('hoehe'),
  beschreibung: text('beschreibung').notNull().default(''),
  intern: boolean('intern').notNull().default(true),
  erstelltAm: erstelltAm(),
}, (t) => [index('anhang_anfrage_idx').on(t.anfrageId)]);

export const dokument = pgTable('dokument', {
  id: text('id').primaryKey(),
  anfrageId: text('anfrage_id').notNull().references(() => anfrage.id, { onDelete: 'cascade' }),
  art: dokumentArtEnum('art').notNull(),
  version: integer('version').notNull().default(1),
  blobPfad: text('blob_pfad').notNull(),
  sha256: text('sha256').notNull(),
  groesse: integer('groesse').notNull().default(0),
  erstelltAm: erstelltAm(),
}, (t) => [uniqueIndex('dokument_version_uq').on(t.anfrageId, t.art, t.version)]);

// ---------------------------------------------------------------------------
// Termine, Ereignisse, Jobs, Löschprotokoll
// ---------------------------------------------------------------------------
export const terminfenster = pgTable('terminfenster', {
  id: text('id').primaryKey(),
  beginn: ts('beginn'),
  ende: ts('ende'),
  beschriftung: text('beschriftung').notNull(),
  aktiv: boolean('aktiv').notNull().default(true),
  erstelltAm: erstelltAm(),
});

export const terminfensterReservierung = pgTable('terminfenster_reservierung', {
  terminfensterId: text('terminfenster_id').primaryKey().references(() => terminfenster.id, { onDelete: 'cascade' }),
  anfrageId: text('anfrage_id').notNull().references(() => anfrage.id, { onDelete: 'cascade' }),
  erstelltAm: erstelltAm(),
}, (t) => [index('reservierung_anfrage_idx').on(t.anfrageId)]);

export const ereignis = pgTable('ereignis', {
  id: serial('id').primaryKey(),
  anfrageId: text('anfrage_id').references(() => anfrage.id, { onDelete: 'cascade' }),
  typ: text('typ').notNull(),
  benutzerId: text('benutzer_id'),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  erstelltAm: erstelltAm(),
}, (t) => [index('ereignis_anfrage_idx').on(t.anfrageId, t.erstelltAm)]);

export const jobLauf = pgTable('job_lauf', {
  id: serial('id').primaryKey(),
  job: text('job').notNull(),
  slot: text('slot').notNull(),
  ausgeloestDurch: jobAusloeserEnum('ausgeloest_durch').notNull(),
  gestartet: ts('gestartet').notNull().defaultNow(),
  beendet: ts('beendet'),
  verarbeitet: integer('verarbeitet').notNull().default(0),
  blockiert: integer('blockiert').notNull().default(0),
  fehler: text('fehler'),
  zusammenfassung: text('zusammenfassung'),
}, (t) => [uniqueIndex('job_lauf_slot_uq').on(t.job, t.slot)]);

export const loeschprotokoll = pgTable('loeschprotokoll', {
  id: serial('id').primaryKey(),
  ksNummer: text('ks_nummer').notNull(),
  geloeschtAm: ts('geloescht_am').notNull().defaultNow(),
  grund: text('grund').notNull(),
});
