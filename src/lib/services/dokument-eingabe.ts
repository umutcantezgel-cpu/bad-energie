import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  anfrage as anfrageTabelle, anfrageVorlage, anfrageZeile, anhang as anhangTabelle, benutzer, kunde as kundeTabelle,
  terminfenster, terminfensterReservierung,
} from '@/db/schema';
import type {
  AnfrageStatus, Dringlichkeit, Einheit, FoerderungEingabe, Gewerk, KalkulationsErgebnis, Position, Quelle, Richtpreis,
  FoerderRegeln,
} from '../types';
import type { Betriebskosten, DokumentEingabe, DossierEingabe, DossierPosition } from '../dokumente/datenblatt';
import { berechne, foerderBausteine, offenePlatzhalter } from './calculation';
import { betriebskosten as berechneBetriebskosten, heizlastSchaetzen, leeresGebaeude } from './heizlast';
import { FOERDER_STANDARD, ladeEinstellungen, ladeFoerderRegeln, ladeMatrix, type Einstellungen } from './kalkulationsdaten';
import { pruefeVersandtexte } from './textregeln';
import { datumDeutsch, plusTage } from './zeit';

/**
 * Baut die kundensichtbare Dokumenteingabe (Allow-List) und die interne Dossiereingabe.
 * Interne Faktoren, Positionsnotizen, Skizzen und Triage bleiben in der Dossierfassung.
 */

export const TOKEN_GUELTIG_TAGE = 30;

type AnfrageZeile = typeof anfrageZeile.$inferSelect;

export type VorgangDaten = {
  anfrage: typeof anfrageTabelle.$inferSelect;
  kunde: typeof kundeTabelle.$inferSelect;
  zeilen: AnfrageZeile[];
  bearbeiter: { name: string; funktion: string; signaturMail: string } | null;
  vorlageIds: string[];
  anhaenge: (typeof anhangTabelle.$inferSelect)[];
  fenster: { id: string; beschriftung: string }[];
};

/** Lädt Anfrage, Kunde, Positionen, Bearbeiter, Vorlagen, Anhänge und reservierte Terminfenster. */
export async function ladeVorgang(anfrageId: string): Promise<VorgangDaten | null> {
  const db = await getDb();
  const kopf = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
  const a = kopf[0];
  if (!a) return null;
  const [kundeZeilen, zeilen, vorlagen, anhaenge, reservierungen] = await Promise.all([
    db.select().from(kundeTabelle).where(eq(kundeTabelle.id, a.kundeId)).limit(1),
    db.select().from(anfrageZeile).where(eq(anfrageZeile.anfrageId, anfrageId)).orderBy(asc(anfrageZeile.position)),
    db.select().from(anfrageVorlage).where(eq(anfrageVorlage.anfrageId, anfrageId)).orderBy(asc(anfrageVorlage.position)),
    db.select().from(anhangTabelle).where(eq(anhangTabelle.anfrageId, anfrageId)).orderBy(asc(anhangTabelle.erstelltAm)),
    db.select({ id: terminfenster.id, beschriftung: terminfenster.beschriftung })
      .from(terminfensterReservierung)
      .innerJoin(terminfenster, eq(terminfenster.id, terminfensterReservierung.terminfensterId))
      .where(eq(terminfensterReservierung.anfrageId, anfrageId))
      .orderBy(asc(terminfenster.beginn), asc(terminfenster.beschriftung)),
  ]);
  let bearbeiter: VorgangDaten['bearbeiter'] = null;
  if (a.bearbeiterId) {
    const b = await db.select().from(benutzer).where(eq(benutzer.id, a.bearbeiterId)).limit(1);
    if (b[0]) bearbeiter = { name: b[0].name, funktion: b[0].funktion, signaturMail: b[0].signaturMail || b[0].email };
  }
  return {
    anfrage: a,
    kunde: kundeZeilen[0],
    zeilen,
    bearbeiter,
    vorlageIds: vorlagen.map((v) => v.vorlageId),
    anhaenge,
    fenster: reservierungen,
  };
}

