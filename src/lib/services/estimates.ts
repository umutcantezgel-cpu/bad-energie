import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  anfrage as anfrageTabelle, anfrageVorlage, anfrageZeile, kunde as kundeTabelle, terminfenster,
  terminfensterReservierung, versandauftrag, ereignis as ereignisTabelle, benutzer, anhang as anhangTabelle,
  dokument,
} from '@/db/schema';
import type {
  AnfrageStatus, EntwurfKarte, FoerderungEingabe, FreigabeErgebnis, Gewerk, Hinweis, InternAnfrage,
  InternAnfrageDTO, KalkulationsErgebnis, KundenAnfrage, OeffentlicheErgebnisDTO, Position, Quelle,
  SessionInfo, TerminfensterOption, VersandArt, VersandStatus,
} from '../types';
import { berechne, euro, oeffentlicheSpanne } from './calculation';
import { pdfDateiname } from './mail';
import { gebaeudeAusJourney } from './heizlast';
import { darfFreigeben, darfSehen } from './auth';
import { ladeEinstellungen, ladeKalkulationsdaten, ladeFoerderRegeln, ladeMatrix } from './kalkulationsdaten';
import { mappeJourney } from './vorlagen-mapping';
import { triage, type TriageErgebnis } from './triage';
import { pruefeVersandtexte } from './textregeln';
import { mitNeuerNummer } from './nummernkreis';
import { schreibeEreignis, setzeVersandStatus, setzeVorgangsStatus } from './statusmaschine';
import {
  fehlendeAngaben, ladeVorgang, loeseReservierungen, positionenAusZeilen, rechneVorgang, terminvorschlagText,
  type VorgangDaten,
} from './dokument-eingabe';
import { stelleAuftragBereit, versendeAuftrag } from './versand';
import { jahrVon, naechsteVersandzeit } from './zeit';

export { csvKopfzeile, csvZeile, datenblattJson } from './dokument-eingabe';

/**
 * Fehler mit fachlichem Grund, damit der Route Handler mit 403 antwortet statt mit 500.
 * Ein fremder Vorgang darf weder gelesen noch überschrieben werden (Rollenregel 3.3).
 */
export class ZugriffFehler extends Error {
  readonly grund = 'berechtigung' as const;
  constructor(nachricht: string) {
    super(nachricht);
    this.name = 'ZugriffFehler';
  }
}

/**
 * Anlage, Aktualisierung, Freigabe und Projektionen von Anfragen.
 * Preise entstehen ausschließlich aus der Richtpreis-Matrix oder aus zwei eingegebenen Werten.
 */

// ---------------------------------------------------------------------------
// Kunde
// ---------------------------------------------------------------------------

export type KontaktDaten = {
  anrede?: string; vorname?: string; nachname: string; email: string; telefon?: string; strasse?: string; plzOrt?: string;
};

/** Kunde nach E-Mail (klein geschrieben) wiederverwenden, sonst anlegen. */
export async function findeOderLegeKundeAn(kontakt: KontaktDaten): Promise<string> {
  const db = await getDb();
  const email = kontakt.email.trim().toLowerCase();
  // Ohne E-Mail (Dispatch, Portal-Lead) entsteht immer ein eigener Kunde; leere Adressen fallen nie zusammen.
  const vorhanden = email ? await db.select().from(kundeTabelle).where(eq(sql`lower(${kundeTabelle.email})`, email)).limit(1) : [];
  if (vorhanden[0]) {
    await db.update(kundeTabelle).set({
      anrede: kontakt.anrede?.trim() || vorhanden[0].anrede,
      vorname: kontakt.vorname?.trim() || vorhanden[0].vorname,
      nachname: kontakt.nachname.trim() || vorhanden[0].nachname,
      telefon: kontakt.telefon?.trim() || vorhanden[0].telefon,
      strasse: kontakt.strasse?.trim() || vorhanden[0].strasse,
      plzOrt: kontakt.plzOrt?.trim() || vorhanden[0].plzOrt,
    }).where(eq(kundeTabelle.id, vorhanden[0].id));
    return vorhanden[0].id;
  }
  const id = randomUUID();
  await db.insert(kundeTabelle).values({
    id,
    anrede: kontakt.anrede?.trim() ?? '',
    vorname: kontakt.vorname?.trim() ?? '',
    nachname: kontakt.nachname.trim(),
    email,
    telefon: kontakt.telefon?.trim() ?? '',
    strasse: kontakt.strasse?.trim() ?? '',
    plzOrt: kontakt.plzOrt?.trim() ?? '',
  });
  return id;
}

// ---------------------------------------------------------------------------
// Positionen schreiben
// ---------------------------------------------------------------------------

