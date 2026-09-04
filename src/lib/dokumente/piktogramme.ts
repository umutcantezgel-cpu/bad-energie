/**
 * Gewerke-Piktogramme als Inline-SVG für Dokumente und Mails.
 *
 * Benannte Abweichung (3) vom Altsystem-Template: die Piktogramme im PDF sind vektoriell
 * statt PNG. Die PNG-Fassungen unter assets/icon_*.png bleiben als Fallback für Mailprogramme,
 * die kein Inline-SVG darstellen.
 *
 * Die Zeichenfläche ist 24 × 24. Alle Formen sind einfache Linien und Flächen in den
 * Briefbogenfarben aus GEWERK_FARBE_DOKUMENT (src/lib/types.ts).
 *
 * Die Ausgabe enthält keine Nutzerdaten und ist deshalb ein engine-erzeugtes Token
 * (Allow-Liste der Template-Engine).
 */
import { GEWERK_FARBE_DOKUMENT } from '../types';

export type PiktogrammSchluessel = 'flamme' | 'wasser' | 'sonne' | 'luft' | 'elektro';

/** Reihenfolge in der Legende und in den Gewerke-Chips. */
export const PIKTOGRAMM_REIHENFOLGE: readonly PiktogrammSchluessel[] = ['flamme', 'wasser', 'sonne', 'luft', 'elektro'] as const;

/** Innenzeichnung je Schlüssel. `%F` wird durch die Farbe ersetzt. */
const FORMEN: Record<PiktogrammSchluessel, string> = {
  // Flamme: geschlossene Fläche mit hellem Kern
  flamme:
    '<path d="M12 2.2c2.6 3.1 3.9 5.6 3.9 7.6 0 1.3-.5 2.4-1.4 3.2.5-1.6.2-3-.9-4.3.1 2-.7 3.5-2.3 4.6-1.5 1-2.3 2.2-2.3 3.5 0 1.1.4 2 1.2 2.8C7 18.9 5.4 16.6 5.4 14c0-2.1 1-4.1 2.9-6.1.2 1 .7 1.8 1.5 2.4.1-3.1.8-5.8 2.2-8.1z" fill="%F"/>' +
    '<path d="M12 21.8c-1.7 0-2.9-1.1-2.9-2.6 0-1.1.6-2 1.9-2.8 1-.7 1.6-1.4 1.9-2.2.9.9 1.4 1.9 1.4 3 0 .8-.2 1.5-.7 2.2 1-.3 1.7-.9 2.2-1.7.2.5.3 1 .3 1.5 0 1.5-1.5 2.6-4.1 2.6z" fill="%F" opacity=".55"/>',
  // Wasser: Tropfen mit Glanzlicht
  wasser:
    '<path d="M12 2.4c3.7 4.4 5.6 7.7 5.6 10.1 0 3.4-2.5 5.9-5.6 5.9s-5.6-2.5-5.6-5.9c0-2.4 1.9-5.7 5.6-10.1z" fill="%F"/>' +
    '<path d="M9.3 12.6c0 2 1.3 3.4 3 3.6" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>' +
    '<path d="M4.5 21h15" fill="none" stroke="%F" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>',
  // Sonne: Kern mit acht Strahlen
  sonne:
    '<circle cx="12" cy="12" r="4.4" fill="%F"/>' +
    '<g fill="none" stroke="%F" stroke-width="1.7" stroke-linecap="round">' +
    '<path d="M12 1.6v2.8M12 19.6v2.8M1.6 12h2.8M19.6 12h2.8"/>' +
    '<path d="M4.7 4.7l2 2M17.3 17.3l2 2M19.3 4.7l-2 2M6.7 17.3l-2 2"/></g>',
  // Luft: drei Strömungslinien mit Wirbel
  luft:
    '<g fill="none" stroke="%F" stroke-width="1.8" stroke-linecap="round">' +
    '<path d="M2.8 8h9.4a2.6 2.6 0 1 0-2.6-2.6"/>' +
    '<path d="M2.8 12h13a2.6 2.6 0 1 1-2.6 2.6"/>' +
    '<path d="M2.8 16h6.6a2.2 2.2 0 1 1-2.2 2.2"/></g>',
  // Elektro: Blitz in einem offenen Rahmen
  elektro:
    '<path d="M13.4 2.2 6.2 13.1h4.2l-1.6 8.7 7.4-11.1h-4.3z" fill="%F"/>' +
    '<path d="M3.2 6.2v11.6M20.8 6.2v11.6" fill="none" stroke="%F" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>',
};

export type PiktogrammOptionen = {
  /** CSS-Maß für Breite und Höhe, zum Beispiel "6.5mm". Default "1em". */
  groesse?: string;
  /** Übersteuert die Briefbogenfarbe. */
  farbe?: string;
  /** Zusätzliche Stilangaben (Mail: vertical-align). */
  stil?: string;
};

const ERLAUBTE_MASSE = /^[0-9.]{1,8}(px|pt|mm|cm|em|rem|%)$/;
const ERLAUBTE_FARBE = /^#[0-9A-Fa-f]{3,8}$/;
const ERLAUBTER_STIL = /^[A-Za-z0-9 :;.,%#()-]{0,120}$/;

/**
 * Liefert ein Inline-SVG als Zeichenkette. Alle Parameter werden gegen enge Muster geprüft,
 * damit nie fremder Text in das Markup gelangt.
 */
export function piktogramm(schluessel: PiktogrammSchluessel, optionen: PiktogrammOptionen = {}): string {
  const form = FORMEN[schluessel];
  if (!form) return '';
  const groesse = optionen.groesse && ERLAUBTE_MASSE.test(optionen.groesse) ? optionen.groesse : '1em';
  const farbe = optionen.farbe && ERLAUBTE_FARBE.test(optionen.farbe) ? optionen.farbe : GEWERK_FARBE_DOKUMENT[schluessel];
  const stil = optionen.stil && ERLAUBTER_STIL.test(optionen.stil) ? optionen.stil : '';
  const attribute = [
    'xmlns="http://www.w3.org/2000/svg"',
    'viewBox="0 0 24 24"',
    'role="presentation"',
    'aria-hidden="true"',
    'focusable="false"',
    `width="${groesse}"`,
    `height="${groesse}"`,
    `style="width:${groesse};height:${groesse};display:block;${stil}"`,
  ].join(' ');
  return `<svg ${attribute}>${form.replaceAll('%F', farbe)}</svg>`;
}

/** Datei-URI der PNG-Fassung (Mail-Fallback), gefüllt von der Template-Engine. */
export function piktogrammDateiname(schluessel: PiktogrammSchluessel): string {
  return `icon_${schluessel}.png`;
}
