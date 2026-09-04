/**
 * Einwilligungsspeicher (localStorage) ohne React.
 * Wird von ConsentProvider, den Tracking-Skripten und externen Einbindungen genutzt.
 */
export const CONSENT_VERSION = '2.0';
export const CONSENT_KEY = 'baris_consent_settings';

export const KATEGORIEN = ['essential', 'analytics', 'marketing', 'maps', 'externalContent'] as const;
export type Kategorie = (typeof KATEGORIEN)[number];
export type Einwilligung = Record<Kategorie, boolean>;

export const NUR_ESSENZIELL: Einwilligung = {
  essential: true, analytics: false, marketing: false, maps: false, externalContent: false,
};
export const ALLES: Einwilligung = {
  essential: true, analytics: true, marketing: true, maps: true, externalContent: true,
};

type Gespeichert = { settings: Einwilligung; version: string; timestamp: string };

/** Gespeicherte Einwilligung oder null, wenn keine oder eine veraltete Version vorliegt. */
export function getStoredConsent(): Einwilligung | null {
  if (typeof window === 'undefined') return null;
  try {
    const roh = window.localStorage.getItem(CONSENT_KEY);
    if (!roh) return null;
    const geparst = JSON.parse(roh) as Gespeichert;
    if (geparst?.version !== CONSENT_VERSION) {
      window.localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return { ...NUR_ESSENZIELL, ...geparst.settings };
  } catch {
    return null;
  }
}

export function hasStoredConsent(kategorie: Kategorie): boolean {
  const gespeichert = getStoredConsent();
  if (!gespeichert) return kategorie === 'essential';
  return gespeichert[kategorie] === true;
}

/** Speichert die Auswahl und benachrichtigt alle Verbraucher im Fenster. */
export function saveConsent(settings: Einwilligung): Einwilligung {
  const vollstaendig: Einwilligung = { ...NUR_ESSENZIELL, ...settings, essential: true };
  if (typeof window === 'undefined') return vollstaendig;
  const daten: Gespeichert = { settings: vollstaendig, version: CONSENT_VERSION, timestamp: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(daten));
  } catch {
    // Speichern kann in privaten Fenstern scheitern; die Auswahl gilt dann nur für diese Sitzung.
  }
  window.dispatchEvent(new CustomEvent('consentUpdated', { detail: vollstaendig }));
  return vollstaendig;
}

/** Öffnet das Einwilligungsfenster (z. B. aus der Fußzeile oder einer Platzhalterkachel). */
export function showConsentBanner(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('showConsentBanner'));
}

/** Abonniert Änderungen (eigenes Ereignis und Änderungen in anderen Tabs). */
export function subscribeConsent(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const beiSpeicher = (e: StorageEvent) => { if (e.key === CONSENT_KEY) callback(); };
  window.addEventListener('consentUpdated', callback);
  window.addEventListener('storage', beiSpeicher);
  return () => {
    window.removeEventListener('consentUpdated', callback);
    window.removeEventListener('storage', beiSpeicher);
  };
}