async function ersetzePositionen(anfrageId: string, positionen: Position[]): Promise<void> {
  const db = await getDb();
  await db.delete(anfrageZeile).where(eq(anfrageZeile.anfrageId, anfrageId));
  if (!positionen.length) return;
  await db.insert(anfrageZeile).values(positionen.map((p, i) => ({
    id: `${anfrageId}:${i + 1}`,
    anfrageId,
    position: i + 1,
    titel: p.titel,
    gewerk: p.gewerk,
    text: p.text,
    menge: String(p.menge ?? 1),
    einheit: p.einheit,
    von: p.von,
    bis: p.bis,
    matrixNr: p.matrixNr,
    vorlageZeileId: p.vorlageZeileId,
    varianteMatrixNr: p.varianteMatrixNr,
    zuschlag: p.zuschlag,
    aktiv: p.aktiv,
    quelle: p.quelle,
    notizIntern: p.notizIntern ?? '',
    intern: p.intern ?? {},
  })));
}

async function ersetzeVorlagen(anfrageId: string, vorlageIds: string[]): Promise<void> {
  const db = await getDb();
  await db.delete(anfrageVorlage).where(eq(anfrageVorlage.anfrageId, anfrageId));
  if (!vorlageIds.length) return;
  await db.insert(anfrageVorlage).values(vorlageIds.map((vorlageId, i) => ({ anfrageId, vorlageId, position: i + 1 })));
}

/** Setzt die Reservierungen auf genau diese Fenster; alle anderen werden frei (Regel 6). */
export async function setzeReservierungen(anfrageId: string, fensterIds: string[]): Promise<void> {
  const db = await getDb();
  await loeseReservierungen(anfrageId, fensterIds);
  for (const terminfensterId of fensterIds.slice(0, 2)) {
    await db.insert(terminfensterReservierung)
      .values({ terminfensterId, anfrageId })
      .onConflictDoNothing();
  }
}

function foerderungSpeicherwert(eingabe: FoerderungEingabe | null, ergebnis: KalkulationsErgebnis) {
  if (!eingabe?.aktiv) return null;
  const f = ergebnis.foerderung;
  return {
    kosten: f?.kosten ?? 0,
    satz: f?.satz ?? 0,
    zuschuss: f?.zuschuss ?? 0,
    eigenanteilVon: f?.eigenanteilVon ?? 0,
    eigenanteilBis: f?.eigenanteilBis ?? 0,
    boni: {
      effizienz: eingabe.natuerlichesKaeltemittel,
      klimageschwindigkeit: eingabe.selbstBewohnt && eingabe.altOelOderGas,
      einkommen: eingabe.einkommenUnterGrenze,
    },
    wohneinheiten: eingabe.wohneinheiten,
    satzManuell: eingabe.satzManuell ?? null,
  };
}

// ---------------------------------------------------------------------------
// Kunden-Modus
// ---------------------------------------------------------------------------

export type KundenAnlage = { anfrageId: string; ksNummer: string; ergebnis: OeffentlicheErgebnisDTO };

/** Legt eine Anfrage aus dem öffentlichen Trichter an (Status `eingang`). */
export async function legeAusKundenAnfrage(eingabe: KundenAnfrage, jetzt: Date = new Date()): Promise<KundenAnlage> {
  const db = await getDb();
  const [daten, einst] = await Promise.all([ladeKalkulationsdaten(), ladeEinstellungen()]);
  const mapping = mappeJourney(eingabe.antworten ?? null, daten, eingabe.objekt.wohneinheiten);

  const wohnflaeche = eingabe.antworten && eingabe.antworten.journey !== 'bad' ? eingabe.antworten.wohnflaeche : null;
  const vorschlag = await triage({
    eigentum: eingabe.objekt.eigentum,
    wohnflaecheM2: wohnflaeche,
    plz: eingabe.objekt.plz || eingabe.kontakt.plzOrt,
    objektAdresse: eingabe.objekt.adresse || eingabe.kontakt.strasse,
    email: eingabe.kontakt.email,
    telefon: eingabe.kontakt.telefon,
    nachname: eingabe.kontakt.nachname,
    vorhabenKurz: mapping.vorhabenKurz,
    preisfrage: !eingabe.antworten,
  }, { radiusKm: einst.radiusKm, minQm: einst.minQm });

  const kundeId = await findeOderLegeKundeAn(eingabe.kontakt);
  const ergebnis = berechne({
    positionen: mapping.positionen,
    matrix: daten.matrix,
    foerderung: mapping.foerderung,
    foerderRegeln: daten.foerderRegeln,
  });

  const jahr = jahrVon(jetzt);
  const anlage = await mitNeuerNummer(jahr, async (nummer) => {
    const id = randomUUID();
    await db.insert(anfrageTabelle).values({
      id,
      ksNummer: nummer.ksNummer,
      jahr: nummer.jahr,
      laufnr: nummer.laufnr,
      status: 'eingang',
      quelle: eingabe.quelle as Quelle,
      kundeId,
      objektAdresse: eingabe.objekt.adresse || eingabe.kontakt.strasse || '',
      objektPlz: eingabe.objekt.plz || '',
      entfernungKm: vorschlag.entfernungKm,
      dringlichkeit: eingabe.dringlichkeit,
      vorhabenKurz: mapping.vorhabenKurz,
      gewerkHaupt: mapping.gewerkHaupt,
      annahmen: mapping.annahmen,
      konfiguratorAntworten: {
        antworten: eingabe.antworten ?? null,
        freitext: eingabe.freitext,
        wunschtermine: eingabe.wunschtermine,
      },
      gebaeude: mapping.gebaeude ?? gebaeudeAusJourney((eingabe.antworten ?? null) as Record<string, unknown> | null, eingabe.objekt.wohneinheiten),
      triageVorschlag: vorschlag.text,
      eigentum: eingabe.objekt.eigentum,
      wohneinheiten: eingabe.objekt.wohneinheiten,
      foerderung: foerderungSpeicherwert(mapping.foerderung, ergebnis),
      summeNettoVon: ergebnis.nettoVon || null,
      summeNettoBis: ergebnis.nettoBis || null,
      erstelltAm: jetzt,
      geaendertAm: jetzt,
    });
    await ersetzeVorlagen(id, mapping.vorlageIds);
    await ersetzePositionen(id, mapping.positionen);
    return { anfrageId: id, ksNummer: nummer.ksNummer };
  });

  await schreibeEreignis({ anfrageId: anlage.anfrageId, typ: 'anfrage:eingang', payload: { quelle: eingabe.quelle, triage: vorschlag.vorschlag } });
  return { ...anlage, ergebnis: oeffentlicheSpanne(ergebnis, { betriebskosten: mapping.betriebskosten, foerderRegeln: daten.foerderRegeln }) };
}

