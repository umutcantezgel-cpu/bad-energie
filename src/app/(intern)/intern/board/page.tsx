import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, kunde as kundeTabelle } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import { ladeMatrix } from '@/lib/services/kalkulationsdaten';
import BoardClient from './BoardClient';
import type { AnfrageStatus, Dringlichkeit, Gewerk } from '@/lib/types';

export const metadata = { title: 'Vorgangs-Board' };

export type BoardKarte = {
  id: string;
  ksNummer: string;
  nachname: string;
  vorhabenKurz: string;
  status: AnfrageStatus;
  dringlichkeit: Dringlichkeit;
  gewerkHaupt: Gewerk | null;
  summeNettoVon: number | null;
  summeNettoBis: number | null;
  erstelltAm: string;
};

export default async function BoardPage() {
  const session = await verifySession();
  const db = await getDb();

  const [anfragen, matrix] = await Promise.all([
    db
      .select({
        id: anfrageTabelle.id,
        ksNummer: anfrageTabelle.ksNummer,
        status: anfrageTabelle.status,
        dringlichkeit: anfrageTabelle.dringlichkeit,
        vorhabenKurz: anfrageTabelle.vorhabenKurz,
        gewerkHaupt: anfrageTabelle.gewerkHaupt,
        summeNettoVon: anfrageTabelle.summeNettoVon,
        summeNettoBis: anfrageTabelle.summeNettoBis,
        erstelltAm: anfrageTabelle.erstelltAm,
        kundeNachname: kundeTabelle.nachname,
        bearbeiterId: anfrageTabelle.bearbeiterId,
      })
      .from(anfrageTabelle)
      .leftJoin(kundeTabelle, eq(anfrageTabelle.kundeId, kundeTabelle.id))
      .orderBy(desc(anfrageTabelle.erstelltAm)),
    ladeMatrix(),
  ]);

  // Für Bauleiter nur eigene oder unzugewiesene Anfragen
  const gefiltert =
    session.rolle === 'bauleiter'
      ? anfragen.filter((a) => !a.bearbeiterId || a.bearbeiterId === session.benutzerId)
      : anfragen;

  const karten: BoardKarte[] = gefiltert.map((a) => ({
    id: a.id,
    ksNummer: a.ksNummer,
    nachname: a.kundeNachname || 'Interessent',
    vorhabenKurz: a.vorhabenKurz || 'Vorhaben offen',
    status: a.status as AnfrageStatus,
    dringlichkeit: a.dringlichkeit as Dringlichkeit,
    gewerkHaupt: (a.gewerkHaupt as Gewerk) || null,
    summeNettoVon: a.summeNettoVon,
    summeNettoBis: a.summeNettoBis,
    erstelltAm: a.erstelltAm.toISOString(),
  }));

  const leereMatrixZeilen = matrix.filter((z) => z.von === null || z.bis === null).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vorgangs-Board</h1>
          <p className="mt-1 text-sm text-slate-600">
            {karten.length} {karten.length === 1 ? 'Vorgang' : 'Vorgänge'} gesamt · Übersicht über alle Anfragen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/intern/konfigurator"
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-semibold text-white shadow-sm"
          >
            + Neue Anfrage
          </Link>
          <Link
            href="/intern/dispatch"
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
          >
            Dispatch (Diktat)
          </Link>
        </div>
      </div>

      {leereMatrixZeilen > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-amber-900">
                {leereMatrixZeilen} Matrixzeilen sind noch ohne Richtpreis
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Neue Kostenschätzungen starten automatisch im Status „blockiert“, solange die Richtpreise nicht gepflegt sind.
              </p>
            </div>
            <Link
              href="/intern/matrix"
              className="inline-flex shrink-0 min-h-[40px] items-center rounded-xl bg-amber-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
            >
              Zum Matrix-Editor →
            </Link>
          </div>
        </div>
      ) : null}

      <BoardClient karten={karten} />
    </div>
  );
}
