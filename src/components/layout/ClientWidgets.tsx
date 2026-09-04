"use client";

import dynamic from 'next/dynamic';
import { ConsentProvider } from '@/components/common/ConsentProvider';
import TrackingScripts from '@/components/common/TrackingScripts';

const WhatsAppButton = dynamic(() => import('@/components/common/WhatsAppButton'), { ssr: false });
const ConsentManager = dynamic(() => import('@/components/common/ConsentManager'), { ssr: false });

export function ClientWidgets() {
  return (
    <ConsentProvider>
      <TrackingScripts />
      <WhatsAppButton />
      <ConsentManager />
    </ConsentProvider>
  );
}