// ---------------------------------------------------------------------------
// Meister-Modus
// ---------------------------------------------------------------------------

export type InternAnlage = {
  anfrageId: string;
  ksNummer: string;
  status: AnfrageStatus;
  hinweise: Hinweis[];
  rueckmeldung: string;
  ergebnis: KalkulationsErgebnis;
};

function statusAus(ergebnis: KalkulationsErgebnis): AnfrageStatus {
  return ergebnis.blockiert.length ? 'blockiert' : 'geplant';
}

/** Legt eine Anfrage aus dem Meister-Modus an oder aktualisiert sie (Upsert nach anfrageId). */
export async function speichereInternAnfrage(eingabe: InternAnfrage, session: SessionInfo, jetzt: Date = new Date()): Promise<InternAnlage> {
  const db = await getDb();
  const [matrix, regeln] = await Promise.all([ladeMatrix(), ladeFoerderRegeln()]);

  // Der bestehende Vorgang wird vor der Rechnung geladen: an ihm hängt, wer schreiben darf
  // und ob die Preise unangetastet bleiben müssen.
  let bestand: typeof anfrageTabelle.$inferSelect | null = null;
  if (eingabe.anfrageId) {
    const vorhanden = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, eingabe.anfrageId)).limit(1);
    bestand = vorhanden[0] ?? null;
    if (!bestand) throw new Error('Anfrage nicht gefunden.');
    // Dieselbe Grenze wie beim Lesen: der Bauleiter arbeitet an eigenen und noch nicht
    // zugeteilten Vorgängen, Chef und Büro an allen. Verglichen wird über die Bearbeiter-Id.
    if (!darfSehen(session, { bearbeiterId: bestand.bearbeiterId })) {
      throw new ZugriffFehler('Dieser Vorgang wird von einer anderen Person bearbeitet.');
    }
  }

  /**
   * Rollenregel 3.3: das Büro bereitet vor und gibt nicht frei. Es pflegt Kontakt, Objekt,
   * Gebäudedaten, persönlichen Satz, Terminvorschlag und Notizen; Positionen, Kalkulationsfaktoren
   * und Förderangaben eines bestehenden Vorgangs bleiben stehen, damit über diesen Weg keine
   * Preise entstehen, die kein Meister eingegeben hat (Fachregel 2).
   */
  const preiseGesperrt = bestand !== null && session.rolle === 'buero';

  const positionen: Position[] = eingabe.positionen.map((p) => ({ ...p, intern: p.intern ?? {} }));
  // Das Objekt ist die eine Quelle für Wohneinheiten (Förderstaffel nach Regel 7).
  const foerderung: FoerderungEingabe | null = eingabe.foerderung.aktiv
    ? { ...eingabe.foerderung, wohneinheiten: eingabe.objekt.wohneinheiten, satzManuell: eingabe.foerderung.satzManuell ?? null }
    : null;
  const gespeicherterVorgang = preiseGesperrt && bestand ? await ladeVorgang(bestand.id) : null;
  const ergebnis = gespeicherterVorgang
    ? rechneVorgang(gespeicherterVorgang, matrix, regeln)
    : berechne({ positionen, matrix, faktoren: eingabe.kalkulation, foerderung, foerderRegeln: regeln });
  const neuerStatus = statusAus(ergebnis);
  const kundeId = await findeOderLegeKundeAn(eingabe.kontakt);

  const felder = {
    kundeId,
    objektAdresse: eingabe.objekt.adresse || eingabe.kontakt.strasse || '',
    objektPlz: eingabe.objekt.plz || '',
    dringlichkeit: eingabe.dringlichkeit,
    vorhabenKurz: eingabe.vorhabenKurz,
    gewerkHaupt: (eingabe.gewerkHaupt as Gewerk | undefined) ?? null,
    persoenlicherSatz: eingabe.persoenlicherSatz,
    annahmen: eingabe.annahmen,
    vorbehalte: eingabe.vorbehalte,
    ausfuehrungSatz: eingabe.ausfuehrungSatz,
    etage: eingabe.notizen.etage,
    aufzug: eingabe.notizen.aufzug,
    montagehindernisse: eingabe.notizen.montagehindernisse,
    leitungswege: eingabe.notizen.leitungswege,
    interneNotizen: eingabe.notizen.intern,
    // Bei gesperrten Preisen werden die gespeicherten Werte unverändert zurückgeschrieben.
    kalkulation: preiseGesperrt && bestand ? (bestand.kalkulation ?? {}) : eingabe.kalkulation,
    foerderung: preiseGesperrt && bestand ? bestand.foerderung : foerderungSpeicherwert(foerderung, ergebnis),
    gebaeude: { ...eingabe.gebaeude, wohneinheiten: eingabe.objekt.wohneinheiten },
    eigentum: eingabe.objekt.eigentum,
    summeNettoVon: ergebnis.nettoVon || null,
    summeNettoBis: ergebnis.nettoBis || null,
    wohneinheiten: eingabe.objekt.wohneinheiten,
    geaendertAm: jetzt,
  };

  let anfrageId = eingabe.anfrageId ?? '';
  let ksNummer = '';
  if (bestand) {
    const a = bestand;
    anfrageId = a.id;
    ksNummer = a.ksNummer;
    const darfStatusSetzen = (['eingang', 'geplant', 'blockiert'] as AnfrageStatus[]).includes(a.status as AnfrageStatus);
    await db.update(anfrageTabelle).set({
      ...felder,
      ...(darfStatusSetzen ? { status: neuerStatus } : {}),
      bearbeiterId: a.bearbeiterId ?? session.benutzerId,
    }).where(eq(anfrageTabelle.id, anfrageId));
  } else {
    const jahr = jahrVon(jetzt);
    const anlage = await mitNeuerNummer(jahr, async (nummer) => {
      const id = randomUUID();
      await db.insert(anfrageTabelle).values({
        id,
        ksNummer: nummer.ksNummer,
        jahr: nummer.jahr,
        laufnr: nummer.laufnr,
        status: neuerStatus,
        quelle: eingabe.quelle as Quelle,
        bearbeiterId: session.benutzerId,
        erstelltAm: jetzt,
        ...felder,
      });
      return { id, ksNummer: nummer.ksNummer };
    });
    anfrageId = anlage.id;
    ksNummer = anlage.ksNummer;
  }

  await ersetzeVorlagen(anfrageId, eingabe.vorlageIds);
  if (!preiseGesperrt) await ersetzePositionen(anfrageId, positionen);
  await setzeReservierungen(anfrageId, eingabe.terminfensterIds);
  await schreibeEreignis({
    anfrageId, typ: 'anfrage:gespeichert', benutzerId: session.benutzerId,
    payload: { status: neuerStatus, positionen: positionen.length },
  });

  const daten = await ladeVorgang(anfrageId);
  const rueckmeldung = daten ? baueRueckmeldung(daten, ergebnis) : ksNummer;
  return { anfrageId, ksNummer, status: neuerStatus, hinweise: ergebnis.blockiert, rueckmeldung, ergebnis };
}

