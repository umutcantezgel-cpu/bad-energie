'use client';

/**
 * Auffangnetz fuer Fehler im Root-Layout des Intern-Bereichs.
 * Ersetzt das Layout vollstaendig, deshalb eigene html- und body-Elemente.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F8FAFC', color: '#0F172A' }}>
        <title>Fehler · Bad &amp; Energie Intern</title>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Da ist etwas schiefgegangen</h1>
          <p style={{ fontSize: 16 }}>
            Der Intern-Bereich konnte nicht geladen werden. Bitte erneut versuchen. Bleibt der Fehler, nennen Sie dem
            Buero diese Kennung.
          </p>
          {error.digest ? <p style={{ fontSize: 14, color: '#475569' }}>Kennung {error.digest}</p> : null}
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              minHeight: 56,
              padding: '0 24px',
              borderRadius: 16,
              border: 'none',
              background: '#1B3A8C',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
