'use client';

import { useState } from 'react';
import type { TokenSeiteDTO } from '@/lib/types';
import { bestaetigeTermin } from './actions';

export default function BestaetigenFormular({
  dto,
  token,
}: {
  dto: TokenSeiteDTO;
  token: string;
}) {
  const [fertig, setFertig] = useState(dto.eingeloest);
  const [ausgewaehlt, setAusgewaehlt] = useState(dto.fenster[0]?.id || '');
  const [alternativ, setAlternativ] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState('');

  if (fertig) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ihr Termin ist notiert!</h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Vielen Dank für Ihre Rückmeldung. Wir haben den Termin in unserem Kalender reserviert und freuen uns auf das Kennenlernen vor Ort.
        </p>
      </div>
    );
  }

  async function handleBestaetigen(e: React.FormEvent) {
    e.preventDefault();
    setFehler('');
    setLaeuft(true);
    try {
      const res = await bestaetigeTermin(token, ausgewaehlt, alternativ);
      if (res.ok) {
        setFertig(true);
      } else {
        setFehler(res.fehler || 'Fehler beim Bestätigen.');
      }
    } catch {
      setFehler('Ein Netzwerkfehler ist aufgetreten.');
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <form onSubmit={handleBestaetigen} className="space-y-6">
      {dto.fenster.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-800 mb-2">
            Vorgeschlagene Termine
          </legend>
          {dto.fenster.map((f) => {
            const aktiv = ausgewaehlt === f.id;
            return (
              <label
                key={f.id}
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  aktiv
                    ? 'border-[color:var(--modul-blau,#1B3A8C)] bg-blue-50/50 ring-2 ring-[color:var(--modul-blau,#1B3A8C)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="fenster"
                  value={f.id}
                  checked={aktiv}
                  onChange={() => setAusgewaehlt(f.id)}
                  className="w-4 h-4 text-[color:var(--modul-blau,#1B3A8C)]"
                />
                <span className="text-sm sm:text-base font-medium text-slate-900">
                  {f.beschriftung}
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      <label className="block">
        <span className="block text-sm font-medium text-slate-700 mb-1">
          Anderer Termin oder Hinweis (optional)
        </span>
        <textarea
          rows={3}
          value={alternativ}
          onChange={(e) => setAlternativ(e.target.value)}
          placeholder="Falls keiner der Termine passt oder Sie uns vorab etwas mitteilen möchten..."
          className="glass-input w-full p-3.5 rounded-2xl border border-slate-200 text-sm text-slate-900"
          maxLength={300}
        />
      </label>

      {fehler ? (
        <p role="alert" className="p-3 rounded-2xl bg-[#FEF3F2] text-xs sm:text-sm font-medium text-[#B42318]">
          {fehler}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={laeuft}
        className="fokus-ring min-h-[56px] w-full rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base sm:text-lg font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {laeuft ? 'Wird übermittelt...' : 'Termin bestätigen'}
      </button>
    </form>
  );
}
