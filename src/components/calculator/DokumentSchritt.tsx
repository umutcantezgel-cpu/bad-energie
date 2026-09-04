'use client';

/**
 * Schritt "Dokument": persoenlicher Satz (Pflicht), zwei Terminfenster, Ausfuehrungssatz,
 * Annahmen und Vorbehalte. Die Textregeln nach Regel 5 werden hier nur als Warnung
 * angezeigt; die harte Sperre liegt serverseitig.
 */
import { useId } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';
import type { TerminfensterOption } from '@/lib/types';
import { textregelWarnungen } from './meister-utils';

export type DokumentSchrittProps = {
  persoenlicherSatz: string;
  ausfuehrungSatz: string;
  annahmen: string[];
  vorbehalte: string[];
  terminfenster: TerminfensterOption[];
  gewaehlteFenster: string[];
  ladeFehler: string;
  onPersoenlicherSatz: (wert: string) => void;
  onAusfuehrungSatz: (wert: string) => void;
  onAnnahmen: (werte: string[]) => void;
  onVorbehalte: (werte: string[]) => void;
  onFenster: (ids: string[]) => void;
};

function Liste({
  titel,
  hinweis,
  werte,
  onChange,
}: {
  titel: string;
  hinweis: string;
  werte: string[];
  onChange: (werte: string[]) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-base font-semibold text-slate-900">{titel}</legend>
      <p className="text-sm text-slate-600">{hinweis}</p>
      <ul className="mt-2 space-y-2">
        {werte.map((wert, index) => (
          <li key={index} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`${titel}-${index}`}>
              {titel} Zeile {index + 1}
            </label>
            <input
              id={`${titel}-${index}`}
              value={wert}
              maxLength={300}
              onChange={(e) => onChange(werte.map((w, i) => (i === index ? e.target.value : w)))}
              className="glass-input h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
            />
            <button
              type="button"
              aria-label={`Zeile ${index + 1} entfernen`}
              onClick={() => onChange(werte.filter((_, i) => i !== index))}
              className="fokus-ring flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#B42318]"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...werte, ''])}
        className="fokus-ring mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-slate-700"
      >
        <Plus aria-hidden className="h-4 w-4" /> Zeile hinzufuegen
      </button>
    </fieldset>
  );
}

export default function DokumentSchritt({
  persoenlicherSatz,
  ausfuehrungSatz,
  annahmen,
  vorbehalte,
  terminfenster,
  gewaehlteFenster,
  ladeFehler,
  onPersoenlicherSatz,
  onAusfuehrungSatz,
  onAnnahmen,
  onVorbehalte,
  onFenster,
}: DokumentSchrittProps) {
  const idSatz = useId();
  const idAusfuehrung = useId();
  const warnungen = [...textregelWarnungen(persoenlicherSatz), ...textregelWarnungen(ausfuehrungSatz)];

  const umschalten = (id: string) => {
    if (gewaehlteFenster.includes(id)) onFenster(gewaehlteFenster.filter((f) => f !== id));
    else if (gewaehlteFenster.length < 2) onFenster([...gewaehlteFenster, id]);
    else onFenster([gewaehlteFenster[1], id]);
  };

  return (
    <div>
      <label htmlFor={idSatz} className="block text-base font-semibold text-slate-900">
        Persoenlicher Satz (Pflicht)
      </label>
      <p className="text-sm text-slate-600">Was Sie vor Ort gesehen haben. Kurz, ohne Floskel, ohne Bindestrich.</p>
      <textarea
        id={idSatz}
        value={persoenlicherSatz}
        rows={3}
        maxLength={400}
        onChange={(e) => onPersoenlicherSatz(e.target.value)}
        className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base text-slate-900"
      />

      <label htmlFor={idAusfuehrung} className="mt-6 block text-base font-semibold text-slate-900">
        Satz zur Ausfuehrung
      </label>
      <textarea
        id={idAusfuehrung}
        value={ausfuehrungSatz}
        rows={2}
        maxLength={400}
        onChange={(e) => onAusfuehrungSatz(e.target.value)}
        className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base text-slate-900"
      />

      {warnungen.length ? (
        <ul className="mt-3 space-y-1 rounded-2xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">
          {warnungen.map((w, i) => (
            <li key={i} className="flex items-center gap-2">
              <AlertTriangle aria-hidden className="h-4 w-4" />
              {w}
            </li>
          ))}
        </ul>
      ) : null}

      <fieldset className="mt-6">
        <legend className="text-base font-semibold text-slate-900">Terminvorschlag, genau zwei Fenster</legend>
        {ladeFehler ? (
          <p className="text-sm text-[#B42318]">{ladeFehler}</p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {terminfenster.map((f) => {
              const gewaehlt = gewaehlteFenster.includes(f.id);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gewaehlt}
                    disabled={!f.frei && !gewaehlt}
                    onClick={() => umschalten(f.id)}
                    className={[
                      'fokus-ring w-full rounded-2xl border p-4 text-left text-base',
                      gewaehlt
                        ? 'border-[color:var(--modul-blau,#1B3A8C)] bg-[color:var(--modul-blau,#1B3A8C)] text-white'
                        : 'border-slate-200 bg-white text-slate-800',
                      !f.frei && !gewaehlt ? 'opacity-50' : '',
                    ].join(' ')}
                  >
                    {f.beschriftung}
                    {!f.frei && !gewaehlt ? <span className="block text-sm">bereits reserviert</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-sm text-slate-600">{gewaehlteFenster.length} von 2 gewaehlt</p>
      </fieldset>

      <Liste
        titel="Annahmen"
        hinweis="Diese Saetze stehen im Kundendokument."
        werte={annahmen}
        onChange={onAnnahmen}
      />
      <Liste
        titel="Nicht enthalten und bauseits"
        hinweis="Ohne Vorbehalt gibt es vor der Freigabe einen Hinweis."
        werte={vorbehalte}
        onChange={onVorbehalte}
      />
    </div>
  );
}
