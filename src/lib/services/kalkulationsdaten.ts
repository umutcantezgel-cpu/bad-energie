import 'server-only';
import type { Kalkulationsdaten } from '../types';

// STUB: wird im Backend-Arbeitsstrang implementiert (liest Matrix, Vorlagen, Förderregeln, Vorbehalte aus der DB).
export async function ladeKalkulationsdaten(): Promise<Kalkulationsdaten> {
  throw new Error('ladeKalkulationsdaten: nicht implementiert');
}
