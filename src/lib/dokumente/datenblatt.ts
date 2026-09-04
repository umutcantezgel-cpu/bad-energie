/**
 * Eingabetypen der Dokumenten-Engine. Vertrag zwischen Backend (baut die Eingabe aus der Anfrage)
 * und Renderer (Kostenschätzung, Mails, Dossier). Feldnamen lehnen sich an datenblatt-schema.json an.
 */
import type { Dringlichkeit, Einheit, FoerderungErgebnis, Gewerk, Kalkulationsfaktoren, PositionErgebnis, Quelle, AnfrageStatus, AnhangArt } from '../types';

export type Briefbogen = {
  firma: string;
  strasse: string;
  plzOrt: string;
  telefon: string;
  telefonLink: string;
  email: string;
  web: string;
  geschaeftsfuehrer: string;
  register: string;
  ustId: string;
};

export type Bearbeiter = { name: string; rolle: string; mail: string };

export type DokumentKunde = {
  anrede: string; // 'Frau' | 'Herr' | ''
  vorname: string;
  nachname: string;
  strasse: string;
  plzOrt: string;
  email: string;
  telefon: string;
};

/** Kundensichtbare Eingabe (Allow-List). Enthält nie interne Faktoren, Notizen oder Skizzen. */
export type DokumentEingabe = {
  ksNummer: string;
  datum: string; // dd.mm.yyyy
  briefbogen: Briefbogen;
  bearbeiter: Bearbeiter;
  kunde: DokumentKunde;
  objektAdresse: string;
  vorhabenKurz: string;
  gewerkHaupt: Gewerk | null;
  persoenlicherSatz: string;
  /** Nur aktive, nicht blockierte Positionen mit Spanne. */
  positionen: PositionErgebnis[];
  nettoVon: number;
  nettoBis: number;
  bruttoVon: number;
  bruttoBis: number;
  foerderung: FoerderungErgebnis | null;
  annahmen: string[];
  vorbehalte: string[];
  terminvorschlag: string;
  ausfuehrungSatz: string;
  mailBetreff: string;
  mailPreheader: string;
  appUrl: string;
  /** Link auf /termin/bestaetigen/[token]; null bei Terminmail ohne Token. */
  bestaetigungsUrl: string | null;
};

export type DossierPosition = {
  titel: string;
  gewerk: Gewerk;
  text: string;
  menge: number;
  einheit: Einheit;
  von: number | null;
  bis: number | null;
  matrixNr: number | null;
  zuschlag: boolean;
  aktiv: boolean;
  notizIntern: string;
  blockiert: boolean;
};

/** Interne Eingabe für das Büro-Dossier (alles). */
export type DossierEingabe = DokumentEingabe & {
  anfrageId: string;
  internUrl: string;
  quelle: Quelle;
  status: AnfrageStatus;
  dringlichkeit: Dringlichkeit;
  triageVorschlag: string;
  entfernungKm: number | null;
  notizen: { etage: number | null; aufzug: boolean | null; montagehindernisse: string; leitungswege: string; intern: string };
  positionenIntern: DossierPosition[];
  kalkulation: Kalkulationsfaktoren;
  fehlendeAngaben: string[];
  warnungen: string[];
  anhaenge: { art: AnhangArt; dateiname: string; url: string }[];
  /** Eine Zeile mit den 16 Spalten von Uebersicht.csv (Semikolon). */
  csvZeile: string;
  /** Vollständige interne Projektion als JSON-Text (datenblatt.json). */
  datenblattJson: string;
};

export type MailArtefakt = { betreff: string; html: string; text: string };

export type EingangsbestaetigungEingabe = {
  ksNummer: string;
  anredeZeile: string;
  briefbogen: Briefbogen;
  bearbeiter: Bearbeiter;
  appUrl: string;
};

/** Anrede-Zeile nach Regel 6: „Frau Musterfrau“ / „Tamara Musterfrau“ / „Musterfrau“. */
export function anredeZeile(k: Pick<DokumentKunde, 'anrede' | 'vorname' | 'nachname'>): string {
  const anrede = k.anrede.trim();
  if (anrede === 'Frau' || anrede === 'Herr') return `${anrede} ${k.nachname}`.trim();
  if (k.vorname.trim()) return `${k.vorname.trim()} ${k.nachname}`.trim();
  return k.nachname;
}
