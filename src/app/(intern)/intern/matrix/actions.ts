import type { FoerderRegeln, Gewerk } from '@/lib/types';

export async function speichereMatrixZeile(
  nr: number,
  von: number | null,
  bis: number | null,
  einheit: 'pauschal' | 'je_stueck' | 'je_lfm' | 'je_tank',
  hinweis = '',
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/matrix/zeile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nr, von, bis, einheit, hinweis }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}

export async function speichereFoerderRegeln(
  regeln: FoerderRegeln,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/matrix/foerderregeln', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regeln),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}

export async function toggleVorbehalt(
  id: number,
  aktiv: boolean,
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch('/api/intern/matrix/vorbehalt-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, aktiv }),
    });
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function erstelleVorbehalt(
  text: string,
  gewerk: Gewerk | null = null,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/matrix/vorbehalt-neu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, gewerk }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}
