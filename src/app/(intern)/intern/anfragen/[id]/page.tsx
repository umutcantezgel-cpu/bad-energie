import { notFound } from 'next/navigation';
import { verifySession } from '@/lib/services/auth';
import { ladeInternAnfrage } from '@/lib/services/estimates';
import AnfrageDetailClient from './AnfrageDetailClient';

export const metadata = { title: 'Vorgangsdetails' };

export default async function AnfrageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;
  const dto = await ladeInternAnfrage(id);

  if (!dto) {
    notFound();
  }

  // Für Bauleiter nur eigene oder unzugewiesene Anfragen
  if (session.rolle === 'bauleiter' && dto.bearbeiter && dto.bearbeiter !== session.name) {
    notFound();
  }

  return <AnfrageDetailClient dto={dto} rolle={session.rolle} />;
}
