/**
 * Reine Hilfsfunktionen des Meister-Modus und des SketchPads.
 *
 * Bewusst ohne React, ohne Serverzugriff und ohne Nebenwirkungen beim Import:
 * dadurch sind Skizzenmodell, Undo-Stack, Radierer, Zustandsreduzierer und
 * Textregeln direkt mit Vitest pruefbar. Zugriffe auf localStorage und document
 * stehen ausschliesslich in den Ansichtsfunktionen und sind dort abgesichert.
 */
import { gebaeudeSchema, internAnfrageSchema } from '@/lib/types';
import type {
  Baustein,
  GebaeudeDaten,
  Gewerk,
  GroessenVariante,
  Hinweis,
  InternAnfrage,
  InternAnfrageDTO,
  KalkulationsErgebnis,
  Position,
  SkizzeExport,
} from '@/lib/types';
import { geraetAusBaureihe, heizlastSchaetzen, leeresGebaeude } from '@/lib/services/heizlast';

// ---------------------------------------------------------------------------
// Farben und Bezeichner
// ---------------------------------------------------------------------------

/** Gewerkefarbe fuer die Oberflaeche (CSS-Variable mit Rueckfallwert). */
export const GEWERK_MODUL_FARBE: Record<Gewerk, string> = {
  heizung: 'var(--modul-flamme, #EE6C1F)',
  bad: 'var(--modul-wasser, #1B3A8C)',
  wasser: 'var(--modul-wasser, #1B3A8C)',
  waermepumpe: 'var(--modul-solar, #F0C000)',
  solar: 'var(--modul-solar, #F0C000)',
  pv: 'var(--modul-solar, #F0C000)',
  klima: 'var(--modul-luft, #8E959E)',
  lueftung: 'var(--modul-luft, #8E959E)',
  elektro: 'var(--modul-elektro, #475569)',
};

/** Gewerkefarbe als fester Hexwert (Canvas kann keine CSS-Variablen aufloesen). */
export const GEWERK_HEX: Record<Gewerk, string> = {
  heizung: '#EE6C1F',
  bad: '#1B3A8C',
  wasser: '#1B3A8C',
  waermepumpe: '#F0C000',
  solar: '#F0C000',
  pv: '#F0C000',
  klima: '#8E959E',
  lueftung: '#8E959E',
  elektro: '#475569',
};

export const GEWERK_NAME: Record<Gewerk, string> = {
  heizung: 'Heizung',
  bad: 'Bad',
  wasser: 'Wasser',
  waermepumpe: 'Waermepumpe',
  solar: 'Solar',
  pv: 'Photovoltaik',
  klima: 'Klima',
  lueftung: 'Lueftung',
  elektro: 'Elektro',
};

let zaehler = 0;
/** Kurze, im Client eindeutige Kennung (kein Zufall noetig, nur Kollisionsfreiheit). */
export function neueId(praefix = 'p'): string {
  zaehler += 1;
  return `${praefix}_${Date.now().toString(36)}_${zaehler.toString(36)}`;
}

/** Pflichtname des PDF-Anhangs. */
export function anhangName(ksNummer: string): string {
  const treffer = /KS-\d{4}-\d{4}/.exec(ksNummer);
  return `Kostenschaetzung ${treffer ? treffer[0] : ksNummer} Bad und Energie.pdf`;
}

// ---------------------------------------------------------------------------
// Textregeln (leichte Warnungen im Client, harte Sperren liegen im Server)
// ---------------------------------------------------------------------------

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
const FLOSKELN = ['vielen dank fuer ihr interesse', 'vielen dank für ihr interesse'];

/** Warnungen nach Regel 5. Reine Hinweise, kein Versandhindernis. */
export function textregelWarnungen(text: string): string[] {
  const warnungen: string[] = [];
  if (!text) return warnungen;
  if (/[A-Za-zÄÖÜäöüß]-[A-Za-zÄÖÜäöüß]/.test(text) || / - /.test(text)) {
    warnungen.push('Bindestrich im Fliesstext. Bitte ausschreiben.');
  }
  if (EMOJI.test(text)) warnungen.push('Emoji gefunden. Kundentexte bleiben ohne Emoji.');
  const klein = text.toLowerCase();
  if (FLOSKELN.some((f) => klein.includes(f))) warnungen.push('Floskel gefunden. Bitte persoenlich formulieren.');
  return warnungen;
}

/** Mindestens eine Waermepumpen-Vorlage gewaehlt (steuert Pflichtangaben und Geraetevorschlag). */
export function istWaermepumpenVorlage(vorlageIds: string[]): boolean {
  return vorlageIds.some((id) => id.toLowerCase().includes('waermepumpe'));
}

