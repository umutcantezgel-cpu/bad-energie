import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { einstellung, foerderRegel, richtpreis, vorbehalt, vorlage, vorlageZeile } from '@/db/schema';
import { BETRIEBSKOSTEN_STANDARD, betriebskostenSchema, type Baustein, type BetriebskostenEinstellungen, type Einheit, type FoerderRegeln, type Gewerk, type Kalkulationsdaten, type Richtpreis, type Vorbehalt, type Vorlage } from '../types';
import type { Briefbogen } from '../dokumente/datenblatt';
import { matrixSpanne } from './calculation';

/**
 * Lädt Stammdaten (Richtpreis-Matrix, Vorlagen mit Bausteinen, Förderregeln, Vorbehalte)
 * und die Betriebseinstellungen. Die Matrix verlässt den Server nur an angemeldete Clients.
 */

export const FOERDER_STANDARD: FoerderRegeln = {
  grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 30, einkommenGrenze: 40000, deckel: 70,
  kostenWe1: 30000, kostenJeWeitere: 15000, maxWe: 6, standardsatz: null, eigenanteilRundung: 1000,
};

export async function ladeMatrix(): Promise<Richtpreis[]> {
  const db = await getDb();
  const zeilen = await db.select().from(richtpreis).orderBy(asc(richtpreis.nr));
  return zeilen.map((z) => ({
    nr: z.nr, leistung: z.leistung, von: z.von, bis: z.bis, einheit: z.einheit as Einheit, hinweis: z.hinweis,
  }));
}

export async function ladeFoerderRegeln(): Promise<FoerderRegeln> {
  const db = await getDb();
  const zeilen = await db.select().from(foerderRegel).where(eq(foerderRegel.id, 1)).limit(1);
  const z = zeilen[0];
  if (!z) return { ...FOERDER_STANDARD };
  return {
    grund: z.grund, effizienz: z.effizienz, klimageschwindigkeit: z.klimageschwindigkeit, einkommen: z.einkommen,
    einkommenGrenze: z.einkommenGrenze, deckel: z.deckel, kostenWe1: z.kostenWe1, kostenJeWeitere: z.kostenJeWeitere,
    maxWe: z.maxWe, standardsatz: z.standardsatz, eigenanteilRundung: z.eigenanteilRundung,
  };
}

export async function ladeVorbehalte(): Promise<Vorbehalt[]> {
  const db = await getDb();
  const zeilen = await db.select().from(vorbehalt).where(eq(vorbehalt.aktiv, true)).orderBy(asc(vorbehalt.position), asc(vorbehalt.id));
  return zeilen.map((z) => ({ id: z.id, text: z.text, gewerk: (z.gewerk as Gewerk | null) ?? null }));
}

export async function ladeVorlagen(matrix: Richtpreis[]): Promise<Vorlage[]> {
  const db = await getDb();
  const kopf = await db.select().from(vorlage).where(eq(vorlage.aktiv, true)).orderBy(asc(vorlage.position), asc(vorlage.id));
  const zeilen = await db.select().from(vorlageZeile).orderBy(asc(vorlageZeile.vorlageId), asc(vorlageZeile.position));
  const jeVorlage = new Map<string, Baustein[]>();
  for (const z of zeilen) {
    const liste = jeVorlage.get(z.vorlageId) ?? [];
    const varianten = z.groessenVarianten ?? null;
    const standardNr = varianten && varianten.length ? varianten[0].matrixNr : z.matrixNr;
    liste.push({
      id: z.id,
      vorlageId: z.vorlageId,
      position: z.position,
      titel: z.titel,
      gewerk: z.gewerk as Gewerk,
      text: z.text,
      matrixNr: z.matrixNr,
      zuschlag: z.zuschlag,
      mengeDefault: Number(z.mengeDefault),
      einheit: z.einheit as Einheit,
      groessenVarianten: varianten,
      matrixHinweis: z.matrixHinweis,
      spanne: matrixSpanne(matrix, standardNr),
    });
    jeVorlage.set(z.vorlageId, liste);
  }
  return kopf.map((v) => ({
    id: v.id,
    name: v.name,
    vorhabenKurz: v.vorhabenKurz,
    mailBetreff: v.mailBetreff,
    mailPreheader: v.mailPreheader,
    foerderungStandard: v.foerderungStandard,
    hinweis: v.hinweis,
    annahmenStandard: v.annahmenStandard ?? [],
    vorbehaltIds: v.vorbehaltIds ?? [],
    gewerkHaupt: v.gewerkHaupt as Gewerk,
    bausteine: jeVorlage.get(v.id) ?? [],
  }));
}

