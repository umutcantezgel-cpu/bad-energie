'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { InternAnfrageDTO, Rolle, AnfrageStatus } from '@/lib/types';
import { euro } from '@/lib/services/calculation';
import { freigeben, stornieren } from '../../actions';
import { loescheAnfrage, holeAuskunftJson, holeCsvExport, aendereStatus } from '../actions';

const STATUS_BADGE: Record<AnfrageStatus, { label: string; bg: string; text: string }> = {
  eingang: { label: 'Eingang', bg: 'bg-slate-100', text: 'text-slate-800' },
  geplant: { label: 'Geplant', bg: 'bg-blue-50', text: 'text-[#296BF5]' },
  blockiert: { label: 'Blockiert', bg: 'bg-[#FEF3F2]', text: 'text-[#B42318]' },
  versendet: { label: 'Versendet', bg: 'bg-sky-50', text: 'text-[#0284C7]' },
  erinnert: { label: 'Erinnert', bg: 'bg-amber-50', text: 'text-[#D97706]' },
  antwort: { label: 'Antwort erhalten', bg: 'bg-emerald-50', text: 'text-[#15803D]' },
  termin: { label: 'Termin vereinbart', bg: 'bg-emerald-100', text: 'text-[#15803D]' },
  verworfen: { label: 'Verworfen', bg: 'bg-slate-200', text: 'text-slate-600' },
};