/** Fehlende Pflichtangaben nach Regel 3 (Anzeige im Abschluss). */
export function fehlendeAngaben(a: InternAnfrage): string[] {
  const fehlt: string[] = [];
  if (!a.kontakt.anrede) fehlt.push('Anrede');
  if (!a.kontakt.nachname || a.kontakt.nachname.length < 2) fehlt.push('Nachname');
  if (!a.kontakt.email) fehlt.push('E-Mail');
  if (!a.kontakt.telefon) fehlt.push('Telefon');
  if (!a.objekt.adresse) fehlt.push('Objektadresse');
  if (a.terminfensterIds.length !== 2) fehlt.push('Zwei Terminfenster');
  if (!a.persoenlicherSatz.trim()) fehlt.push('Persoenlicher Satz');
  // Zugang und Bestand nach der Arbeitsweise des Chefs (Beleg 3 und 10).
  const tuer = a.gebaeude.platz.tuerbreiteCm;
  if (istWaermepumpenVorlage(a.vorlageIds) && tuer !== null && tuer < 80) fehlt.push('Türbreite unter 80 cm, Transportweg klären');
  if (istWaermepumpenVorlage(a.vorlageIds) && !a.gebaeude.bestand.energieart) fehlt.push('Bestehende Heizung');
  // Dieselben Punkte wie im Büro-Dossier (dokument-eingabe.ts), damit der Meister vor Ort dasselbe sieht.
  if (istWaermepumpenVorlage(a.vorlageIds)) {
    const h = heizlastSchaetzen(a.gebaeude);
    if (h && !h.belastbar) fehlt.push('Jahresverbrauch fehlt, die Heizlast aus der Wohnfläche allein trägt die Gerätewahl nicht');
    if (h && h.belastbar && geraetAusBaureihe(h.kwEmpfohlen, a.gebaeude.geraet.hersteller).ueberBaureihe) {
      fehlt.push('Die errechnete Heizlast liegt über der Baureihe, die Auslegung klären wir vor Ort.');
    }
  }
  return [...new Set(fehlt)];
}

/** Kennungen der Abschnitte des Meister-Modus (Reihenfolge des gefuehrten Modus). */
export const ABSCHNITT_IDS = ['vorhaben', 'bausteine', 'kunde', 'gebaeude', 'notizen', 'dokument', 'abschluss'] as const;
export type AbschnittId = (typeof ABSCHNITT_IDS)[number];

/**
 * Offene Punkte eines Abschnitts im gefuehrten Modus. Reine Pruefung ohne Nebenwirkung.
 * Nur blockierte Basispositionen sperren das Weitergehen; alles andere ist ein Hinweis.
 */
export function schrittPruefung(id: AbschnittId, a: InternAnfrage, ergebnis: KalkulationsErgebnis): string[] {
  const offen: string[] = [];
  switch (id) {
    case 'vorhaben':
      if (!a.vorlageIds.length) offen.push('Mindestens ein Vorhaben wählen.');
      break;
    case 'bausteine':
      for (const p of ergebnis.positionen) {
        if (!p.zuschlag && p.blockiert) offen.push(`„${p.titel}“ hat keine Spanne. Größe oder Matrixzeile klären.`);
      }
      break;
    case 'kunde':
      if (!a.kontakt.nachname || a.kontakt.nachname.trim().length < 2) offen.push('Nachname fehlt.');
      if (!a.kontakt.email.trim() && !(a.kontakt.telefon ?? '').trim()) offen.push('E-Mail oder Telefon fehlt.');
      break;
    case 'gebaeude':
      if (!a.gebaeude.wohnflaeche) offen.push('Wohnfläche fehlt.');
      if (istWaermepumpenVorlage(a.vorlageIds) && !a.gebaeude.bestand.energieart) offen.push('Bestehende Heizung fehlt.');
      break;
    case 'notizen':
      break;
    case 'dokument':
      if (!a.persoenlicherSatz.trim()) offen.push('Persönlicher Satz fehlt.');
      if (a.terminfensterIds.length !== 2) offen.push('Zwei Terminfenster wählen.');
      break;
    case 'abschluss':
      break;
    default:
      break;
  }
  return offen;
}

/** Nur blockierte Basispositionen sperren den naechsten Schritt (Fachregel 2). */
export function schrittSperrt(id: AbschnittId, ergebnis: KalkulationsErgebnis): boolean {
  return id === 'bausteine' && ergebnis.positionen.some((p) => !p.zuschlag && p.blockiert);
}

