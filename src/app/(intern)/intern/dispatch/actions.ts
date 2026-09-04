import type { DispatchBefehl } from '@/lib/services/dispatch-parser';

export type DispatchErgebnis = {
  ok: boolean;
  ksNummer?: string;
  anfrageId?: string;
  rueckmeldung: string;
  fehler?: string;
};

export async function fuehreDispatchAus(befehl: DispatchBefehl): Promise<DispatchErgebnis> {
  try {
    const res = await fetch('/api/intern/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(befehl),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, rueckmeldung: '', fehler: (err as Error).message };
  }
}
