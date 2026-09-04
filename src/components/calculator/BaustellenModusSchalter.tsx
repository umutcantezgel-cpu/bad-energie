'use client';

/**
 * Umschalter Baustellen-Modus. Setzt data-baustelle="on" am Wurzelelement; das
 * Stylesheet macht daraufhin alle Glasflaechen opak, vergroessert Schrift und Ziele.
 * Standard ist an bei grobem Zeiger und reduzierter Transparenz.
 */
import { useSyncExternalStore } from 'react';
import { HardHat } from 'lucide-react';
import { ansichtAbonnieren, ansichtLesen, ansichtServerLesen, ansichtSetzen } from './meister-utils';

export default function BaustellenModusSchalter() {
  const zustand = useSyncExternalStore(ansichtAbonnieren, ansichtLesen, ansichtServerLesen);
  const an = zustand.baustelle;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      onClick={() => ansichtSetzen({ baustelle: !an })}
      className={[
        'fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold',
        an ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-700',
      ].join(' ')}
    >
      <HardHat aria-hidden className="h-4 w-4" />
      {an ? 'Baustelle an' : 'Baustelle'}
    </button>
  );
}
