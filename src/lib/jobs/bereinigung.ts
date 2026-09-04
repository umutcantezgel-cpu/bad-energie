import 'server-only';
import { and, inArray, isNotNull, lt } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, terminfensterReservierung } from '@/db/schema';
import { raeumeLimitsAuf } from '@/lib/services/ratelimit';
import { raeumeSitzungenAuf } from '@/lib/services/session';
import type { JobErgebnis } from './runner';

/**
 * Wöchentliche Bereinigung: abgelaufene Bestätigungstoken, Reservierungen zu erledigten
 * oder verworfenen Anfragen (Regel 6), abgelaufene Sitzungen und alte Rate-Limit-Zähler.
 */
export async function bereinigungJob(jetzt: Date): Promise<JobErgebnis> {
  const db = await getDb();

  const token = await db.update(anfrageTabelle)
    .set({ bestaetigungsTokenHash: null, tokenGueltigBis: null })
    .where(and(isNotNull(anfrageTabelle.bestaetigungsTokenHash), lt(anfrageTabelle.tokenGueltigBis, jetzt)))
    .returning({ id: anfrageTabelle.id });

  const erledigt = await db.select({ id: anfrageTabelle.id }).from(anfrageTabelle)
    .where(inArray(anfrageTabelle.status, ['verworfen', 'antwort', 'termin']));
  let reservierungen = 0;
  if (erledigt.length) {
    const geloescht = await db.delete(terminfensterReservierung)
      .where(inArray(terminfensterReservierung.anfrageId, erledigt.map((e) => e.id)))
      .returning({ id: terminfensterReservierung.terminfensterId });
    reservierungen = geloescht.length;
  }

  const sitzungen = await raeumeSitzungenAuf(jetzt);
  const limits = await raeumeLimitsAuf(jetzt);

  const verarbeitet = token.length + reservierungen + sitzungen + limits;
  return {
    verarbeitet,
    blockiert: 0,
    zusammenfassung: `${token.length} Token entwertet, ${reservierungen} Reservierungen gelöst, ${sitzungen} Sitzungen entfernt, ${limits} Zähler aufgeräumt.`,
  };
}