/**
 * Trägt den Triage-Vorschlag für einen bestehenden Vorgang nach (Dispatch, Portal-Leads).
 * Eigentum steht nicht am Vorgang, deshalb reicht der Aufrufer es durch, wenn er es kennt.
 */
export async function triageFuerAnfrage(
  anfrageId: string,
  zusatz: { eigentum?: 'eigentum' | 'miete' | 'unklar'; preisfrage?: boolean } = {},
): Promise<TriageErgebnis | null> {
  const daten = await ladeVorgang(anfrageId);
  if (!daten) return null;
  const einst = await ladeEinstellungen();
  const a = daten.anfrage;
  const k = daten.kunde;
  const ergebnis = await triage({
    eigentum: zusatz.eigentum ?? (a.eigentum === 'eigentum' || a.eigentum === 'miete' ? a.eigentum : 'unklar'),
    wohnflaecheM2: a.gebaeude?.wohnflaeche ?? null,
    plz: a.objektPlz || k?.plzOrt || '',
    objektAdresse: a.objektAdresse || k?.strasse || '',
    email: k?.email ?? '',
    telefon: k?.telefon ?? '',
    nachname: k?.nachname ?? '',
    vorhabenKurz: a.vorhabenKurz,
    preisfrage: zusatz.preisfrage ?? false,
  }, { radiusKm: einst.radiusKm, minQm: einst.minQm });

  const db = await getDb();
  await db.update(anfrageTabelle)
    .set({ triageVorschlag: ergebnis.text, entfernungKm: ergebnis.entfernungKm })
    .where(eq(anfrageTabelle.id, anfrageId));
  return ergebnis;
}