export default function AnfrageDetailClient({
  dto,
  rolle,
}: {
  dto: InternAnfrageDTO;
  rolle: Rolle;
}) {
  const router = useRouter();
  const [aktiverTab, setAktiverTab] = useState<'kalkulation' | 'kunde' | 'dokumente' | 'verlauf'>('kalkulation');
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const status = STATUS_BADGE[dto.status] || { label: dto.status, bg: 'bg-slate-100', text: 'text-slate-800' };

  // Summen berechnen
  const summeNettoVon = dto.positionen
    .filter((p) => p.aktiv && p.von !== null)
    .reduce((s, p) => s + (p.von ?? 0) * (p.menge || 1), 0);
  const summeNettoBis = dto.positionen
    .filter((p) => p.aktiv && p.bis !== null)
    .reduce((s, p) => s + (p.bis ?? 0) * (p.menge || 1), 0);
  const summeBruttoVon = Math.round(summeNettoVon * 1.19);
  const summeBruttoBis = Math.round(summeNettoBis * 1.19);

  async function handleFreigabe(sofort: boolean) {
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    try {
      const res = await freigeben(dto.anfrageId, sofort);
      if (res.ok) {
        setMeldung(res.rueckmeldung || (sofort ? 'Erfolgreich versendet!' : 'Erfolgreich freigegeben (Versand um 18:00)!'));
        router.refresh();
      } else {
        setFehler(res.fehler || 'Fehler bei der Freigabe.');
      }
    } catch {
      setFehler('Fehler beim Ausführen der Freigabe.');
    } finally {
      setLaeuft(false);
    }
  }

  async function handleCsvExport() {
    try {
      const csv = await holeCsvExport(dto.anfrageId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dto.ksNummer}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Fehler beim CSV-Export.');
    }
  }

  async function handleAuskunftExport() {
    try {
      const json = await holeAuskunftJson(dto.anfrageId);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dto.ksNummer}_art15_datenauskunft.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Fehler beim Export der DSGVO-Auskunft.');
    }
  }

  async function handleLoeschen() {
    if (!confirm(`Soll der Vorgang ${dto.ksNummer} und alle zugehörigen Anhänge wirklich unwiderruflich gelöscht werden (Art. 17 DSGVO)?`)) {
      return;
    }
    setLaeuft(true);
    try {
      const res = await loescheAnfrage(dto.anfrageId);
      if (res.ok) {
        alert(`Vorgang ${dto.ksNummer} wurde gelöscht.`);
        router.push('/intern/board');
      } else {
        alert(res.fehler || 'Löschen fehlgeschlagen.');
      }
    } catch {
      alert('Fehler beim Löschen.');
    } finally {
      setLaeuft(false);
    }
  }

  async function handleStatusWechsel(neuerStatus: AnfrageStatus) {
    const grund = neuerStatus === 'verworfen' ? prompt('Grund für das Verwerfen:') || '' : '';
    setLaeuft(true);
    try {
      const res = await aendereStatus(dto.anfrageId, neuerStatus, grund);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.fehler || 'Statuswechsel fehlgeschlagen.');
      }
    } catch {
      alert('Fehler beim Statuswechsel.');
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/intern/board" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              ← Zurück zum Board
            </Link>
            <span className="text-slate-300">·</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-xs text-slate-500">
              Erstellt am {new Date(dto.erstelltAm).toLocaleDateString('de-DE')}
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            {dto.ksNummer} · {dto.kontakt.vorname} {dto.kontakt.nachname}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {dto.vorhabenKurz} · Bearbeiter: {dto.bearbeiter || 'Keiner zugewiesen'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/intern/konfigurator/${dto.anfrageId}`}
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-semibold text-white shadow-sm"
          >
            Im Konfigurator öffnen
          </Link>

          {(rolle === 'chef' || rolle === 'bauleiter') && (
            <>
              <button
                type="button"
                disabled={laeuft}
                onClick={() => handleFreigabe(false)}
                className="fokus-ring inline-flex min-h-[44px] items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Freigeben (18:00)
              </button>
              <button
                type="button"
                disabled={laeuft}
                onClick={() => handleFreigabe(true)}
                className="fokus-ring inline-flex min-h-[44px] items-center rounded-2xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
              >
                Sofort senden
              </button>
            </>
          )}
        </div>
      </div>

      {meldung ? (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-medium">
          {meldung}
        </div>
      ) : null}

      {fehler ? (
        <div className="p-4 rounded-2xl bg-[#FEF3F2] text-[#B42318] text-sm font-medium">
          {fehler}
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setAktiverTab('kalkulation')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'kalkulation'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kalkulation &amp; Positionen
        </button>
        <button
          type="button"
          onClick={() => setAktiverTab('kunde')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'kunde'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kunde &amp; Objekt
        </button>
        <button
          type="button"
          onClick={() => setAktiverTab('dokumente')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'dokumente'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Anhänge ({dto.anhaenge.length})
        </button>
        <button
          type="button"
          onClick={() => setAktiverTab('verlauf')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'verlauf'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verlauf &amp; Aufträge ({dto.versandauftraege.length})
        </button>
      </div>

      {/* Tab Inhalt: Kalkulation */}
      {aktiverTab === 'kalkulation' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                <tr>
                  <th className="py-3 px-4">Position &amp; Leistung</th>
                  <th className="py-3 px-4">Gewerk</th>
                  <th className="py-3 px-4 text-right">Menge</th>
                  <th className="py-3 px-4 text-right">Von (€)</th>
                  <th className="py-3 px-4 text-right">Bis (€)</th>
                  <th className="py-3 px-4">Notiz Intern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dto.positionen.map((p, idx) => (
                  <tr key={p.id} className={p.aktiv ? '' : 'opacity-40 line-through bg-slate-50/50'}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{idx + 1}. {p.titel}</p>
                      {p.text && <p className="text-xs text-slate-500">{p.text}</p>}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">{p.gewerk}</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {p.menge} {p.einheit}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {p.von !== null ? euro(p.von) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {p.bis !== null ? euro(p.bis) : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 italic max-w-xs">
                      {p.notizIntern || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summenblock */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-6 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white">
            <div className="space-y-1 text-right">
              <p className="text-xs text-slate-400">Summe Netto</p>
              <p className="text-base font-bold tabular-nums">
                {euro(summeNettoVon)} bis {euro(summeNettoBis)} €
              </p>
            </div>
            <div className="space-y-1 text-right border-l border-slate-700 pl-6">
              <p className="text-xs text-slate-400">Summe Brutto (inkl. 19% MwSt.)</p>
              <p className="text-xl font-bold text-white tabular-nums">
                {euro(summeBruttoVon)} bis {euro(summeBruttoBis)} €
              </p>
            </div>
          </div>

          {/* Annahmen & Vorbehalte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Annahmen für diese Schätzung</h3>
              {dto.annahmen.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  {dto.annahmen.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Keine besonderen Annahmen erfasst.</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Nicht enthalten und bauseits</h3>
              {dto.vorbehalte.length > 0 ? (
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  {dto.vorbehalte.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Keine Vorbehalte hinterlegt.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Inhalt: Kunde & Objekt */}
      {aktiverTab === 'kunde' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Kundendaten</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-500">Name: <span className="font-semibold text-slate-900">{dto.kontakt.anrede} {dto.kontakt.vorname} {dto.kontakt.nachname}</span></p>
              <p className="text-slate-500">E-Mail: <a href={`mailto:${dto.kontakt.email}`} className="font-semibold text-[color:var(--modul-blau,#1B3A8C)] underline">{dto.kontakt.email}</a></p>
              <p className="text-slate-500">Telefon: <a href={`tel:${dto.kontakt.telefon}`} className="font-semibold text-slate-900">{dto.kontakt.telefon || 'Nicht angegeben'}</a></p>
              <p className="text-slate-500">Adresse: <span className="font-semibold text-slate-900">{dto.kontakt.strasse}, {dto.kontakt.plzOrt}</span></p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Objekt &amp; Gegebenheiten</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-500">Objektadresse: <span className="font-semibold text-slate-900">{dto.objekt.adresse || dto.kontakt.strasse}</span></p>
              <p className="text-slate-500">Etage / Aufzug: <span className="font-semibold text-slate-900">{dto.notizen.etage !== null ? `${dto.notizen.etage}. OG` : 'EG/k.A.'} · {dto.notizen.aufzug ? 'Aufzug vorhanden' : 'Kein Aufzug'}</span></p>
              <p className="text-slate-500">Montagehindernisse: <span className="font-semibold text-slate-900">{dto.notizen.montagehindernisse || 'Keine'}</span></p>
              <p className="text-slate-500">Leitungswege: <span className="font-semibold text-slate-900">{dto.notizen.leitungswege || 'Standard'}</span></p>
              {dto.notizen.intern && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700">Interne Notizen:</p>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{dto.notizen.intern}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Inhalt: Anhänge */}
      {aktiverTab === 'dokumente' && (
        <div className="space-y-4">
          {dto.anhaenge.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              Für diese Anfrage wurden noch keine Fotos oder Skizzen hochgeladen.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dto.anhaenge.map((anhang) => (
                <div key={anhang.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold uppercase">{anhang.art}</span>
                    <span>{Math.round(anhang.groesse / 1024)} KB</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{anhang.dateiname}</p>
                  {anhang.beschreibung && <p className="text-xs text-slate-600">{anhang.beschreibung}</p>}
                  <a
                    href={anhang.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
                  >
                    Datei ansehen / herunterladen →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Inhalt: Verlauf & Aufträge */}
      {aktiverTab === 'verlauf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Versandaufträge</h3>
            {dto.versandauftraege.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Noch keine Versandaufträge angelegt.</p>
            ) : (
              <div className="space-y-3">
                {dto.versandauftraege.map((va) => (
                  <div key={va.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{va.art}</p>
                      <p className="text-slate-500">Status: {va.status}</p>
                    </div>
                    {va.versendetAm && (
                      <span className="text-slate-500">
                        {new Date(va.versendetAm).toLocaleString('de-DE')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ereignis-Protokoll</h3>
            {dto.ereignisse.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Noch keine Ereignisse erfasst.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {dto.ereignisse.map((e, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-2 text-xs">
                    <p className="font-bold text-slate-800">{e.typ}</p>
                    <p className="text-slate-400">
                      {new Date(e.erstelltAm).toLocaleString('de-DE')} {e.benutzer ? `durch ${e.benutzer}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Aktionen (Export, Statuswechsel, DSGVO) */}
      <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCsvExport}
            className="fokus-ring inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            CSV herunterladen
          </button>
          <button
            type="button"
            onClick={handleAuskunftExport}
            className="fokus-ring inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Art. 15 Auskunft (JSON)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {dto.status !== 'verworfen' && (
            <button
              type="button"
              onClick={() => handleStatusWechsel('verworfen')}
              className="fokus-ring inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Vorgang verwerfen
            </button>
          )}
          {rolle === 'chef' && (
            <button
              type="button"
              onClick={handleLoeschen}
              className="fokus-ring inline-flex min-h-[40px] items-center rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-[#B42318] hover:bg-red-100"
            >
              Löschen (Art. 17 DSGVO)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
