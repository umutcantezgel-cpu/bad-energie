'use client';

/** Zuschlagsposition als Schalter mit optionaler Menge (Oeltank, Zaehlerschrank, Vorwand, ...). */
import { euro } from '@/lib/services/calculation';
import type { Baustein, Position } from '@/lib/types';
import MengenStepper from './MengenStepper';
import { GEWERK_MODUL_FARBE } from './meister-utils';

export type ZuschlagToggleProps = {
  baustein: Baustein;
  position: Position | null;
  kundenansicht: boolean;
  onUmschalten: (an: boolean) => void;
  onMenge: (menge: number) => void;
};

export default function ZuschlagToggle({ baustein, position, kundenansicht, onUmschalten, onMenge }: ZuschlagToggleProps) {
  const an = Boolean(position?.aktiv);
  const spanne = baustein.spanne;
  const blockiert = an && !spanne;

  return (
    <li className="glass-tile flex flex-col gap-3 rounded-2xl border border-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        role="switch"
        aria-checked={an}
        onClick={() => onUmschalten(!an)}
        className="fokus-ring flex min-h-[56px] flex-1 items-center gap-3 rounded-2xl text-left"
      >
        <span
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: GEWERK_MODUL_FARBE[baustein.gewerk] }}
        />
        <span className="flex-1">
          <span className="block text-base font-semibold text-slate-900">{baustein.titel}</span>
          {!kundenansicht && spanne ? (
            <span className="block text-sm tabular-nums text-slate-600">
              {euro(spanne.von)} bis {euro(spanne.bis)} Euro netto
            </span>
          ) : null}
          {blockiert ? (
            <span className="block text-sm font-medium text-[#B42318]">
              Matrixzeile {baustein.matrixNr ?? '?'} fehlt
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${an ? 'bg-[color:var(--modul-blau,#1B3A8C)]' : 'bg-slate-300'}`}
        >
          <span className={`h-6 w-6 rounded-full bg-white transition-transform ${an ? 'translate-x-6' : ''}`} />
        </span>
      </button>
      {an && baustein.einheit !== 'pauschal' ? (
        <MengenStepper
          wert={position?.menge ?? baustein.mengeDefault}
          einheit={baustein.einheit}
          beschriftung={`Menge fuer ${baustein.titel}`}
          onChange={onMenge}
        />
      ) : null}
    </li>
  );
}
