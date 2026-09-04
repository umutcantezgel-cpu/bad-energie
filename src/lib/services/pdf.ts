/**
 * PDF-Renderer: gefülltes Kostenschätzungs-HTML zu einem DIN-A4-PDF.
 *
 * Produktion (Vercel): @sparticuz/chromium mit puppeteer-core.
 * Entwicklung: lokales Chrome oder Chromium über CHROME_EXECUTABLE_PATH bzw. übliche Pfade.
 *
 * Sicherheit nach SECURITY.md: JavaScript aus, kein Netzwerkzugriff (jede Anfrage wird
 * abgebrochen), Timeout 20 Sekunden. Der Browser wird je Prozess wiederverwendet und
 * bei einem Fehler geschlossen und neu gestartet.
 */
import 'server-only';

import { existsSync } from 'node:fs';
import type { Browser } from 'puppeteer-core';

export const PDF_TIMEOUT_MS = 20_000;

/** Übliche Pfade in der Entwicklung, in der Reihenfolge der Prüfung. */
const LOKALE_PFADE = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
];

/** Erster vorhandener lokaler Browser oder null. Auch für skipIf in Tests nutzbar. */
export function lokalerChromePfad(): string | null {
  const gesetzt = process.env.CHROME_EXECUTABLE_PATH?.trim();
  if (gesetzt) return existsSync(gesetzt) ? gesetzt : null;
  return LOKALE_PFADE.find((p) => existsSync(p)) ?? null;
}

function istProduktion(): boolean {
  if (process.env.CHROME_EXECUTABLE_PATH?.trim()) return false;
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
}

let browserPromise: Promise<Browser> | null = null;

async function starteBrowser(): Promise<Browser> {
  const puppeteer = await import('puppeteer-core');
  if (istProduktion()) {
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  const pfad = lokalerChromePfad();
  if (!pfad) {
    throw new Error(
      'Kein Chrome gefunden. Setze CHROME_EXECUTABLE_PATH auf eine Chrome- oder Chromium-Installation.',
    );
  }
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    defaultViewport: { width: 1240, height: 1754 },
    executablePath: pfad,
    headless: true,
  });
}

/** Browser je Prozess wiederverwenden. Bei einem Fehler wird er geschlossen und neu gestartet. */
async function holeBrowser(): Promise<Browser> {
  if (!browserPromise) browserPromise = starteBrowser();
  try {
    const browser = await browserPromise;
    if (browser.connected) return browser;
  } catch {
    // Startfehler: unten neu versuchen
  }
  browserPromise = starteBrowser();
  return browserPromise;
}

/** Browser schließen (Fehlerpfad, Tests, Shutdown). */
export async function schliesseBrowser(): Promise<void> {
  const laufend = browserPromise;
  browserPromise = null;
  if (!laufend) return;
  try {
    const browser = await laufend;
    await browser.close();
  } catch {
    // bereits beendet
  }
}

function fusszeile(ksNummer: string): string {
  const nummer = /^KS-\d{4}-\d{4}$/.test(ksNummer) ? ksNummer : '';
  return (
    "<div style='width:100%;font-family:Arial,\"Liberation Sans\",sans-serif;font-size:7.5pt;color:#4A4F5C;" +
    `text-align:right;padding:0 16mm 0 0;'>${nummer} · Seite <span class='pageNumber'></span> von <span class='totalPages'></span></div>`
  );
}

/** Rendert das übergebene HTML zu einem A4-PDF und gibt den Buffer zurück. */
export async function renderPdf(html: string, optionen: { ksNummer?: string } = {}): Promise<Buffer> {
  const browser = await holeBrowser();
  let seite: Awaited<ReturnType<Browser['newPage']>> | null = null;
  try {
    seite = await browser.newPage();
    await seite.setJavaScriptEnabled(false);
    await seite.setRequestInterception(true);
    seite.on('request', (anfrage) => {
      // Kein Netzwerkzugriff: alle Assets liegen als data-URI im HTML.
      void anfrage.abort().catch(() => {});
    });
    seite.setDefaultTimeout(PDF_TIMEOUT_MS);
    await seite.setContent(html, { waitUntil: 'load', timeout: PDF_TIMEOUT_MS });
    const pdf = await seite.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: fusszeile(optionen.ksNummer ?? ''),
      margin: { top: '14mm', right: '16mm', bottom: '16mm', left: '16mm' },
      timeout: PDF_TIMEOUT_MS,
    });
    return Buffer.from(pdf);
  } catch (fehler) {
    await schliesseBrowser();
    throw fehler;
  } finally {
    if (seite) await seite.close().catch(() => {});
  }
}

/** Zählt die Seiten eines PDF-Buffers (für das Zwei-Seiten-Badge). */
export function pdfSeitenzahl(pdf: Buffer): number {
  const text = pdf.toString('latin1');
  const treffer = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g);
  return treffer ? treffer.length : 0;
}
