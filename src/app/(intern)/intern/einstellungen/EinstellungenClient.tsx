'use client';

import { useState } from 'react';
import type { Einstellungen } from '@/lib/services/kalkulationsdaten';
import type { BetriebskostenEinstellungen } from '@/lib/types';
import { speichereEinstellungen } from './actions';

/** Felder des Betriebskostenvergleichs in der Reihenfolge, in der der Chef rechnet. */
const BETRIEBSKOSTEN_FELDER: {
  feld: keyof BetriebskostenEinstellungen;
  label: string;
  schritt: number;
}[] = [
  { feld: 'gasCtKwh', label: 'Gaspreis (ct je kWh)', schritt: 0.1 },
  { feld: 'oelCtLiter', label: 'Heizölpreis (ct je Liter)', schritt: 1 },
  { feld: 'stromCtKwh', label: 'Strompreis (ct je kWh)', schritt: 0.1 },
  { feld: 'wpStromCtKwh', label: 'Wärmepumpenstrom (ct je kWh)', schritt: 0.1 },
  { feld: 'jazStandard', label: 'Jahresarbeitszahl', schritt: 0.1 },
  { feld: 'pvEigenanteilProzent', label: 'PV-Eigenanteil (%)', schritt: 1 },
  { feld: 'pelletsCtKg', label: 'Pelletspreis (ct je kg)', schritt: 0.1 },
  { feld: 'holzEurM3', label: 'Holzpreis (Euro je m³)', schritt: 1 },
];

