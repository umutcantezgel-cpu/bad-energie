import 'server-only';

/**
 * Herkunftsprüfung für mutierende Route Handler (`/api/intern/*`, `/api/estimate` im Intern-Modus).
 * SameSite=lax schützt nicht gegen POST aus fremdem Kontext; deshalb Origin bzw. Sec-Fetch-Site prüfen.
 */

export type HerkunftErgebnis = { ok: true } | { ok: false; grund: string };

function erlaubteHosts(request: Request): Set<string> {
  const hosts = new Set<string>();
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try { hosts.add(new URL(appUrl).host); } catch { /* ungültige APP_URL wird von env.ts gemeldet */ }
  }
  const host = request.headers.get('host');
  if (host) hosts.add(host);
  const forwarded = request.headers.get('x-forwarded-host');
  if (forwarded) hosts.add(forwarded.split(',')[0].trim());
  return hosts;
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
    try {
      if (erlaubteHosts(request).has(new URL(referer).host)) return { ok: true };
    } catch { /* unbrauchbarer Referer */ }
    return { ok: false, grund: 'Anfrage aus fremdem Kontext.' };
  }
  try {
    if (erlaubteHosts(request).has(new URL(origin).host)) return { ok: true };
  } catch { /* unbrauchbarer Origin */ }
  return { ok: false, grund: 'Anfrage aus fremdem Kontext.' };
}
