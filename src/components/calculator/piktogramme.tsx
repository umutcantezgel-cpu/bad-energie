/**
 * Inline-SVG-Set des Konfigurators.
 * Rein vektoriell, ohne Abhängigkeit von einer Icon-Bibliothek, damit dieselben
 * Zeichen später auch im Dokument verwendet werden können. Farben erben über
 * `currentColor`; die Zeichen tragen nie eine eigene Bedeutung ohne Beschriftung.
 */
import React from 'react';
import type { PiktogrammName } from '@/lib/journeys/typen';

const P: Record<PiktogrammName, React.ReactNode> = {
  // Bad, Vorhaben
  'bad-komplett': (
    <>
      <path d="M3 13h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Z" />
      <path d="M7 13V6a2 2 0 0 1 4 0" />
      <path d="M6 20l-1 2M18 20l1 2" />
    </>
  ),
  'bad-teil': (
    <>
      <path d="M3 13h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Z" />
      <path d="M12 13V3" strokeDasharray="3 2" />
    </>
  ),
  dusche: (
    <>
      <path d="M6 21V8a3 3 0 0 1 3-3h4" />
      <path d="M13 3h4v4h-4z" />
      <path d="M9 12v1M12 14v1M15 12v1M10.5 17v1M13.5 17v1" />
    </>
  ),
  barrierefrei: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M9 9h6l1 5h-4l-3 7" />
      <path d="M5 14h4" />
    </>
  ),
  wc: (
    <>
      <path d="M6 4h3v7h7a4 4 0 0 1-4 4H9a3 3 0 0 1-3-3V4Z" />
      <path d="M9 15l-1 5h6l-1-5" />
    </>
  ),

  // Grundrisse
  'grundriss-schmal': (
    <>
      <rect x="7" y="3" width="10" height="18" rx="1.5" />
      <path d="M7 15h10" />
    </>
  ),
  'grundriss-quadratisch': (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M4 14h16" />
    </>
  ),
  'grundriss-l': (
    <>
      <path d="M4 4h8v7h8v9H4z" />
      <path d="M12 11h8" />
    </>
  ),

  // Ausstattungsstufen
  'stufe-1': (
    <>
      <path d="M4 18h4V9H4z" />
      <path d="M4 21h16" />
    </>
  ),
  'stufe-2': (
    <>
      <path d="M4 18h4V9H4zM10 18h4V6h-4z" />
      <path d="M4 21h16" />
    </>
  ),
  'stufe-3': (
    <>
      <path d="M4 18h4V9H4zM10 18h4V6h-4zM16 18h4V3h-4z" />
      <path d="M4 21h16" />
    </>
  ),

  // Wünsche
  walkin: (
    <>
      <path d="M3 19h18" />
      <path d="M8 19V6h9v13" />
      <path d="M5 12h3M5 16h3" />
    </>
  ),
  wanne: (
    <>
      <path d="M3 12h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4Z" />
      <path d="M7 12V7a2 2 0 0 1 4 0" />
    </>
  ),
  'dusch-wc': (
    <>
      <path d="M6 4h3v7h7a4 4 0 0 1-4 4H9a3 3 0 0 1-3-3V4Z" />
      <path d="M18 6v3M20 8h-4" />
    </>
  ),
  doppelwaschtisch: (
    <>
      <path d="M3 12h8v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3ZM13 12h8v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-3Z" />
      <path d="M7 12V8M17 12V8" />
    </>
  ),
  fussbodenheizung: (
    <>
      <path d="M3 19h18" />
      <path d="M6 15c0-2 3-2 3-4s-3-2-3-4M12 15c0-2 3-2 3-4s-3-2-3-4M18 15c0-1 1-1.5 1-2.5" />
    </>
  ),
  heizkoerper: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 5v14M13 5v14" />
    </>
  ),
  spiegel: (
    <>
      <rect x="6" y="3" width="12" height="14" rx="6" />
      <path d="M9 20h6" />
    </>
  ),
  wand: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M3 10h18M3 15h18M9 5v5M15 10v5M9 15v4" />
    </>
  ),
  warmwasser: (
    <>
      <path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9Z" />
      <path d="M10 14c1 1 3 1 4 0" />
    </>
  ),

  // Energieträger und Zieltechnik
  gas: (
    <>
      <path d="M12 3c2.5 3.5 4 5.5 4 8a4 4 0 0 1-8 0c0-2.5 1.5-4.5 4-8Z" />
      <path d="M9 20h6" />
    </>
  ),
  oel: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2" />
      <path d="M8 8V6h8v2M8 13h8" />
    </>
  ),
  strom: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  holz: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4v4M12 16v4" />
    </>
  ),
  gasheizung: (
    <>
      <rect x="5" y="4" width="14" height="12" rx="2" />
      <path d="M12 8c1.2 1.7 2 2.6 2 3.8a2 2 0 0 1-4 0c0-1.2.8-2.1 2-3.8Z" />
      <path d="M8 16v4M16 16v4" />
    </>
  ),
  waermepumpe: (
    <>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <circle cx="9" cy="12" r="3" />
      <path d="M18 9v6M21 12h-6" />
    </>
  ),
  klima: (
    <>
      <rect x="3" y="5" width="18" height="7" rx="2" />
      <path d="M7 12v3M12 12v5M17 12v3" />
    </>
  ),

  // Zeit und Alter
  'zeit-1': (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 1" />
    </>
  ),
  'zeit-2': (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l-3 2" />
    </>
  ),
  'zeit-3': (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l-3-1" />
      <path d="M4 4l16 16" />
    </>
  ),

  // Gebäude
  haus: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
    </>
  ),
  doppelhaus: (
    <>
      <path d="M3 11 8 6l5 5M11 11l5-5 5 5" />
      <path d="M5 10v10h14V10M12 20v-6" />
    </>
  ),
  reihenhaus: (
    <>
      <path d="M2 12l4-4 4 4M10 12l4-4 4 4" />
      <path d="M3 11v9h18v-9" />
      <path d="M9 20v-5M15 20v-5" />
    </>
  ),
  mehrfamilienhaus: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),

  // Bauzeit
  'baujahr-alt': (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  'baujahr-mittel': (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M9 14h6" />
    </>
  ),
  'baujahr-neu': (
    <>
      <rect x="5" y="6" width="14" height="14" rx="1.5" />
      <path d="M9 6V3h6v3M9 12h6" />
    </>
  ),
  'baujahr-neubau': (
    <>
      <rect x="5" y="6" width="14" height="14" rx="1.5" />
      <path d="M9 12h6M12 9v6" />
    </>
  ),

  // Sonstige Zustände
  gemischt: (
    <>
      <rect x="4" y="4" width="7" height="10" rx="1.5" />
      <path d="M4 20h16" />
      <path d="M14 16c0-1.5 2-1.5 2-3s-2-1.5-2-3" />
    </>
  ),
  waerme: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  kuehlen: (
    <>
      <path d="M12 3v18M4 7l16 10M20 7 4 17" />
    </>
  ),
  eigentum: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="m10 15 1.5 1.5L15 13" />
    </>
  ),
  miete: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M9 15h6" />
    </>
  ),
  euro: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M15 9a4 4 0 1 0 0 6M8 11h6M8 13h6" />
    </>
  ),
  fragezeichen: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9.5A2 2 0 1 1 12 12v1.5" />
      <path d="M12 17h.01" />
    </>
  ),
  sofort: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </>
  ),
  kalender: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 11h16" />
    </>
  ),
  uhr: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  haken: <path d="m5 13 4 4L19 7" />,
  ja: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.5 2.5L16 9.5" />
    </>
  ),
  nein: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 12h6" />
    </>
  ),
  // Standort der Heizung im Haus
  keller: (
    <>
      <path d="m3 10 9-6 9 6" />
      <path d="M5 10v10h14V10" />
      <rect x="8" y="15" width="8" height="5" />
    </>
  ),
  erdgeschoss: (
    <>
      <path d="m3 10 9-6 9 6" />
      <path d="M5 10v10h14V10" />
      <rect x="8" y="12" width="8" height="5" />
    </>
  ),
  dachgeschoss: (
    <>
      <path d="m3 12 9-8 9 8" />
      <path d="M6 12v8h12v-8" />
      <path d="M9 9h6" />
    </>
  ),
  anbau: (
    <>
      <path d="M4 20V9l6-5 6 5v11" />
      <rect x="16" y="13" width="4" height="7" />
    </>
  ),
  aussen: (
    <>
      <rect x="3" y="7" width="12" height="10" rx="2" />
      <circle cx="9" cy="12" r="3" />
      <path d="M18 9v6M21 7v10" />
    </>
  ),
};

export const PIKTOGRAMM_NAMEN = Object.keys(P) as PiktogrammName[];

export type PiktogrammProps = {
  name: PiktogrammName;
  className?: string;
  /** Kantenlänge in Pixeln. */
  groesse?: number;
};

/**
 * Rendert ein Piktogramm. Die Zeichen sind dekorativ; die Bedeutung steht immer
 * als Text daneben, deshalb `aria-hidden`.
 */
export default function Piktogramm({ name, className, groesse = 28 }: PiktogrammProps) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {P[name]}
    </svg>
  );
}