export default function EinstellungenClient({
  initialEinstellungen,
  istChef,
}: {
  initialEinstellungen: Einstellungen;
  istChef: boolean;
}) {
  const [einst, setEinst] = useState<Einstellungen>(initialEinstellungen);
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  function setzeBetriebskosten(feld: keyof BetriebskostenEinstellungen, wert: string) {
    const zahl = Number(wert);
    setEinst({
      ...einst,
      betriebskosten: {
        ...einst.betriebskosten,
        [feld]: Number.isFinite(zahl) ? zahl : einst.betriebskosten[feld],
      },
    });
  }

  async function handleSpeichern(e: React.FormEvent) {
    e.preventDefault();
    if (!istChef) return;
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    try {
      const res = await speichereEinstellungen(einst);
      if (res.ok) {
        setMeldung('Einstellungen gespeichert.');
      } else {
        setFehler(res.fehler || 'Die Einstellungen konnten nicht gespeichert werden.');
      }
    } catch {
      setFehler('Die Einstellungen konnten nicht gespeichert werden.');
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Betriebseinstellungen</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Zentrale Steuerung für Automatisierungsfristen, E-Mail-Versand und rechtliche Briefbogendaten.
        </p>
      </header>

      {meldung ? (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-medium">
          {meldung}
        </div>
      ) : null}

      {fehler ? (
        <div role="alert" className="p-4 rounded-2xl bg-[#FEF3F2] text-[#B42318] text-sm font-medium">
          {fehler}
        </div>
      ) : null}

      <form onSubmit={handleSpeichern} className="space-y-8">
        {/* 1. Fristen & Versandregeln */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Versand &amp; Automatisierung</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tägliche Versandzeit (Puffer)
              </label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.versandzeit}
                onChange={(e) => setEinst({ ...einst, versandzeit: e.target.value })}
                placeholder="18:00"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wiedervorlage nach (Tage)
              </label>
              <input
                type="number"
                disabled={!istChef}
                value={einst.wiedervorlageTage}
                onChange={(e) => setEinst({ ...einst, wiedervorlageTage: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Erinnerung nach (Tage)
              </label>
              <input
                type="number"
                disabled={!istChef}
                value={einst.erinnerungTage}
                onChange={(e) => setEinst({ ...einst, erinnerungTage: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max. Radius für Schätzung (km)
              </label>
              <input
                type="number"
                disabled={!istChef}
                value={einst.radiusKm}
                onChange={(e) => setEinst({ ...einst, radiusKm: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min. Wohnfläche für WP (m²)
              </label>
              <input
                type="number"
                disabled={!istChef}
                value={einst.minQm}
                onChange={(e) => setEinst({ ...einst, minQm: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Speicherfrist DSGVO (Monate)
              </label>
              <input
                type="number"
                disabled={!istChef}
                value={einst.speicherfristMonate}
                onChange={(e) => setEinst({ ...einst, speicherfristMonate: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                disabled={!istChef}
                checked={einst.eingangsbestaetigung}
                onChange={(e) => setEinst({ ...einst, eingangsbestaetigung: e.target.checked })}
                className="w-4 h-4 rounded text-[color:var(--modul-blau,#1B3A8C)]"
              />
              <span className="text-sm font-medium text-slate-800">
                Automatische Eingangsbestätigung an Endkunden versenden (gedrosselt)
              </span>
            </label>
          </div>
        </section>

        {/* 2. E-Mail & Büro */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">E-Mail &amp; Absender</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Büro-E-Mail (Dossiers)</label>
              <input
                type="email"
                disabled={!istChef}
                value={einst.bueroEmail}
                onChange={(e) => setEinst({ ...einst, bueroEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard-Absender Name</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.absender.name}
                onChange={(e) =>
                  setEinst({ ...einst, absender: { ...einst.absender, name: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard-Absender E-Mail</label>
              <input
                type="email"
                disabled={!istChef}
                value={einst.absender.email}
                onChange={(e) =>
                  setEinst({ ...einst, absender: { ...einst.absender, email: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 3. Betriebskostenvergleich */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Betriebskostenvergleich</h2>
          <p className="text-sm text-slate-600">
            Grundlage für den Vergleich „heute gegen Wärmepumpe“ in der Live-Leiste, im Kundendokument und auf der
            Ergebnisseite. Die Preise stehen nie im Kundendokument, nur die gerundeten Beträge.
          </p>

          {einst.demoPreise ? (
            <p className="rounded-2xl border border-[color:var(--modul-orange,#EE6C1F)] bg-orange-50 p-3 text-sm font-semibold text-[color:var(--modul-orange,#EE6C1F)]">
              Demo-Preise, vom Chef zu bestätigen. In der Matrix tragen die betroffenen Zeilen ein Demo-Kennzeichen.
            </p>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BETRIEBSKOSTEN_FELDER.map(({ feld, label, schritt }) => (
              <div key={feld}>
                <label htmlFor={`bk-${feld}`} className="block text-sm font-bold text-slate-700 mb-1">
                  {label}
                </label>
                <input
                  id={`bk-${feld}`}
                  type="number"
                  inputMode="decimal"
                  step={schritt}
                  disabled={!istChef}
                  value={einst.betriebskosten[feld]}
                  onChange={(e) => setzeBetriebskosten(feld, e.target.value)}
                  className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Briefbogen & Impressum */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Briefbogen-Stammdaten (PDF &amp; Dokumente)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Firma</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.firma}
                onChange={(e) =>
                  setEinst({ ...einst, briefbogen: { ...einst.briefbogen, firma: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Straße &amp; Hausnummer</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.strasse}
                onChange={(e) =>
                  setEinst({ ...einst, briefbogen: { ...einst.briefbogen, strasse: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PLZ &amp; Ort</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.plzOrt}
                onChange={(e) =>
                  setEinst({ ...einst, briefbogen: { ...einst.briefbogen, plzOrt: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefon</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.telefon}
                onChange={(e) =>
                  setEinst({ ...einst, briefbogen: { ...einst.briefbogen, telefon: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Geschäftsführer</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.geschaeftsfuehrer}
                onChange={(e) =>
                  setEinst({
                    ...einst,
                    briefbogen: { ...einst.briefbogen, geschaeftsfuehrer: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Handelsregister</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.register}
                onChange={(e) =>
                  setEinst({ ...einst, briefbogen: { ...einst.briefbogen, register: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">USt-IdNr.</label>
              <input
                type="text"
                disabled={!istChef}
                value={einst.briefbogen.ustId}
                onChange={(e) =>
                  setEinst({ ...einst, briefbogen: { ...einst.briefbogen, ustId: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </section>

        {istChef ? (
          <button
            type="submit"
            disabled={laeuft}
            className="fokus-ring min-h-[50px] rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-8 text-base font-bold text-white shadow-md transition-opacity disabled:opacity-60"
          >
            {laeuft ? 'Wird gespeichert...' : 'Einstellungen speichern'}
          </button>
        ) : null}
      </form>
    </div>
  );
}
