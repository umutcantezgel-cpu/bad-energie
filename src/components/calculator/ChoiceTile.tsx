'use client';
/**
 * Auswahlkachel des Konfigurators.
 * Einzelauswahl rendert als `radio` in einer `radiogroup`, Mehrfachauswahl als
 * `checkbox`. Große Touchziele, Piktogramm als Inline-SVG, Beschriftung immer
 * sichtbar; die Farbe allein trägt nie eine Bedeutung.
 */
import React from 'react';
import Piktogramm from './piktogramme';
import { gewerkStil, type GewerkFarbe } from './konfigurator-utils';
import type { PiktogrammName } from '@/lib/journeys/typen';

export type ChoiceTileProps = {
  titel: string;
  untertitel?: string;
  piktogramm: PiktogrammName;
  gewaehlt: boolean;
  mehrfach?: boolean;
  gewerk?: GewerkFarbe;
  deaktiviert?: boolean;
  /** Zusatzzeile unter dem Text, zum Beispiel ein Ausstellungspreis. */
  zusatz?: React.ReactNode;
  onSelect: () => void;
};

export default function ChoiceTile({
  titel,
  untertitel,
  piktogramm,
  gewaehlt,
  mehrfach = false,
  gewerk = 'wasser',
  deaktiviert = false,
  zusatz,
  onSelect,
}: ChoiceTileProps) {
  const rolle = mehrfach ? 'checkbox' : 'radio';

  return (
    <button
      type="button"
      role={rolle}
      aria-checked={gewaehlt}
      aria-disabled={deaktiviert || undefined}
      disabled={deaktiviert}
      onClick={onSelect}
      data-state={deaktiviert ? 'disabled' : gewaehlt ? 'selected' : undefined}
      style={gewerkStil(gewerk)}
      className="glass-tile fokus-ring flex min-h-[112px] w-full flex-col items-start gap-2 p-4 text-left sm:p-5"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{
          background: gewaehlt ? 'var(--gewerk-flaeche)' : 'var(--gewerk-tint)',
          color: gewaehlt ? '#FFFFFF' : 'var(--gewerk-text)',
        }}
      >
        <Piktogramm name={piktogramm} groesse={26} />
      </span>
      <span className="font-bold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
        {titel}
      </span>
      {untertitel ? (
        <span className="text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
          {untertitel}
        </span>
      ) : null}
      {zusatz ? <span className="mt-auto w-full">{zusatz}</span> : null}
    </button>
  );
}
