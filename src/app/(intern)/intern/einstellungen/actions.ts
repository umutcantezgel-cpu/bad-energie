import type { Einstellungen } from '@/lib/services/kalkulationsdaten';

export async function speichereEinstellungen(
  werte: Einstellungen,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/einstellungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(werte),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}