const STATUS_LABEL: Record<AnfrageStatus, string> = {
  eingang: 'Eingang', geplant: 'Geplant', blockiert: 'Blockiert', versendet: 'Versendet',
  erinnert: 'Erinnert', antwort: 'Antwort', termin: 'Termin', verworfen: 'Verworfen',
};

/** Rückmeldung im Format des Altsystems: zwei bis vier Zeilen. */
export function baueRueckmeldung(daten: VorgangDaten, ergebnis: KalkulationsErgebnis): string {
  const a = daten.anfrage;
  const name = daten.kunde?.nachname ?? '';
  const spanne = ergebnis.bruttoBis > 0 ? `${euro(ergebnis.bruttoVon)} bis ${euro(ergebnis.bruttoBis)} € brutto` : 'noch ohne Spanne';
  const zeilen = [
    `${a.ksNummer} ${name}, ${a.vorhabenKurz || 'Vorhaben offen'}, ${spanne}, liegt in ${STATUS_LABEL[a.status as AnfrageStatus]}.`,
  ];
  const fehlt = fehlendeAngaben(daten, ergebnis);
  if (fehlt.length) zeilen.push(`Fehlt: ${fehlt.slice(0, 4).join('; ')}.`);
  const termin = terminvorschlagText(daten.fenster);
  if (termin) zeilen.push(`Terminvorschlag: ${termin}.`);
  return zeilen.join('\n');
}

// ---------------------------------------------------------------------------
// Freigabe und Versand
// ---------------------------------------------------------------------------

export type FreigabeOptionen = { art?: VersandArt; sofort?: boolean; jetzt?: Date };

/**
 * Gibt den offenen Versandauftrag frei. `sofort` sendet synchron, sonst wird
 * `faellig_am` auf die Versandzeit gesetzt (oder auf jetzt, wenn sie schon vorbei ist).
 */
