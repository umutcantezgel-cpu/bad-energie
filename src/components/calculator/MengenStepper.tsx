'use client';

/** Mengenwahl fuer Positionen mit Einheit je Stueck, je lfm oder je Tank. */
import { Minus, Plus } from 'lucide-react';
import { EINHEIT_LABEL, type Einheit } from '@/lib/types';

export type MengenStepperProps = {
  wert: number;
  einheit: Einheit;
  min?: number;
  max?: number;
  schritt?: number;
  beschriftung: string;
  onChange: (wert: number) => void;
};

export default function MengenStepper({
  wert,
  einheit,
  min = 0,
  max = 999,
  schritt = 1,
  beschriftung,
  onChange,
}: MengenStepperProps) {
  const setze = (naechster: number) => {
    const begrenzt = Math.min(max, Math.max(min, Number.isFinite(naechster) ? naechster : min));
    onChange(Math.round(begrenzt * 100) / 100);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`${beschriftung} verringern`}
        onClick={() => setze(wert - schritt)}
        disabled={wert <= min}
        className="fokus-ring flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
      >
        <Minus aria-hidden className="h-5 w-5" />
      </button>
      <label className="flex flex-col items-center">
        <span className="sr-only">{beschriftung}</span>
        <input
          type="number"
          inputMode="decimal"
          value={wert}
          min={min}
          max={max}
          step={schritt}
          onChange={(e) => setze(Number(e.target.value))}
          className="glass-input h-14 w-20 rounded-2xl border border-slate-200 bg-white text-center text-base tabular-nums text-slate-900"
        />
      </label>
      <button
        type="button"
        aria-label={`${beschriftung} erhoehen`}
        onClick={() => setze(wert + schritt)}
        disabled={wert >= max}
        className="fokus-ring flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
      >
        <Plus aria-hidden className="h-5 w-5" />
      </button>
      <span className="text-sm text-slate-600">{EINHEIT_LABEL[einheit]}</span>
    </div>
  );
}
