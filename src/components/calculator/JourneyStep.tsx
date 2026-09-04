'use client';
/**
 * Ein Fragenschritt des Kunden-Modus.
 * Rendert Kacheln, Regler, Mengensteller und Textfelder einer Journey und zeigt
 * Validierungsmeldungen inline. Kein `alert()`.
 */
import React, { useId } from 'react';
import type { Frage, Journey, JourneyZustand, OptionWert, Schritt } from '@/lib/journeys';
import { leseWert, sichtbareFragen } from '@/lib/journeys';
import ChoiceTile from './ChoiceTile';
import RangeField from './RangeField';
import { type GewerkFarbe } from './konfigurator-utils';

export type JourneyStepProps = {
  journey: Journey;
  schritt: Schritt;
  zustand: JourneyZustand;
  fehler: Record<string, string>;
  gewerk: GewerkFarbe;
  /** Zusatzinhalt je Option, zum Beispiel der Ausstellungspreis. */
  zusatzFuerOption?: (frage: Frage, wert: OptionWert) => React.ReactNode;
  onAendern: (frage: Frage, wert: unknown) => void;
};

function Fehlermeldung({ text, id }: { text: string; id: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-2 font-semibold"
      style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16h.01" strokeLinecap="round" />
      </svg>
      <span>{text}</span>
    </p>
  );
}

function Mengensteller({
  label,
  beschreibung,
  wert,
  min,
  max,
  einheit,
  onChange,
}: {
  label: string;
  beschreibung?: string;
  wert: number;
  min: number;
  max: number;
  einheit: string;
  onChange: (wert: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-bold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
        {label}
      </label>
      {beschreibung ? (
        <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
          {beschreibung}
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, wert - 1))}
          disabled={wert <= min}
          aria-label={`${label}: eins weniger`}
          className="fokus-ring flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-xl font-bold text-slate-700 disabled:opacity-50"
        >
          &minus;
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={wert}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n))));
          }}
          className="glass-input zahl-tabellarisch fokus-ring w-24 text-center font-bold"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, wert + 1))}
          disabled={wert >= max}
          aria-label={`${label}: eins mehr`}
          className="fokus-ring flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-xl font-bold text-slate-700 disabled:opacity-50"
        >
          +
        </button>
        <span className="text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
          {einheit}
        </span>
      </div>
    </div>
  );
}

export default function JourneyStep({
  journey,
  schritt,
  zustand,
  fehler,
  gewerk,
  zusatzFuerOption,
  onAendern,
}: JourneyStepProps) {
  const fragen = sichtbareFragen(schritt, zustand);

  return (
    <div className="space-y-10">
      {schritt.frage ? (
        <header className="space-y-2">
          <h2 className="font-black tracking-tight text-slate-900" style={{ fontSize: 'var(--font-size-display)' }}>
            {schritt.frage}
          </h2>
          {schritt.erklaerung ? (
            <p className="max-w-2xl text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
              {schritt.erklaerung}
            </p>
          ) : null}
        </header>
      ) : null}

      {fragen.map((frage) => {
        const meldung = fehler[frage.id];
        const fehlerId = `fehler-${journey.id}-${frage.id}`;

        if (frage.art === 'einzelauswahl' || frage.art === 'mehrfachauswahl') {
          const mehrfach = frage.art === 'mehrfachauswahl';
          const aktuell = leseWert(zustand, frage);
          const gewaehlteListe = Array.isArray(aktuell) ? (aktuell as OptionWert[]) : [];
          const spalten = frage.spalten === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';

          return (
            <fieldset key={frage.id} className="border-0 p-0">
              <legend className="mb-1 font-bold text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                {frage.frage}
              </legend>
              {frage.erklaerung ? (
                <p className="mb-4 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {frage.erklaerung}
                </p>
              ) : null}
              <div
                role={mehrfach ? 'group' : 'radiogroup'}
                aria-label={frage.frage}
                aria-invalid={meldung ? true : undefined}
                aria-describedby={meldung ? fehlerId : undefined}
                className={`grid grid-cols-1 gap-3 ${spalten}`}
              >
                {frage.optionen.map((option) => {
                  const gewaehlt = mehrfach
                    ? gewaehlteListe.includes(option.wert)
                    : aktuell === option.wert;
                  return (
                    <ChoiceTile
                      key={String(option.wert)}
                      titel={option.titel}
                      untertitel={option.untertitel}
                      piktogramm={option.piktogramm}
                      gewaehlt={gewaehlt}
                      mehrfach={mehrfach}
                      gewerk={gewerk}
                      zusatz={zusatzFuerOption?.(frage, option.wert)}
                      onSelect={() => {
                        if (!mehrfach) {
                          onAendern(frage, option.wert);
                          return;
                        }
                        const naechste = gewaehlt
                          ? gewaehlteListe.filter((w) => w !== option.wert)
                          : [...gewaehlteListe, option.wert];
                        onAendern(frage, naechste);
                      }}
                    />
                  );
                })}
              </div>
              {meldung ? <Fehlermeldung text={meldung} id={fehlerId} /> : null}
            </fieldset>
          );
        }

        if (frage.art === 'zahl') {
          const wert = Number(leseWert(zustand, frage) ?? frage.min);
          return (
            <div key={frage.id}>
              <RangeField
                label={frage.frage}
                beschreibung={frage.erklaerung}
                wert={wert}
                min={frage.min}
                max={frage.max}
                schritt={frage.schritt}
                einheit={frage.einheit}
                rasten={frage.rasten}
                nachkommastellen={frage.nachkommastellen}
                onChange={(neu) => onAendern(frage, neu)}
              />
              {meldung ? <Fehlermeldung text={meldung} id={fehlerId} /> : null}
            </div>
          );
        }

        if (frage.art === 'anzahl') {
          const wert = Number(leseWert(zustand, frage) ?? frage.min);
          return (
            <div key={frage.id}>
              <Mengensteller
                label={frage.frage}
                beschreibung={frage.erklaerung}
                wert={wert}
                min={frage.min}
                max={frage.max}
                einheit={frage.einheit}
                onChange={(neu) => onAendern(frage, neu)}
              />
              {meldung ? <Fehlermeldung text={meldung} id={fehlerId} /> : null}
            </div>
          );
        }

        if (frage.art === 'text') {
          const textWert = String(leseWert(zustand, frage) ?? '');
          return (
            <div key={frage.id} className="max-w-sm">
              <label htmlFor={`feld-${frage.id}`} className="font-bold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
                {frage.frage}
              </label>
              {frage.erklaerung ? (
                <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {frage.erklaerung}
                </p>
              ) : null}
              <input
                id={`feld-${frage.id}`}
                type="text"
                inputMode={frage.eingabemodus === 'numeric' ? 'numeric' : 'text'}
                maxLength={frage.maxLaenge}
                placeholder={frage.platzhalter}
                value={textWert}
                aria-invalid={meldung ? true : undefined}
                aria-describedby={meldung ? fehlerId : undefined}
                onChange={(e) => onAendern(frage, e.target.value)}
                className="glass-input fokus-ring mt-3"
              />
              {meldung ? <Fehlermeldung text={meldung} id={fehlerId} /> : null}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
