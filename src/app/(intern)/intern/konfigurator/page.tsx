/**
 * Konfigurator im Meister-Modus. Server Component: die Sitzung wird vor dem Rendern
 * geprueft, ohne gueltige Sitzung leitet verifySession um.
 */
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import { verifySession } from '@/lib/services/auth';

export const metadata = { title: 'Konfigurator' };

export default async function KonfiguratorSeite() {
  await verifySession();
  return <TouchConfigurator modus="intern" />;
}