/** Matrix, Vorlagen mit Bausteinen, Förderregeln und Vorbehalte für die Live-Kalkulation. */
export async function ladeKalkulationsdaten(): Promise<Kalkulationsdaten> {
  const matrix = await ladeMatrix();
  const [vorlagen, foerderRegeln, vorbehalte, einst] = await Promise.all([
    ladeVorlagen(matrix),
    ladeFoerderRegeln(),
    ladeVorbehalte(),
    ladeEinstellungen(),
  ]);
  return { matrix, vorlagen, foerderRegeln, vorbehalte, betriebskosten: einst.betriebskosten };
}

// ---------------------------------------------------------------------------
// Betriebseinstellungen
// ---------------------------------------------------------------------------

export type Absender = { name: string; email: string };

export type Einstellungen = {
  versandzeit: string;
  wiedervorlageTage: number;
  erinnerungTage: number;
  radiusKm: number;
  minQm: number;
  speicherfristMonate: number;
  eingangsbestaetigung: boolean;
  bueroEmail: string;
  absender: Absender;
  briefbogen: Briefbogen;
  betriebskosten: BetriebskostenEinstellungen;
  /** true, solange die Demo-Preise des Vorführsystems in der Matrix stehen. */
  demoPreise: boolean;
};

export const EINSTELLUNG_STANDARD: Einstellungen = {
  versandzeit: '18:00',
  wiedervorlageTage: 5,
  erinnerungTage: 7,
  radiusKm: 40,
  minQm: 50,
  speicherfristMonate: 24,
  eingangsbestaetigung: false,
  bueroEmail: 'info@bad-energie.de',
  absender: { name: 'Sabri Demir', email: 'info@bad-energie.de' },
  briefbogen: {
    firma: 'Bad & Energie GmbH',
    strasse: 'Siegmund-Hiepe-Straße 20',
    plzOrt: '35578 Wetzlar',
    telefon: '06441 2039053',
    telefonLink: '+4964412039053',
    email: 'info@bad-energie.de',
    web: 'bad-energie.de',
    geschaeftsfuehrer: 'Sabri Demir',
    register: 'Amtsgericht Wetzlar HRB 2449',
    ustId: 'DE215933612',
  },
  betriebskosten: BETRIEBSKOSTEN_STANDARD,
  demoPreise: false,
};

function zahl(wert: unknown, standard: number): number {
  const n = typeof wert === 'number' ? wert : Number(wert);
  return Number.isFinite(n) ? n : standard;
}

function text(wert: unknown, standard: string): string {
  return typeof wert === 'string' && wert.trim() ? wert.trim() : standard;
}

/** Liest alle Einstellungen; fehlende Schlüssel fallen auf die Vorgabe zurück. */
export async function ladeEinstellungen(): Promise<Einstellungen> {
  const db = await getDb();
  const zeilen = await db.select().from(einstellung);
  const werte = new Map<string, unknown>(zeilen.map((z) => [z.key, z.wert]));
  const briefbogenRoh = werte.get('briefbogen');
  const absenderRoh = werte.get('absender');
  const betriebskostenRoh = betriebskostenSchema.safeParse({ ...BETRIEBSKOSTEN_STANDARD, ...(typeof werte.get('betriebskosten') === 'object' && werte.get('betriebskosten') ? (werte.get('betriebskosten') as object) : {}) });
  return {
    versandzeit: text(werte.get('versandzeit'), EINSTELLUNG_STANDARD.versandzeit),
    wiedervorlageTage: zahl(werte.get('wiedervorlage_tage'), EINSTELLUNG_STANDARD.wiedervorlageTage),
    erinnerungTage: zahl(werte.get('erinnerung_tage'), EINSTELLUNG_STANDARD.erinnerungTage),
    radiusKm: zahl(werte.get('radius_km'), EINSTELLUNG_STANDARD.radiusKm),
    minQm: zahl(werte.get('min_qm'), EINSTELLUNG_STANDARD.minQm),
    speicherfristMonate: zahl(werte.get('speicherfrist_monate'), EINSTELLUNG_STANDARD.speicherfristMonate),
    eingangsbestaetigung: werte.get('eingangsbestaetigung') === true,
    bueroEmail: text(werte.get('buero_email'), EINSTELLUNG_STANDARD.bueroEmail),
    absender: absenderRoh && typeof absenderRoh === 'object'
      ? { ...EINSTELLUNG_STANDARD.absender, ...(absenderRoh as Partial<Absender>) }
      : EINSTELLUNG_STANDARD.absender,
    briefbogen: briefbogenRoh && typeof briefbogenRoh === 'object'
      ? { ...EINSTELLUNG_STANDARD.briefbogen, ...(briefbogenRoh as Partial<Briefbogen>) }
      : EINSTELLUNG_STANDARD.briefbogen,
    betriebskosten: betriebskostenRoh.success ? betriebskostenRoh.data : BETRIEBSKOSTEN_STANDARD,
    demoPreise: werte.get('demo_preise') === true,
  };
}
