'use client';

/**
 * Bestaetigungs-Sheet vor dem Sofortversand. Zeigt Empfaenger, Pflichtnamen des
 * Anhangs und die Bruttospanne. Ohne Netz ist der Versand gesperrt und erklaert.
 */
import { useEffect, useRef } from 'react';
import { AlertTriangle, Send, X } from 'lucide-react';
import { euro } from '@/lib/services/calculation';

export type AbschlussSheetProps = {
  offen: boolean;
  empfaenger: string;
  anhangname: string;
  bruttoVon: number;
  bruttoBis: number;
  fehlendeAngaben: string[];
  online: boolean;
  laeuft: boolean;
  rueckmeldung: string;
  onSenden: () => void;
  onSchliessen: () => void;
};

export default function AbschlussSheet({
  offen,
  empfaenger,
  anhangname,
  bruttoVon,
  bruttoBis,
  fehlendeAngaben,
  online,
  laeuft,
  rueckmeldung,
  onSenden,
  onSchliessen,
}: AbschlussSheetProps) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!offen) return;
    box.current?.focus();
    const beiTaste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSchliessen();
    };
    document.addEventListener('keydown', beiTaste);
    return () => document.removeEventListener('keydown', beiTaste);
  }, [offen, onSchliessen]);

  if (!offen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-6">
      <div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Kostenschaetzung sofort senden"
        className="glass-sheet w-full max-w-xl rounded-t-3xl border border-white/70 bg-white/95 p-6 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Sofort senden</h2>
          <button
            type="button"
            aria-label="Schliessen"
            onClick={onSchliessen}
            className="fokus-ring flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-4 space-y-3 text-base">
          <div>
            <dt className="text-sm text-slate-600">Empfaenger</dt>
            <dd className="font-medium text-slate-900">{empfaenger || 'noch offen'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Anhang</dt>
            <dd className="font-medium text-slate-900">{anhangname}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Bruttospanne</dt>
            <dd className="font-medium tabular-nums text-slate-900">
              {euro(bruttoVon)} bis {euro(bruttoBis)} Euro
            </dd>
          </div>
        </dl>

        {fehlendeAngaben.length ? (
          <div className="mt-4 rounded-2xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle aria-hidden className="h-4 w-4" /> Fehlende Angaben
            </p>
            <p>{fehlendeAngaben.join(', ')}</p>
          </div>
        ) : null}

        {!online ? (
          <p className="mt-4 rounded-2xl bg-[#FEF3F2] p-3 text-sm text-[#B42318]">
            Ohne Netz kann nichts versendet werden. Der Entwurf bleibt auf dem Geraet und geht bei Verbindung raus.
          </p>
        ) : null}

        {rueckmeldung ? (
          <p aria-live="polite" className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-800">
            {rueckmeldung}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSenden}
            disabled={!online || laeuft || !empfaenger}
            className="fokus-ring inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white disabled:opacity-50"
          >
            <Send aria-hidden className="h-5 w-5" />
            {laeuft ? 'Wird gesendet' : 'Jetzt senden'}
          </button>
          <button
            type="button"
            onClick={onSchliessen}
            className="fokus-ring inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-white px-6 text-base font-semibold text-slate-700"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