/**
 * kW-Wert fuer den Positionstext: das vor Ort bestaetigte Geraet, wenn es zur gewaehlten
 * Groessenvariante passt, sonst die Beschriftung der Variante („5 bis 7“).
 */
export function kwFuerVariante(
  variante: GroessenVariante | null | undefined,
  geraetKw: number | null | undefined,
): string | number | undefined {
  if (!variante) return undefined;
  if (geraetKw !== null && geraetKw !== undefined && Number.isFinite(geraetKw)) {
    const von = variante.heizlastKwVon ?? 0;
    const bis = variante.heizlastKwBis ?? Number.POSITIVE_INFINITY;
    if (geraetKw >= von && geraetKw <= bis) return geraetKw;
  }
  return variante.kwLabel;
}

// ---------------------------------------------------------------------------
// Zustand des Meister-Modus (Reduzierer, rein)
// ---------------------------------------------------------------------------

export function leereAnfrage(): InternAnfrage {
  return {
    modus: 'intern',
    aktion: 'entwurf',
    quelle: 'intern',
    vorlageIds: [],
    kontakt: { anrede: '', vorname: '', nachname: '', email: '', telefon: '', strasse: '', plzOrt: '', kenntnisnahme: true },
    objekt: { adresse: '', plz: '', eigentum: 'unklar', wohneinheiten: 1 },
    gebaeude: leeresGebaeude(),
    dringlichkeit: 'unklar',
    vorhabenKurz: '',
    positionen: [],
    kalkulation: {},
    foerderung: {
      aktiv: false,
      wohneinheiten: 1,
      selbstBewohnt: true,
      altOelOderGas: true,
      einkommenUnterGrenze: false,
      natuerlichesKaeltemittel: true,
      satzManuell: null,
    },
    persoenlicherSatz: '',
    annahmen: [],
    vorbehalte: [],
    ausfuehrungSatz: '',
    terminfensterIds: [],
    notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: '' },
    skizzen: [],
    fotos: [],
  };
}

/** Fuellt fehlende Gebaeudeteile mit Standardwerten (alte Datensaetze ohne `gebaeude`). */
export function normalisiereGebaeude(roh: unknown): GebaeudeDaten {
  const geparst = gebaeudeSchema.safeParse(roh ?? {});
  return geparst.success ? geparst.data : leeresGebaeude();
}

/**
 * Ergaenzt einen alten Entwurf aus IndexedDB um neue Teile (vor allem `gebaeude`).
 * Vollstaendige Entwuerfe laufen ueber `internAnfrageSchema`, unvollstaendige werden
 * feldweise mit der leeren Anfrage aufgefuellt, damit ein Termin nie an einer
 * fehlenden Struktur scheitert.
 */
export function normalisiereAnfrage(lokal: unknown): InternAnfrage {
  const leer = leereAnfrage();
  if (!lokal || typeof lokal !== 'object') return leer;
  const geparst = internAnfrageSchema.safeParse(lokal);
  if (geparst.success) return geparst.data;
  const roh = lokal as Partial<InternAnfrage>;
  return {
    ...leer,
    ...roh,
    modus: 'intern',
    aktion: roh.aktion ?? 'entwurf',
    kontakt: { ...leer.kontakt, ...roh.kontakt, kenntnisnahme: true },
    objekt: { ...leer.objekt, ...roh.objekt },
    gebaeude: normalisiereGebaeude(roh.gebaeude),
    kalkulation: { ...leer.kalkulation, ...roh.kalkulation },
    foerderung: { ...leer.foerderung, ...roh.foerderung },
    notizen: { ...leer.notizen, ...roh.notizen },
    vorlageIds: Array.isArray(roh.vorlageIds) ? [...roh.vorlageIds] : [],
    positionen: Array.isArray(roh.positionen) ? roh.positionen.map((p) => ({ ...p })) : [],
    annahmen: Array.isArray(roh.annahmen) ? [...roh.annahmen] : [],
    vorbehalte: Array.isArray(roh.vorbehalte) ? [...roh.vorbehalte] : [],
    terminfensterIds: Array.isArray(roh.terminfensterIds) ? roh.terminfensterIds.slice(0, 2) : [],
    skizzen: Array.isArray(roh.skizzen) ? [...roh.skizzen] : [],
    fotos: Array.isArray(roh.fotos) ? roh.fotos.map((f) => ({ ...f, beschreibung: f.beschreibung ?? '' })) : [],
  };
}

