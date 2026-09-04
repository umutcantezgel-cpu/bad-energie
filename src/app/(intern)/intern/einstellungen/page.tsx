import { verifySession } from '@/lib/services/auth';
import { ladeEinstellungen } from '@/lib/services/kalkulationsdaten';
import EinstellungenClient from './EinstellungenClient';

export const metadata = { title: 'Betriebseinstellungen' };

export default async function EinstellungenPage() {
  const session = await verifySession();
  const einstellungen = await ladeEinstellungen();

  return (
    <EinstellungenClient
      initialEinstellungen={einstellungen}
      istChef={session.rolle === 'chef'}
    />
  );
}