/** Datenbankzeilen → Positionen der Kalkulation. */
export function positionenAusZeilen(zeilen: AnfrageZeile[]): Position[] {
  return zeilen.map((z) => ({
    id: z.id,
    titel: z.titel,
    gewerk: z.gewerk as Gewerk,
    text: z.text,
    menge: Number(z.menge),
    einheit: z.einheit as Einheit,
    von: z.von,
    bis: z.bis,
    matrixNr: z.matrixNr,
    vorlageZeileId: z.vorlageZeileId,
    varianteMatrixNr: z.varianteMatrixNr,
    zuschlag: z.zuschlag,
    aktiv: z.aktiv,
    quelle: z.quelle as 'vorlage' | 'manuell',
    notizIntern: z.notizIntern,
    intern: z.intern ?? {},
  }));
}

export function foerderungEingabeAus(daten: VorgangDaten): FoerderungEingabe | null {
  const f = daten.anfrage.foerderung;
  if (!f) return null;
  return {
    aktiv: true,
    wohneinheiten: f.wohneinheiten ?? daten.anfrage.wohneinheiten ?? 1,
    selbstBewohnt: f.boni?.klimageschwindigkeit ?? true,
    altOelOderGas: f.boni?.klimageschwindigkeit ?? true,
    einkommenUnterGrenze: f.boni?.einkommen ?? false,
    natuerlichesKaeltemittel: f.boni?.effizienz ?? true,
    // Der berechnete Satz wird nie zur Handeingabe; sonst verschwinden die Förderbausteine aus dem Dokument.
    satzManuell: f.satzManuell ?? null,
  };
}

export function rechneVorgang(daten: VorgangDaten, matrix: Richtpreis[], regeln: FoerderRegeln): KalkulationsErgebnis {
  return berechne({
    positionen: positionenAusZeilen(daten.zeilen),
    matrix,
    faktoren: daten.anfrage.kalkulation ?? {},
    foerderung: foerderungEingabeAus(daten),
    foerderRegeln: regeln,
  });
}

/** Terminvorschlag als „<Fenster A>, oder <Fenster B>“. */
export function terminvorschlagText(fenster: { beschriftung: string }[]): string {
  const texte = fenster.map((f) => f.beschriftung.trim()).filter(Boolean);
  if (texte.length === 0) return '';
  if (texte.length === 1) return texte[0];
  return `${texte[0]}, oder ${texte[1]}`;
}

/** Fehlende Angaben nach Regel 3. */
export function fehlendeAngaben(daten: VorgangDaten, ergebnis: KalkulationsErgebnis): string[] {
  const fehlt: string[] = [];
  const k = daten.kunde;
  if (!k?.anrede?.trim()) fehlt.push('Anrede');
  if (!k?.telefon?.trim()) fehlt.push('Telefon');
  if (!k?.email?.trim()) fehlt.push('E-Mail');
  if (!terminvorschlagText(daten.fenster)) fehlt.push('Terminvorschlag');
  if (!daten.anfrage.objektAdresse.trim()) fehlt.push('Objektadresse');
  if (!daten.anfrage.persoenlicherSatz.trim()) fehlt.push('Persönlicher Satz');
  for (const p of ergebnis.positionen) {
    // Abgewählte Zuschläge stehen nicht im Dokument; ihre Platzhalter fehlen dem Kunden nicht.
    if (!p.aktiv) continue;
    const offen = offenePlatzhalter(p.text);
    if (offen.length) fehlt.push(`Platzhalter in „${p.titel}“: ${offen.map((o) => `[${o}]`).join(', ')}`);
  }
  for (const h of ergebnis.blockiert) {
    if (h.code === 'matrix_fehlt' || h.code === 'wert_fehlt' || h.code === 'variante_fehlt') fehlt.push(h.text);
  }
  return [...new Set(fehlt)];
}

// ---------------------------------------------------------------------------
// Bestätigungstoken
// ---------------------------------------------------------------------------

export function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Erzeugt ein Einmaltoken (32 Byte base64url); gespeichert wird nur der sha256-Hash. */
export async function erzeugeBestaetigungsToken(anfrageId: string, jetzt: Date): Promise<string> {
  const db = await getDb();
  const token = randomBytes(32).toString('base64url');
  await db.update(anfrageTabelle)
    .set({ bestaetigungsTokenHash: tokenHash(token), tokenGueltigBis: plusTage(jetzt, TOKEN_GUELTIG_TAGE), tokenEingeloestAm: null })
    .where(eq(anfrageTabelle.id, anfrageId));
  return token;
}

