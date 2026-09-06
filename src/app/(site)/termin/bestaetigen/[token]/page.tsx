import { and, eq, gte } from 'drizzle-orm';
import type { Metadata } from 'next';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, kunde, terminfenster, terminfensterReservierung } from '@/db/schema';
import { tokenHash } from '@/lib/services/dokument-eingabe';
import type { TokenSeiteDTO } from '@/lib/types';
import BestaetigenFormular from './BestaetigenFormular';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Termin bestätigen | Bad & Energie GmbH',
  robots: { index: false, follow: false },
};

export default async function TermineBestaetigenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const hash = tokenHash(token);
  const db = await getDb();
  const jetzt = new Date();

  const anfragen = await db
    .select({
      id: anfrageTabelle.id,
      ksNummer: anfrageTabelle.ksNummer,
      tokenEingeloestAm: anfrageTabelle.tokenEingeloestAm,
      kundeId: anfrageTabelle.kundeId,
    })
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full glass-card p-8 text-center rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link nicht mehr gültig</h1>
          <p className="text-slate-600 mb-6 text-sm">
            Dieser Bestätigungslink ist leider abgelaufen oder wurde bereits verwendet. Bitte kontaktieren Sie uns direkt, um einen neuen Termin abzustimmen.
          </p>
          <a
            href="tel:+49644142956"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] text-white font-semibold text-sm"
          >
            06441-42956 anrufen
          </a>
        </div>
      </div>
    );
  }

  let vorname = '';
  if (a.kundeId) {
    const kunden = await db.select().from(kunde).where(eq(kunde.id, a.kundeId)).limit(1);
    if (kunden[0]?.vorname) vorname = kunden[0].vorname;
  }

  // Reservierte Fenster laden
  const reservierungen = await db
    .select({
      id: terminfenster.id,
      beschriftung: terminfenster.beschriftung,
    })
    .from(terminfensterReservierung)
    .innerJoin(terminfenster, eq(terminfensterReservierung.terminfensterId, terminfenster.id))
    .where(eq(terminfensterReservierung.anfrageId, a.id));

  const dto: TokenSeiteDTO = {
    ksNummer: a.ksNummer,
    vorname,
    fenster: reservierungen,
    eingeloest: Boolean(a.tokenEingeloestAm),
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full glass-card p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <header className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[color:var(--modul-blau,#1B3A8C)] text-xs font-semibold uppercase tracking-wider mb-3">
            {dto.ksNummer}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {dto.vorname ? `Guten Tag ${dto.vorname}` : 'Guten Tag'}
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Bitte bestätigen Sie Ihren Wunschtermin für den unverbindlichen Vor-Ort-Termin.
          </p>
        </header>

        <BestaetigenFormular dto={dto} token={token} />
      </div>
    </div>
  );
}