export async function freigeben(anfrageId: string, session: SessionInfo, optionen: FreigabeOptionen = {}): Promise<FreigabeErgebnis> {
  const db = await getDb();
  const jetzt = optionen.jetzt ?? new Date();
  const art: VersandArt = optionen.art ?? 'erstkontakt';
  const daten = await ladeVorgang(anfrageId);
  if (!daten) return { ok: false, fehler: 'Anfrage nicht gefunden.', grund: 'nicht_gefunden' };
  if (!darfFreigeben(session, { bearbeiterId: daten.anfrage.bearbeiterId })) {
    return { ok: false, fehler: 'Für diese Anfrage fehlt die Freigabeberechtigung.', grund: 'berechtigung' };
  }
  const [matrix, regeln, einst] = await Promise.all([ladeMatrix(), ladeFoerderRegeln(), ladeEinstellungen()]);
  const ergebnis = rechneVorgang(daten, matrix, regeln);
  const pruefung = pruefeVersandtexte({
    persoenlicherSatz: daten.anfrage.persoenlicherSatz,
    terminvorschlag: terminvorschlagText(daten.fenster),
    email: daten.kunde?.email ?? '',
    anrede: daten.kunde?.anrede,
    vorname: daten.kunde?.vorname,
    nachname: daten.kunde?.nachname,
    ausfuehrungSatz: daten.anfrage.ausfuehrungSatz,
    annahmen: daten.anfrage.annahmen ?? [],
    vorbehalte: daten.anfrage.vorbehalte ?? [],
  });
  const blockiert = art === 'terminmail' ? [] : ergebnis.blockiert;
  if (pruefung.sperren.length || blockiert.length) {
    return {
      ok: false,
      fehler: [...pruefung.sperren, ...blockiert.map((h) => h.text)].join(' '),
      hinweise: blockiert,
      grund: 'blockiert',
    };
  }

  // Eine Web-Anfrage (eingang) oder ein zuvor blockierter Vorgang wird mit bestandener Prüfung geplant (Fachregel 1).
  const statusVorher = daten.anfrage.status as AnfrageStatus;
  if (statusVorher === 'eingang' || statusVorher === 'blockiert') {
    await setzeVorgangsStatus(anfrageId, statusVorher, 'geplant', {}, { benutzerId: session.benutzerId, typ: 'anfrage:geplant' });
  }

  const auftrag = await stelleAuftragBereit(anfrageId, art, { empfaenger: daten.kunde?.email ?? '' });
  const faelligAm = optionen.sofort ? jetzt : naechsteVersandzeit(jetzt, einst.versandzeit);
  const freigegeben = await setzeVersandStatus(auftrag.id, ['entwurf', 'fehlgeschlagen'], 'freigegeben', {
    faelligAm, freigegebenVon: session.benutzerId, freigegebenAm: jetzt, naechsterVersuchAm: null, fehler: null,
  });
  if (!freigegeben && auftrag.status !== 'freigegeben') {
    return { ok: false, fehler: `Der Auftrag steht bereits auf ${auftrag.status}.`, grund: 'status' };
  }
  await db.update(versandauftrag).set({ faelligAm }).where(eq(versandauftrag.id, auftrag.id));
  await schreibeEreignis({
    anfrageId, typ: 'versand:freigegeben', benutzerId: session.benutzerId,
    payload: { art, sofort: Boolean(optionen.sofort), faelligAm: faelligAm.toISOString() },
  });

  if (!optionen.sofort) {
    return { ok: true, anfrageId, rueckmeldung: `${daten.anfrage.ksNummer} ist freigegeben. Versand ab ${einst.versandzeit}.` };
  }
  const bericht = await versendeAuftrag(auftrag.id, { jetzt });
  const neu = await ladeVorgang(anfrageId);
  return {
    ok: true,
    anfrageId,
    versand: { kunde: bericht.status, dossier: bericht.dossier?.status ?? 'storniert' },
    rueckmeldung: neu ? baueRueckmeldung(neu, rechneVorgang(neu, matrix, regeln)) : `${daten.anfrage.ksNummer} wurde versendet.`,
  };
}

/** Storniert die offenen Versandaufträge und gibt den Unique-Slot frei. */
export async function stornieren(anfrageId: string, session: SessionInfo, grund = 'Vom Menschen verworfen.'): Promise<FreigabeErgebnis> {
  const db = await getDb();
  const daten = await ladeVorgang(anfrageId);
  if (!daten) return { ok: false, fehler: 'Anfrage nicht gefunden.' };
  if (!darfFreigeben(session, { bearbeiterId: daten.anfrage.bearbeiterId }) && session.rolle !== 'buero') {
    return { ok: false, fehler: 'Keine Berechtigung.' };
  }
  const offene = await db.select().from(versandauftrag).where(and(
    eq(versandauftrag.anfrageId, anfrageId),
    inArray(versandauftrag.status, ['entwurf', 'freigegeben', 'fehlgeschlagen']),
  ));
  for (const auftrag of offene) {
    await setzeVersandStatus(auftrag.id, auftrag.status as VersandStatus, 'storniert');
  }
  await loeseReservierungen(anfrageId);
  const jetzt = new Date();
  const status = daten.anfrage.status as AnfrageStatus;
  if (status !== 'verworfen') {
    await setzeVorgangsStatus(anfrageId, status, 'verworfen', { verworfenAm: jetzt, grundVerworfen: grund }, { benutzerId: session.benutzerId });
  }
  return { ok: true, anfrageId, rueckmeldung: `${daten.anfrage.ksNummer} ist verworfen. ${offene.length} Auftrag oder Aufträge storniert.` };
}

// ---------------------------------------------------------------------------
// Projektionen
// ---------------------------------------------------------------------------