/** Uebernimmt eine geladene Anfrage in den Bearbeitungszustand. */
export function ausDTO(dto: InternAnfrageDTO): InternAnfrage {
  const leer = leereAnfrage();
  return {
    ...leer,
    anfrageId: dto.anfrageId,
    quelle: dto.quelle,
    vorlageIds: [...dto.vorlageIds],
    kontakt: {
      anrede: dto.kontakt.anrede === 'Frau' || dto.kontakt.anrede === 'Herr' ? dto.kontakt.anrede : '',
      vorname: dto.kontakt.vorname,
      nachname: dto.kontakt.nachname,
      email: dto.kontakt.email,
      telefon: dto.kontakt.telefon,
      strasse: dto.kontakt.strasse,
      plzOrt: dto.kontakt.plzOrt,
      kenntnisnahme: true,
    },
    objekt: {
      adresse: dto.objekt.adresse,
      plz: dto.objekt.plz,
      eigentum: dto.objekt.eigentum,
      wohneinheiten: dto.objekt.wohneinheiten,
    },
    gebaeude: normalisiereGebaeude(dto.gebaeude),
    dringlichkeit: dto.dringlichkeit,
    vorhabenKurz: dto.vorhabenKurz,
    gewerkHaupt: dto.gewerkHaupt ?? undefined,
    positionen: dto.positionen.map((p) => ({ ...p })),
    kalkulation: { ...dto.kalkulation },
    foerderung: { ...dto.foerderung },
    persoenlicherSatz: dto.persoenlicherSatz,
    annahmen: [...dto.annahmen],
    vorbehalte: [...dto.vorbehalte],
    ausfuehrungSatz: dto.ausfuehrungSatz,
    terminfensterIds: [...dto.terminfensterIds],
    notizen: { ...dto.notizen },
  };
}

export type MeisterAktion =
  | { typ: 'ersetze'; wert: InternAnfrage }
  | { typ: 'feld'; teil: Partial<InternAnfrage> }
  | { typ: 'kontakt'; teil: Partial<InternAnfrage['kontakt']> }
  | { typ: 'objekt'; teil: Partial<InternAnfrage['objekt']> }
  | { typ: 'gebaeude'; teil: Partial<GebaeudeDaten> }
  | { typ: 'gebaeudeBestand'; teil: Partial<GebaeudeDaten['bestand']> }
  | { typ: 'gebaeudePlatz'; teil: Partial<GebaeudeDaten['platz']> }
  | { typ: 'gebaeudeGeraet'; teil: Partial<GebaeudeDaten['geraet']> }
  | { typ: 'kalkulation'; teil: Partial<InternAnfrage['kalkulation']> }
  | { typ: 'foerderung'; teil: Partial<InternAnfrage['foerderung']> }
  | { typ: 'notizen'; teil: Partial<InternAnfrage['notizen']> }
  | { typ: 'vorlage'; vorlageId: string; an: boolean }
  | { typ: 'positionSetzen'; position: Position }
  | { typ: 'positionAendern'; id: string; teil: Partial<Position> }
  | { typ: 'positionEntfernen'; id: string }
  | { typ: 'termin'; ids: string[] }
  | { typ: 'skizzeSetzen'; index: number; skizze: SkizzeExport }
  | { typ: 'skizzeEntfernen'; index: number }
  | { typ: 'fotosHinzu'; fotos: InternAnfrage['fotos'] }
  | { typ: 'fotoBeschreibung'; index: number; beschreibung: string }
  | { typ: 'fotoEntfernen'; index: number };

