import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, anfrageZeile } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import {
  ladeMatrix,
  ladeFoerderRegeln,
  ladeVorbehalte,
  ladeVorlagen,
} from '@/lib/services/kalkulationsdaten';
import MatrixClient from './MatrixClient';

export const metadata = { title: 'Richtpreis-Matrix & Regeln' };

export default async function MatrixPage() {
  const session = await verifySession();
  const db = await getDb();

  const [matrix, foerderRegeln, vorbehalte] = await Promise.all([
    ladeMatrix(),
    ladeFoerderRegeln(),
    ladeVorbehalte(),
  ]);

  const vorlagen = await ladeVorlagen(matrix);

  // Zählen, welche Matrixzeilen blockierte Anfragen blockieren
  const blockierteZeilen = await db
    .select({
      matrixNr: anfrageZeile.matrixNr,
    })
    .from(anfrageZeile)
    .innerJoin(anfrageTabelle, eq(anfrageZeile.anfrageId, anfrageTabelle.id))
    .where(eq(anfrageTabelle.status, 'blockiert'));

  const blockiertZaehler: Record<number, number> = {};
  for (const b of blockierteZeilen) {
    if (b.matrixNr !== null) {
      blockiertZaehler[b.matrixNr] = (blockiertZaehler[b.matrixNr] || 0) + 1;
    }
  }

  return (
    <MatrixClient
      initialMatrix={matrix}
      initialFoerderRegeln={foerderRegeln}
      initialVorbehalte={vorbehalte}
      vorlagen={vorlagen}
      blockiertZaehler={blockiertZaehler}
      istChef={session.rolle === 'chef'}
    />
  );
}
