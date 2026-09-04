'use server';

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { benutzer } from '@/db/schema';
import { verifySession, deaktiviereBenutzer } from '@/lib/services/auth';
import { pinHashen, pinGueltig } from '@/lib/services/pin';
import type { Rolle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function legeBenutzerAn(
  name: string,
  email: string,
  pin: string,
  rolle: Rolle,
  funktion = 'Mitarbeiter',
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    return { ok: false, fehler: 'Nur der Chef darf Benutzer anlegen.' };
  }

  if (!pinGueltig(pin)) {
    return { ok: false, fehler: 'Die PIN muss aus 6 bis 8 Ziffern bestehen.' };
  }

  const db = await getDb();
  const bereinigteEmail = email.trim().toLowerCase();

  const vorhanden = await db.select().from(benutzer).where(eq(benutzer.email, bereinigteEmail)).limit(1);
  if (vorhanden[0]) {
    return { ok: false, fehler: 'Ein Benutzer mit dieser E-Mail existiert bereits.' };
  }

  const pHash = pinHashen(pin);
  await db.insert(benutzer).values({
    id: randomUUID(),
    name: name.trim(),
    email: bereinigteEmail,
    pinHash: pHash,
    rolle,
    funktion: funktion.trim(),
    signaturMail: bereinigteEmail,
    aktiv: true,
  });

  revalidatePath('/intern/benutzer');
  return { ok: true };
}

export async function setzePinNeu(
  benutzerId: string,
  neuePin: string,
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    return { ok: false, fehler: 'Nur der Chef darf PINs zurücksetzen.' };
  }

  if (!pinGueltig(neuePin)) {
    return { ok: false, fehler: 'Die PIN muss aus 6 bis 8 Ziffern bestehen.' };
  }

  const db = await getDb();
  const pHash = pinHashen(neuePin);
  await db
    .update(benutzer)
    .set({
      pinHash: pHash,
      fehlversuche: 0,
      gesperrtBis: null,
    })
    .where(eq(benutzer.id, benutzerId));

  revalidatePath('/intern/benutzer');
  return { ok: true };
}

export async function toggleBenutzerAktiv(
  benutzerId: string,
  aktiv: boolean,
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    return { ok: false, fehler: 'Nur der Chef darf Benutzer aktivieren/deaktivieren.' };
  }

  if (benutzerId === session.benutzerId && !aktiv) {
    return { ok: false, fehler: 'Sie können Ihren eigenen Account nicht deaktivieren.' };
  }

  if (aktiv) {
    const db = await getDb();
    await db.update(benutzer).set({ aktiv: true, fehlversuche: 0, gesperrtBis: null }).where(eq(benutzer.id, benutzerId));
  } else {
    await deaktiviereBenutzer(benutzerId);
  }

  revalidatePath('/intern/benutzer');
  return { ok: true };
}
