import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Ablage für Anhänge und Dokumente. In Produktion Vercel Blob (`access: 'private'`),
 * lokal ein Dateiadapter unter ./data/blob. Blob-URLs erreichen den Browser nie;
 * die Auslieferung läuft ausschließlich über authentifizierte Route Handler.
 */

export type StorageObjekt = { daten: Buffer; mime: string };

export type Storage = {
  put(pfad: string, daten: Buffer, mime: string): Promise<void>;
  get(pfad: string): Promise<StorageObjekt | null>;
  del(pfad: string): Promise<void>;
};

const LOKALES_VERZEICHNIS = path.resolve(process.cwd(), 'data/blob');

function sichererPfad(pfad: string): string {
  const bereinigt = pfad.replace(/\\/g, '/').replace(/\.\.+/g, '').replace(/^\/+/, '');
  const ziel = path.resolve(LOKALES_VERZEICHNIS, bereinigt);
  if (!ziel.startsWith(LOKALES_VERZEICHNIS)) throw new Error('Ungültiger Ablagepfad.');
  return ziel;
}

/** Dateiadapter für Entwicklung und Tests. */
export function dateiStorage(): Storage {
  return {
    async put(pfad, daten, mime) {
      const ziel = sichererPfad(pfad);
      await mkdir(path.dirname(ziel), { recursive: true });
      await writeFile(ziel, daten);
      await writeFile(`${ziel}.mime`, mime, 'utf8');
    },
    async get(pfad) {
      try {
        const ziel = sichererPfad(pfad);
        const daten = await readFile(ziel);
        let mime = 'application/octet-stream';
        try { mime = (await readFile(`${ziel}.mime`, 'utf8')).trim() || mime; } catch { /* ohne Seitendatei */ }
        return { daten, mime };
      } catch {
        return null;
      }
    },
    async del(pfad) {
      const ziel = sichererPfad(pfad);
      await rm(ziel, { force: true });
      await rm(`${ziel}.mime`, { force: true });
    },
  };
}

/** Vercel Blob, private Objekte. */
export function blobStorage(token: string): Storage {
  return {
    async put(pfad, daten, mime) {
      const { put } = await import('@vercel/blob');
      await put(pfad, daten, { access: 'private', contentType: mime, addRandomSuffix: false, allowOverwrite: true, token });
    },
    async get(pfad) {
      const { get } = await import('@vercel/blob');
      const ergebnis = await get(pfad, { access: 'private', token });
      if (!ergebnis || ergebnis.statusCode !== 200 || !ergebnis.stream) return null;
      const teile: Uint8Array[] = [];
      const leser = ergebnis.stream.getReader();
      for (;;) {
        const { done, value } = await leser.read();
        if (done) break;
        if (value) teile.push(value);
      }
      return { daten: Buffer.concat(teile), mime: ergebnis.blob.contentType || 'application/octet-stream' };
    },
    async del(pfad) {
      const { del } = await import('@vercel/blob');
      await del(pfad, { token });
    },
  };
}

let zwischenspeicher: Storage | undefined;

/** Aktiver Adapter: Blob, wenn ein Token gesetzt ist, sonst lokale Dateien. */
export function getStorage(): Storage {
  if (zwischenspeicher) return zwischenspeicher;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  zwischenspeicher = token ? blobStorage(token) : dateiStorage();
  return zwischenspeicher;
}

/** Nur für Tests: Adapter setzen oder zurücksetzen. */
export function setzeStorage(storage: Storage | undefined): void {
  zwischenspeicher = storage;
}

// ---------------------------------------------------------------------------
// Pfade
// ---------------------------------------------------------------------------

export function anhangPfad(anfrageId: string, endung: string): string {
  return `anhaenge/${anfrageId}/${randomUUID()}.${endung.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin'}`;
}

export function thumbPfad(anfrageId: string): string {
  return `anhaenge/${anfrageId}/${randomUUID()}.webp`;
}

export function dokumentPfad(anfrageId: string, sha256: string, endung = 'pdf'): string {
  return `dokumente/${anfrageId}/${sha256}.${endung}`;
}