/** Vollständige Anfrage für den Meister-Modus. */
export async function ladeInternAnfrage(anfrageId: string): Promise<InternAnfrageDTO | null> {
  const db = await getDb();
  const daten = await ladeVorgang(anfrageId);
  if (!daten) return null;
  const [auftraege, ereignisse, dokumente] = await Promise.all([
    db.select().from(versandauftrag).where(eq(versandauftrag.anfrageId, anfrageId)).orderBy(desc(versandauftrag.erstelltAm)),
    db.select({ typ: ereignisTabelle.typ, erstelltAm: ereignisTabelle.erstelltAm, name: benutzer.name })
      .from(ereignisTabelle)
      .leftJoin(benutzer, eq(benutzer.id, ereignisTabelle.benutzerId))
      .where(eq(ereignisTabelle.anfrageId, anfrageId))
      .orderBy(desc(ereignisTabelle.erstelltAm))
      .limit(50),
    db.select().from(dokument).where(eq(dokument.anfrageId, anfrageId)).orderBy(desc(dokument.erstelltAm)),
  ]);
  const a = daten.anfrage;
  const k = daten.kunde;
  const basis = `/api/intern/anfragen/${anfrageId}/anhaenge`;
  return {
    anfrageId,
    ksNummer: a.ksNummer,
    status: a.status as AnfrageStatus,
    bemerkung: a.bemerkung,
    quelle: a.quelle as Quelle,
    vorlageIds: daten.vorlageIds,
    kontakt: {
      anrede: k?.anrede ?? '', vorname: k?.vorname ?? '', nachname: k?.nachname ?? '', email: k?.email ?? '',
      telefon: k?.telefon ?? '', strasse: k?.strasse ?? '', plzOrt: k?.plzOrt ?? '',
    },
    objekt: {
      adresse: a.objektAdresse, plz: a.objektPlz,
      eigentum: (a.eigentum === 'eigentum' || a.eigentum === 'miete' ? a.eigentum : 'unklar'), wohneinheiten: a.wohneinheiten, entfernungKm: a.entfernungKm,
    },
    // Alte Web-Leads ohne Gebäudedaten werden aus den Konfigurator-Antworten vorbelegt.
    gebaeude: a.gebaeude ?? gebaeudeAusJourney(((a.konfiguratorAntworten as { antworten?: unknown } | null)?.antworten ?? null) as Record<string, unknown> | null, a.wohneinheiten),
    dringlichkeit: a.dringlichkeit,
    vorhabenKurz: a.vorhabenKurz,
    gewerkHaupt: (a.gewerkHaupt as Gewerk | null) ?? null,
    positionen: positionenAusZeilen(daten.zeilen),
    kalkulation: a.kalkulation ?? {},
    foerderung: {
      aktiv: Boolean(a.foerderung),
      wohneinheiten: a.foerderung?.wohneinheiten ?? a.wohneinheiten,
      selbstBewohnt: a.foerderung?.boni?.klimageschwindigkeit ?? true,
      altOelOderGas: a.foerderung?.boni?.klimageschwindigkeit ?? true,
      einkommenUnterGrenze: a.foerderung?.boni?.einkommen ?? false,
      natuerlichesKaeltemittel: a.foerderung?.boni?.effizienz ?? true,
      satzManuell: a.foerderung?.satzManuell ?? null,
    },
    persoenlicherSatz: a.persoenlicherSatz,
    annahmen: a.annahmen ?? [],
    vorbehalte: a.vorbehalte ?? [],
    ausfuehrungSatz: a.ausfuehrungSatz,
    terminfensterIds: daten.fenster.map((f) => f.id),
    notizen: {
      etage: a.etage, aufzug: a.aufzug, montagehindernisse: a.montagehindernisse,
      leitungswege: a.leitungswege, intern: a.interneNotizen,
    },
    konfiguratorAntworten: a.konfiguratorAntworten ?? {},
    triageVorschlag: a.triageVorschlag,
    dokumente: dokumente.map((d) => ({
      id: d.id, art: d.art, version: d.version, groesse: d.groesse, erstelltAm: d.erstelltAm.toISOString(),
      dateiname: dokumentDateiname(d.art, a.ksNummer, d.version),
      url: `/api/intern/anfragen/${anfrageId}/dokumente/${d.id}`,
    })),
    anhaenge: daten.anhaenge.map((h) => ({
      id: h.id, art: h.art, dateiname: h.dateiname, mime: h.mime, groesse: h.groesse,
      beschreibung: h.beschreibung, erstelltAm: h.erstelltAm.toISOString(),
      url: `${basis}/${h.id}`, thumbUrl: h.thumbBlobPfad ? `${basis}/${h.id}?vorschau=1` : null,
    })),
    versandauftraege: auftraege.map((v) => ({
      id: v.id, art: v.art as VersandArt, status: v.status as VersandStatus,
      faelligAm: v.faelligAm?.toISOString() ?? null, versendetAm: v.versendetAm?.toISOString() ?? null, fehler: v.fehler,
    })),
    ereignisse: ereignisse.map((e) => ({ typ: e.typ, erstelltAm: e.erstelltAm.toISOString(), benutzer: e.name ?? null })),
    bearbeiter: daten.bearbeiter?.name ?? '',
    erstelltAm: a.erstelltAm.toISOString(),
  };
}

