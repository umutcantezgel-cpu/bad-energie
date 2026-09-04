import type { Rolle } from '@/lib/types';

export async function legeBenutzerAn(
  name: string,
  email: string,
  pin: string,
  rolle: Rolle,
  funktion = 'Mitarbeiter',
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/benutzer/neu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, pin, rolle, funktion }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}

export async function setzePinNeu(
  benutzerId: string,
  neuePin: string,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/benutzer/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ benutzerId, neuePin }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}

export async function toggleBenutzerAktiv(
  benutzerId: string,
  aktiv: boolean,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/benutzer/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ benutzerId, aktiv }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}
