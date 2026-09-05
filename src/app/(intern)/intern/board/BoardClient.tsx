'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BoardKarte } from './page-types';
import { euro } from '@/lib/services/calculation';
import type { AnfrageStatus } from '@/lib/types';

const SPALTEN_DEFINITION: { id: string; titel: string; status: AnfrageStatus[] }[] = [
  { id: 'eingang', titel: 'Eingang', status: ['eingang'] },
  { id: 'geplant', titel: 'Geplant', status: ['geplant'] },
  { id: 'blockiert', titel: 'Blockiert', status: ['blockiert'] },
  { id: 'versendet', titel: 'Versendet / Wiedervorlage', status: ['versendet', 'erinnert'] },
  { id: 'termin', titel: 'Antwort / Termin', status: ['antwort', 'termin'] },
];

const GEWERK_FARBE: Record<string, string> = {
  bad: '#1B3A8C',
  wasser: '#1B3A8C',
  heizung: '#EE6C1F',
  waermepumpe: '#F0C000',
  solar: '#F0C000',
  pv: '#F0C000',
  klima: '#8E959E',
  lueftung: '#8E959E',
  elektro: '#475569',
};

const DRINGLICHKEIT_LABEL: Record<string, string> = {
  sofort: 'Sofort',
  wochen_4: 'In 4 Wochen',
  monate_3: 'In 3 Monaten',
  unklar: 'Zeitpunkt offen',
};

export default function BoardClient({ karten }: { karten: BoardKarte[] }) {
  const [aktiverFilter, setAktiverFilter] = useState<string>('alle');

  const kartenNachSpalte = (spaltenStatus: AnfrageStatus[]) =>
    karten.filter((k) => spaltenStatus.includes(k.status));

  const gefilterteKarten =
    aktiverFilter === 'alle'
      ? karten
      : karten.filter((k) => {
          const spalte = SPALTEN_DEFINITION.find((s) => s.id === aktiverFilter);
          return spalte ? spalte.status.includes(k.status) : true;
        });

  return (
    <div className="space-y-6">
      {/* Mobile Filterchips (< 1280px) */}
      <div className="flex xl:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setAktiverFilter('alle')}
          className={`fokus-ring shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            aktiverFilter === 'alle'
              ? 'bg-[color:var(--modul-blau,#1B3A8C)] text-white'
              : 'border border-slate-200 bg-white text-slate-700'
          }`}
        >
          Alle ({karten.length})
        </button>
        {SPALTEN_DEFINITION.map((s) => {
          const anzahl = kartenNachSpalte(s.status).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setAktiverFilter(s.id)}
              className={`fokus-ring shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                aktiverFilter === s.id
                  ? 'bg-[color:var(--modul-blau,#1B3A8C)] text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              {s.titel} ({anzahl})
            </button>
          );
        })}
      </div>

      {/* Desktop Kanban Spalten (>= 1280px) */}
      <div id="anfragen" className="scroll-mt-24 hidden xl:grid xl:grid-cols-5 gap-4">
        {SPALTEN_DEFINITION.map((spalte) => {
          const spaltenKarten = kartenNachSpalte(spalte.status);
          return (
            <div
              key={spalte.id}
              className="flex flex-col rounded-3xl border border-slate-200/80 bg-slate-100/60 p-4 min-h-[600px]"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-slate-800">{spalte.titel}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-xs">
                  {spaltenKarten.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {spaltenKarten.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-600">
                    Keine Vorgänge
                  </div>
                ) : (
                  spaltenKarten.map((k) => <KarteItem key={k.id} karte={k} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet Listenansicht (< 1280px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:hidden">
        {gefilterteKarten.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
            In dieser Ansicht liegen aktuell keine Vorgänge.
          </div>
        ) : (
          gefilterteKarten.map((k) => <KarteItem key={k.id} karte={k} />)
        )}
      </div>
    </div>
  );
}

function KarteItem({ karte }: { karte: BoardKarte }) {
  const gewerkFarbe = karte.gewerkHaupt ? GEWERK_FARBE[karte.gewerkHaupt] || '#8E959E' : '#8E959E';
  const hatSpanne = karte.summeNettoBis && karte.summeNettoBis > 0;
  const bruttoVon = karte.summeNettoVon ? Math.round(karte.summeNettoVon * 1.19) : 0;
  const bruttoBis = karte.summeNettoBis ? Math.round(karte.summeNettoBis * 1.19) : 0;

  return (
    <div className="glass-card relative rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md border border-slate-200/80 bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: gewerkFarbe }}
            title={karte.gewerkHaupt || 'Gewerk offen'}
          />
          <span className="text-xs font-bold text-slate-700">{karte.ksNummer}</span>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {DRINGLICHKEIT_LABEL[karte.dringlichkeit] || karte.dringlichkeit}
        </span>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-900 leading-tight">
          {karte.nachname}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
          {karte.vorhabenKurz}
        </p>
      </div>

      <div className="mb-3">
        {karte.status === 'blockiert' ? (
          <span className="inline-block rounded-md bg-[#FEF3F2] px-2 py-1 text-[11px] font-bold text-[#B42318]">
            Blockiert: Richtpreis fehlt
          </span>
        ) : hatSpanne ? (
          <span className="text-xs font-bold text-[color:var(--modul-blau,#1B3A8C)] tabular-nums">
            {euro(bruttoVon)} – {euro(bruttoBis)} €
          </span>
        ) : (
          <span className="text-xs text-slate-600 italic">Noch ohne Zahlen</span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
        <Link
          href={`/intern/anfragen/${karte.id}`}
          className="text-xs font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
        >
          Details →
        </Link>
        <Link
          href={`/intern/konfigurator/${karte.id}`}
          className="fokus-ring rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Bearbeiten
        </Link>
      </div>
    </div>
  );
}
