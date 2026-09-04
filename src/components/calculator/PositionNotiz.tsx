'use client';

/**
 * Notizfeld je Position. Der Text bleibt intern: er erscheint nie im Kunden-PDF,
 * nie in einer Kundenmail und wird in der Kundenansicht vollstaendig aus dem DOM entfernt.
 * Diktat laeuft ueber die Tastatur des Geraets, nicht ueber die Web Speech API.
 */
import { useId } from 'react';
import { Lock } from 'lucide-react';

export type PositionNotizProps = {
  wert: string;
  beschriftung?: string;
  onChange: (wert: string) => void;
};

export default function PositionNotiz({ wert, beschriftung = 'Notiz zu dieser Position', onChange }: PositionNotizProps) {
  const id = useId();
  return (
    <div className="mt-3">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {beschriftung}
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[13px] font-normal text-slate-600">
          <Lock aria-hidden className="h-3.5 w-3.5" />
          bleibt intern
        </span>
      </label>
      <textarea
        id={id}
        value={wert}
        rows={2}
        maxLength={1000}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Diktieren oder tippen. Bleibt im Haus."
        className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 p-3 text-base text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}
