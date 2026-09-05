/**
 * Gemeinsame Helfer der E2E-Tests (AP7).
 * Keine Testdatei: der Name passt nicht auf `testMatch`, Playwright sammelt ihn nicht ein.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import { E2E_CHEF_EMAIL, E2E_CHEF_PIN, OUTBOX_PFAD } from './global-setup';

export { E2E_CHEF_EMAIL, E2E_CHEF_PIN, OUTBOX_PFAD };

/** Fassung und Schlüssel aus `src/components/common/consent-store.ts`. */
const CONSENT_KEY = 'baris_consent_settings';
const CONSENT_VERSION = '2.0';

/** Schlüssel aus `src/components/calculator/meister-utils.ts`. */
const SCHLUESSEL_KUNDENANSICHT = 'be-kundenansicht';

/**
 * Setzt die Einwilligung auf „nur Essenzielle“, bevor die erste Seite lädt.
 * Damit erscheint das Banner nicht und verdeckt keine Schaltflächen.
 * `kundenansicht` legt den Schalter des Intern-Bereichs fest; ohne Angabe ist er aus,
 * weil er auf Touchgeräten unter 1280 Pixeln sonst von allein anspringt.
 */
export async function umgebungVorbereiten(page: Page, optionen: { kundenansicht?: boolean } = {}): Promise<void> {
  const kundenansicht = optionen.kundenansicht === true ? '1' : '0';
  // Sanftes Scrollen der Seite macht Kacheln für Playwright „nicht stabil“; im Test wird sofort gescrollt.
  await page.addInitScript(() => {
    const stil = document.createElement('style');
    stil.textContent = 'html { scroll-behavior: auto !important; }';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(stil));
  });
  await page.addInitScript(
    ([schluessel, fassung, ansichtSchluessel, ansichtWert]) => {
      try {
        window.localStorage.setItem(
          schluessel,
          JSON.stringify({
            settings: { essential: true, analytics: false, marketing: false, maps: false, externalContent: false },
            version: fassung,
            timestamp: new Date().toISOString(),
          }),
        );
        window.localStorage.setItem(ansichtSchluessel, ansichtWert);
      } catch {
        // Privater Modus: die Tests laufen auch ohne gespeicherte Auswahl weiter.
      }
    },
    [CONSENT_KEY, CONSENT_VERSION, SCHLUESSEL_KUNDENANSICHT, kundenansicht] as const,
  );
}

/** Meldet den Chef im Intern-Bereich an und wartet, bis der Konfigurator steht. */
export async function alsChefAnmelden(page: Page): Promise<void> {
  await page.goto('/intern');
  await expect(page.getByRole('heading', { name: 'Anmeldung' })).toBeVisible();
  await page.getByLabel('E-Mail').fill(E2E_CHEF_EMAIL);
  await page.getByLabel('PIN').fill(E2E_CHEF_PIN);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForURL('**/intern/konfigurator', { timeout: 120_000 });
}

/** Dateinamen im Datei-Postausgang (data/outbox). */
export async function outboxDateien(): Promise<string[]> {
  try {
    const dateien = await readdir(OUTBOX_PFAD);
    return dateien.filter((d) => d.endsWith('.eml')).sort();
  } catch {
    return [];
  }
}

/**
 * Wartet, bis mindestens `anzahl` neue .eml-Dateien im Postausgang liegen,
 * und liefert deren Inhalt. Der Sofortversand schreibt Kundenmail und Dossier
 * nacheinander, deshalb wird gepollt.
 */
export async function neueOutboxMails(
  vorher: string[],
  anzahl: number,
  fristMs = 120_000,
): Promise<{ name: string; inhalt: string }[]> {
  const bekannt = new Set(vorher);
  const ende = Date.now() + fristMs;
  let neue: string[] = [];
  while (Date.now() < ende) {
    neue = (await outboxDateien()).filter((d) => !bekannt.has(d));
    if (neue.length >= anzahl) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  return Promise.all(
    neue.map(async (name) => ({ name, inhalt: await readFile(path.join(OUTBOX_PFAD, name), 'utf8') })),
  );
}

/** WattFox-Lead aus Beleg 7 und 8 der Mappe `Arbeitsweise Chef/`, Wort für Wort. */
export const WATTFOX_TEXT = `Interesse an: Heizung (Wärmepumpe)
Art der Wärmepumpe: Luft-Wärmepumpe
Nutzung der Wärmepumpe: zum Heizen, zur Brauchwassererwärmung
Bisheriges Heizsystem: Gasheizung, Solarthermie
Gebäudetyp: Ein- / Zweifamilienhaus
Größe der zu beheizenden Fläche in qm: 150
Art der durchzuführenden Tätigkeit: Austausch / Modernisierung
Wie viele Personen leben im Haushalt?: 1-2 Personen
Baujahr des Gebäudes: 1965
Alter der Heizung in Jahren: 20
Art des Erwerbs: Kauf
Sonstiges: - Einfamilienhaus - Gebäude steht im Eigentum der anfragenden Person - Anfragende Person ist dort wohnhaft - Standort der Heizung: Keller`;
