'use client';

/**
 * Entwurfs- und Freigabeliste (Plan 4.11).
 *
 * Je Karte: KS-Nummer, Kunde, Vorhaben, Bruttospanne oder Blockade, Warnungen,
 * Faelligkeit und die Freigabewege. "Freigeben und sofort senden" erscheint nur,
 * wenn die Rolle das erlaubt. Beide Wege laufen ueber ein Bestaetigungs-Sheet.
 */
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, PenLine, Send, Trash2 } from 'lucide-react';
import { euro } from '@/lib/services/calculation';
import type { EntwurfKarte } from '@/lib/types';
import { anhangName } from './meister-utils';

export type EntwurfsListeProps = {
  karten: EntwurfKarte[];
  online: boolean;
  laufendeId: string | null;
  meldung: string;
  onFreigeben: (anfrageId: string, sofort: boolean) => void;
  onStornieren: (anfrageId: string) => void;
};

type Bestaetigung = { anfrageId: string; art: 'freigabe' | 'sofort' | 'storno' };

function faelligText(faelligAm: string | null): string {
  if (!faelligAm) return 'noch nicht freigegeben';
  const datum = new Date(faelligAm);
  if (Number.isNaN(datum.getTime())) return faelligAm;
  return `faellig ${datum.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

export default function EntwurfsListe({
  karten,
  online,
  laufendeId,
  meldung,
  onFreigeben,
  onStornieren,
}: EntwurfsListeProps) {
  const [bestaetigung, setBestaetigung] = useState<Bestaetigung | null>(null);
  const gewaehlt = karten.find((k) => k.anfrageId === bestaetigung?.anfrageId) ?? null;

  if (!karten.length) {
    return <p className="rounded-3xl bg-white/80 p-6 text-base text-slate-700">Nichts zur Freigabe offen.</p>;
  }

  return (
    <div>
      {meldung ? (
        <p aria-live="polite" className="mb-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-800">
          {meldung}
        </p>
      ) : null}

      <ul className="space-y-4">
        {karten.map((karte) => {
          const blockiert = karte.hinweise.length > 0 || karte.bruttoVon === null || karte.bruttoBis === null;
          const laeuft = laufendeId === karte.anfrageId;
          return (
            <li
              key={karte.anfrageId}
              className="glass-tile rounded-3xl border border-white/70 p-5"
              style={{ borderLeft: `4px solid ${blockiert ? '#B42318' : '#16A34A'}` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {karte.ksNummer} · {karte.kunde}
                </h2>
                <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                  <Clock aria-hidden className="h-4 w-4" />
                  {faelligText(karte.faelligAm)}
                </span>
              </div>
              <p className="mt-1 text-base text-slate-700">{karte.vorhaben}</p>

              <p className="mt-2 text-base font-medium tabular-nums text-slate-900">
                {blockiert ? (
                  <span className="text-[#B42318]">blockiert</span>
                ) : (
                  <>
                    {euro(karte.bruttoVon)} bis {euro(karte.bruttoBis)} Euro brutto
                  </>
                )}
              </p>

              {karte.hinweise.length ? (
                <ul className="mt-2 space-y-1 rounded-2xl bg-[#FEF3F2] p-3 text-sm text-[#B42318]">
                  {karte.hinweise.map((h, i) => (
                    <li key={`${h.code}-${i}`}>{h.text}</li>
                  ))}
                </ul>
              ) : null}

              {karte.warnungen.length ? (
                <ul className="mt-2 space-y-1 rounded-2xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">
                  {karte.warnungen.map((w, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <AlertTriangle aria-hidden className="h-4 w-4" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={blockiert || laeuft}
                  onClick={() => setBestaetigung({ anfrageId: karte.anfrageId, art: 'freigabe' })}
                  className="fokus-ring inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-base font-semibold text-white disabled:opacity-50"
                >
                  Freigeben (18:00)
                </button>
                {karte.darfFreigeben ? (
                  <button
                    type="button"
                    disabled={blockiert || laeuft || !online}
                    onClick={() => setBestaetigung({ anfrageId: karte.anfrageId, art: 'sofort' })}
                    className="fokus-ring inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white disabled:opacity-50"
                  >
                    <Send aria-hidden className="h-5 w-5" />
                    Freigeben und sofort senden
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={laeuft}
                  onClick={() => setBestaetigung({ anfrageId: karte.anfrageId, art: 'storno' })}
                  className="fokus-ring inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-white px-5 text-base font-semibold text-[#B42318] disabled:opacity-50"
                >
                  <Trash2 aria-hidden className="h-5 w-5" />
                  Stornieren
                </button>
                <Link
                  href={`/intern/konfigurator/${karte.anfrageId}`}
                  className="fokus-ring inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-white px-5 text-base font-semibold text-slate-700"
                >
                  <PenLine aria-hidden className="h-5 w-5" />
                  Bearbeiten
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {bestaetigung && gewaehlt ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Freigabe bestaetigen"
            className="glass-sheet w-full max-w-lg rounded-t-3xl border border-white/70 bg-white/95 p-6 sm:rounded-3xl"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {bestaetigung.art === 'storno' ? 'Wirklich stornieren?' : 'Freigabe bestaetigen'}
            </h2>
            <p className="mt-2 text-base text-slate-700">
              {gewaehlt.ksNummer} · {gewaehlt.kunde} · {gewaehlt.vorhaben}
            </p>
            {bestaetigung.art !== 'storno' ? (
              <p className="mt-2 text-base text-slate-700">
                Anhang {anhangName(gewaehlt.ksNummer)}.{' '}
                {bestaetigung.art === 'sofort'
                  ? 'Die Mail geht sofort raus.'
                  : 'Der Versand laeuft heute um 18:00, sonst sofort.'}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (bestaetigung.art === 'storno') onStornieren(bestaetigung.anfrageId);
                  else onFreigeben(bestaetigung.anfrageId, bestaetigung.art === 'sofort');
                  setBestaetigung(null);
                }}
                className="fokus-ring inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white"
              >
                Ja, ausfuehren
              </button>
              <button
                type="button"
                onClick={() => setBestaetigung(null)}
                className="fokus-ring inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-white px-6 text-base font-semibold text-slate-700"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
