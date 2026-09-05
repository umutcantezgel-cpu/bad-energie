/**
 * Vorbereitung der E2E-Datenbank (AP7).
 *
 * Legt `./data/e2e` frisch an, migriert, seedet mit Demo-Preisen, legt den
 * Chef-Benutzer an, ergänzt genügend Terminfenster für mehrere Durchläufe und
 * leert den Datei-Postausgang.
 *
 * Warum kein `globalSetup` in `playwright.config.ts`:
 * Playwright startet die Plugins (und damit den `webServer`) vor dem globalen
 * Setup. In `node_modules/playwright/lib/runner/index.js` baut
 * `createGlobalSetupTasks` die Reihenfolge
 *   clear output → plugin setup (webServer) → global teardown → global setup.
 * PGlite verträgt aber nur einen Prozess je Datenverzeichnis: liefe dieses Skript
 * als `globalSetup`, hielte der Playwright-Prozess die Sperre auf `data/e2e`,
 * während der Entwicklungsserver dieselbe Datenbank öffnen will. Deshalb läuft die
 * Vorbereitung als eigener, vorher beendeter Prozess, verkettet im `command` des
 * `webServer` (`npm run e2e:vorbereiten && npm run dev -- --port 3100`).
 *
 * Direkter Aufruf: `tsx e2e/global-setup.ts --run` (npm-Skript `e2e:vorbereiten`).
 */
import { randomUUID } from 'node:crypto';
import { mkdir, readdir, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { SPIEGEL_PFAD, spiegelAufbauen } from './spiegel';

export const E2E_DATENBANK = 'pglite://./data/e2e';
export const E2E_CHEF_EMAIL = 'chef@bad-energie.de';
export const E2E_CHEF_PIN = '123456';
export const OUTBOX_PFAD = path.resolve(process.cwd(), 'data/outbox');

/** Zusätzliche Terminfenster, damit mehrere Vorführ-Durchläufe je zwei reservieren können. */
const ZUSATZ_FENSTER = 12;

/** Leert den Datei-Postausgang, ohne das Verzeichnis zu entfernen. */
export async function leereOutbox(): Promise<void> {
  await mkdir(OUTBOX_PFAD, { recursive: true });
  const dateien = await readdir(OUTBOX_PFAD);
  await Promise.all(dateien.map((d) => unlink(path.join(OUTBOX_PFAD, d)).catch(() => {})));
}

export default async function vorbereiten(): Promise<void> {
  // Zweites Projektverzeichnis, wenn die Konfiguration es angefordert hat (fremder
  // Entwicklungsserver hält die Sperre des Projektstamms). Siehe e2e/spiegel.ts.
  if (process.env.E2E_SPIEGEL_BAUEN === '1') {
    const ziel = process.env.E2E_APP_DIR?.trim() || SPIEGEL_PFAD;
    const begonnen = Date.now();
    spiegelAufbauen(ziel);
    console.log(`E2E-Spiegelverzeichnis bereit: ${ziel} (${Math.round((Date.now() - begonnen) / 1000)} s)`);
  }

  // Muss vor dem ersten Datenbankzugriff stehen: `getDb()` liest DATABASE_URL beim Verbinden.
  process.env.DATABASE_URL = E2E_DATENBANK;
  process.env.MAIL_TRANSPORT = 'file';
  delete process.env.MAIL_TEST_TO;

  const verzeichnis = path.resolve(process.cwd(), 'data/e2e');
  await rm(verzeichnis, { recursive: true, force: true });
  await leereOutbox();
  await rm(path.resolve(process.cwd(), 'data/blob'), { recursive: true, force: true });

  // Dynamisch importieren, damit die Umgebungsvariablen oben zuerst gesetzt sind.
  const { migrieren } = await import('../src/db/migrate');
  const { seeden } = await import('../src/db/seed');
  const { getDb } = await import('../src/db/client');
  const { benutzer, terminfenster } = await import('../src/db/schema');
  const { pinHashen } = await import('../src/lib/services/pin');

  await migrieren();
  await seeden({ demoPreise: true });

  const db = await getDb();
  await db.insert(benutzer).values({
    id: randomUUID(),
    email: E2E_CHEF_EMAIL,
    name: 'Sabri Demir',
    rolle: 'chef',
    funktion: 'Geschäftsführer',
    signaturMail: 'info@bad-energie.de',
    pinHash: pinHashen(E2E_CHEF_PIN),
  });

  const zusatz = Array.from({ length: ZUSATZ_FENSTER }, (_, i) => ({
    id: randomUUID(),
    beschriftung: `Testfenster ${String(i + 1).padStart(2, '0')}, vormittags`,
  }));
  await db.insert(terminfenster).values(zusatz);

  console.log(
    `E2E vorbereitet: ${verzeichnis}, Demo-Preise geladen, Chef ${E2E_CHEF_EMAIL} mit PIN ${E2E_CHEF_PIN}, ` +
      `${ZUSATZ_FENSTER} zusätzliche Terminfenster, Postausgang geleert.`,
  );
}

if (process.argv.includes('--run')) {
  vorbereiten()
    .then(() => process.exit(0))
    .catch((fehler) => {
      console.error('E2E-Vorbereitung fehlgeschlagen:', fehler);
      process.exit(1);
    });
}
