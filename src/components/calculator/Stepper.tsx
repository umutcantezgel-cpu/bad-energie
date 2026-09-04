'use client';
/**
 * Fortschrittsanzeige des Kunden-Modus.
 * Zeigt "Schritt X von N" und auf dem ersten Schritt zusätzlich die Dauer.
 */
import React from 'react';

export type StepperProps = {
  schritt: number;
  anzahl: number;
  /** Beschriftung des aktuellen Schritts, wird vorgelesen. */
  titel: string;
  dauerHinweis?: string;
};

export default function Stepper({ schritt, anzahl, titel, dauerHinweis = 'etwa 2 Minuten' }: StepperProps) {
  const nummer = schritt + 1;
  const anteil = Math.round((nummer / anzahl) * 100);
  const text = `Schritt ${nummer} von ${anzahl} · ${dauerHinweis}`;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[color:var(--modul-blau)] font-bold" style={{ fontSize: 'var(--font-size-sm)' }}>
          Schritt {nummer} von {anzahl}
          <span className="text-slate-500 font-medium"> · {dauerHinweis}</span>
        </p>
        <p className="text-slate-500 font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>
          {titel}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={anzahl}
        aria-valuenow={nummer}
        aria-valuetext={text}
        aria-label="Fortschritt im Konfigurator"
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${anteil}%`,
            background: 'linear-gradient(90deg, var(--modul-blau) 0%, #0A1556 100%)',
            transition: 'width var(--duration-slow) var(--ease-house)',
          }}
        />
      </div>
    </div>
  );
}
