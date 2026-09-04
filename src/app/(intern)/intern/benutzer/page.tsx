import { desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb } from '@/db/client';
import { benutzer } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import type { Rolle } from '@/lib/types';
import BenutzerClient from './BenutzerClient';

export const metadata = { title: 'Benutzerverwaltung' };

export type BenutzerEintrag = {
  id: string;
  name: string;
  email: string;
  rolle: Rolle;
  funktion: string;
  aktiv: boolean;
  fehlversuche: number;
  gesperrtBis: string | null;
  letzterLoginAm: string | null;
  erstelltAm: string;
};

export default async function BenutzerPage() {
  const session = await verifySession();
  if (session.rolle !== 'chef') {
    redirect('/intern/board');
  }

  const db = await getDb();
  const liste = await db.select().from(benutzer).orderBy(desc(benutzer.erstelltAm));

  const eintraege: BenutzerEintrag[] = liste.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    rolle: b.rolle as Rolle,
    funktion: b.funktion,
    aktiv: b.aktiv,
    fehlversuche: b.fehlversuche,
    gesperrtBis: b.gesperrtBis?.toISOString() ?? null,
    letzterLoginAm: b.letzterLoginAm?.toISOString() ?? null,
    erstelltAm: b.erstelltAm.toISOString(),
  }));

  return <BenutzerClient initialBenutzer={eintraege} />;
}