/** Reiner Reduzierer des Bearbeitungszustands. */
export function meisterReduzierer(zustand: InternAnfrage, aktion: MeisterAktion): InternAnfrage {
  switch (aktion.typ) {
    case 'ersetze':
      return aktion.wert;
    case 'feld':
      return { ...zustand, ...aktion.teil };
    case 'kontakt':
      return { ...zustand, kontakt: { ...zustand.kontakt, ...aktion.teil } };
    case 'objekt': {
      const objekt = { ...zustand.objekt, ...aktion.teil };
      if (aktion.teil.wohneinheiten === undefined) return { ...zustand, objekt };
      // Das Objekt ist die eine Quelle für Wohneinheiten; Förderung und Gebäude folgen (Regel 7).
      return {
        ...zustand,
        objekt,
        foerderung: { ...zustand.foerderung, wohneinheiten: objekt.wohneinheiten },
        gebaeude: { ...zustand.gebaeude, wohneinheiten: objekt.wohneinheiten },
      };
    }
    case 'gebaeude':
      return { ...zustand, gebaeude: { ...zustand.gebaeude, ...aktion.teil } };
    case 'gebaeudeBestand':
      return { ...zustand, gebaeude: { ...zustand.gebaeude, bestand: { ...zustand.gebaeude.bestand, ...aktion.teil } } };
    case 'gebaeudePlatz':
      return { ...zustand, gebaeude: { ...zustand.gebaeude, platz: { ...zustand.gebaeude.platz, ...aktion.teil } } };
    case 'gebaeudeGeraet':
      return { ...zustand, gebaeude: { ...zustand.gebaeude, geraet: { ...zustand.gebaeude.geraet, ...aktion.teil } } };
    case 'kalkulation':
      return { ...zustand, kalkulation: { ...zustand.kalkulation, ...aktion.teil } };
    case 'foerderung':
      return { ...zustand, foerderung: { ...zustand.foerderung, ...aktion.teil } };
    case 'notizen':
      return { ...zustand, notizen: { ...zustand.notizen, ...aktion.teil } };
    case 'vorlage': {
      const drin = zustand.vorlageIds.includes(aktion.vorlageId);
      if (aktion.an === drin) return zustand;
      const vorlageIds = aktion.an
        ? [...zustand.vorlageIds, aktion.vorlageId]
        : zustand.vorlageIds.filter((v) => v !== aktion.vorlageId);
      return { ...zustand, vorlageIds };
    }
    case 'positionSetzen': {
      const index = zustand.positionen.findIndex((p) => p.id === aktion.position.id);
      const positionen = index >= 0
        ? zustand.positionen.map((p, i) => (i === index ? aktion.position : p))
        : [...zustand.positionen, aktion.position];
      return { ...zustand, positionen };
    }
    case 'positionAendern':
      return {
        ...zustand,
        positionen: zustand.positionen.map((p) => (p.id === aktion.id ? { ...p, ...aktion.teil } : p)),
      };
    case 'positionEntfernen':
      return { ...zustand, positionen: zustand.positionen.filter((p) => p.id !== aktion.id) };
    case 'termin':
      return { ...zustand, terminfensterIds: aktion.ids.slice(0, 2) };
    case 'skizzeSetzen': {
      const skizzen = [...zustand.skizzen];
      if (aktion.index >= 0 && aktion.index < skizzen.length) skizzen[aktion.index] = aktion.skizze;
      else skizzen.push(aktion.skizze);
      return { ...zustand, skizzen: skizzen.slice(0, 6) };
    }
    case 'skizzeEntfernen':
      return { ...zustand, skizzen: zustand.skizzen.filter((_, i) => i !== aktion.index) };
    case 'fotosHinzu':
      return { ...zustand, fotos: [...zustand.fotos, ...aktion.fotos].slice(0, 10) };
    case 'fotoBeschreibung':
      return {
        ...zustand,
        fotos: zustand.fotos.map((f, i) => (i === aktion.index ? { ...f, beschreibung: aktion.beschreibung } : f)),
      };
    case 'fotoEntfernen':
      return { ...zustand, fotos: zustand.fotos.filter((_, i) => i !== aktion.index) };
    default:
      return zustand;
  }
}

/** Bausteine einer Auswahl, sortiert nach Vorlage und Position. */
export function aktiveBausteine(vorlagenBausteine: Baustein[], vorlageIds: string[]): Baustein[] {
  return vorlagenBausteine
    .filter((b) => vorlageIds.includes(b.vorlageId))
    .sort((a, b) => vorlageIds.indexOf(a.vorlageId) - vorlageIds.indexOf(b.vorlageId) || a.position - b.position);
}

/** Erste blockierte Position (Sprungziel der Live-Leiste). */
export function ersteBlockierte(hinweise: Hinweis[]): string | null {
  for (const h of hinweise) if (h.positionId) return h.positionId;
  return null;
}

// ---------------------------------------------------------------------------
// SketchPad: Modell
// ---------------------------------------------------------------------------

/** Feste logische Leinwand (DIN A4 quer bei 210 dpi), rotationsstabil. */
export const LEINWAND_BREITE = 2480;
export const LEINWAND_HOEHE = 1754;
export const UNDO_TIEFE = 30;

export type Punkt = { x: number; y: number; druck: number };
export type Werkzeug = 'stift' | 'marker' | 'radierer' | 'massband' | 'text';

