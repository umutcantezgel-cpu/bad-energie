'use client';

/** Fehlerseite des Intern-Bereichs. Zeigt keine Details, nur die Kennung fuer das Protokoll. */
export default function InternError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-white/90 p-6">
      <h1 className="text-xl font-semibold text-slate-900">Der Bereich konnte nicht geladen werden</h1>
      <p className="mt-2 text-base text-slate-700">
        Bitte erneut versuchen. Ihre lokalen Entwuerfe bleiben auf dem Geraet erhalten.
      </p>
      {error.digest ? <p className="mt-2 text-sm text-slate-500">Kennung {error.digest}</p> : null}
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="fokus-ring mt-6 min-h-[56px] rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
