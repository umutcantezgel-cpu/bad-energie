import { defineConfig, devices } from '@playwright/test';

/**
 * E2E-Tests laufen gegen den Entwicklungsserver mit einer eigenen PGlite-Datenbank
 * und dem Datei-Mailversand, damit keine echten Mails hinausgehen.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'tablet', use: { ...devices['iPad (gen 7) landscape'], defaultBrowserType: 'chromium' } },
    { name: 'handy', use: { ...devices['iPhone 14'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      DATABASE_URL: 'pglite://./data/e2e',
      MAIL_TRANSPORT: 'file',
      APP_URL: BASE_URL,
      SESSION_SECRET: 'e2e-entwicklungspfeffer-mindestens-32-zeichen',
      CRON_SECRET: 'e2e-cron-geheimnis-mindestens-32-zeichen-lang',
    },
  },
});
