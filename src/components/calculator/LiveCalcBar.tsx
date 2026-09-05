'use client';

/**
 * Live-Kalkulationsleiste des Meister-Modus (sticky unten) und das Sync-Badge der Toolbar.
 *
 * In der Kundenansicht werden Nettobetraege nicht gerendert, also aus dem DOM entfernt.
 * Sichtbar bleiben Bruttospanne und Foerderzuschuss. Die Leiste meldet Aenderungen
 * ueber aria-live an Screenreader.
 */
import { useSyncExternalStore } from 'react';
import { AlertTriangle, CloudOff, RefreshCw, Check } from 'lucide-react';
import { euro } from '@/lib/services/calculation';
import type { KalkulationsErgebnis } from '@/lib/types';
import { syncAbonnieren, syncLesen, syncServerLesen, syncText } from './entwurfSpeicher';

export type LiveCalcBarProps = {
  ergebnis: KalkulationsErgebnis;
  kundenansicht: boolean;
  /** Betriebskosten mit Wärmepumpe je Monat und Ersparnis je Jahr (null ohne Daten). */
  betriebskosten?: { proMonat: number; ersparnisJahr: number | null } | null;
  onSprungZuBlockierter?: () => void;
};

export default function LiveCalcBar({ ergebnis, kundenansicht, betriebskosten, onSprungZuBlockierter }: LiveCalcBarProps) {
  const aktive = ergebnis.positionen.filter((p) => !p.blockiert && p.von !== null).length;
  const blockierte = ergebnis.positionen.filter((p) => p.blockiert).length;

  return (
    <div className="glass-bar-dark sticky bottom-0 z-30 mt-8 rounded-t-3xl border-t border-white/20 bg-slate-900/85 px-4 py-3 text-white backdrop-blur-xl">
      <div aria-live="polite" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {!kundenansicht ? (
          <span className="tabular-nums">
            <span className="block text-[13px] uppercase tracking-wide text-white/70">Netto</span>
            {euro(ergebnis.nettoVon)} bis {euro(ergebnis.nettoBis)} Euro
          </span>
        ) : null}
        <span className="tabular-nums">
          <span className="block text-[13px] uppercase tracking-wide text-white/70">Brutto</span>
          {euro(ergebnis.bruttoVon)} bis {euro(ergebnis.bruttoBis)} Euro
        </span>
        {ergebnis.foerderung ? (
          <span className="tabular-nums text-[color:var(--modul-gold,#F0C000)]">
            <span className="block text-[13px] uppercase tracking-wide text-white/70">Foerderzuschuss</span>
            {euro(ergebnis.foerderung.zuschuss)} Euro ({ergebnis.foerderung.satz} Prozent)
          </span>
        ) : null}
        {ergebnis.foerderung ? (
          <span className="tabular-nums">
            <span className="block text-[13px] uppercase tracking-wide text-white/70">Eigenanteil</span>
            {euro(ergebnis.foerderung.eigenanteilVon)} bis {euro(ergebnis.foerderung.eigenanteilBis)} Euro
          </span>
        ) : null}
        {betriebskosten ? (
          <span className="tabular-nums">
            <span className="block text-[13px] uppercase tracking-wide text-white/70">Betrieb</span>
            etwa {euro(betriebskosten.proMonat)} Euro im Monat
            {betriebskosten.ersparnisJahr !== null && betriebskosten.ersparnisJahr > 0 ? ` (spart ${euro(betriebskosten.ersparnisJahr)} im Jahr)` : ''}
          </span>
        ) : null}
        <span className="tabular-nums">
          <span className="block text-[13px] uppercase tracking-wide text-white/70">Positionen</span>
          {aktive} aktiv
        </span>
        {blockierte > 0 ? (
          <button
            type="button"
            onClick={onSprungZuBlockierter}
            className="fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#B42318] px-4 font-semibold text-white"
          >
            <AlertTriangle aria-hidden className="h-4 w-4" />
            {blockierte} blockiert, zur ersten Kachel
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Sync-Badge der Intern-Toolbar. Liest den modulweiten Autosave-Zustand. */
export function SyncBadge() {
  const zustand = useSyncExternalStore(syncAbonnieren, syncLesen, syncServerLesen);
  const text = syncText(zustand);
  const symbol =
    zustand.status === 'offline' ? (
      <CloudOff aria-hidden className="h-4 w-4" />
    ) : zustand.status === 'sendet' ? (
      <RefreshCw aria-hidden className="h-4 w-4 animate-spin" />
    ) : zustand.status === 'fehler' ? (
      <AlertTriangle aria-hidden className="h-4 w-4" />
    ) : (
      <Check aria-hidden className="h-4 w-4" />
    );
  const farbe =
    zustand.status === 'offline' || zustand.status === 'fehler'
      ? 'bg-[#FEF3F2] text-[#B42318]'
      : zustand.status === 'sendet'
        ? 'bg-slate-100 text-slate-700'
        : 'bg-[#ECFDF3] text-[#15803D]';

  return (
    <span
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${farbe}`}
    >
      {symbol}
      {text}
    </span>
  );
}
