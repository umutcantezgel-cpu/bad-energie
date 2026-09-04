'use client';

/**
 * Umschalter Kundenansicht. Der Zustand liegt modulweit (meister-utils) und in
 * localStorage unter "be-kundenansicht"; Standard ist an auf Touchgeraeten unter 1280 px.
 * Bei aktiver Kundenansicht traegt die Oberflaeche eine blaue Kopfleiste und eine Pille,
 * damit vor dem Kunden nie unklar ist, welche Ansicht laeuft.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  ansichtAbonnieren,
  ansichtInitialisieren,
  ansichtLesen,
  ansichtServerLesen,
  ansichtSetzen,
} from './meister-utils';

export default function KundenansichtSchalter() {
  const zustand = useSyncExternalStore(ansichtAbonnieren, ansichtLesen, ansichtServerLesen);

  useEffect(() => {
    ansichtInitialisieren();
  }, []);

  const an = zustand.kundenansicht;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      onClick={() => ansichtSetzen({ kundenansicht: !an })}
      className={[
        'fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold',
        an ? 'bg-[color:var(--modul-blau,#1B3A8C)] text-white' : 'bg-white/80 text-slate-700',
      ].join(' ')}
    >
      {an ? <Eye aria-hidden className="h-4 w-4" /> : <EyeOff aria-hidden className="h-4 w-4" />}
      {an ? 'Kundenansicht aktiv' : 'Kundenansicht'}
    </button>
  );
}
