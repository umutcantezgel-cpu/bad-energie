'use server';

import { and, eq, gte, isNull } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle } from '@/db/schema';
import { tokenHash } from '@/lib/services/dokument-eingabe';
import { schreibeEreignis } from '@/lib/services/statusmaschine';
import { loeseReservierungen } from '@/lib/services/dokument-eingabe';
import { pruefeLimit } from '@/lib/services/ratelimit';

export type BestaetigenErgebnis = { ok: boolean; fehler?: string };

export async function bestaetigeTermin(
  token: string,
  fensterId: string,
  alternativ: string,
): Promise<BestaetigenErgebnis> {
  const hash = tokenHash(token);
  const limit = await pruefeLimit(`termin:token:${hash}`, 5, 10 * 60 * 1000);
  if (!limit.erlaubt) {
    return { ok: false, fehler: 'Zu viele Versuche. Bitte probieren Sie es später erneut.' };
  }

  const db = await getDb();
  const jetzt = new Date();

  const anfragen = await db
    .select()
    .from(anfrageTabelle)
    .where(
      and(
        eq(anfrageTabelle.bestaetigungsTokenHash, hash),
        gte(anfrageTabelle.tokenGueltigBis, jetzt),
      ),
    )
    .limit(1);

  const a = anfragen[0];
  if (!a) {
    return { ok: false, fehler: 'Der Bestätigungslink ist ungültig oder abgelaufen.' };
  }

  if (a.tokenEingeloestAm) {
    return { ok: false, fehler: 'Dieser Termin wurde bereits bestätigt.' };
  }

  // Atomar einlösen
  const update = await db
    .update(anfrageTabelle)
    .set({
      status: 'antwort',
      antwortAm: jetzt,
      tokenEingeloestAm: jetzt,
      bemerkung: alternativ ? `Kundenwunsch: ${alternativ.slice(0, 300)}` : a.bemerkung,
    })
    .where(
      and(
        eq(anfrageTabelle.id, a.id),
        isNull(anfrageTabelle.tokenEingeloestAm),
      ),
    )
    .returning();

  if (!update.length) {
    return { ok: false, fehler: 'Der Termin wurde bereits bestätigt.' };
  }

  // Andere Reservierungen freigeben
  await loeseReservierungen(a.id);

  await schreibeEreignis({
    anfrageId: a.id,
    typ: 'termin:bestaetigt',
    payload: { fensterId, alternativ: alternativ.slice(0, 300) },
  });

  return { ok: true };
}
