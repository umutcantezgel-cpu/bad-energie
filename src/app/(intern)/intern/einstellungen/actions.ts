'use server';

import { getDb } from '@/db/client';
import { einstellung } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import type { Einstellungen } from '@/lib/services/kalkulationsdaten';
import { revalidatePath } from 'next/cache';

export async function speichereEinstellungen(
  werte: Einstellungen,
): Promise<{ ok: boolean; fehler?: string }> {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    return { ok: false, fehler: 'Nur der Chef darf Betriebseinstellungen ändern.' };
  }

  const db = await getDb();

  const eintraege: { key: string; wert: unknown }[] = [
    { key: 'versandzeit', wert: werte.versandzeit },
    { key: 'wiedervorlage_tage', wert: werte.wiedervorlageTage },
    { key: 'erinnerung_tage', wert: werte.erinnerungTage },
    { key: 'radius_km', wert: werte.radiusKm },
    { key: 'min_qm', wert: werte.minQm },
    { key: 'speicherfrist_monate', wert: werte.speicherfristMonate },
    { key: 'eingangsbestaetigung', wert: werte.eingangsbestaetigung },
    { key: 'buero_email', wert: werte.bueroEmail },
    { key: 'absender', wert: werte.absender },
    { key: 'briefbogen', wert: werte.briefbogen },
  ];

  for (const e of eintraege) {
    await db
      .insert(einstellung)
      .values({ key: e.key, wert: e.wert })
      .onConflictDoUpdate({
        target: einstellung.key,
        set: { wert: e.wert },
      });
  }

  revalidatePath('/intern/einstellungen');
  return { ok: true };
}
