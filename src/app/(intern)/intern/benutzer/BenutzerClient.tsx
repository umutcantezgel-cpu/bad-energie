'use client';

import { useState } from 'react';
import type { BenutzerEintrag } from './page-types';
import type { Rolle } from '@/lib/types';
import { legeBenutzerAn, setzePinNeu, toggleBenutzerAktiv } from './actions';

export default function BenutzerClient({
  initialBenutzer,
}: {
  initialBenutzer: BenutzerEintrag[];
}) {
  const [benutzer, setBenutzer] = useState<BenutzerEintrag[]>(initialBenutzer);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [rolle, setRolle] = useState<Rolle>('bauleiter');
  const [funktion, setFunktion] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);

  async function handleAnlegen(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !pin.trim()) {
      alert('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }
    setLaeuft(true);
    setMeldung(null);
    const res = await legeBenutzerAn(name, email, pin, rolle, funktion);
    if (res.ok) {
      setMeldung(`Benutzer ${name} erfolgreich angelegt.`);
      setName('');
      setEmail('');
      setPin('');
      setFunktion('');
    } else {
      alert(res.fehler || 'Fehler beim Anlegen.');
    }
    setLaeuft(false);
  }

  async function handlePinReset(id: string, benutzerName: string) {
    const neuePin = prompt(`Neue 6- bis 8-stellige PIN für ${benutzerName} eingeben:`);
    if (!neuePin) return;
    if (!/^\d{6,8}$/.test(neuePin)) {
      alert('Die PIN muss aus genau 6 bis 8 Ziffern bestehen.');
      return;
    }
    setLaeuft(true);
    const res = await setzePinNeu(id, neuePin);
    if (res.ok) {
      setMeldung(`PIN für ${benutzerName} erfolgreich geändert.`);
    } else {
      alert(res.fehler || 'Fehler beim Setzen der PIN.');
    }
    setLaeuft(false);
  }

  async function handleToggleAktiv(id: string, aktuellAktiv: boolean) {
    setLaeuft(true);
    const res = await toggleBenutzerAktiv(id, !aktuellAktiv);
    if (res.ok) {
      setBenutzer((prev) =>
        prev.map((b) => (b.id === id ? { ...b, aktiv: !aktuellAktiv } : b)),
      );
    } else {
      alert(res.fehler || 'Fehler beim Ändern des Status.');
    }
    setLaeuft(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Benutzerverwaltung</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Zugänge für Chef, Bauleiter und Büro. Deaktivieren widerruft sofort alle aktiven Sitzungen des Benutzers.
        </p>
      </header>

      {meldung ? (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-medium">
          {meldung}
        </div>
      ) : null}

      {/* Liste der Benutzer */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Aktive Konten ({benutzer.length})</h2>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              <tr>
                <th className="py-3 px-4">Name &amp; Funktion</th>
                <th className="py-3 px-4">E-Mail</th>
                <th className="py-3 px-4">Rolle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benutzer.map((b) => (
                <tr key={b.id} className={b.aktiv ? 'hover:bg-slate-50/70' : 'opacity-50 bg-slate-50/40'}>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.funktion}</p>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-700">{b.email}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {b.rolle}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {b.aktiv ? (
                      <span className="text-emerald-700 font-semibold">Aktiv</span>
                    ) : (
                      <span className="text-red-700 font-semibold">Deaktiviert</span>
                    )}
                    {b.gesperrtBis && (
                      <span className="block text-[11px] text-amber-700 font-medium">
                        Gesperrt bis {new Date(b.gesperrtBis).toLocaleTimeString('de-DE')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-3">
                    <button
                      type="button"
                      disabled={laeuft}
                      onClick={() => handlePinReset(b.id, b.name)}
                      className="text-xs font-semibold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
                    >
                      PIN neu
                    </button>
                    <button
                      type="button"
                      disabled={laeuft}
                      onClick={() => handleToggleAktiv(b.id, b.aktiv)}
                      className={`text-xs font-semibold ${
                        b.aktiv ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'
                      }`}
                    >
                      {b.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Neuen Benutzer anlegen */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 max-w-xl">
        <h2 className="text-lg font-bold text-slate-900">Neuen Mitarbeiter anlegen</h2>

        <form onSubmit={handleAnlegen} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vollständiger Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Max Mustermann"
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@bad-energie.de"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN (6-8 Ziffern)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{6,8}"
                minLength={6}
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="123456"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm tracking-widest tabular-nums font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rolle</label>
              <select
                value={rolle}
                onChange={(e) => setRolle(e.target.value as Rolle)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                <option value="bauleiter">Bauleiter (nur eigene Anfragen freigeben)</option>
                <option value="buero">Büro (Vorbereitung, keine Freigabe)</option>
                <option value="chef">Chef (Geschäftsführer, darf alles)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Funktion / Titel</label>
              <input
                type="text"
                value={funktion}
                onChange={(e) => setFunktion(e.target.value)}
                placeholder="z. B. Bauleiter Sanitär"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={laeuft}
            className="fokus-ring min-h-[44px] rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-bold text-white shadow-sm"
          >
            Mitarbeiter speichern
          </button>
        </form>
      </section>
    </div>
  );
}
