export async function erstelleTerminfenster(
  beschriftung: string,
  beginnIso: string,
  endeIso: string,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/termine/neu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beschriftung, beginnIso, endeIso }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}

export async function loescheTerminfenster(
  id: string,
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch('/api/intern/termine/loeschen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}
