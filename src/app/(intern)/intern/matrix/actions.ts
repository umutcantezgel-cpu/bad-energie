'use server';

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { richtpreis, foerderRegel, vorbehalt, anfrage as anfrageTabelle } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import type { FoerderRegeln, Gewerk } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function speichereMatrixZeile(
  nr: number,
  von: number | null,
  bis: number | null,
  einheit: 'pauschal' | 'je_stueck' | 'je_lfm' | 'je_tank',
  hinweis = '',
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    return { ok: false, fehler: 'Nur der Chef darf Richtpreise ändern.' };
  }

  const db = await getDb();
  await db
    .update(richtpreis)
    .set({
      von: von !== null && !isNaN(von) ? Math.round(von) : null,
      bis: bis !== null && !isNaN(bis) ? Math.round(bis) : null,
      einheit,
      hinweis: hinweis.trim(),
      geaendertAm: new Date(),
      geaendertVon: session.name,
    })
    .where(eq(richtpreis.nr, nr));

  revalidatePath('/intern/matrix');
  revalidatePath('/intern/board');
  return { ok: true };
}

export async function speichereFoerderRegeln(
  regeln: FoerderRegeln,
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    return { ok: false, fehler: 'Nur der Chef darf Förderregeln ändern.' };
  }

  const db = await getDb();
  await db
    .update(foerderRegel)
    .set({
      grund: regeln.grund,
      effizienz: regeln.effizienz,
      klimageschwindigkeit: regeln.klimageschwindigkeit,
      einkommen: regeln.einkommen,
      deckel: regeln.deckel,
      kostenWe1: regeln.kostenWe1,
      kostenJeWeitere: regeln.kostenJeWeitere,
      maxWe: regeln.maxWe,
      standardsatz: regeln.standardsatz,
      eigenanteilRundung: regeln.eigenanteilRundung,
    })
    .where(eq(foerderRegel.id, 1));

  revalidatePath('/intern/matrix');
  return { ok: true };
}

export async function toggleVorbehalt(
  id: number,
  aktiv: boolean,
): Promise<{ ok: boolean }> {
  await verifySession();
  const db = await getDb();
  await db.update(vorbehalt).set({ aktiv }).where(eq(vorbehalt.id, id));
  revalidatePath('/intern/matrix');
  return { ok: true };
}

export async function erstelleVorbehalt(
  text: string,
  gewerk: Gewerk | null = null,
): Promise<{ ok: boolean; fehler?: string }> {
  await verifySession();
  const db = await getDb();
  await db.insert(vorbehalt).values({
    text: text.trim(),
    gewerk: gewerk || null,
    aktiv: true,
  });
  revalidatePath('/intern/matrix');
  return { ok: true };
}
