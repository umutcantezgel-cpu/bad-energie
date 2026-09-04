'use client';

import { useState } from 'react';
import type { Richtpreis, FoerderRegeln, Vorbehalt, Vorlage, Einheit } from '@/lib/types';
import { speichereMatrixZeile, speichereFoerderRegeln, toggleVorbehalt, erstelleVorbehalt } from './actions';
import { euro } from '@/lib/services/calculation';

export default function MatrixClient({
  initialMatrix,
  initialFoerderRegeln,
  initialVorbehalte,
  vorlagen,
  blockiertZaehler,
  istChef,
}: {
  initialMatrix: Richtpreis[];
  initialFoerderRegeln: FoerderRegeln;
  initialVorbehalte: Vorbehalt[];
  vorlagen: Vorlage[];
  blockiertZaehler: Record<number, number>;
  istChef: boolean;
}) {
  const [matrix, setMatrix] = useState<Richtpreis[]>(initialMatrix);
  const [foerderRegeln, setFoerderRegeln] = useState<FoerderRegeln>(initialFoerderRegeln);
  const [vorbehalte, setVorbehalte] = useState<Vorbehalt[]>(initialVorbehalte);

  const [bearbeiteNr, setBearbeiteNr] = useState<number | null>(null);
  const [formVon, setFormVon] = useState<string>('');
  const [formBis, setFormBis] = useState<string>('');
  const [formEinheit, setFormEinheit] = useState<Einheit>('pauschal');
  const [formHinweis, setFormHinweis] = useState<string>('');

  const [neuerVorbehaltText, setNeuerVorbehaltText] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);

  function startBearbeiten(z: Richtpreis) {
    setBearbeiteNr(z.nr);
    setFormVon(z.von !== null ? String(z.von) : '');
    setFormBis(z.bis !== null ? String(z.bis) : '');
    setFormEinheit(z.einheit);
    setFormHinweis(z.hinweis || '');
  }

  async function handleSpeichernZeile(nr: number) {
    setLaeuft(true);
    setMeldung(null);
    const von = formVon.trim() ? Number(formVon) : null;
    const bis = formBis.trim() ? Number(formBis) : null;
    const res = await speichereMatrixZeile(nr, von, bis, formEinheit, formHinweis);
    if (res.ok) {
      setMatrix((prev) =>
        prev.map((item) =>
          item.nr === nr
            ? { ...item, von, bis, einheit: formEinheit, hinweis: formHinweis }
            : item,
        ),
      );
      setBearbeiteNr(null);
      setMeldung(`Matrixzeile ${nr} erfolgreich gespeichert.`);
    } else {
      alert(res.fehler || 'Fehler beim Speichern.');
    }
    setLaeuft(false);
  }

  async function handleSpeichernFoerderung(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setMeldung(null);
    const res = await speichereFoerderRegeln(foerderRegeln);
    if (res.ok) {
      setMeldung('Förderregeln erfolgreich aktualisiert.');
    } else {
      alert(res.fehler || 'Fehler beim Speichern der Förderregeln.');
    }
    setLaeuft(false);
  }

  async function handleToggleVorbehalt(id: number, aktiv: boolean) {
    await toggleVorbehalt(id, aktiv);
    setVorbehalte((prev) =>
      prev.map((v) => (v.id === id ? { ...v, aktiv } : v)),
    );
  }

  async function handleNeuerVorbehalt(e: React.FormEvent) {
    e.preventDefault();
    if (!neuerVorbehaltText.trim()) return;
    setLaeuft(true);
    const res = await erstelleVorbehalt(neuerVorbehaltText);
    if (res.ok) {
      setNeuerVorbehaltText('');
      setMeldung('Neuer Vorbehalt angelegt.');
      // Liste neu laden über Page-Refresh oder lokalen Push
    }
    setLaeuft(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Richtpreis-Matrix &amp; Regeln
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Alle Preise sind Netto-Werte. Fehlende Richtpreise sperren den automatischen Versand betroffener Kostenschätzungen.
        </p>
      </header>

      {meldung ? (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-medium">
          {meldung}
        </div>
      ) : null}

      {/* 1. Richtpreis-Tabelle */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Richtpreis-Matrix (17 Positionen)</h2>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              <tr>
                <th className="py-3 px-4 w-16">Nr</th>
                <th className="py-3 px-4">Leistung / Gewerk</th>
                <th className="py-3 px-4 text-right">Von (€ Netto)</th>
                <th className="py-3 px-4 text-right">Bis (€ Netto)</th>
                <th className="py-3 px-4">Einheit</th>
                <th className="py-3 px-4">Hinweis</th>
                {istChef ? <th className="py-3 px-4 text-right">Aktion</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((z) => {
                const istLeer = z.von === null || z.bis === null;
                const blockiert = blockiertZaehler[z.nr] || 0;
                const wirdBearbeitet = bearbeiteNr === z.nr;

                if (wirdBearbeitet) {
                  return (
                    <tr key={z.nr} className="bg-blue-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{z.nr}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{z.leistung}</td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          value={formVon}
                          onChange={(e) => setFormVon(e.target.value)}
                          placeholder="Von"
                          className="w-24 p-1.5 text-right rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          value={formBis}
                          onChange={(e) => setFormBis(e.target.value)}
                          placeholder="Bis"
                          className="w-24 p-1.5 text-right rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={formEinheit}
                          onChange={(e) => setFormEinheit(e.target.value as Einheit)}
                          className="p-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        >
                          <option value="pauschal">pauschal</option>
                          <option value="je_stueck">je Stück</option>
                          <option value="je_lfm">je lfm</option>
                          <option value="je_tank">je Tank</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={formHinweis}
                          onChange={(e) => setFormHinweis(e.target.value)}
                          placeholder="Hinweis..."
                          className="w-full p-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          disabled={laeuft}
                          onClick={() => handleSpeichernZeile(z.nr)}
                          className="px-3 py-1 bg-[color:var(--modul-blau,#1B3A8C)] text-white text-xs font-bold rounded-lg"
                        >
                          Speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setBearbeiteNr(null)}
                          className="px-2 py-1 text-slate-600 text-xs"
                        >
                          Abbrechen
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={z.nr}
                    className={`transition-colors ${
                      istLeer ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{z.nr}</span>
                        {blockiert > 0 ? (
                          <span
                            className="rounded-full bg-red-100 text-[#B42318] px-2 py-0.5 text-[10px] font-bold"
                            title={`Blockiert ${blockiert} offene Anfragen`}
                          >
                            {blockiert}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{z.leistung}</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {z.von !== null ? (
                        <span className="font-semibold text-slate-800">{euro(z.von)} €</span>
                      ) : (
                        <span className="text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded text-xs">
                          fehlt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {z.bis !== null ? (
                        <span className="font-semibold text-slate-800">{euro(z.bis)} €</span>
                      ) : (
                        <span className="text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded text-xs">
                          fehlt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">{z.einheit}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {z.hinweis || '—'}
                    </td>
                    {istChef ? (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => startBearbeiten(z)}
                          className="text-xs font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
                        >
                          Bearbeiten
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Förderregeln (Singleton) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Förderungs-Regelwerk (BEG / KfW)</h2>
        <p className="text-xs text-slate-600">
          Prozentsätze und Deckel für die automatische Wärmepumpen-Förderung.
        </p>

        <form onSubmit={handleSpeichernFoerderung} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grundförderung (%)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.grund}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, grund: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Effizienzbonus (%)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.effizienz}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, effizienz: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Klimageschwindigkeit (%)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.klimageschwindigkeit}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, klimageschwindigkeit: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Einkommensbonus (%)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.einkommen}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, einkommen: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Maximaldeckel (%)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.deckel}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, deckel: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Max. Kosten WE1 (€)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.kostenWe1}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, kostenWe1: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Eigenanteil Rundung (€)</label>
            <input
              type="number"
              disabled={!istChef}
              value={foerderRegeln.eigenanteilRundung}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, eigenanteilRundung: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>

          {istChef ? (
            <div className="col-span-full pt-2">
              <button
                type="submit"
                disabled={laeuft}
                className="fokus-ring min-h-[44px] rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-bold text-white shadow-sm"
              >
                Förderregeln speichern
              </button>
            </div>
          ) : null}
        </form>
      </section>

      {/* 3. Vorbehaltskatalog ("Nicht enthalten und bauseits") */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Vorbehaltskatalog („Nicht enthalten und bauseits“)</h2>
        <p className="text-xs text-slate-600">
          Standard-Ausschlüsse, die den Kunden in der Kostenschätzung vor Missverständnissen schützen.
        </p>

        <div className="space-y-2">
          {vorbehalte.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs sm:text-sm"
            >
              <span className="font-medium text-slate-800">{v.text}</span>
              {v.gewerk && (
                <span className="text-[11px] font-bold uppercase text-slate-500 mr-4">
                  {v.gewerk}
                </span>
              )}
            </div>
          ))}
        </div>

        {istChef ? (
          <form onSubmit={handleNeuerVorbehalt} className="flex gap-2 pt-2">
            <input
              type="text"
              value={neuerVorbehaltText}
              onChange={(e) => setNeuerVorbehaltText(e.target.value)}
              placeholder="Neuen Vorbehalt ergänzen (z. B. Elektroanschluss bis Zählerschrank bauseits)..."
              className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={laeuft}
              className="min-h-[42px] px-4 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Hinzufügen
            </button>
          </form>
        ) : null}
      </section>

      {/* 4. Vorlagen & Bausteine Übersicht */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Aktive Vorlagen ({vorlagen.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vorlagen.map((v) => (
            <div key={v.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">{v.name}</h3>
              <p className="text-xs text-slate-600">{v.vorhabenKurz} · {v.bausteine.length} Bausteine</p>
              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                {v.bausteine.map((b) => (
                  <div key={b.id} className="flex justify-between">
                    <span>• {b.titel}</span>
                    <span className="tabular-nums font-mono text-slate-400">Matrix {b.matrixNr || 'manuell'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
