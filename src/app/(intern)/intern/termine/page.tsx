import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { terminfenster, terminfensterReservierung, anfrage as anfrageTabelle } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import TermineClient from './TermineClient';

export const metadata = { title: 'Terminfenster' };

export type TerminfensterEintrag = {
  id: string;
  beschriftung: string;
  beginn: string;
  ende: string;
  reserviertFuerKsNummer: string | null;
  reserviertFuerAnfrageId: string | null;
};

export default async function TerminePage() {
  await verifySession();
  const db = await getDb();

  const fenster = await db
    .select({
      id: terminfenster.id,
      beschriftung: terminfenster.beschriftung,
      beginn: terminfenster.beginn,
      ende: terminfenster.ende,
      ksNummer: anfrageTabelle.ksNummer,
      anfrageId: anfrageTabelle.id,
    })
    .from(terminfenster)
    .leftJoin(
      terminfensterReservierung,
      eq(terminfenster.id, terminfensterReservierung.terminfensterId),
    )
    .leftJoin(
      anfrageTabelle,
      eq(terminfensterReservierung.anfrageId, anfrageTabelle.id),
    )
    .orderBy(asc(terminfenster.beginn));

  const eintraege: TerminfensterEintrag[] = fenster.map((f) => ({
    id: f.id,
    beschriftung: f.beschriftung,
    beginn: f.beginn ? f.beginn.toISOString() : new Date().toISOString(),
    ende: f.ende ? f.ende.toISOString() : new Date().toISOString(),
    reserviertFuerKsNummer: f.ksNummer || null,
    reserviertFuerAnfrageId: f.anfrageId || null,
  }));

  return <TermineClient initialEintraege={eintraege} />;
}