export function appUrl(): string {
  return (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function bestaetigungsUrl(token: string): string {
  return `${appUrl()}/termin/bestaetigen/${token}`;
}

// ---------------------------------------------------------------------------
// CSV und Datenblatt
// ---------------------------------------------------------------------------

export const CSV_SPALTEN = [
  'ks_nummer', 'datum', 'nachname', 'vorname', 'email', 'objekt', 'vorhaben', 'vorlage',
  'spanne_von', 'spanne_bis', 'status', 'versendet_am', 'wiedervorlage', 'antwort_am', 'termin', 'bemerkung',
] as const;

function csvFeld(wert: string): string {
  const roh = (wert ?? '').replace(/\r?\n/g, ' ').trim();
  return /[";]/.test(roh) ? `"${roh.replace(/"/g, '""')}"` : roh;
}

/** Eine Zeile im Format von Uebersicht.csv (16 Spalten, Semikolon). */
export function csvZeile(daten: VorgangDaten, ergebnis: KalkulationsErgebnis): string {
  const a = daten.anfrage;
  const k = daten.kunde;
  const felder = [
    a.ksNummer,
    datumDeutsch(a.erstelltAm),
    k?.nachname ?? '',
    k?.vorname ?? '',
    k?.email ?? '',
    [a.objektAdresse, a.objektPlz].filter(Boolean).join(', '),
    a.vorhabenKurz,
    daten.vorlageIds.join('+'),
    ergebnis.bruttoVon ? String(ergebnis.bruttoVon) : '',
    ergebnis.bruttoBis ? String(ergebnis.bruttoBis) : '',
    a.status,
    a.versendetAm ? datumDeutsch(a.versendetAm) : '',
    a.wiedervorlageAm ? datumDeutsch(a.wiedervorlageAm) : '',
    a.antwortAm ? datumDeutsch(a.antwortAm) : '',
    a.terminAm ? datumDeutsch(a.terminAm) : '',
    a.bemerkung,
  ];
  return felder.map(csvFeld).join(';');
}

export function csvKopfzeile(): string {
  return CSV_SPALTEN.join(';');
}

/** Interne Projektion als JSON-Text (Anhang datenblatt.json des Dossiers). */
export function datenblattJson(daten: VorgangDaten, ergebnis: KalkulationsErgebnis): string {
  const a = daten.anfrage;
  const k = daten.kunde;
  return JSON.stringify({
    ks_nummer: a.ksNummer,
    status: a.status,
    quelle: a.quelle,
    erstellt_am: a.erstelltAm.toISOString(),
    kunde: k ? { anrede: k.anrede, vorname: k.vorname, nachname: k.nachname, email: k.email, telefon: k.telefon, strasse: k.strasse, plz_ort: k.plzOrt } : null,
    objekt: { adresse: a.objektAdresse, plz: a.objektPlz, entfernung_km: a.entfernungKm, wohneinheiten: a.wohneinheiten },
    vorhaben_kurz: a.vorhabenKurz,
    gewerk_haupt: a.gewerkHaupt,
    dringlichkeit: a.dringlichkeit,
    triage_vorschlag: a.triageVorschlag,
    vorlagen: daten.vorlageIds,
    persoenlicher_satz: a.persoenlicherSatz,
    annahmen: a.annahmen,
    vorbehalte: a.vorbehalte,
    ausfuehrung_satz: a.ausfuehrungSatz,
    kalkulation: a.kalkulation,
    foerderung: a.foerderung,
    summe: { netto_von: ergebnis.nettoVon, netto_bis: ergebnis.nettoBis, brutto_von: ergebnis.bruttoVon, brutto_bis: ergebnis.bruttoBis },
    positionen: daten.zeilen.map((z) => ({
      position: z.position, titel: z.titel, gewerk: z.gewerk, text: z.text, menge: Number(z.menge), einheit: z.einheit,
      von: z.von, bis: z.bis, matrix_nr: z.matrixNr, zuschlag: z.zuschlag, aktiv: z.aktiv, notiz_intern: z.notizIntern, intern: z.intern,
    })),
    notizen: {
      etage: a.etage, aufzug: a.aufzug, montagehindernisse: a.montagehindernisse,
      leitungswege: a.leitungswege, intern: a.interneNotizen,
    },
    konfigurator_antworten: a.konfiguratorAntworten,
    gebaeude: a.gebaeude,
  }, null, 2);
}

// ---------------------------------------------------------------------------
// Eingaben für die Dokumenten-Engine
// ---------------------------------------------------------------------------

export type EingabeOptionen = { bestaetigungsUrl?: string | null; jetzt?: Date; foerderRegeln?: FoerderRegeln };

/** Kundensichtbarer Betriebskostenvergleich; null ohne heutigen Verbrauch oder Preis. */
export function kundenBetriebskosten(daten: VorgangDaten, einst: Einstellungen): Betriebskosten | null {
  const gebaeude = daten.anfrage.gebaeude ?? leeresGebaeude();
  const b = berechneBetriebskosten(gebaeude, einst.betriebskosten, heizlastSchaetzen(gebaeude));
  if (!b || b.heuteJahr === null || b.ersparnisJahr === null || b.ersparnisJahr <= 0) return null;
  return {
    energieartLabel: b.energieartLabel,
    heuteJahr: b.heuteJahr,
    wpJahr: b.wpJahr,
    wpMitPvJahr: gebaeude.geraet.pvGewuenscht ? b.wpMitPvJahr : null,
    ersparnisJahr: b.ersparnisJahr,
    proMonat: b.proMonat,
  };
}

function bearbeiterAus(daten: VorgangDaten, einst: Einstellungen) {
  return daten.bearbeiter
    ? { name: daten.bearbeiter.name, rolle: daten.bearbeiter.funktion, mail: daten.bearbeiter.signaturMail }
    : { name: einst.absender.name, rolle: einst.briefbogen.firma, mail: einst.absender.email };
}

/** Kundensichtbare Eingabe. Enthält nur Positionen mit Spanne, nie interne Felder. */
export function baueDokumentEingabe(
  daten: VorgangDaten,
  ergebnis: KalkulationsErgebnis,
  einst: Einstellungen,
  optionen: EingabeOptionen = {},
): DokumentEingabe {
  const a = daten.anfrage;
  const k = daten.kunde;
  const jetzt = optionen.jetzt ?? new Date();
  return {
    ksNummer: a.ksNummer,
    datum: datumDeutsch(jetzt),
    briefbogen: einst.briefbogen,
    bearbeiter: bearbeiterAus(daten, einst),
    kunde: {
      anrede: k?.anrede ?? '',
      vorname: k?.vorname ?? '',
      nachname: k?.nachname ?? '',
      strasse: k?.strasse ?? '',
      plzOrt: k?.plzOrt ?? '',
      email: k?.email ?? '',
      telefon: k?.telefon ?? '',
    },
    objektAdresse: [a.objektAdresse, a.objektPlz && !a.objektAdresse.includes(a.objektPlz) ? a.objektPlz : ''].filter(Boolean).join(', '),
    vorhabenKurz: a.vorhabenKurz,
    gewerkHaupt: (a.gewerkHaupt as Gewerk | null) ?? null,
    persoenlicherSatz: a.persoenlicherSatz,
    // Nur aktive, bewertete Positionen: abgewählte Zuschläge stehen nicht im Kundendokument (sie fehlen auch in der Summe).
    positionen: ergebnis.positionen.filter((p) => p.aktiv && !p.blockiert && p.von !== null && p.bis !== null),
    nettoVon: ergebnis.nettoVon,
    nettoBis: ergebnis.nettoBis,
    bruttoVon: ergebnis.bruttoVon,
    bruttoBis: ergebnis.bruttoBis,
    foerderung: ergebnis.foerderung,
    betriebskosten: a.gewerkHaupt === 'waermepumpe' || daten.vorlageIds.some((id) => id.startsWith('waermepumpe')) ? kundenBetriebskosten(daten, einst) : null,
    foerderBausteine: ergebnis.foerderung ? foerderBausteine(ergebnis.foerderung.boni, optionen.foerderRegeln ?? FOERDER_STANDARD) : [],
    annahmen: a.annahmen ?? [],
    vorbehalte: a.vorbehalte ?? [],
    terminvorschlag: terminvorschlagText(daten.fenster),
    ausfuehrungSatz: a.ausfuehrungSatz,
    mailBetreff: a.mailBetreff,
    mailPreheader: a.mailPreheader,
    appUrl: appUrl(),
    bestaetigungsUrl: optionen.bestaetigungsUrl ?? null,
  };
}

/** Interne Eingabe für das Büro-Dossier. */
export function baueDossierEingabe(
  daten: VorgangDaten,
  ergebnis: KalkulationsErgebnis,
  einst: Einstellungen,
  optionen: EingabeOptionen = {},
): DossierEingabe {
  const basis = baueDokumentEingabe(daten, ergebnis, einst, optionen);
  const a = daten.anfrage;
  const jeId = new Map(ergebnis.positionen.map((p) => [p.positionId, p]));
  const positionenIntern: DossierPosition[] = daten.zeilen.map((z) => {
    const e = jeId.get(z.id);
    return {
      titel: z.titel,
      gewerk: z.gewerk as Gewerk,
      text: z.text,
      menge: Number(z.menge),
      einheit: z.einheit as Einheit,
      von: e?.von ?? z.von,
      bis: e?.bis ?? z.bis,
      matrixNr: z.matrixNr,
      zuschlag: z.zuschlag,
      aktiv: z.aktiv,
      notizIntern: z.notizIntern,
      blockiert: e?.blockiert ?? false,
    };
  });
  const pruefung = pruefeVersandtexte({
    persoenlicherSatz: a.persoenlicherSatz,
    terminvorschlag: basis.terminvorschlag,
    email: basis.kunde.email,
    anrede: basis.kunde.anrede,
    vorname: basis.kunde.vorname,
    nachname: basis.kunde.nachname,
    ausfuehrungSatz: a.ausfuehrungSatz,
    annahmen: a.annahmen ?? [],
    vorbehalte: a.vorbehalte ?? [],
  });
  return {
    ...basis,
    anfrageId: a.id,
    internUrl: `${appUrl()}/intern/anfragen/${a.id}`,
    quelle: a.quelle as Quelle,
    status: a.status as AnfrageStatus,
    dringlichkeit: a.dringlichkeit as Dringlichkeit,
    triageVorschlag: a.triageVorschlag,
    entfernungKm: a.entfernungKm,
    notizen: {
      etage: a.etage,
      aufzug: a.aufzug,
      montagehindernisse: a.montagehindernisse,
      leitungswege: a.leitungswege,
      intern: a.interneNotizen,
    },
    positionenIntern,
    kalkulation: a.kalkulation ?? {},
    fehlendeAngaben: fehlendeAngaben(daten, ergebnis),
    warnungen: [...pruefung.warnungen, ...pruefung.sperren],
    anhaenge: daten.anhaenge.map((h) => ({
      art: h.art,
      dateiname: h.dateiname,
      url: `${appUrl()}/api/intern/anfragen/${a.id}/anhaenge/${h.id}`,
    })),
    csvZeile: csvZeile(daten, ergebnis),
    datenblattJson: datenblattJson(daten, ergebnis),
  };
}

/** Lädt Vorgang, Stammdaten und Einstellungen und baut beide Eingaben in einem Zug. */
export async function ladeEingaben(anfrageId: string, optionen: EingabeOptionen = {}): Promise<{
  daten: VorgangDaten; ergebnis: KalkulationsErgebnis; einstellungen: Einstellungen;
  dokument: DokumentEingabe; dossier: DossierEingabe;
} | null> {
  const daten = await ladeVorgang(anfrageId);
  if (!daten) return null;
  const [matrix, regeln, einstellungen] = await Promise.all([ladeMatrix(), ladeFoerderRegeln(), ladeEinstellungen()]);
  const ergebnis = rechneVorgang(daten, matrix, regeln);
  return {
    daten,
    ergebnis,
    einstellungen,
    dokument: baueDokumentEingabe(daten, ergebnis, einstellungen, { ...optionen, foerderRegeln: regeln }),
    dossier: baueDossierEingabe(daten, ergebnis, einstellungen, { ...optionen, foerderRegeln: regeln }),
  };
}

/** Gibt die Terminfenster einer Anfrage wieder frei (Regel 6); `behalten` bleibt reserviert. */
export async function loeseReservierungen(anfrageId: string, behalten: string[] = []): Promise<void> {
  const db = await getDb();
  const alle = await db.select().from(terminfensterReservierung).where(eq(terminfensterReservierung.anfrageId, anfrageId));
  const zuLoeschen = alle.filter((r) => !behalten.includes(r.terminfensterId)).map((r) => r.terminfensterId);
  if (!zuLoeschen.length) return;
  await db.delete(terminfensterReservierung).where(and(
    eq(terminfensterReservierung.anfrageId, anfrageId),
    inArray(terminfensterReservierung.terminfensterId, zuLoeschen),
  ));
}
