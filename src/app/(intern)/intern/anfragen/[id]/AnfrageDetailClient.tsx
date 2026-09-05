'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  AnfrageStatus,
  GebaeudeDaten,
  HeizungsStandort,
  InternAnfrageDTO,
  Rolle,
  VerbrauchEinheit,
  Verteilung,
} from '@/lib/types';
import { gebaeudeSchema } from '@/lib/types';
import { euro } from '@/lib/services/calculation';
import {
  BAUJAHR_KLASSE_LABEL,
  ENERGIEART_LABEL,
  FENSTER_LABEL,
  HERSTELLER_LABEL,
  KESSELTYP_LABEL,
  LAGE_LABEL,
  leeresGebaeude,
} from '@/lib/services/heizlast';
import { JOURNEYS, type Frage, type JourneyId } from '@/lib/journeys';
import { freigeben } from '../../actions';
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

/** Statuswechsel, die der Bearbeiter von Hand setzt (Plan 9.4). */
const STATUS_WECHSEL: AnfrageStatus[] = ['geplant', 'blockiert', 'antwort', 'termin', 'verworfen'];

const STANDORT_LABEL: Record<HeizungsStandort, string> = {
  keller: 'Keller',
  erdgeschoss: 'Erdgeschoss',
  dachgeschoss: 'Dachgeschoss',
  anbau: 'Anbau',
  aussen: 'Außen',
  unbekannt: 'Unbekannt',
};

const VERTEILUNG_LABEL: Record<Verteilung, string> = {
  heizkoerper: 'Heizkörper',
  fussboden: 'Fußbodenheizung',
  gemischt: 'Gemischt',
};

const VERBRAUCH_EINHEIT_LABEL: Record<VerbrauchEinheit, string> = {
  kwh: 'kWh',
  liter: 'Liter',
  m3: 'm³',
  kg: 'kg',
};

/** Türbreite, ab der ein Innengerät ohne Zerlegen durchpasst (Beleg 3 und 10). */
const TUERBREITE_MIN_CM = 80;

type Angabe = { label: string; wert: string; warnung?: boolean };

/** Ältere Datensätze können Teilobjekte vermissen; das Schema ergänzt die Vorgaben. */
function sicheresGebaeude(roh: GebaeudeDaten): GebaeudeDaten {
  const ergebnis = gebaeudeSchema.safeParse(roh);
  return ergebnis.success ? ergebnis.data : leeresGebaeude();
}