/** Entwürfe und freigegebene, noch nicht versendete Aufträge. */
export async function ladeEntwuerfe(session: SessionInfo): Promise<EntwurfKarte[]> {
  const db = await getDb();
  const [matrix, regeln] = await Promise.all([ladeMatrix(), ladeFoerderRegeln()]);
  const auftraege = await db.select().from(versandauftrag)
    .where(and(
      inArray(versandauftrag.status, ['entwurf', 'freigegeben', 'fehlgeschlagen']),
      // Dossier und Eingangsbestätigung entstehen automatisch und gehören nie in die Freigabeliste.
      inArray(versandauftrag.art, ['erstkontakt', 'erinnerung', 'terminmail']),
    ))
    .orderBy(desc(versandauftrag.erstelltAm));
  const karten: EntwurfKarte[] = [];
  const gesehen = new Set<string>();
  for (const auftrag of auftraege) {
    if (gesehen.has(auftrag.anfrageId)) continue;
    gesehen.add(auftrag.anfrageId);
    const daten = await ladeVorgang(auftrag.anfrageId);
    if (!daten) continue;
    if (session.rolle === 'bauleiter' && daten.anfrage.bearbeiterId !== session.benutzerId) continue;
    const ergebnis = rechneVorgang(daten, matrix, regeln);
    const pruefung = pruefeVersandtexte({
      persoenlicherSatz: daten.anfrage.persoenlicherSatz,
      terminvorschlag: terminvorschlagText(daten.fenster),
      email: daten.kunde?.email ?? '',
      anrede: daten.kunde?.anrede,
      vorname: daten.kunde?.vorname,
      nachname: daten.kunde?.nachname,
      ausfuehrungSatz: daten.anfrage.ausfuehrungSatz,
      annahmen: daten.anfrage.annahmen ?? [],
      vorbehalte: daten.anfrage.vorbehalte ?? [],
    });
    karten.push({
      anfrageId: daten.anfrage.id,
      ksNummer: daten.anfrage.ksNummer,
      kunde: [daten.kunde?.vorname, daten.kunde?.nachname].filter(Boolean).join(' '),
      vorhaben: daten.anfrage.vorhabenKurz,
      bruttoVon: ergebnis.bruttoVon || null,
      bruttoBis: ergebnis.bruttoBis || null,
      status: daten.anfrage.status as AnfrageStatus,
      versandStatus: auftrag.status as VersandStatus,
      versandArt: auftrag.art as VersandArt,
      faelligAm: auftrag.faelligAm?.toISOString() ?? null,
      hinweise: ergebnis.blockiert,
      warnungen: [...pruefung.sperren, ...pruefung.warnungen],
      erstelltAm: daten.anfrage.erstelltAm.toISOString(),
      bearbeiter: daten.bearbeiter?.name ?? '',
      darfFreigeben: darfFreigeben(session, { bearbeiterId: daten.anfrage.bearbeiterId }),
    });
  }
  return karten;
}

/** Terminfenster mit Belegung (frei, wenn keine andere offene Anfrage sie reserviert). */
export async function ladeTerminfenster(): Promise<TerminfensterOption[]> {
  const db = await getDb();
  const [fenster, belegt] = await Promise.all([
    db.select().from(terminfenster).where(eq(terminfenster.aktiv, true)).orderBy(terminfenster.beginn, terminfenster.beschriftung),
    db.select({ id: terminfensterReservierung.terminfensterId }).from(terminfensterReservierung),
  ]);
  const belegtIds = new Set(belegt.map((b) => b.id));
  return fenster.map((f) => ({ id: f.id, beschriftung: f.beschriftung, frei: !belegtIds.has(f.id) }));
}

/** Anhang-Metadaten für die Zugriffsprüfung im Download-Handler. */
export async function ladeAnhang(anhangId: string): Promise<typeof anhangTabelle.$inferSelect | null> {
  const db = await getDb();
  const zeilen = await db.select().from(anhangTabelle).where(eq(anhangTabelle.id, anhangId)).limit(1);
  return zeilen[0] ?? null;
}

/** Anzeigename eines erzeugten Dokuments (Kunden-PDF trägt den Pflichtnamen nach Regel 8). */
export function dokumentDateiname(art: string, ksNummer: string, version: number): string {
  const v = version > 1 ? ` v${version}` : '';
  switch (art) {
    case 'kostenschaetzung_pdf': return pdfDateiname(ksNummer);
    case 'kostenschaetzung_html': return `Kostenschaetzung ${ksNummer}${v}.html`;
    case 'mail_html': return `Erstkontakt ${ksNummer}${v}.html`;
    case 'mail_txt': return `Erstkontakt ${ksNummer}${v}.txt`;
    case 'erinnerung_html': return `Erinnerung ${ksNummer}${v}.html`;
    case 'erinnerung_txt': return `Erinnerung ${ksNummer}${v}.txt`;
    case 'terminmail_html': return `Terminmail ${ksNummer}${v}.html`;
    case 'terminmail_txt': return `Terminmail ${ksNummer}${v}.txt`;
    case 'annahmen_md': return `Freigabeblatt ${ksNummer}${v}.md`;
    case 'abschlussbericht_md': return `Abschlussbericht ${ksNummer}${v}.md`;
    case 'dossier_html': return `Dossier ${ksNummer}${v}.html`;
    default: return `${art} ${ksNummer}${v}`;
  }
}
