import 'server-only';

/**
 * Regel 5 (Kundentexte) als maschinelle Prüfung.
 * Warnungen sind Hinweise für den Menschen; harte Sperren verhindern den Versand
 * (fehlender persönlicher Satz, fehlender Terminvorschlag, fehlende E-Mail).
 */

export type TextPruefung = { warnungen: string[]; sperren: string[] };

const EMOJI = /\p{Extended_Pictographic}/u;
const BINDESTRICH = /[A-Za-zÄÖÜäöüß]-[A-Za-zÄÖÜäöüß]/;

/** Häufige Ersatzschreibungen statt echter Umlaute. */
const ERSATZSCHREIBUNGEN = [
  'fuer', 'ueber', 'moeglich', 'muessen', 'koennen', 'waerme', 'waermepumpe', 'groesse', 'schoen',
  'gruen', 'hoehe', 'aendern', 'spuelen', 'kuechen', 'tuer', 'wuensche', 'anschluesse', 'gebaeude',
];

const FLOSKELN = [
  'zeitnah', 'diesbezueglich', 'diesbezüglich', 'im rahmen von', 'selbstverstaendlich', 'selbstverständlich',
  'wie bereits besprochen', 'in kuerze', 'in kürze', 'nach ruecksprache', 'nach rücksprache',
  'wir wuerden uns freuen', 'wir würden uns freuen', 'jederzeit gerne zur verfuegung', 'jederzeit gerne zur verfügung',
];

const MAX_WOERTER_JE_SATZ = 22;

function saetze(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

/** Prüft einen einzelnen Kundentext und liefert Warnungen mit Feldnamen. */
export function pruefeKundentext(text: string, feld: string): string[] {
  const warnungen: string[] = [];
  const roh = (text ?? '').trim();
  if (!roh) return warnungen;
  if (EMOJI.test(roh)) warnungen.push(`${feld}: Emoji entfernen.`);
  if (BINDESTRICH.test(roh)) warnungen.push(`${feld}: Bindestrich im Fließtext vermeiden.`);
  const klein = roh.toLowerCase();
  const ersatz = ERSATZSCHREIBUNGEN.filter((w) => klein.includes(w));
  if (ersatz.length) warnungen.push(`${feld}: Umlaute ausschreiben statt ${[...new Set(ersatz)].join(', ')}.`);
  const floskeln = FLOSKELN.filter((f) => klein.includes(f));
  if (floskeln.length) warnungen.push(`${feld}: Floskel vermeiden (${[...new Set(floskeln)].join(', ')}).`);
  for (const satz of saetze(roh)) {
    const woerter = satz.split(/\s+/).length;
    if (woerter > MAX_WOERTER_JE_SATZ) {
      warnungen.push(`${feld}: Satz mit ${woerter} Wörtern kürzen.`);
      break;
    }
  }
  return warnungen;
}

export type VersandTexte = {
  persoenlicherSatz: string;
  terminvorschlag: string;
  email: string;
  anrede?: string;
  vorname?: string;
  nachname?: string;
  ausfuehrungSatz?: string;
  annahmen?: string[];
  vorbehalte?: string[];
};

/** Vollständige Prüfung vor Freigabe und Versand. */
export function pruefeVersandtexte(t: VersandTexte): TextPruefung {
  const warnungen: string[] = [];
  const sperren: string[] = [];

  if (!t.persoenlicherSatz.trim()) sperren.push('Persönlicher Satz fehlt.');
  if (!t.terminvorschlag.trim()) sperren.push('Terminvorschlag fehlt.');
  if (!t.email.trim()) sperren.push('E-Mail-Adresse fehlt.');

  warnungen.push(...pruefeKundentext(t.persoenlicherSatz, 'Persönlicher Satz'));
  if (t.ausfuehrungSatz) warnungen.push(...pruefeKundentext(t.ausfuehrungSatz, 'Ausführungssatz'));
  (t.annahmen ?? []).forEach((a, i) => warnungen.push(...pruefeKundentext(a, `Annahme ${i + 1}`)));
  (t.vorbehalte ?? []).forEach((v, i) => warnungen.push(...pruefeKundentext(v, `Vorbehalt ${i + 1}`)));

  const anrede = (t.anrede ?? '').trim();
  if (anrede !== 'Frau' && anrede !== 'Herr') {
    warnungen.push(
      (t.vorname ?? '').trim()
        ? 'Anrede ist nicht gesichert; das Dokument nutzt „Guten Tag Vorname Nachname“.'
        : 'Anrede und Vorname fehlen; bitte vor dem Versand prüfen.',
    );
  }
  if (!(t.nachname ?? '').trim()) sperren.push('Nachname fehlt.');

  return { warnungen: [...new Set(warnungen)], sperren: [...new Set(sperren)] };
}