export function sha256Hex(daten: Buffer | string): string {
  return createHash('sha256').update(daten).digest('hex');
}

// ---------------------------------------------------------------------------
// Bildprüfung und Aufbereitung
// ---------------------------------------------------------------------------

export const MAX_BILD_BYTES = 15 * 1024 * 1024;
export const MAX_SKIZZE_BYTES = 3 * 1024 * 1024;
export const MAX_KANTE_PX = 2000;
export const THUMB_KANTE_PX = 400;

export type BildTyp = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'application/pdf';

/** Erkennt den Dateityp an den Magic Bytes; der vom Client gemeldete MIME-Typ zählt nicht. */
export function erkenneTyp(daten: Buffer): BildTyp | null {
  if (daten.length < 12) return null;
  if (daten[0] === 0xff && daten[1] === 0xd8 && daten[2] === 0xff) return 'image/jpeg';
  if (daten.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (daten.subarray(0, 4).toString('ascii') === 'RIFF' && daten.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (daten.subarray(4, 8).toString('ascii') === 'ftyp') {
    const marke = daten.subarray(8, 12).toString('ascii');
    if (['heic', 'heix', 'hevc', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1'].includes(marke)) return 'image/heic';
  }
  if (daten.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  return null;
}

export function istPng(daten: Buffer): boolean {
  return erkenneTyp(daten) === 'image/png';
}

export type AufbereitetesBild = {
  daten: Buffer;
  mime: 'image/jpeg';
  endung: 'jpg';
  breite: number;
  hoehe: number;
  thumb: Buffer;
  thumbMime: 'image/webp';
};

/**
 * Prüft die Magic Bytes, wandelt HEIC vor, kodiert mit sharp neu (max. 2000 px, EXIF und GPS entfernt)
 * und erzeugt ein WebP-Vorschaubild mit 400 px. Nur das Ergebnis wird gespeichert.
 */
export async function bildAufbereiten(roh: Buffer): Promise<AufbereitetesBild> {
  if (roh.length > MAX_BILD_BYTES) throw new Error('Datei ist größer als 15 MB.');
  const typ = erkenneTyp(roh);
  if (typ === null) throw new Error('Dateityp wird nicht unterstützt.');
  if (typ === 'application/pdf') throw new Error('PDF ist kein Bild.');

  let eingabe = roh;
  if (typ === 'image/heic') {
    const heicConvert = (await import('heic-convert')).default;
    const gewandelt = await heicConvert({ buffer: new Uint8Array(roh), format: 'JPEG', quality: 0.9 });
    eingabe = Buffer.from(gewandelt);
  }

  const sharp = (await import('sharp')).default;
  const bild = sharp(eingabe, { failOn: 'none' }).rotate();
  const gross = await bild.clone()
    .resize({ width: MAX_KANTE_PX, height: MAX_KANTE_PX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const thumb = await bild.clone()
    .resize({ width: THUMB_KANTE_PX, height: THUMB_KANTE_PX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  return {
    daten: gross.data,
    mime: 'image/jpeg',
    endung: 'jpg',
    breite: gross.info.width,
    hoehe: gross.info.height,
    thumb,
    thumbMime: 'image/webp',
  };
}

/** Skizze aus dem SketchPad: PNG, höchstens 3 MB, Magic Bytes geprüft. */
export function skizzePruefen(daten: Buffer): void {
  if (daten.length > MAX_SKIZZE_BYTES) throw new Error('Skizze ist größer als 3 MB.');
  if (!istPng(daten)) throw new Error('Skizze muss ein PNG sein.');
}

/** Base64-Data-URL zu Buffer; wirft bei fremdem Präfix. */
export function ausDataUrl(dataUrl: string): { daten: Buffer; gemeldeterMime: string } {
  const treffer = /^data:([a-z0-9.+/-]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!treffer) throw new Error('Ungültige Datenquelle.');
  const gemeldeterMime = treffer[1].toLowerCase();
  if (gemeldeterMime === 'image/svg+xml') throw new Error('SVG wird nicht angenommen.');
  return { daten: Buffer.from(treffer[2], 'base64'), gemeldeterMime };
}
