export type BestaetigenErgebnis = { ok: boolean; fehler?: string };

export async function bestaetigeTermin(
  token: string,
  fensterId: string,
  alternativ: string,
): Promise<BestaetigenErgebnis> {
  try {
    const res = await fetch('/api/intern/termin-bestaetigen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, fensterId, alternativ }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message || 'Netzwerkfehler.' };
  }
}