export type Strich = {
  id: string;
  art: 'strich';
  werkzeug: 'stift' | 'marker';
  farbe: string;
  breite: number;
  punkte: Punkt[];
};
export type Mass = {
  id: string;
  art: 'mass';
  farbe: string;
  von: { x: number; y: number };
  bis: { x: number; y: number };
  label: string;
};
export type Textmarke = {
  id: string;
  art: 'text';
  farbe: string;
  position: { x: number; y: number };
  groesse: number;
  text: string;
};
export type Element = Strich | Mass | Textmarke;
export type SkizzeModell = { elemente: Element[] };

export type UndoStack<T> = { vergangenheit: T[]; gegenwart: T; zukunft: T[] };

export function neuerStack<T>(gegenwart: T): UndoStack<T> {
  return { vergangenheit: [], gegenwart, zukunft: [] };
}

export function anwenden<T>(stack: UndoStack<T>, naechste: T): UndoStack<T> {
  const vergangenheit = [...stack.vergangenheit, stack.gegenwart].slice(-UNDO_TIEFE);
  return { vergangenheit, gegenwart: naechste, zukunft: [] };
}

export function kannRueckgaengig<T>(stack: UndoStack<T>): boolean {
  return stack.vergangenheit.length > 0;
}

export function kannWiederholen<T>(stack: UndoStack<T>): boolean {
  return stack.zukunft.length > 0;
}

export function rueckgaengig<T>(stack: UndoStack<T>): UndoStack<T> {
  if (!stack.vergangenheit.length) return stack;
  const vergangenheit = stack.vergangenheit.slice(0, -1);
  const gegenwart = stack.vergangenheit[stack.vergangenheit.length - 1];
  return { vergangenheit, gegenwart, zukunft: [stack.gegenwart, ...stack.zukunft].slice(0, UNDO_TIEFE) };
}

export function wiederholen<T>(stack: UndoStack<T>): UndoStack<T> {
  if (!stack.zukunft.length) return stack;
  const [gegenwart, ...zukunft] = stack.zukunft;
  return { vergangenheit: [...stack.vergangenheit, stack.gegenwart].slice(-UNDO_TIEFE), gegenwart, zukunft };
}

// ---------------------------------------------------------------------------
// SketchPad: Geometrie
// ---------------------------------------------------------------------------

export type Ansicht = { zoom: number; panX: number; panY: number };
export const ANSICHT_START: Ansicht = { zoom: 1, panX: 0, panY: 0 };
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 6;

export function begrenzeZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/** Skalierung, mit der die logische Leinwand vollstaendig in den Viewport passt. */
export function ansichtSkalierung(viewportBreite: number, viewportHoehe: number): number {
  if (viewportBreite <= 0 || viewportHoehe <= 0) return 1;
  return Math.min(viewportBreite / LEINWAND_BREITE, viewportHoehe / LEINWAND_HOEHE);
}

/** Bildschirmpunkt (relativ zur Leinwandflaeche) in Leinwandkoordinaten. */
export function zuLeinwand(
  x: number,
  y: number,
  basis: number,
  ansicht: Ansicht,
): { x: number; y: number } {
  const faktor = basis * ansicht.zoom;
  if (faktor === 0) return { x: 0, y: 0 };
  return { x: (x - ansicht.panX) / faktor, y: (y - ansicht.panY) / faktor };
}

export function abstandPunktZuSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const laenge = dx * dx + dy * dy;
  if (laenge === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / laenge;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Trifft der Radierer dieses Element? */
export function trifftElement(element: Element, punkt: { x: number; y: number }, radius: number): boolean {
  if (element.art === 'strich') {
    if (element.punkte.length === 1) return Math.hypot(punkt.x - element.punkte[0].x, punkt.y - element.punkte[0].y) <= radius;
    for (let i = 1; i < element.punkte.length; i += 1) {
      if (abstandPunktZuSegment(punkt, element.punkte[i - 1], element.punkte[i]) <= radius) return true;
    }
    return false;
  }
  if (element.art === 'mass') return abstandPunktZuSegment(punkt, element.von, element.bis) <= radius;
  return Math.hypot(punkt.x - element.position.x, punkt.y - element.position.y) <= radius + element.groesse;
}

/** Entfernt alle vom Radierer getroffenen Elemente. */
export function radiere(elemente: Element[], punkt: { x: number; y: number }, radius: number): Element[] {
  return elemente.filter((e) => !trifftElement(e, punkt, radius));
}

/** Standardbeschriftung des Massbands in Zentimetern (Leinwandbreite entspricht cmGesamt). */
export function massLabel(
  von: { x: number; y: number },
  bis: { x: number; y: number },
  cmGesamt = 600,
): string {
  const pixel = Math.hypot(bis.x - von.x, bis.y - von.y);
  const cm = Math.round((pixel / LEINWAND_BREITE) * cmGesamt);
  return `${cm} cm`;
}

// ---------------------------------------------------------------------------
// Ansichtsschalter (Kundenansicht, Baustellen-Modus)
// ---------------------------------------------------------------------------

export const SCHLUESSEL_KUNDENANSICHT = 'be-kundenansicht';
export const SCHLUESSEL_BAUSTELLE = 'be-baustelle';

export type Ansichtszustand = { kundenansicht: boolean; baustelle: boolean };

const ANSICHT_SERVER: Ansichtszustand = { kundenansicht: false, baustelle: false };
let ansichtZustand: Ansichtszustand = ANSICHT_SERVER;
const ansichtHoerer = new Set<() => void>();

function medienTreffer(abfrage: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(abfrage).matches;
  } catch {
    return false;
  }
}

