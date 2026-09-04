'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AbmeldenButton() {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);

  async function handleAbmelden() {
    if (laeuft) return;
    setLaeuft(true);
    try {
      await fetch('/api/intern/abmelden', { method: 'POST' });
    } finally {
      router.push('/intern');
      router.refresh();
      setLaeuft(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAbmelden}
      disabled={laeuft}
      className="fokus-ring inline-flex min-h-[44px] items-center rounded-full bg-white/80 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
    >
      {laeuft ? 'Abmelden...' : 'Abmelden'}
    </button>
  );
}
