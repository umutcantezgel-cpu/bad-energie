import type { AnfrageStatus } from '@/lib/types';

/** DSGVO Art. 17: Löschen einer Anfrage samt Anhängen, Dokumenten und Löschprotokoll-Eintrag. */
export async function loescheAnfrage(anfrageId: string): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch(`/api/intern/anfragen/${encodeURIComponent(anfrageId)}/loeschen`, {
      method: 'POST',
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}

/** DSGVO Art. 15: Datenauskunft als JSON */
export async function holeAuskunftJson(anfrageId: string): Promise<string> {
  const res = await fetch(`/api/intern/anfragen/${encodeURIComponent(anfrageId)}/auskunft`);
  if (!res.ok) throw new Error('Fehler beim Abrufen der Datenauskunft.');
  const json = await res.json();
  return JSON.stringify(json, null, 2);
}

/** CSV-Zeile für diese Anfrage im Altsystem-Format (16 Spalten) */
export async function holeCsvExport(anfrageId: string): Promise<string> {
  const res = await fetch(`/api/intern/anfragen/${encodeURIComponent(anfrageId)}/csv`);
  if (!res.ok) throw new Error('Fehler beim Exportieren der CSV-Daten.');
  return await res.text();
}

/** Ändert den Status eines Vorgangs manuell */
export async function aendereStatus(
  anfrageId: string,
  neuerStatus: AnfrageStatus,
  grund = '',
): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const res = await fetch(`/api/intern/anfragen/${encodeURIComponent(anfrageId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: neuerStatus, grund }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message };
  }
}
