/**
 * Entwurfs- und Freigabeliste. Server Component: Sitzung pruefen, Karten laden,
 * Darstellung und Aktionen im Client.
 */
import { verifySession } from '@/lib/services/auth';
import { ladeEntwuerfe } from '../actions';
import EntwuerfeClient from './EntwuerfeClient';

export const metadata = { title: 'Entwuerfe' };

export default async function EntwuerfeSeite() {
  await verifySession();
  const karten = await ladeEntwuerfe();
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Entwuerfe und Freigaben</h1>
      <p className="mt-1 text-base text-slate-600">
        Freigegebene Kostenschaetzungen gehen um 18:00 raus, sofern nicht sofort gesendet wird.
      </p>
      <div className="mt-6">
        <EntwuerfeClient karten={karten} />
      </div>
    </>
  );
}
