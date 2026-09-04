'use server';

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { terminfenster, terminfensterReservierung } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';

export async function erstelleTerminfenster(
  beschriftung: string,
  beginnIso: string,
  endeIso: string,
): Promise<{ ok: boolean; fehler?: string }> {
  await verifySession();
  if (!beschriftung.trim()) {
    return { ok: false, fehler: 'Beschriftung darf nicht leer sein.' };
  }

  const db = await getDb();
  await db.insert(terminfenster).values({
    id: randomUUID(),
    beschriftung: beschriftung.trim(),
    beginn: new Date(beginnIso),
    ende: new Date(endeIso),
  });

  revalidatePath('/intern/termine');
  return { ok: true };
}

export async function loescheTerminfenster(
  id: string,
): Promise<{ ok: boolean; fehler?: string }> {
  await verifySession();
  const db = await getDb();
  await db.delete(terminfensterReservierung).where(eq(terminfensterReservierung.terminfensterId, id));
  await db.delete(terminfenster).where(eq(terminfenster.id, id));

  revalidatePath('/intern/termine');
  return { ok: true };
}
