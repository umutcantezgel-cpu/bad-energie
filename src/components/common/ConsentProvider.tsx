'use client';

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import {
  ALLES, NUR_ESSENZIELL, getStoredConsent, hasStoredConsent, saveConsent, showConsentBanner, subscribeConsent,
  type Einwilligung, type Kategorie,
} from './consent-store';

type ConsentWert = {
  consent: Einwilligung;
  /** true, wenn für diese Kategorie eine Einwilligung vorliegt. */
  hasConsent: (kategorie: Kategorie) => boolean;
  /** Auswahl speichern (ergänzt fehlende Kategorien mit „abgelehnt“). */
  updateConsent: (auswahl: Partial<Einwilligung>) => void;
  /** Einwilligungsfenster öffnen. */
  showBanner: () => void;
  /** true, solange der Besucher noch nicht entschieden hat. */
  entscheidungOffen: boolean;
};

const ConsentContext = createContext<ConsentWert | null>(null);

function schnappschuss(): string {
  const gespeichert = getStoredConsent();
  return gespeichert ? JSON.stringify(gespeichert) : '';
}

function serverSchnappschuss(): string {
  return '';
}

/** Liest die Einwilligung reaktiv, auch ohne Provider im Baum. */
export function useEinwilligung(): { consent: Einwilligung; entschieden: boolean } {
  const roh = useSyncExternalStore(subscribeConsent, schnappschuss, serverSchnappschuss);
  return useMemo(() => {
    if (!roh) return { consent: NUR_ESSENZIELL, entschieden: false };
    try {
      return { consent: { ...NUR_ESSENZIELL, ...(JSON.parse(roh) as Einwilligung) }, entschieden: true };
    } catch {
      return { consent: NUR_ESSENZIELL, entschieden: false };
    }
  }, [roh]);
}

/**
 * Einzelne Kategorie als Schalter. Vor der Hydration und ohne Einwilligung immer false
 * (außer essential), damit Server- und Client-Ausgabe übereinstimmen.
 */
export function useConsentGate(kategorie: Kategorie): boolean {
  const { consent, entschieden } = useEinwilligung();
  if (kategorie === 'essential') return true;
  return entschieden && consent[kategorie] === true;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const { consent, entschieden } = useEinwilligung();

  const updateConsent = useCallback((auswahl: Partial<Einwilligung>) => {
    saveConsent({ ...NUR_ESSENZIELL, ...auswahl });
  }, []);

  const wert = useMemo<ConsentWert>(() => ({
    consent,
    hasConsent: (kategorie: Kategorie) => (kategorie === 'essential' ? true : entschieden && consent[kategorie] === true),
    updateConsent,
    showBanner: showConsentBanner,
    entscheidungOffen: !entschieden,
  }), [consent, entschieden, updateConsent]);

  return <ConsentContext.Provider value={wert}>{children}</ConsentContext.Provider>;
}

/** Einwilligung im Kontext; funktioniert dank Speicher-Abo auch ohne Provider. */
export function useConsent(): ConsentWert {
  const ausKontext = useContext(ConsentContext);
  const { consent, entschieden } = useEinwilligung();
  const updateConsent = useCallback((auswahl: Partial<Einwilligung>) => {
    saveConsent({ ...NUR_ESSENZIELL, ...auswahl });
  }, []);
  const ersatz = useMemo<ConsentWert>(() => ({
    consent,
    hasConsent: (kategorie: Kategorie) => (kategorie === 'essential' ? true : entschieden && consent[kategorie] === true),
    updateConsent,
    showBanner: showConsentBanner,
    entscheidungOffen: !entschieden,
  }), [consent, entschieden, updateConsent]);
  return ausKontext ?? ersatz;
}

export { ALLES, NUR_ESSENZIELL, getStoredConsent, hasStoredConsent, saveConsent, showConsentBanner };
export type { Einwilligung, Kategorie };
