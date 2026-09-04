'use client';

/**
 * PIN-Login des Intern-Bereichs.
 *
 * E-Mail und PIN (sechs bis acht Ziffern) gehen an die Server Action `anmelden`,
 * die die Sitzung setzt. Die Fehlermeldung ist bewusst generisch, damit sie keine
 * Auskunft ueber vorhandene Benutzer gibt. Nach Erfolg wechselt der Client in den
 * Konfigurator.
 */
import { useActionState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { anmelden } from './actions';
import type { AnmeldeErgebnis } from '@/lib/types';

export default function InternAnmeldung() {
  const router = useRouter();
  const [zustand, aktion, laeuft] = useActionState<AnmeldeErgebnis | undefined, FormData>(anmelden, undefined);
  const idEmail = useId();
  const idPin = useId();

  useEffect(() => {
    if (zustand?.ok) router.push('/intern/konfigurator');
  }, [zustand, router]);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900">Anmeldung</h1>
      <p className="mt-1 text-base text-slate-600">Bitte E-Mail und Ihre PIN eingeben.</p>

      <form action={aktion} className="mt-6 space-y-4">
        <label className="block" htmlFor={idEmail}>
          <span className="block text-sm font-medium text-slate-700">E-Mail</span>
          <input
            id={idEmail}
            name="email"
            type="email"
            required
            autoComplete="username"
            className="glass-input mt-1 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900"
          />
        </label>

        <label className="block" htmlFor={idPin}>
          <span className="block text-sm font-medium text-slate-700">PIN</span>
          <input
            id={idPin}
            name="pin"
            type="password"
            required
            inputMode="numeric"
            pattern="[0-9]{6,8}"
            minLength={6}
            maxLength={8}
            autoComplete="current-password"
            className="glass-input mt-1 h-16 w-full rounded-2xl border border-slate-200 bg-white px-4 text-2xl tracking-[0.4em] tabular-nums text-slate-900"
          />
        </label>

        {zustand && !zustand.ok ? (
          <p role="alert" className="rounded-2xl bg-[#FEF3F2] p-3 text-sm font-medium text-[#B42318]">
            {zustand.fehler || 'Anmeldung nicht moeglich.'}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={laeuft}
          className="fokus-ring min-h-[56px] w-full rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-lg font-semibold text-white disabled:opacity-60"
        >
          {laeuft ? 'Wird geprueft' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
