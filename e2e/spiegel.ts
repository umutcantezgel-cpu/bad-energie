/**
 * Zweites Projektverzeichnis („Spiegel“) für den E2E-Entwicklungsserver.
 *
 * Next.js 16 lässt je Projektverzeichnis nur einen Entwicklungsserver zu. Die Sperre
 * liegt in `<distDir>/dev/lock` (siehe `Lockfile.acquireWithRetriesOrExit` in
 * `node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js`, Zeile 160).
 * Läuft am Arbeitsplatz bereits `npm run dev` auf Port 3000, bricht der E2E-Server mit
 * „Another next dev server is already running“ ab, egal auf welchem Port.
 *
 * Ausweg: ein zweites Projektverzeichnis mit eigener Sperrdatei. Turbopack verweigert
 * dabei jeden Symlink, der aus dem Projektstamm hinausführt
 * („Symlink [project]/node_modules is invalid, it points out of the filesystem root“),
 * deshalb wird echt kopiert. Auf APFS kostet das fast nichts: `cp -Rc` legt Klone an,
 * die sich die Datenblöcke teilen (node_modules in rund sieben Sekunden).
 *
 * Nicht mitkopiert werden Laufzeitdaten: `data/`, `drizzle/` und `legacy/` liest die
 * Anwendung über `process.cwd()` (siehe `src/lib/services/mail.ts`, `src/db/migrate.ts`,
 * `src/db/seed.ts`, `src/lib/dokumente/assets.ts`). Der Server wird aus dem Projektstamm
 * gestartet, `process.cwd()` zeigt also weiterhin dorthin. Damit teilen sich beide
 * Verzeichnisse dieselbe E2E-Datenbank und denselben Postausgang.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, copyFileSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Projektstamm. Beide Aufrufer (Playwright-Konfiguration und `npm run e2e:vorbereiten`)
 * starten im Projektstamm; `e2e/global-setup.ts` rechnet mit derselben Annahme
 * (`path.resolve(process.cwd(), 'data/e2e')`).
 */
export const PROJEKT_STAMM = process.cwd();

/** Fester Ort des Spiegels, damit wiederholte Läufe die Kopie von node_modules weiterverwenden. */
export const SPIEGEL_PFAD = path.join(os.tmpdir(), 'bad-energie-e2e-spiegel');

/** Verzeichnisse, die der Spiegel als echte Kopie braucht. */
const KOPIERTE_VERZEICHNISSE = ['src', 'public'] as const;

/** Dateien, die im Projektstamm liegen und der Spiegel ebenfalls braucht. */
const KOPIERTE_DATEIEN = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'next-env.d.ts',
  '.env.local',
] as const;

/**
 * Hält ein anderer, noch lebender Prozess die Entwicklungssperre des Projektstamms?
 * Dann braucht der E2E-Server ein eigenes Projektverzeichnis.
 */
export function fremderEntwicklungsserverLaeuft(): boolean {
  const sperre = path.join(PROJEKT_STAMM, '.next', 'dev', 'lock');
  if (!existsSync(sperre)) return false;
  let pid: number | undefined;
  try {
    pid = JSON.parse(readFileSync(sperre, 'utf8'))?.pid;
  } catch {
    // Unlesbare Sperrdatei: lieber den Spiegel nehmen als am Lock scheitern.
    return true;
  }
  if (typeof pid !== 'number' || pid === process.pid) return false;
  try {
    // Signal 0 prüft nur, ob der Prozess existiert.
    process.kill(pid, 0);
    return true;
  } catch {
    // Verwaiste Sperrdatei eines beendeten Servers.
    return false;
  }
}

/** Kopiert mit Klonen (APFS); fällt auf eine gewöhnliche Kopie zurück, wo `-c` fehlt. */
function kopiereVerzeichnis(quelle: string, ziel: string): void {
  rmSync(ziel, { recursive: true, force: true });
  try {
    execFileSync('cp', ['-Rc', quelle, ziel], { stdio: 'pipe' });
  } catch {
    execFileSync('cp', ['-R', quelle, ziel], { stdio: 'inherit' });
  }
}

/** Zeitstempel der Datei oder 0, wenn es sie nicht gibt. */
function stand(datei: string): number {
  try {
    return statSync(datei).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Legt den Spiegel an oder bringt ihn auf Stand.
 * `node_modules` wird nur kopiert, wenn es fehlt oder `package-lock.json` neuer ist;
 * `src` und die Konfigurationsdateien werden bei jedem Lauf erneuert.
 */
export function spiegelAufbauen(ziel: string = SPIEGEL_PFAD): string {
  mkdirSync(ziel, { recursive: true });

  const zielModule = path.join(ziel, 'node_modules');
  const marke = path.join(ziel, '.node_modules-stand');
  const sperreStand = stand(path.join(PROJEKT_STAMM, 'package-lock.json'));
  const kopierteModule = existsSync(zielModule) && existsSync(marke) ? Number(readFileSync(marke, 'utf8')) : 0;
  if (kopierteModule !== sperreStand) {
    kopiereVerzeichnis(path.join(PROJEKT_STAMM, 'node_modules'), zielModule);
    writeFileSync(marke, String(sperreStand), 'utf8');
  }

  for (const verzeichnis of KOPIERTE_VERZEICHNISSE) {
    kopiereVerzeichnis(path.join(PROJEKT_STAMM, verzeichnis), path.join(ziel, verzeichnis));
  }
  for (const datei of KOPIERTE_DATEIEN) {
    const quelle = path.join(PROJEKT_STAMM, datei);
    if (existsSync(quelle)) copyFileSync(quelle, path.join(ziel, datei));
  }
  return ziel;
}
