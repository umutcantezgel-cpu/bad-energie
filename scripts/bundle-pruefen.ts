/**
 * Größenprüfung der Function-Bundles aus dem letzten Build.
 *
 * Jede Serverroute bekommt beim Build eine Datei `*.js.nft.json` mit allen Dateien, die in
 * die Function kopiert werden. Dieses Skript summiert diese Dateien je Route und meldet
 * einen Fehler, sobald eine Route die Grenze überschreitet. Hintergrund: Die entpackte
 * Function darf auf Vercel 250 MB nicht überschreiten; die Vorwarnschwelle liegt bei 200 MB,
 * damit ein Zuwachs auffällt, bevor das Deployment scheitert.
 *
 * Aufruf: `npx tsx scripts/bundle-pruefen.ts [--grenze=<MB>] [--verzeichnis=<Pfad>]`
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Vorwarnschwelle in MB. Vercel bricht erst bei 250 MB ab. */
export const GRENZE_MB = 200;

const MB = 1024 * 1024;

export type RoutenGroesse = {
  /** Routenname, wie ihn der Build vergibt (ohne `.js.nft.json`). */
  route: string;
  dateien: number;
  bytes: number;
  /** Größte Beiträge nach oberstem Verzeichnis, absteigend. */
  anteile: Array<{ ordner: string; bytes: number }>;
};

/** Alle Trace-Dateien unterhalb eines Verzeichnisses, rekursiv. */
export function nftDateien(wurzel: string): string[] {
  const treffer: string[] = [];
  const eintraege = readdirSync(wurzel, { withFileTypes: true });
  for (const eintrag of eintraege) {
    const voll = path.join(wurzel, eintrag.name);
    if (eintrag.isDirectory()) treffer.push(...nftDateien(voll));
    else if (eintrag.name.endsWith('.nft.json')) treffer.push(voll);
  }
  return treffer.sort();
}

/** Routenname aus dem Pfad der Trace-Datei. */
export function routenName(nftPfad: string, serverWurzel: string): string {
  return path.relative(serverWurzel, nftPfad).replace(/\.js\.nft\.json$/, '');
}

/** MB mit einer Nachkommastelle, deutsche Schreibweise. */
export function mb(bytes: number): string {
  return (bytes / MB).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Summiert die Dateien einer Route. Doppelte Einträge zählen einmal, nicht lesbare Einträge
 * (etwa gelöschte Ziele eines Symlinks) zählen mit null Bytes und brechen die Prüfung nicht ab.
 */
export function vermesse(nftPfad: string, projektWurzel: string): Omit<RoutenGroesse, 'route'> {
  const inhalt = JSON.parse(readFileSync(nftPfad, 'utf8')) as { files?: string[] };
  const basis = path.dirname(path.resolve(nftPfad));
  const gesehen = new Set<string>();
  const nachOrdner = new Map<string, number>();
  let bytes = 0;
  for (const datei of inhalt.files ?? []) {
    const absolut = path.resolve(basis, datei);
    if (gesehen.has(absolut)) continue;
    gesehen.add(absolut);
    let groesse = 0;
    try {
      groesse = statSync(absolut).size;
    } catch {
      // Verweis ohne Ziel: zählt nicht mit, ist aber kein Grund abzubrechen.
    }
    bytes += groesse;
    const ordner = path.relative(projektWurzel, absolut).split(path.sep)[0] || '/';
    nachOrdner.set(ordner, (nachOrdner.get(ordner) ?? 0) + groesse);
  }
  const anteile = [...nachOrdner.entries()]
    .map(([ordner, wert]) => ({ ordner, bytes: wert }))
    .sort((a, b) => b.bytes - a.bytes);
  return { dateien: gesehen.size, bytes, anteile };
}

/** Tabelle der Routen, größte zuerst. */
export function tabelle(zeilen: RoutenGroesse[], grenzeMb: number): string {
  const kopf = ['MB', 'Dateien', 'Route'];
  const werte = zeilen.map((z) => [mb(z.bytes), String(z.dateien), z.route]);
  const breiten = kopf.map((k, i) => Math.max(k.length, ...werte.map((w) => w[i].length)));
  const zeile = (spalten: string[]): string =>
    `${spalten[0].padStart(breiten[0])}  ${spalten[1].padStart(breiten[1])}  ${spalten[2]}`;
  const linien = [zeile(kopf), `${'-'.repeat(breiten[0])}  ${'-'.repeat(breiten[1])}  ${'-'.repeat(breiten[2])}`];
  for (const [index, w] of werte.entries()) {
    const marke = zeilen[index].bytes > grenzeMb * MB ? '  <== über der Grenze' : '';
    linien.push(zeile(w) + marke);
  }
  return linien.join('\n');
}

function zahlAusArgument(name: string, vorgabe: number): number {
  const treffer = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!treffer) return vorgabe;
  const wert = Number(treffer.slice(name.length + 3));
  return Number.isFinite(wert) && wert > 0 ? wert : vorgabe;
}

function textAusArgument(name: string, vorgabe: string): string {
  const treffer = process.argv.find((a) => a.startsWith(`--${name}=`));
  return treffer ? treffer.slice(name.length + 3) : vorgabe;
}

function main(): void {
  const projektWurzel = process.cwd();
  const serverWurzel = path.resolve(projektWurzel, textAusArgument('verzeichnis', path.join('.next', 'server')));
  const grenzeMb = zahlAusArgument('grenze', GRENZE_MB);

  let dateien: string[];
  try {
    dateien = nftDateien(serverWurzel);
  } catch {
    console.error(`Kein Build gefunden: ${serverWurzel} fehlt. Erst "npm run build" ausführen.`);
    process.exit(1);
  }
  if (!dateien.length) {
    console.error(`Keine Trace-Dateien unter ${serverWurzel}. Erst "npm run build" ausführen.`);
    process.exit(1);
  }

  const zeilen: RoutenGroesse[] = dateien
    .map((pfad) => ({ route: routenName(pfad, serverWurzel), ...vermesse(pfad, projektWurzel) }))
    .sort((a, b) => b.bytes - a.bytes);

  console.log(tabelle(zeilen, grenzeMb));

  const zuGross = zeilen.filter((z) => z.bytes > grenzeMb * MB);
  if (!zuGross.length) {
    console.log(`\nGrößte Route ${mb(zeilen[0].bytes)} MB, Grenze ${grenzeMb} MB. In Ordnung.`);
    return;
  }
  console.error(`\n${zuGross.length} Route(n) über ${grenzeMb} MB. Vercel bricht bei 250 MB entpackt ab.`);
  for (const z of zuGross) {
    const grosseAnteile = z.anteile.slice(0, 6).map((a) => `${a.ordner} ${mb(a.bytes)} MB`).join(', ');
    console.error(`  ${z.route}: ${mb(z.bytes)} MB — ${grosseAnteile}`);
  }
  console.error('Abhilfe: outputFileTracingExcludes in next.config.ts erweitern oder den Import entfernen, der den Ordner zieht.');
  process.exit(1);
}

// Nur beim direkten Aufruf messen: Tests importieren die reinen Funktionen und dürfen
// dabei weder den Build lesen noch den Prozess beenden.
const direktAufgerufen = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direktAufgerufen) main();
