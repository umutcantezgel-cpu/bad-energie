'use client';

/**
 * Client-Teil der Entwurfsliste: fuehrt Freigabe, Sofortversand und Storno ueber
 * die Server Actions aus und meldet das Ergebnis. Ohne Netz bleibt der Sofortversand
 * gesperrt (die Liste selbst ist weiter lesbar).
 */
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import EntwurfsListe from '@/components/calculator/EntwurfsListe';
import type { EntwurfKarte } from '@/lib/types';
import { freigeben, stornieren } from '../actions';

export default function EntwuerfeClient({ karten }: { karten: EntwurfKarte[] }) {
  const router = useRouter();
  const [laeuftUebergang, starteUebergang] = useTransition();
  const [laufendeId, setLaufendeId] = useState<string | null>(null);
  const [meldung, setMeldung] = useState('');
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const setzen = () => setOnline(typeof navigator === 'undefined' || navigator.onLine !== false);
    setzen();
    window.addEventListener('online', setzen);
    window.addEventListener('offline', setzen);
    return () => {
      window.removeEventListener('online', setzen);
      window.removeEventListener('offline', setzen);
    };
  }, []);

  const fuehreAus = (anfrageId: string, arbeit: () => Promise<{ ok: boolean; rueckmeldung?: string; fehler?: string }>) => {
    setLaufendeId(anfrageId);
    setMeldung('');
    starteUebergang(async () => {
      try {
        const ergebnis = await arbeit();
        setMeldung(ergebnis.ok ? (ergebnis.rueckmeldung ?? 'Erledigt.') : (ergebnis.fehler ?? 'Nicht moeglich.'));
        router.refresh();
      } catch {
        setMeldung('Die Aktion konnte nicht ausgefuehrt werden.');
      } finally {
        setLaufendeId(null);
      }
    });
  };

  return (
    <EntwurfsListe
      karten={karten}
      online={online}
      laufendeId={laeuftUebergang ? laufendeId : null}
      meldung={meldung}
      onFreigeben={(anfrageId, sofort) => fuehreAus(anfrageId, () => freigeben(anfrageId, sofort))}
      onStornieren={(anfrageId) => fuehreAus(anfrageId, () => stornieren(anfrageId))}
    />
  );
}
