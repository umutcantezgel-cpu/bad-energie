/**
 * Konfigurator zu einer bestehenden Anfrage. Laedt den Vorgang serverseitig und
 * uebergibt ihn als Anfangszustand an den Meister-Modus.
 */
import { notFound } from 'next/navigation';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import { verifySession } from '@/lib/services/auth';
import { ladeAnfrage } from '../../actions';

export const metadata = { title: 'Konfigurator' };

export default async function KonfiguratorAnfrageSeite({ params }: { params: Promise<{ anfrageId: string }> }) {
  await verifySession();
  const { anfrageId } = await params;
  const initial = await ladeAnfrage(anfrageId);
  if (!initial) notFound();
  return <TouchConfigurator modus="intern" anfrageId={anfrageId} initial={initial} />;
}
