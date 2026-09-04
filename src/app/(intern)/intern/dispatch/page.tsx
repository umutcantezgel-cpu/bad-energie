import { verifySession } from '@/lib/services/auth';
import DispatchClient from './DispatchClient';

export const metadata = { title: 'Mobile Dispatch' };

export default async function DispatchPage() {
  await verifySession();
  return <DispatchClient />;
}