function angabenGebaeude(g: GebaeudeDaten): Angabe[] {
  const baujahr = g.baujahr !== null ? String(g.baujahr) : null;
  const klasse = g.baujahrKlasse ? BAUJAHR_KLASSE_LABEL[g.baujahrKlasse] : null;
  const verbrauch =
    g.bestand.verbrauchJahr !== null
      ? `${g.bestand.verbrauchJahr.toLocaleString('de-DE')} ${g.bestand.verbrauchEinheit ? VERBRAUCH_EINHEIT_LABEL[g.bestand.verbrauchEinheit] : ''}`.trim()
      : '—';
  const heizung = [
    g.bestand.energieart ? ENERGIEART_LABEL[g.bestand.energieart] : null,
    g.bestand.kesseltyp ? KESSELTYP_LABEL[g.bestand.kesseltyp] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return [
    { label: 'Wohnfläche', wert: g.wohnflaeche !== null ? `${g.wohnflaeche} m²` : '—' },
    { label: 'Baujahr / Klasse', wert: [baujahr, klasse].filter(Boolean).join(' · ') || '—' },
    { label: 'Lage', wert: g.lage ? LAGE_LABEL[g.lage] : '—' },
    { label: 'Fenster', wert: g.fenster ? FENSTER_LABEL[g.fenster] : '—' },
    { label: 'Personen im Haus', wert: g.personen !== null ? String(g.personen) : '—' },
    { label: 'Wohneinheiten', wert: String(g.wohneinheiten) },
    { label: 'Heizung heute', wert: heizung || '—' },
    { label: 'Verbrauch im Jahr', wert: verbrauch },
    {
      label: 'Alter der Heizung',
      wert: g.bestand.heizungsalterJahre !== null ? `${g.bestand.heizungsalterJahre} Jahre` : '—',
    },
    { label: 'Standort der Heizung', wert: STANDORT_LABEL[g.bestand.standort] },
    { label: 'Wärmeverteilung', wert: g.bestand.verteilung ? VERTEILUNG_LABEL[g.bestand.verteilung] : '—' },
    {
      label: 'Türbreite Zugang',
      wert: g.platz.tuerbreiteCm !== null ? `${g.platz.tuerbreiteCm} cm` : '—',
      warnung: g.platz.tuerbreiteCm !== null && g.platz.tuerbreiteCm < TUERBREITE_MIN_CM,
    },
    { label: 'Gerät', wert: HERSTELLER_LABEL[g.geraet.hersteller] + (g.geraet.kw !== null ? ` · ${g.geraet.kw} kW` : '') },
  ];
}

function wertText(wert: unknown): string {
  if (wert === null || wert === undefined || wert === '') return '—';
  if (typeof wert === 'boolean') return wert ? 'Ja' : 'Nein';
  if (Array.isArray(wert)) return wert.map((w) => wertText(w)).join(', ');
  return String(wert);
}

function optionText(frage: Frage, wert: unknown): string {
  if (frage.art === 'einzelauswahl' || frage.art === 'mehrfachauswahl') {
    const werte = Array.isArray(wert) ? wert : [wert];
    const titel = werte.map((w) => frage.optionen.find((o) => o.wert === w)?.titel ?? wertText(w));
    return titel.join(', ');
  }
  if (frage.art === 'zahl' || frage.art === 'anzahl') {
    return `${wertText(wert)} ${frage.einheit}`.trim();
  }
  return wertText(wert);
}

/** Antworten der Kundenstrecke als lesbare Zeilen (Frage → Antwort). */
function konfiguratorZeilen(roh: Record<string, unknown>): Angabe[] {
  const antworten = (roh.antworten ?? null) as Record<string, unknown> | null;
  const zeilen: Angabe[] = [];
  const erledigt = new Set<string>(['journey']);

  if (antworten) {
    const journeyId = antworten.journey as JourneyId | undefined;
    const journey = journeyId ? JOURNEYS[journeyId] : undefined;
    if (journey) {
      zeilen.push({ label: 'Strecke', wert: journey.name });
      for (const schritt of journey.schritte) {
        for (const frage of schritt.fragen) {
          if (frage.ziel !== 'antworten') continue;
          if (!(frage.feld in antworten)) continue;
          // Nur Fragen zeigen, die der Kunde auch gesehen hat (Varianten mit sichtbarWenn).
          if (frage.sichtbarWenn && !(frage.sichtbarWenn.werte as unknown[]).includes(antworten[frage.sichtbarWenn.feld])) continue;
          const wert = antworten[frage.feld];
          if (wert === null || wert === undefined || wert === '') continue;
          erledigt.add(frage.feld);
          zeilen.push({ label: frage.frage, wert: optionText(frage, wert) });
        }
      }
    }
    for (const [schluessel, wert] of Object.entries(antworten)) {
      if (erledigt.has(schluessel)) continue;
      if (wert === null || wert === undefined || wert === '') continue;
      zeilen.push({ label: schluessel, wert: wertText(wert) });
    }
  }

  const freitext = roh.freitext;
  if (typeof freitext === 'string' && freitext.trim()) {
    zeilen.push({ label: 'Freitext des Kunden', wert: freitext.trim() });
  }
  const wunschtermine = roh.wunschtermine;
  if (Array.isArray(wunschtermine) && wunschtermine.length > 0) {
    zeilen.push({ label: 'Wunschtermine', wert: wunschtermine.map((w) => wertText(w)).join(' · ') });
  }
  return zeilen;
}

function AngabenListe({ angaben }: { angaben: Angabe[] }) {
  return (
    <dl className="space-y-2 text-sm">
      {angaben.map((a, i) => (
        <div key={`${a.label}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-slate-500">{a.label}</dt>
          <dd
            className={`font-semibold ${a.warnung ? 'text-[#B42318]' : 'text-slate-900'}`}
            title={a.warnung ? `Unter ${TUERBREITE_MIN_CM} cm: Zugang vor Ort prüfen` : undefined}
          >
            {a.wert}
            {a.warnung ? ' · zu schmal' : ''}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type SheetZustand = { art: 'status'; status: AnfrageStatus } | { art: 'loeschen' } | null;

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
  const [sheet, setSheet] = useState<SheetZustand>(null);
  const [grund, setGrund] = useState('');

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

  const gebaeude = sicheresGebaeude(dto.gebaeude);
  const gebaeudeAngaben = angabenGebaeude(gebaeude);
  const antwortZeilen = konfiguratorZeilen(dto.konfiguratorAntworten);

  const pdfAnhaenge = dto.anhaenge
    .filter((a) => a.mime === 'application/pdf' || a.art === 'pdf')
    .sort((a, b) => (a.erstelltAm < b.erstelltAm ? 1 : -1));
  const neuestesPdf = pdfAnhaenge[0] ?? null;

  async function handleFreigabe(sofort: boolean) {
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    try {
      const res = await freigeben(dto.anfrageId, sofort);
      if (res.ok) {
        setMeldung(res.rueckmeldung || (sofort ? 'Versendet.' : 'Freigegeben, Versand um 18:00.'));
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
    setFehler(null);
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
      setFehler('Der CSV-Export ist fehlgeschlagen.');
    }
  }

  async function handleAuskunftExport() {
    setFehler(null);
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
      setFehler('Der Export der Datenauskunft ist fehlgeschlagen.');
    }
  }

  function oeffneSheet(zustand: SheetZustand) {
    setGrund('');
    setMeldung(null);
    setFehler(null);
    setSheet(zustand);
  }

  async function handleLoeschen() {
    setLaeuft(true);
    setFehler(null);
    try {
      const res = await loescheAnfrage(dto.anfrageId);
      if (res.ok) {
        setSheet(null);
        router.push('/intern/board');
      } else {
        setFehler(res.fehler || 'Das Löschen ist fehlgeschlagen.');
      }
    } catch {
      setFehler('Das Löschen ist fehlgeschlagen.');
    } finally {
      setLaeuft(false);
    }
  }

  async function handleStatusWechsel(neuerStatus: AnfrageStatus) {
    setLaeuft(true);
    setFehler(null);
    try {
      const res = await aendereStatus(dto.anfrageId, neuerStatus, grund.trim());
      if (res.ok) {
        setSheet(null);
        setMeldung(`Status gesetzt: ${STATUS_BADGE[neuerStatus].label}.`);
        router.refresh();
      } else {
        setFehler(res.fehler || 'Der Statuswechsel ist fehlgeschlagen.');
      }
    } catch {
      setFehler('Der Statuswechsel ist fehlgeschlagen.');
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
            <Link href="/intern/board" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
              ← Zurück zum Board
            </Link>
            <span className="text-slate-300">·</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-bold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-sm text-slate-500">
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

      {/* Statuswechsel */}
      <section aria-label="Status setzen" className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Status setzen:</span>
        {STATUS_WECHSEL.filter((s) => s !== dto.status).map((s) => (
          <button
            key={s}
            type="button"
            disabled={laeuft}
            onClick={() => oeffneSheet({ art: 'status', status: s })}
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {STATUS_BADGE[s].label}
          </button>
        ))}
      </section>

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

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setAktiverTab('kalkulation')}
          className={`min-h-[44px] pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'kalkulation'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kalkulation und Positionen
        </button>
        <button
          type="button"
          onClick={() => setAktiverTab('kunde')}
          className={`min-h-[44px] pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'kunde'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kunde und Gebäude
        </button>
        <button
          type="button"
          onClick={() => setAktiverTab('dokumente')}
          className={`min-h-[44px] pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'dokumente'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dokumente ({dto.anhaenge.length})
        </button>
        <button
          type="button"
          onClick={() => setAktiverTab('verlauf')}
          className={`min-h-[44px] pb-3 text-sm font-bold border-b-2 transition-all ${
            aktiverTab === 'verlauf'
              ? 'border-[color:var(--modul-blau,#1B3A8C)] text-[color:var(--modul-blau,#1B3A8C)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verlauf und Aufträge ({dto.versandauftraege.length})
        </button>
      </div>

      {/* Tab Inhalt: Kalkulation */}
      {aktiverTab === 'kalkulation' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                <tr>
                  <th className="py-3 px-4">Position und Leistung</th>
                  <th className="py-3 px-4">Gewerk</th>
                  <th className="py-3 px-4 text-right">Menge</th>
                  <th className="py-3 px-4 text-right">Von (Euro)</th>
                  <th className="py-3 px-4 text-right">Bis (Euro)</th>
                  <th className="py-3 px-4">Notiz intern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dto.positionen.map((p, idx) => (
                  <tr key={p.id} className={p.aktiv ? '' : 'opacity-40 line-through bg-slate-50/50'}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{idx + 1}. {p.titel}</p>
                      {p.text && <p className="text-sm text-slate-500">{p.text}</p>}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-600">{p.gewerk}</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {p.menge} {p.einheit}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {p.von !== null ? euro(p.von) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {p.bis !== null ? euro(p.bis) : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500 italic max-w-xs">
                      {p.notizIntern || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summenblock */}
          <div className="glass-bar-dark flex flex-col sm:flex-row sm:justify-end gap-6 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white">
            <div className="space-y-1 text-right">
              <p className="text-sm text-slate-300">Summe netto</p>
              <p className="text-base font-bold tabular-nums">
                {euro(summeNettoVon)} bis {euro(summeNettoBis)} Euro
              </p>
            </div>
            <div className="space-y-1 text-right border-l border-slate-700 pl-6">
              <p className="text-sm text-slate-300">Summe brutto (inklusive 19 Prozent Mehrwertsteuer)</p>
              <p className="text-xl font-bold text-white tabular-nums">
                {euro(summeBruttoVon)} bis {euro(summeBruttoBis)} Euro
              </p>
            </div>
          </div>

          {/* Annahmen und Vorbehalte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Annahmen für diese Schätzung</h3>
              {dto.annahmen.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {dto.annahmen.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">Keine besonderen Annahmen erfasst.</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Nicht enthalten und bauseits</h3>
              {dto.vorbehalte.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {dto.vorbehalte.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">Keine Vorbehalte hinterlegt.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Inhalt: Kunde und Gebäude */}
      {aktiverTab === 'kunde' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Kundendaten</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-500">Name: <span className="font-semibold text-slate-900">{dto.kontakt.anrede} {dto.kontakt.vorname} {dto.kontakt.nachname}</span></p>
              <p className="text-slate-500">E-Mail: {dto.kontakt.email ? (
                <a href={`mailto:${dto.kontakt.email}`} className="font-semibold text-[color:var(--modul-blau,#1B3A8C)] underline">{dto.kontakt.email}</a>
              ) : (
                <span className="font-semibold text-[#B42318]">fehlt</span>
              )}</p>
              <p className="text-slate-500">Telefon: <a href={`tel:${dto.kontakt.telefon}`} className="font-semibold text-slate-900">{dto.kontakt.telefon || 'Nicht angegeben'}</a></p>
              <p className="text-slate-500">Adresse: <span className="font-semibold text-slate-900">{[dto.kontakt.strasse, dto.kontakt.plzOrt].filter(Boolean).join(', ') || '—'}</span></p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Objekt und Gegebenheiten</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-500">Objektadresse: <span className="font-semibold text-slate-900">{dto.objekt.adresse || dto.kontakt.strasse}</span></p>
              <p className="text-slate-500">Etage / Aufzug: <span className="font-semibold text-slate-900">{dto.notizen.etage !== null ? `${dto.notizen.etage}. OG` : 'EG oder keine Angabe'} · {dto.notizen.aufzug ? 'Aufzug vorhanden' : 'Kein Aufzug'}</span></p>
              <p className="text-slate-500">Montagehindernisse: <span className="font-semibold text-slate-900">{dto.notizen.montagehindernisse || 'Keine'}</span></p>
              <p className="text-slate-500">Leitungswege: <span className="font-semibold text-slate-900">{dto.notizen.leitungswege || 'Standard'}</span></p>
              {dto.notizen.intern && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-bold text-slate-700">Interne Notizen:</p>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{dto.notizen.intern}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Gebäude und Heizung</h3>
            <AngabenListe angaben={gebaeudeAngaben} />
            {gebaeude.platz.heizraum ? (
              <p className="text-sm text-slate-600">Heizraum: {gebaeude.platz.heizraum}</p>
            ) : null}
            {gebaeude.platz.aussenEinheitOrt ? (
              <p className="text-sm text-slate-600">Ort der Außeneinheit: {gebaeude.platz.aussenEinheitOrt}</p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Antworten aus der Kundenstrecke</h3>
            {antwortZeilen.length > 0 ? (
              <AngabenListe angaben={antwortZeilen} />
            ) : (
              <p className="text-sm text-slate-400 italic">
                Diese Anfrage stammt nicht aus dem Konfigurator, es liegen keine Antworten vor.
              </p>
            )}
            {dto.triageVorschlag ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Triage: {dto.triageVorschlag}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab Inhalt: Dokumente */}
      {aktiverTab === 'dokumente' && (
        <div className="space-y-6">
          {neuestesPdf ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">{neuestesPdf.dateiname}</h3>
                <span className="text-sm text-slate-500">
                  {new Date(neuestesPdf.erstelltAm).toLocaleString('de-DE')} · {Math.round(neuestesPdf.groesse / 1024)} KB
                </span>
              </div>
              <iframe
                src={`${neuestesPdf.url}?inline=1`}
                title={`Vorschau ${neuestesPdf.dateiname}`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50"
                height={800}
              />
              <a
                href={neuestesPdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fokus-ring inline-flex min-h-[44px] items-center text-sm font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
              >
                Wird die Vorschau nicht angezeigt: PDF herunterladen
              </a>
            </section>
          ) : null}

          {dto.anhaenge.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              Für diese Anfrage liegen noch keine Dokumente, Fotos oder Skizzen vor.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dto.anhaenge.map((anhang) => (
                <div key={anhang.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="font-bold uppercase">{anhang.art}</span>
                    <span>{Math.round(anhang.groesse / 1024)} KB</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{anhang.dateiname}</p>
                  {anhang.beschreibung && <p className="text-sm text-slate-600">{anhang.beschreibung}</p>}
                  <a
                    href={anhang.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fokus-ring inline-flex min-h-[44px] items-center text-sm font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
                  >
                    Datei ansehen oder herunterladen
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Inhalt: Verlauf und Aufträge */}
      {aktiverTab === 'verlauf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Versandaufträge</h3>
            {dto.versandauftraege.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Noch keine Versandaufträge angelegt.</p>
            ) : (
              <div className="space-y-3">
                {dto.versandauftraege.map((va) => (
                  <div key={va.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-sm">
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
            <h3 className="text-base font-bold text-slate-900">Ereignisse</h3>
            {dto.ereignisse.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Noch keine Ereignisse erfasst.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {dto.ereignisse.map((e, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-2 text-sm">
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

      {/* Footer Aktionen (Export, DSGVO) */}
      <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCsvExport}
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            CSV herunterladen
          </button>
          <button
            type="button"
            onClick={handleAuskunftExport}
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Datenauskunft nach Artikel 15 (JSON)
          </button>
        </div>

        {rolle === 'chef' ? (
          <button
            type="button"
            onClick={() => oeffneSheet({ art: 'loeschen' })}
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-[#B42318] hover:bg-red-100"
          >
            Löschen nach Artikel 17
          </button>
        ) : null}
      </div>

      {/* Bestätigungs-Sheet statt Browserdialog */}
      {sheet ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={sheet.art === 'loeschen' ? 'Vorgang löschen' : 'Status setzen'}
            className="glass-sheet w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            {sheet.art === 'loeschen' ? (
              <>
                <h2 className="text-lg font-bold text-slate-900">Vorgang {dto.ksNummer} löschen</h2>
                <p className="text-sm text-slate-600">
                  Anfrage, Anhänge und Dokumente werden unwiderruflich gelöscht und im Löschprotokoll vermerkt.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">
                  Status auf „{STATUS_BADGE[sheet.status].label}“ setzen
                </h2>
                <p className="text-sm text-slate-600">Vorgang {dto.ksNummer}</p>
                {sheet.status === 'verworfen' || sheet.status === 'blockiert' ? (
                  <div>
                    <label htmlFor="status-grund" className="mb-1 block text-sm font-bold text-slate-700">
                      Grund {sheet.status === 'verworfen' ? '(erscheint im Protokoll)' : ''}
                    </label>
                    <textarea
                      id="status-grund"
                      value={grund}
                      onChange={(e) => setGrund(e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="glass-input w-full rounded-xl border border-slate-200 p-3 text-base"
                    />
                  </div>
                ) : null}
              </>
            )}

            {fehler ? (
              <p role="alert" className="rounded-xl bg-[#FEF3F2] p-3 text-sm font-medium text-[#B42318]">{fehler}</p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSheet(null)}
                className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={laeuft}
                onClick={() => (sheet.art === 'loeschen' ? handleLoeschen() : handleStatusWechsel(sheet.status))}
                className={`fokus-ring inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60 ${
                  sheet.art === 'loeschen' ? 'bg-[#B42318]' : 'bg-[color:var(--modul-blau,#1B3A8C)]'
                }`}
              >
                {sheet.art === 'loeschen' ? 'Endgültig löschen' : 'Status setzen'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
