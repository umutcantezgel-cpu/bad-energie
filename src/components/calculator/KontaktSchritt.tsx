'use client';
/**
 * Kontakt- und Wunschterminteil des letzten Schritts.
 * Die Angaben dieses Schritts werden nie im Browser gespeichert.
 */
import React from 'react';
import Link from 'next/link';

export type KontaktFelder = {
  anrede: '' | 'Frau' | 'Herr';
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  kenntnisnahme: boolean;
  eingangsbestaetigung: boolean;
};

export const LEERER_KONTAKT: KontaktFelder = {
  anrede: '',
  vorname: '',
  nachname: '',
  email: '',
  telefon: '',
  kenntnisnahme: false,
  eingangsbestaetigung: false,
};

export type KontaktSchrittProps = {
  kontakt: KontaktFelder;
  wunschtermine: [string, string];
  fehler: Record<string, string>;
  onKontakt: (felder: KontaktFelder) => void;
  onWunschtermine: (termine: [string, string]) => void;
};

function Feld({
  id,
  label,
  children,
  meldung,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  meldung?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-semibold text-slate-900" style={{ fontSize: 'var(--font-size-sm)' }}>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {meldung ? (
        <p id={`fehler-${id}`} role="alert" className="mt-1.5 font-semibold" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
          {meldung}
        </p>
      ) : null}
    </div>
  );
}

export default function KontaktSchritt({
  kontakt,
  wunschtermine,
  fehler,
  onKontakt,
  onWunschtermine,
}: KontaktSchrittProps) {
  const setze = <K extends keyof KontaktFelder>(feld: K, wert: KontaktFelder[K]) =>
    onKontakt({ ...kontakt, [feld]: wert });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-xl)' }}>
          Wohin dürfen wir antworten?
        </h3>
        <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
          Wir melden uns persönlich. Ihre Angaben nutzen wir nur für Ihre Anfrage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Feld id="k-anrede" label="Anrede">
          <select
            id="k-anrede"
            value={kontakt.anrede}
            onChange={(e) => setze('anrede', e.target.value as KontaktFelder['anrede'])}
            className="glass-input fokus-ring"
          >
            <option value="">Keine Angabe</option>
            <option value="Frau">Frau</option>
            <option value="Herr">Herr</option>
          </select>
        </Feld>

        <Feld id="k-vorname" label="Vorname">
          <input
            id="k-vorname"
            type="text"
            autoComplete="given-name"
            value={kontakt.vorname}
            onChange={(e) => setze('vorname', e.target.value)}
            className="glass-input fokus-ring"
          />
        </Feld>

        <Feld id="k-nachname" label="Nachname" meldung={fehler.nachname}>
          <input
            id="k-nachname"
            type="text"
            required
            autoComplete="family-name"
            value={kontakt.nachname}
            aria-invalid={fehler.nachname ? true : undefined}
            aria-describedby={fehler.nachname ? 'fehler-k-nachname' : undefined}
            onChange={(e) => setze('nachname', e.target.value)}
            className="glass-input fokus-ring"
          />
        </Feld>

        <Feld id="k-email" label="E-Mail-Adresse" meldung={fehler.email}>
          <input
            id="k-email"
            type="email"
            required
            autoComplete="email"
            value={kontakt.email}
            aria-invalid={fehler.email ? true : undefined}
            aria-describedby={fehler.email ? 'fehler-k-email' : undefined}
            onChange={(e) => setze('email', e.target.value)}
            className="glass-input fokus-ring"
          />
        </Feld>

        <Feld id="k-telefon" label="Telefonnummer" meldung={fehler.telefon}>
          <input
            id="k-telefon"
            type="tel"
            autoComplete="tel"
            value={kontakt.telefon}
            aria-invalid={fehler.telefon ? true : undefined}
            aria-describedby={fehler.telefon ? 'fehler-k-telefon' : undefined}
            onChange={(e) => setze('telefon', e.target.value)}
            className="glass-input fokus-ring"
          />
        </Feld>
      </div>

      <fieldset className="border-0 p-0">
        <legend className="font-bold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
          Wann passt es Ihnen?
        </legend>
        <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
          Zwei Wunschzeitfenster als Vorschlag. Das ist noch kein fester Termin.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Feld id="k-termin-1" label="Erstes Zeitfenster">
            <input
              id="k-termin-1"
              type="text"
              maxLength={120}
              placeholder="Dienstag vormittags"
              value={wunschtermine[0]}
              onChange={(e) => onWunschtermine([e.target.value, wunschtermine[1]])}
              className="glass-input fokus-ring"
            />
          </Feld>
          <Feld id="k-termin-2" label="Zweites Zeitfenster">
            <input
              id="k-termin-2"
              type="text"
              maxLength={120}
              placeholder="Donnerstag nachmittags"
              value={wunschtermine[1]}
              onChange={(e) => onWunschtermine([wunschtermine[0], e.target.value])}
              className="glass-input fokus-ring"
            />
          </Feld>
        </div>
      </fieldset>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-slate-700" style={{ fontSize: 'var(--font-size-sm)' }}>
          <input
            type="checkbox"
            required
            checked={kontakt.kenntnisnahme}
            aria-invalid={fehler.kenntnisnahme ? true : undefined}
            aria-describedby={fehler.kenntnisnahme ? 'fehler-kenntnisnahme' : undefined}
            onChange={(e) => setze('kenntnisnahme', e.target.checked)}
            className="fokus-ring mt-0.5 h-5 w-5 shrink-0 rounded"
          />
          <span>
            Ich habe die{' '}
            <Link href="/datenschutz" className="font-semibold underline" style={{ color: 'var(--modul-blau)' }}>
              Datenschutzerklärung
            </Link>{' '}
            zur Kenntnis genommen.
          </span>
        </label>
        {fehler.kenntnisnahme ? (
          <p id="fehler-kenntnisnahme" role="alert" className="font-semibold" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
            {fehler.kenntnisnahme}
          </p>
        ) : null}

        <label className="flex cursor-pointer items-start gap-3 text-slate-700" style={{ fontSize: 'var(--font-size-sm)' }}>
          <input
            type="checkbox"
            checked={kontakt.eingangsbestaetigung}
            onChange={(e) => setze('eingangsbestaetigung', e.target.checked)}
            className="fokus-ring mt-0.5 h-5 w-5 shrink-0 rounded"
          />
          <span>Bitte schicken Sie mir eine kurze Eingangsbestätigung per E-Mail.</span>
        </label>
      </div>
    </div>
  );
}