function gespeichert(schluessel: string): boolean | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const wert = localStorage.getItem(schluessel);
    if (wert === '1') return true;
    if (wert === '0') return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Grobes Zeigegeraet (Finger statt Maus). Quelle fuer den Standard des gefuehrten Modus;
 * als externer Speicher fuer `useSyncExternalStore`, damit Server und Client gleich starten.
 */
export function zeigerAbonnieren(hoerer: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => undefined;
  try {
    const abfrage = window.matchMedia('(pointer: coarse)');
    abfrage.addEventListener('change', hoerer);
    return () => abfrage.removeEventListener('change', hoerer);
  } catch {
    return () => undefined;
  }
}

export function zeigerGrobLesen(): boolean {
  return medienTreffer('(pointer: coarse)');
}

export function zeigerServerLesen(): boolean {
  return false;
}

/** Standard: Kundenansicht an auf Touch unter 1280 px, Baustellen-Modus bei reduzierter Transparenz. */
export function ansichtStandard(): Ansichtszustand {
  const grob = medienTreffer('(pointer: coarse)');
  const schmal = typeof window !== 'undefined' ? window.innerWidth < 1280 : false;
  return {
    kundenansicht: grob && schmal,
    baustelle: grob && medienTreffer('(prefers-reduced-transparency: reduce)'),
  };
}

export function ansichtLesen(): Ansichtszustand {
  return ansichtZustand;
}

export function ansichtServerLesen(): Ansichtszustand {
  return ANSICHT_SERVER;
}

export function ansichtAbonnieren(hoerer: () => void): () => void {
  ansichtHoerer.add(hoerer);
  return () => {
    ansichtHoerer.delete(hoerer);
  };
}

function ansichtVeroeffentlichen(naechste: Ansichtszustand): void {
  if (naechste.kundenansicht === ansichtZustand.kundenansicht && naechste.baustelle === ansichtZustand.baustelle) return;
  ansichtZustand = naechste;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-baustelle', naechste.baustelle ? 'on' : 'off');
    document.documentElement.setAttribute('data-kundenansicht', naechste.kundenansicht ? 'on' : 'off');
  }
  for (const h of ansichtHoerer) h();
}

/** Liest gespeicherte Werte und Medienabfragen; einmal beim Start des Intern-Bereichs. */
export function ansichtInitialisieren(): void {
  const standard = ansichtStandard();
  ansichtVeroeffentlichen({
    kundenansicht: gespeichert(SCHLUESSEL_KUNDENANSICHT) ?? standard.kundenansicht,
    baustelle: gespeichert(SCHLUESSEL_BAUSTELLE) ?? standard.baustelle,
  });
}

export function ansichtSetzen(teil: Partial<Ansichtszustand>): void {
  const naechste = { ...ansichtZustand, ...teil };
  if (typeof localStorage !== 'undefined') {
    try {
      if (teil.kundenansicht !== undefined) localStorage.setItem(SCHLUESSEL_KUNDENANSICHT, teil.kundenansicht ? '1' : '0');
      if (teil.baustelle !== undefined) localStorage.setItem(SCHLUESSEL_BAUSTELLE, teil.baustelle ? '1' : '0');
    } catch {
      // Speicher nicht verfuegbar: Zustand gilt nur fuer diese Sitzung.
    }
  }
  ansichtVeroeffentlichen(naechste);
}

/** Nur fuer Tests: setzt den Modulzustand zurueck. */
export function ansichtZuruecksetzen(): void {
  ansichtZustand = ANSICHT_SERVER;
}

