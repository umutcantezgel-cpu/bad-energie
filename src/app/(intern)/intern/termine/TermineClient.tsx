'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TerminfensterEintrag } from './page-types';
import { erstelleTerminfenster, loescheTerminfenster } from './actions';

/** Zeitraum eines Fensters; geseedete Fenster tragen nur die Beschriftung und keine Uhrzeit. */
function zeitraumText(beginn: string | null | undefined, ende: string | null | undefined): string {
  const von = beginn ? new Date(beginn) : null;
  const bis = ende ? new Date(ende) : null;
  if (!von || Number.isNaN(von.getTime())) return 'Zeit nach Beschriftung';
  const datum = von.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  if (!bis || Number.isNaN(bis.getTime())) return datum;
  return `${datum} – ${bis.toLocaleTimeString('de-DE', { timeStyle: 'short' })}`;
}

export default function TermineClient({
  initialEintraege,
}: {
  initialEintraege: TerminfensterEintrag[];
}) {
  const [eintraege, setEintraege] = useState(initialEintraege);
  const [beschriftung, setBeschriftung] = useState('');
  const [beginn, setBeginn] = useState('');
  const [ende, setEnde] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);

  async function handleAnlegen(e: React.FormEvent) {
    e.preventDefault();
    if (!beschriftung.trim() || !beginn || !ende) {
      alert('Bitte alle Felder ausfüllen.');
      return;
    }
    setLaeuft(true);
    setMeldung(null);
    const res = await erstelleTerminfenster(beschriftung, new Date(beginn).toISOString(), new Date(ende).toISOString());
    if (res.ok) {
      setMeldung('Terminfenster erfolgreich angelegt.');
      setBeschriftung('');
      setBeginn('');
      setEnde('');
      // Aktualisierung über Router-Refresh oder Revalidate
    } else {
      alert(res.fehler || 'Fehler beim Anlegen.');
    }
    setLaeuft(false);
  }

  async function handleLoeschen(id: string) {
    if (!confirm('Soll dieses Terminfenster wirklich gelöscht werden?')) return;
    setLaeuft(true);
    const res = await loescheTerminfenster(id);
    if (res.ok) {
      setEintraege((prev) => prev.filter((e) => e.id !== id));
    } else {
      alert(res.fehler || 'Fehler beim Löschen.');
    }
    setLaeuft(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Terminfenster-Verwaltung</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Diese Fenster stehen dem Meister und den Kunden als Terminvorschläge zur Verfügung. Jedes Fenster kann für höchstens eine offene Anfrage reserviert werden (Regel 6).
        </p>
      </header>

      {meldung ? (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-medium">
          {meldung}
        </div>
      ) : null}

      {/* Liste der Fenster */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Aktive Fenster ({eintraege.length})</h2>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              <tr>
                <th className="py-3 px-4">Beschriftung (Kundenansicht)</th>
                <th className="py-3 px-4">Zeitraum</th>
                <th className="py-3 px-4">Status / Reservierung</th>
                <th className="py-3 px-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eintraege.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-500">
                    Keine Terminfenster angelegt. Bitte neue Fenster unten eintragen.
                  </td>
                </tr>
              ) : (
                eintraege.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{f.beschriftung}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {zeitraumText(f.beginn, f.ende)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {f.reserviertFuerKsNummer ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 font-bold text-amber-800">
                          Reserviert für{' '}
                          {f.reserviertFuerAnfrageId ? (
                            <Link
                              href={`/intern/anfragen/${f.reserviertFuerAnfrageId}`}
                              className="underline"
                            >
                              {f.reserviertFuerKsNummer}
                            </Link>
                          ) : (
                            <span>einen anderen Vorgang</span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                          Frei
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={laeuft}
                        onClick={() => handleLoeschen(f.id)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Neues Fenster anlegen */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 max-w-xl">
        <h2 className="text-lg font-bold text-slate-900">Neues Terminfenster anlegen</h2>

        <form onSubmit={handleAnlegen} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Beschriftung für Kunden
            </label>
            <input
              type="text"
              value={beschriftung}
              onChange={(e) => setBeschriftung(e.target.value)}
              placeholder="z. B. Mittwoch, 10. September, ab 9 Uhr"
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Beginn</label>
              <input
                type="datetime-local"
                value={beginn}
                onChange={(e) => setBeginn(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ende</label>
              <input
                type="datetime-local"
                value={ende}
                onChange={(e) => setEnde(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={laeuft}
            className="fokus-ring min-h-[44px] rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-bold text-white shadow-sm"
          >
            Fenster speichern
          </button>
        </form>
      </section>
    </div>
  );
}
