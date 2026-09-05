/**
 * Zugriff auf die Dokumentvorlagen und Binärassets unter src/lib/dokumente/assets/.
 *
 * Die Dateien werden über next.config.ts (outputFileTracingIncludes, Schlüssel
 * '/api/intern/**' und '/intern/**') in die Function kopiert. Die Schlüssel sind Globs auf
 * den Routennamen: Ein Schlüssel mit den Klammern eines dynamischen Segments trifft keine
 * Route, weil die Klammern als Zeichenklasse gelesen werden.
 * Gelesen wird einmal je Prozess, danach aus dem Modulcache.
 */
import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Assetverzeichnis relativ zur Projektwurzel. Ein berechneter Pfad über import.meta.url zog im
 * Datei-Trace der Function die Nachbarschaft mit; outputFileTracingIncludes stellt die Dateien bereit.
 */
function basen(): string[] {
  return [path.join(process.cwd(), 'src', 'lib', 'dokumente', 'assets')];
}

const textCache = new Map<string, string>();
const base64Cache = new Map<string, string>();

function lies(name: string): Buffer | null {
  if (name.includes('..') || path.isAbsolute(name)) throw new Error(`Ungültiger Assetname: ${name}`);
  for (const basis of basen()) {
    try {
      return readFileSync(path.join(basis, name));
    } catch {
      continue;
    }
  }
  return null;
}

/** Textvorlage (UTF-8). Fehlt die Datei, ist das ein Fehler: ohne Vorlage gibt es kein Dokument. */
export function ladeText(name: string): string {
  const zwischenspeicher = textCache.get(name);
  if (zwischenspeicher !== undefined) return zwischenspeicher;
  const puffer = lies(name);
  if (!puffer) throw new Error(`Vorlage fehlt: ${name}`);
  const text = puffer.toString('utf8').replace(/^﻿/, '');
  textCache.set(name, text);
  return text;
}

/** Binärasset als Base64. Fehlt die Datei, bleibt der Platz leer (Logo, Icon, Schrift sind Beiwerk). */
export function ladeBase64(name: string): string {
  const zwischenspeicher = base64Cache.get(name);
  if (zwischenspeicher !== undefined) return zwischenspeicher;
  const puffer = lies(name);
  const wert = puffer ? puffer.toString('base64') : '';
  base64Cache.set(name, wert);
  return wert;
}

/**
 * @font-face-Regeln mit eingebetteter Liberation Sans (benannte Abweichung 7).
 * Das serverlose Chromium kennt kein Arial; ohne eingebettete Schrift bricht das Seitenlayout.
 * Fehlen die Schriftdateien, bleibt der Fallback-Stack des Templates wirksam.
 */
export function schriftRegeln(): string {
  const regular = ladeBase64('fonts/LiberationSans-Regular.ttf');
  const bold = ladeBase64('fonts/LiberationSans-Bold.ttf');
  if (!regular && !bold) return '';
  const regel = (base64: string, gewicht: number) =>
    base64
      ? `@font-face{font-family:'Liberation Sans';font-style:normal;font-weight:${gewicht};font-display:block;src:url(data:font/ttf;base64,${base64}) format('truetype');}`
      : '';
  return `${regel(regular, 400)}${regel(bold, 700)}`;
}

/** Nur für Tests: Cache leeren. */
export function assetsZuruecksetzen(): void {
  textCache.clear();
  base64Cache.clear();
}
