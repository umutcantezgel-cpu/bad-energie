/**
 * Baut aus den Datenblättern des Altsystems (ks-2026-0031.json, ks-2026-0032.json)
 * die Eingaben der Dokumenten-Engine. Grundlage der Golden-Tests.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import type {
  Betriebskosten, Briefbogen, DokumentEingabe, DossierEingabe, DossierPosition } from '../../src/lib/dokumente/datenblatt';
import { bruttoAusNetto } from '../../src/lib/services/calculation';
import type { Einheit, FoerderungErgebnis, Gewerk, PositionErgebnis } from '../../src/lib/types';

type FixtureZeile = { titel: string; text: string; von: number | null; bis: number | null; gewerk: string };
type FixtureFoerderung = { kosten: number; satz: number; zuschuss: number; eigenanteil_von: number; eigenanteil_bis: number };
type Fixture = {
  ks_nummer: string;
  datum: string;
  bearbeiter: string;
  bearbeiter_rolle: string;
  bearbeiter_mail: string;
  anrede: string;
  vorname: string;
  nachname: string;
  strasse: string;
  plz_ort: string;
  email: string;
  telefon: string;
  objekt_adresse: string;
  vorhaben_kurz: string;
  vorlage: string;
  gewerk_haupt: string;
  persoenlicher_satz: string;
  rows: FixtureZeile[];
  summe_netto_von: number | null;
  summe_netto_bis: number | null;
  foerderung: FixtureFoerderung | null;
  annahmen: string[];
  terminvorschlag: string;
  ausfuehrung_satz: string;
  mail_betreff: string;
  mail_preheader: string;
};

export const BRIEFBOGEN: Briefbogen = {
  firma: 'Bad & Energie GmbH',
  strasse: 'Siegmund-Hiepe-Straße 20',
  plzOrt: '35578 Wetzlar',
  telefon: '06441 2039053',
  telefonLink: 'tel:+4964412039053',
  email: 'info@bad-energie.de',
  web: 'bad-energie.de',
  geschaeftsfuehrer: 'Sabri Demir',
  register: 'Amtsgericht Wetzlar HRB 2449',
  ustId: 'DE215933612',
};

function lies(nummer: '0031' | '0032'): Fixture {
  const datei = path.join(process.cwd(), 'test', 'fixtures', `ks-2026-${nummer}.json`);
  return JSON.parse(readFileSync(datei, 'utf8')) as Fixture;
}

function positionen(zeilen: FixtureZeile[]): PositionErgebnis[] {
  return zeilen.map((z, i) => ({
    positionId: `p${i + 1}`,
    titel: z.titel,
    gewerk: z.gewerk as Gewerk,
    text: z.text,
    menge: 1,
    einheit: 'pauschal' as Einheit,
    einzelVon: z.von,
    einzelBis: z.bis,
    von: z.von,
    bis: z.bis,
    blockiert: false,
    zuschlag: false,
  }));
}

function foerderung(f: FixtureFoerderung | null): FoerderungErgebnis | null {
  if (!f) return null;
  return {
    satz: f.satz,
    kosten: f.kosten,
    zuschuss: f.zuschuss,
    eigenanteilVon: f.eigenanteil_von,
    eigenanteilBis: f.eigenanteil_bis,
    boni: { grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 0 },
  };
}

export type EingabeOptionen = {
  vorbehalte?: string[];
  bestaetigungsUrl?: string | null;
  betriebskosten?: Betriebskosten | null;
  foerderBausteine?: string[];
  appUrl?: string;
};

/** DokumentEingabe aus einem Altsystem-Datenblatt. */
export function eingabeAus(nummer: '0031' | '0032', optionen: EingabeOptionen = {}): DokumentEingabe {
  const f = lies(nummer);
  const pos = positionen(f.rows);
  const nettoVon = f.summe_netto_von ?? pos.reduce((s, p) => s + (p.von ?? 0), 0);
  const nettoBis = f.summe_netto_bis ?? pos.reduce((s, p) => s + (p.bis ?? 0), 0);
  return {
    ksNummer: f.ks_nummer,
    datum: f.datum,
    briefbogen: BRIEFBOGEN,
    bearbeiter: { name: f.bearbeiter, rolle: f.bearbeiter_rolle, mail: f.bearbeiter_mail },
    kunde: {
      anrede: f.anrede,
      vorname: f.vorname,
      nachname: f.nachname,
      strasse: f.strasse,
      plzOrt: f.plz_ort,
      email: f.email,
      telefon: f.telefon,
    },
    objektAdresse: f.objekt_adresse,
    vorhabenKurz: f.vorhaben_kurz,
    vorlage: f.vorlage,
    gewerkHaupt: (f.gewerk_haupt || null) as Gewerk | null,
    persoenlicherSatz: f.persoenlicher_satz,
    positionen: pos,
    nettoVon,
    nettoBis,
    bruttoVon: bruttoAusNetto(nettoVon),
    bruttoBis: bruttoAusNetto(nettoBis),
    foerderung: foerderung(f.foerderung),
    betriebskosten: optionen.betriebskosten ?? null,
    foerderBausteine: optionen.foerderBausteine ?? [],
    annahmen: f.annahmen,
    vorbehalte: optionen.vorbehalte ?? [],
    terminvorschlag: f.terminvorschlag,
    ausfuehrungSatz: f.ausfuehrung_satz,
    mailBetreff: f.mail_betreff,
    mailPreheader: f.mail_preheader,
    appUrl: optionen.appUrl ?? 'https://bad-energie.de',
    bestaetigungsUrl: optionen.bestaetigungsUrl ?? null,
  };
}

/** DossierEingabe mit allen internen Feldern (Deny-Liste-Test). */
export function dossierAus(nummer: '0031' | '0032', optionen: EingabeOptionen = {}): DossierEingabe {
  const basis = eingabeAus(nummer, optionen);
  const positionenIntern: DossierPosition[] = basis.positionen.map((p) => ({
    titel: p.titel,
    gewerk: p.gewerk,
    text: p.text,
    menge: p.menge,
    einheit: p.einheit,
    von: p.von,
    bis: p.bis,
    matrixNr: 7,
    zuschlag: false,
    aktiv: true,
    notizIntern: 'Nur intern: Kunde hat einen alten Zaehlerschrank, Aufschlag pruefen.',
    blockiert: false,
  }));
  return {
    ...basis,
    anfrageId: 'a-1',
    internUrl: 'https://bad-energie.de/intern/anfragen/a-1',
    quelle: 'intern',
    status: 'geplant',
    dringlichkeit: 'wochen_4',
    triageVorschlag: 'Kostenschätzung',
    entfernungKm: 12,
    notizen: {
      etage: 2,
      aufzug: false,
      montagehindernisse: 'Enges Treppenhaus',
      leitungswege: 'Steigleitung im Flur',
      intern: 'Chef kennt den Kunden persoenlich.',
    },
    positionenIntern,
    kalkulation: { stundensatz: 68, materialZuschlagProzent: 12, rabattProzent: 0, margeHinweis: 'Marge knapp, Bad mitrechnen' },
    fehlendeAngaben: ['telefon'],
    warnungen: ['Anrede unsicher'],
    anhaenge: [{ art: 'skizze', dateiname: 'skizze-1.png', url: 'https://bad-energie.de/api/intern/anfragen/a-1/anhaenge/x1' }],
    csvZeile: 'KS-2026-0031;03.09.2026;Musterfrau;Tamara;kundin@example.de;;;;;;geplant;;;;;',
    datenblattJson: '{"intern":true}',
  };
}
