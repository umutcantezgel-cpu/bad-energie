import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage } from '@/db/schema';

/**
 * Nummernkreis KS-JJJJ-NNNN, fortlaufend je Kalenderjahr.
 * Die Eindeutigkeit sichert der Unique-Index auf (jahr, laufnr); bei Konflikt wird erneut versucht.
 */

export type Nummer = { jahr: number; laufnr: number; ksNummer: string };

export function formatKsNummer(jahr: number, laufnr: number): string {
  return `KS-${jahr}-${String(laufnr).padStart(4, '0')}`;
}

export function zerlegeKsNummer(ksNummer: string): Nummer | null {
  const treffer = /^KS-(\d{4})-(\d{4})$/.exec(ksNummer.trim());
  if (!treffer) return null;
  return { jahr: Number(treffer[1]), laufnr: Number(treffer[2]), ksNummer: ksNummer.trim() };
}

export async function naechsteLaufnr(jahr: number): Promise<number> {
  const db = await getDb();
  const zeilen = await db
    .select({ hoechste: sql<number | null>`max(${anfrage.laufnr})` })
    .from(anfrage)
    .where(eq(anfrage.jahr, jahr));
  return Number(zeilen[0]?.hoechste ?? 0) + 1;
}

function istEindeutigkeitsfehler(fehler: unknown): boolean {
  const text = fehler instanceof Error ? `${fehler.message}` : String(fehler);
  const code = (fehler as { code?: string } | null)?.code;
  return code === '23505' || /duplicate key|unique constraint|UNIQUE/i.test(text);
}

/**
 * Ruft `anlegen` mit der nächsten freien Nummer auf. Kollidiert eine parallele Anlage
 * mit dem Unique-Index, wird die Nummer neu bestimmt und erneut versucht.
 */
export async function mitNeuerNummer<T>(jahr: number, anlegen: (nummer: Nummer) => Promise<T>, versuche = 10): Promise<T> {
  let letzterFehler: unknown = null;
  for (let i = 0; i < versuche; i += 1) {
    const laufnr = await naechsteLaufnr(jahr);
    const nummer: Nummer = { jahr, laufnr, ksNummer: formatKsNummer(jahr, laufnr) };
    try {
      return await anlegen(nummer);
    } catch (fehler) {
      if (!istEindeutigkeitsfehler(fehler)) throw fehler;
      letzterFehler = fehler;
    }
  }
  throw new Error(`Es konnte keine freie KS-Nummer vergeben werden. ${letzterFehler instanceof Error ? letzterFehler.message : ''}`.trim());
}
