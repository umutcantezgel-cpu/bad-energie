import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E-Tests laufen gegen den Entwicklungsserver mit einer eigenen PGlite-Datenbank
 * und dem Datei-Mailversand, damit keine echten Mails hinausgehen.
 *
 * Vorbereitung der Datenbank (Migration, Seed mit Demo-Preisen, Chef-Benutzer,
 * Postausgang leeren) liegt in `e2e/global-setup.ts`, wird aber NICHT als
 * `globalSetup` eingetragen: Playwright startet die Plugins und damit den
 * `webServer` vor dem globalen Setup (siehe `createGlobalSetupTasks` in
 * `node_modules/playwright/lib/runner/index.js`: clear output → plugin setup →
 * global teardown → global setup). PGlite verträgt nur einen Prozess je
 * Datenverzeichnis; das Setup muss also beendet sein, bevor der Server die
 * Datenbank öffnet. Deshalb ist es dem `command` als eigener Prozess vorangestellt.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Lokales Chrome für die PDF-Erzeugung im Sofortversand. Nur setzen, wenn es die Datei
 * wirklich gibt: ein gesetzter, aber ungültiger Pfad lässt `lokalerChromePfad()` in
 * `src/lib/services/pdf.ts` null liefern, statt die üblichen Pfade zu prüfen.
 */
const CHROME_KANDIDATEN = [
  process.env.CHROME_EXECUTABLE_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter((p): p is string => typeof p === 'string' && p.length > 0);
const CHROME_PFAD = CHROME_KANDIDATEN.find((p) => existsSync(p));

/**
 * Next.js 16 lässt je Projektverzeichnis nur einen Entwicklungsserver zu (Sperrdatei
 * `<distDir>/lock`, siehe `node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js`).
 * Läuft auf dem Rechner bereits ein Entwicklungsserver für dieses Verzeichnis, bricht der
 * zweite mit „Another next dev server is already running“ ab. `E2E_APP_DIR` zeigt dann auf
 * ein zweites Projektverzeichnis (Kopie von `src` und den Konfigurationsdateien, Verweise
 * auf `node_modules`, `public`, `data`, `drizzle`, `legacy`), das eine eigene Sperrdatei hat.
 */
const APP_DIR = process.env.E2E_APP_DIR?.trim();
const DEV_BEFEHL = APP_DIR
  ? `npx next dev "${APP_DIR}" --port ${PORT}`
  : `npm run dev -- --port ${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // Kaltstart des Entwicklungsservers: die erste Übersetzung einer Route dauert lange.
  timeout: 240_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    actionTimeout: 30_000,
    navigationTimeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'tablet', use: { ...devices['iPad (gen 7) landscape'], defaultBrowserType: 'chromium' } },
    { name: 'handy', use: { ...devices['iPhone 14'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: `npm run e2e:vorbereiten && ${DEV_BEFEHL}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DATABASE_URL: 'pglite://./data/e2e',
      MAIL_TRANSPORT: 'file',
      // Leerer Wert hebt einen Eintrag aus `.env.local` auf: @next/env übernimmt einen
      // Dateiwert nur, wenn der Schlüssel im Elternprozess gar nicht vorkam. Ohne das
      // würde `mitTestEmpfaenger` alle Testmails auf die Auffangadresse umschreiben.
      MAIL_TEST_TO: '',
      APP_URL: BASE_URL,
      SESSION_SECRET: 'e2e-entwicklungspfeffer-mindestens-32-zeichen',
      CRON_SECRET: 'e2e-cron-geheimnis-mindestens-32-zeichen-lang',
      // PDF-Erzeugung im Sofortversand: lokales Chrome statt @sparticuz/chromium.
      ...(CHROME_PFAD ? { CHROME_EXECUTABLE_PATH: CHROME_PFAD } : {}),
    },
  },
});
