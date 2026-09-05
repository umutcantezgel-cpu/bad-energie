import 'server-only';

/**
 * Herkunftsprüfung für mutierende Route Handler (`/api/intern/*`, `/api/estimate` im Intern-Modus).
 * SameSite=lax schützt nicht gegen POST aus fremdem Kontext; deshalb Origin bzw. Sec-Fetch-Site prüfen.
 */

export type HerkunftErgebnis = { ok: true } | { ok: false; grund: string };

/**
 * Vergleichsmaß ist allein die eingestellte eigene Adresse.
 * `host` und `x-forwarded-host` stammen aus der Anfrage selbst und lassen sich vom Aufrufer
 * frei setzen; wer sie als erlaubt annimmt, hebt die Prüfung auf.
 */
function urlErlaubt(u: URL): boolean {
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try {
      if (new URL(appUrl).host === u.host) return true;
    } catch { /* ungültige APP_URL wird von env.ts gemeldet */ }
  }
  // In Entwicklung und Test läuft der Server unter wechselnden Ports auf dem eigenen Rechner.
  if (process.env.NODE_ENV !== 'production') {
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]' || u.hostname === '::1') return true;
  }
  return false;
}

function passt(wert: string): boolean {
  try {
    return urlErlaubt(new URL(wert));
  } catch {
    return false;
  }
}

export function pruefeHerkunft(request: Request): HerkunftErgebnis {
  const site = request.headers.get('sec-fetch-site');
  if (site && (site === 'same-origin' || site === 'same-site' || site === 'none')) return { ok: true };
  if (site && site === 'cross-site') return { ok: false, grund: 'Anfrage aus fremdem Kontext.' };

  const origin = request.headers.get('origin');
  if (!origin) {
    // Kein Origin: nur Nicht-Browser-Aufrufe (Cron, Tests). Referer als zweite Quelle.
    const referer = request.headers.get('referer');
    if (!referer) return { ok: true };
    if (passt(referer)) return { ok: true };
    return { ok: false, grund: 'Anfrage aus fremdem Kontext.' };
  }
  if (passt(origin)) return { ok: true };
  return { ok: false, grund: 'Anfrage aus fremdem Kontext.' };
}
