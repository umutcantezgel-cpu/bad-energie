'use client';
/**
 * Diskreter Einstieg in den Intern-Bereich.
 * Wird nur durch einen langen Druck auf das Signet im Konfigurator-Kopf
 * geöffnet und meldet über die Server Action `anmelden` an.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AnmeldeErgebnis } from '@/lib/types';

export type PinSheetProps = {
  offen: boolean;
  onSchliessen: () => void;
  /** Ziel nach erfolgreicher Anmeldung. */
  ziel?: string;
};

export default function PinSheet({ offen, onSchliessen, ziel = '/intern/konfigurator' }: PinSheetProps) {
  const router = useRouter();
  const [ergebnis, setErgebnis] = useState<AnmeldeErgebnis | undefined>();
  const [laeuft, setLaeuft] = useState(false);
  const ersteEingabe = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLaeuft(true);
    setErgebnis(undefined);
    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get('email') ?? '');
      const pin = String(formData.get('pin') ?? '');
      const res = await fetch('/api/intern/anmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });
      const daten: AnmeldeErgebnis = await res.json();
      setErgebnis(daten);
      if (daten.ok) {
        router.push(ziel);
      }
    } catch {
      setErgebnis({ ok: false, fehler: 'Verbindungsfehler beim Anmelden.' });
    } finally {
      setLaeuft(false);
    }
  };

  useEffect(() => {
    if (offen) ersteEingabe.current?.focus();
  }, [offen]);

  useEffect(() => {
    if (ergebnis?.ok) router.push(ziel);
  }, [ergebnis, router, ziel]);

  useEffect(() => {
    if (!offen) return undefined;
    const beiTaste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSchliessen();
        return;
      }
      if (e.key !== 'Tab' || !dialog.current) return;
      const ziele = dialog.current.querySelectorAll<HTMLElement>('button, input, [href], select, textarea');
      if (ziele.length === 0) return;
      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    };
    document.addEventListener('keydown', beiTaste);
    return () => document.removeEventListener('keydown', beiTaste);
  }, [offen, onSchliessen]);

  if (!offen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Anmeldung schließen"
        onClick={onSchliessen}
        className="absolute inset-0 bg-slate-950/50"
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-titel"
        className="glass-sheet relative w-full max-w-md p-6 sm:rounded-3xl"
      >
        <h2 id="pin-titel" className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-xl)' }}>
          Anmeldung für Mitarbeitende
        </h2>
        <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
          Dieser Bereich ist nicht öffentlich.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="pin-email" className="font-semibold text-slate-900" style={{ fontSize: 'var(--font-size-sm)' }}>
              E-Mail-Adresse
            </label>
            <input
              ref={ersteEingabe}
              id="pin-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="glass-input fokus-ring mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="pin-pin" className="font-semibold text-slate-900" style={{ fontSize: 'var(--font-size-sm)' }}>
              PIN
            </label>
            <input
              id="pin-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
              minLength={6}
              maxLength={8}
              className="glass-input zahl-tabellarisch fokus-ring mt-1.5"
            />
          </div>

          {ergebnis && !ergebnis.ok ? (
            <p role="alert" className="font-semibold" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
              {ergebnis.fehler}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={laeuft}
              className="fokus-ring flex-1 rounded-full px-5 py-3 font-bold text-white disabled:opacity-60"
              style={{ background: 'var(--color-button-primary)', minHeight: '48px', fontSize: 'var(--font-size-base)' }}
            >
              {laeuft ? 'Wird geprüft …' : 'Anmelden'}
            </button>
            <button
              type="button"
              onClick={onSchliessen}
              className="fokus-ring rounded-full border border-slate-300 px-5 py-3 font-bold text-slate-700"
              style={{ minHeight: '48px', fontSize: 'var(--font-size-base)' }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