/**
 * Ein leerer Konfigurator darf keinen Vorgang mit KS-Nummer erzeugen: Ohne bestehende Anfrage wird erst
 * an den Server gesendet, wenn eine Vorlage gewählt ist und der Kunde erkennbar ist (Name, E-Mail oder Telefon).
 */
export function lohntServerEntwurf(a: InternAnfrage, hatAnfrageId: boolean): boolean {
  if (hatAnfrageId || a.anfrageId) return true;
  if (a.vorlageIds.length === 0) return false;
  const k = a.kontakt;
  return Boolean(k.nachname.trim() || k.email.trim() || (k.telefon ?? '').trim());
}

/**
 * Der Server schreibt die Vorgangskennung in den Zustand zurueck. Das ist keine Aenderung
 * des Meisters und darf keinen weiteren Speicherlauf ausloesen, sonst dreht sich
 * Speichern und Zurueckschreiben endlos im Kreis.
 */
export function nurKennungGeaendert(vorher: InternAnfrage, nachher: InternAnfrage): boolean {
  if (vorher === nachher) return true;
  if (vorher.anfrageId === nachher.anfrageId) return false;
  return JSON.stringify({ ...vorher, anfrageId: '' }) === JSON.stringify({ ...nachher, anfrageId: '' });
}

// ---------------------------------------------------------------------------
// Groesse des Sendekoerpers und Anhaenge
// ---------------------------------------------------------------------------

/**
 * Vercel nimmt hoechstens 4,5 MB Koerper an und antwortet darueber ohne JSON. Wir bleiben
 * darunter und sagen dem Meister im Klartext, was zu tun ist.
 */
export const KOERPER_GRENZE_BYTE = 4_000_000;

/** Groesse einer JSON-Zeichenkette in Byte (UTF-8). */
export function koerperBytes(json: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(json).length;
  return json.length;
}

/** Meldung, wenn der Koerper zu gross ist; sonst null. */
export function zuGrossMeldung(bytes: number, grenze = KOERPER_GRENZE_BYTE): string | null {
  if (bytes <= grenze) return null;
  const mb = (bytes / 1_000_000).toFixed(1).replace('.', ',');
  const grenzeMb = String(Math.round(grenze / 1_000_000));
  return `Fotos und Skizzen sind zusammen zu groß (${mb} MB, erlaubt ${grenzeMb} MB). Bitte Fotos entfernen oder verkleinern.`;
}

/** Kennung eines Anhangs fuer den Abgleich; Name und Laenge der Datenspur genuegen. */
export function anhangKennung(anhang: { name: string; dataUrl: string }): string {
  return `${anhang.name}|${anhang.dataUrl.length}`;
}

/**
 * Nur die seit dem letzten erfolgreichen Speichern hinzugekommenen Anhaenge. Der Server
 * haengt Skizzen und Fotos an den Vorgang an, deshalb wuerde jeder Speicherlauf sie sonst
 * erneut hochladen und der Koerper waechst mit jedem Foto.
 */
export function neueAnhaenge(
  anfrage: Pick<InternAnfrage, 'skizzen' | 'fotos'>,
  gesendet: ReadonlySet<string> | null,
): Pick<InternAnfrage, 'skizzen' | 'fotos'> {
  if (!gesendet || gesendet.size === 0) return { skizzen: anfrage.skizzen, fotos: anfrage.fotos };
  return {
    skizzen: anfrage.skizzen.filter((s) => !gesendet.has(anhangKennung(s))),
    fotos: anfrage.fotos.filter((f) => !gesendet.has(anhangKennung(f))),
  };
}

// ---------------------------------------------------------------------------
// Vorbelegung der Groessenvariante
// ---------------------------------------------------------------------------

/**
 * Groesse einer Basisposition beim Anlegen. Geraten wird nie: Ohne belastbare Heizlast
 * bleibt die Groesse offen, die Zeile ist blockiert und der Meister waehlt sie nach
 * Heizlast (Fachregel 2). Vorbelegt wird nur der Vorschlag, der zur Baureihe passt.
 */
export function varianteVorbelegung(
  baustein: Pick<Baustein, 'groessenVarianten'>,
  heizlast: { belastbar: boolean } | null | undefined,
  vorschlag: { matrixNr: number; ueberBaureihe: boolean } | null | undefined,
): number | null {
  const varianten = baustein.groessenVarianten ?? [];
  if (!varianten.length) return null;
  if (!heizlast?.belastbar) return null;
  if (!vorschlag || vorschlag.ueberBaureihe) return null;
  if (!varianten.some((v) => v.matrixNr === vorschlag.matrixNr)) return null;
  return vorschlag.matrixNr;
}
