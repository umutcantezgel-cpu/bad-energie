import 'server-only';
import type { SessionInfo } from '../types';

// STUB: wird im Backend-Arbeitsstrang vollständig implementiert (Sitzungstabelle, Cookie, Rollen).
/** Liest die Sitzung aus dem Cookie; leitet ohne gültige Sitzung nach /intern um. */
export async function verifySession(): Promise<SessionInfo> {
  throw new Error('verifySession: nicht implementiert');
}

/** Sitzung ohne Redirect (null, wenn nicht angemeldet). */
export async function aktuelleSession(): Promise<SessionInfo | null> {
  return null;
}
