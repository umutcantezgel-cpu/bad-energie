'use client';
/**
 * Regler mit Wertkachel und Rasten.
 * Der Wert rastet auf die vorgegebenen Größen ein, damit Bild und
 * Ausstellungspreis zur Auswahl passen.
 */
import React, { useId } from 'react';
import { raste, zahl } from './konfigurator-utils';

export type RangeFieldProps = {
  label: string;
  beschreibung?: string;
  wert: number;
  min: number;
  max: number;
  schritt: number;
  einheit: string;
  rasten?: number[];
  nachkommastellen?: number;
  onChange: (wert: number) => void;
};

export default function RangeField({
  label,
  beschreibung,
  wert,
  min,
  max,
  schritt,
  einheit,
  rasten,
  nachkommastellen = 0,
  onChange,
}: RangeFieldProps) {
  const id = useId();
  const anzeige = `${zahl(wert, nachkommastellen)} ${einheit}`;
  const anteil = ((wert - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label htmlFor={id} className="font-bold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
          {label}
        </label>
        <output
          htmlFor={id}
          className="glass-tile zahl-tabellarisch px-4 py-2 font-bold text-[color:var(--modul-blau)]"
          style={{ fontSize: 'var(--font-size-lg)', borderRadius: 'var(--radius-lg)' }}
        >
          {anzeige}
        </output>
      </div>
      {beschreibung ? (
        <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
          {beschreibung}
        </p>
      ) : null}

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={schritt}
        value={wert}
        onChange={(e) => onChange(raste(Number(e.target.value), rasten))}
        aria-valuetext={anzeige}
        className="fokus-ring mt-4 h-11 w-full cursor-pointer appearance-none bg-transparent"
        style={{
          background: `linear-gradient(90deg, var(--modul-blau) ${anteil}%, #E2E8F0 ${anteil}%)`,
          borderRadius: '9999px',
          height: '12px',
        }}
      />

      {rasten && rasten.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {rasten.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange(r)}
              aria-pressed={Math.abs(r - wert) < 0.05}
              className="fokus-ring rounded-full border px-3 py-2 font-semibold"
              style={{
                fontSize: 'var(--font-size-sm)',
                minHeight: '44px',
                borderColor: Math.abs(r - wert) < 0.05 ? 'var(--modul-blau)' : 'var(--color-border-strong)',
                background: Math.abs(r - wert) < 0.05 ? 'var(--gewerk-wasser-tint)' : '#FFFFFF',
                color: Math.abs(r - wert) < 0.05 ? 'var(--modul-blau)' : '#334155',
              }}
            >
              {zahl(r, nachkommastellen)} {einheit}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex justify-between text-slate-500" style={{ fontSize: 'var(--font-size-sm)' }}>
        <span>
          {zahl(min, nachkommastellen)} {einheit}
        </span>
        <span>
          {zahl(max, nachkommastellen)} {einheit}
        </span>
      </div>
    </div>
  );
}
