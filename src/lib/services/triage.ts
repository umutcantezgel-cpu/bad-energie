import 'server-only';
import { asc, desc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { plzRadius } from '@/db/schema';

/**
 * Triage nach Regel 10. Das System schlägt vor, der Mensch entscheidet.
 * Kostenschätzung für Eigentümer mit klarem Vorhaben; nur Terminmail bei Miete, unklarem Vorhaben
 * oder zu kleiner Fläche; verwerfen ohne Kontaktdaten oder außerhalb des Radius.
 */

export type TriageVorschlag = 'kostenschaetzung' | 'terminmail' | 'verwerfen';

export type TriageEingabe = {
  eigentum: 'eigentum' | 'miete' | 'unklar';
  wohnflaecheM2?: number | null;
  plz?: string;
  objektAdresse?: string;
  email?: string;
  telefon?: string;
  nachname?: string;
  vorhabenKurz?: string;
  preisfrage?: boolean;
};

export type TriageRegeln = { radiusKm: number; minQm: number };

export type TriageErgebnis = {
  vorschlag: TriageVorschlag;
  text: string;
  entfernungKm: number | null;
  ort: string | null;
  gruende: string[];
};

/** Entfernung über das längste passende PLZ-Präfix (Regel: Präfix-Längstmatch). */
export async function entfernungFuerPlz(plz: string | null | undefined): Promise<{ entfernungKm: number; ort: string } | null> {
  const ziffern = (plz ?? '').replace(/\D/g, '');
  if (!ziffern) return null;
  const db = await getDb();
  const alle = await db.select().from(plzRadius).orderBy(desc(plzRadius.plzPraefix), asc(plzRadius.ort));
  let treffer: { entfernungKm: number; ort: string; laenge: number } | null = null;
  for (const z of alle) {
    if (!ziffern.startsWith(z.plzPraefix)) continue;
    if (!treffer || z.plzPraefix.length > treffer.laenge) {
      treffer = { entfernungKm: z.entfernungKm, ort: z.ort, laenge: z.plzPraefix.length };
    }
  }
  return treffer ? { entfernungKm: treffer.entfernungKm, ort: treffer.ort } : null;
}

const TEXT: Record<TriageVorschlag, string> = {
  kostenschaetzung: 'Kostenschätzung erstellen',
  terminmail: 'Nur Terminmail',
  verwerfen: 'Verwerfen',
};

export async function triage(eingabe: TriageEingabe, regeln: TriageRegeln): Promise<TriageErgebnis> {
  const gruende: string[] = [];
  const entfernung = await entfernungFuerPlz(eingabe.plz);
  const entfernungKm = entfernung?.entfernungKm ?? null;

  const email = (eingabe.email ?? '').trim();
  const telefon = (eingabe.telefon ?? '').trim();
  const nachname = (eingabe.nachname ?? '').trim();

  let vorschlag: TriageVorschlag = 'kostenschaetzung';

  if (!nachname || (!email && !telefon)) {
    gruende.push('Kontaktdaten fehlen.');
    vorschlag = 'verwerfen';
  } else if (entfernungKm !== null && entfernungKm > regeln.radiusKm) {
    gruende.push(`Objekt liegt ${entfernungKm} km entfernt, mehr als ${regeln.radiusKm} km.`);
    vorschlag = 'verwerfen';
  } else if (eingabe.preisfrage && !(eingabe.objektAdresse ?? '').trim()) {
    gruende.push('Reine Preisfrage ohne Objekt.');
    vorschlag = 'verwerfen';
  } else if (eingabe.eigentum === 'miete') {
    gruende.push('Objekt ist gemietet.');
    vorschlag = 'terminmail';
  } else if (eingabe.preisfrage) {
    gruende.push('Reine Preisfrage.');
    vorschlag = 'terminmail';
  } else if (!(eingabe.vorhabenKurz ?? '').trim()) {
    gruende.push('Vorhaben ist unklar.');
    vorschlag = 'terminmail';
  } else if (typeof eingabe.wohnflaecheM2 === 'number' && eingabe.wohnflaecheM2 > 0 && eingabe.wohnflaecheM2 < regeln.minQm) {
    gruende.push(`Fläche ${eingabe.wohnflaecheM2} m² liegt unter ${regeln.minQm} m².`);
    vorschlag = 'terminmail';
  } else if (eingabe.eigentum === 'unklar') {
    gruende.push('Eigentum ist nicht bestätigt.');
    vorschlag = 'terminmail';
  } else {
    gruende.push('Eigentümer mit klarem Vorhaben.');
  }

  if (entfernungKm !== null && vorschlag !== 'verwerfen') {
    gruende.push(`Entfernung ${entfernungKm} km${entfernung?.ort ? ` (${entfernung.ort})` : ''}.`);
  }

  return {
    vorschlag,
    text: `${TEXT[vorschlag]}: ${gruende.join(' ')}`.trim(),
    entfernungKm,
    ort: entfernung?.ort ?? null,
    gruende,
  };
}
