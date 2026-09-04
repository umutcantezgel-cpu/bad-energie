/**
 * Clientseitige Bildverkleinerung fuer Baustellenfotos.
 *
 * Der Browser decodiert das Bild, zeichnet es auf ein Canvas und liefert ein JPEG
 * mit hoechstens 2000 px Kantenlaenge. Damit bleibt der Estimate-Payload weit unter
 * dem Body-Limit, und EXIF-Daten (auch GPS) fallen beim Neuzeichnen weg.
 *
 * HEIC decodieren nur Safari-Browser. Andere Browser liefern hier den Grund 'heic';
 * die Datei wird dann unveraendert fuer den spaeteren Upload vorgemerkt und
 * serverseitig gewandelt.
 */

export const MAX_KANTE = 2000;
export const JPEG_QUALITAET = 0.82;

export type BildDatei = { name: string; type: string };

export type VerkleinerungsErgebnis =
  | { ok: true; name: string; dataUrl: string; breite: number; hoehe: number }
  | { ok: false; name: string; grund: 'heic' | 'format' | 'fehler'; datei: File };

/** HEIC und HEIF erkennen (Dateiendung, weil der MIME-Typ oft leer ist). */
export function istHeic(datei: BildDatei): boolean {
  const name = (datei.name || '').toLowerCase();
  const typ = (datei.type || '').toLowerCase();
  return typ === 'image/heic' || typ === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif');
}

/** Erlaubte Eingabeformate (SVG ist ausgeschlossen). */
export function istErlaubtesBild(datei: BildDatei): boolean {
  const typ = (datei.type || '').toLowerCase();
  if (typ === 'image/svg+xml') return false;
  if (typ.startsWith('image/')) return true;
  const name = (datei.name || '').toLowerCase();
  return /\.(jpe?g|png|webp|heic|heif)$/.test(name);
}

/** Zielgroesse unter Beibehaltung des Seitenverhaeltnisses; kleinere Bilder bleiben unveraendert. */
export function zielGroesse(breite: number, hoehe: number, max = MAX_KANTE): { breite: number; hoehe: number } {
  if (!(breite > 0) || !(hoehe > 0)) return { breite: 0, hoehe: 0 };
  const laengste = Math.max(breite, hoehe);
  if (laengste <= max) return { breite: Math.round(breite), hoehe: Math.round(hoehe) };
  const faktor = max / laengste;
  return { breite: Math.max(1, Math.round(breite * faktor)), hoehe: Math.max(1, Math.round(hoehe * faktor)) };
}

/** Dateiname ohne Endung, gekuerzt auf 80 Zeichen (nur Metadatum). */
export function dateinameOhneEndung(name: string): string {
  return name.replace(/\.[^.]+$/, '').slice(0, 80) || 'Foto';
}

async function ladeBild(datei: File): Promise<{ quelle: CanvasImageSource; breite: number; hoehe: number; freigeben: () => void }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(datei);
    return { quelle: bitmap, breite: bitmap.width, hoehe: bitmap.height, freigeben: () => bitmap.close() };
  }
  const url = URL.createObjectURL(datei);
  try {
    const bild = await new Promise<HTMLImageElement>((erfuellen, ablehnen) => {
      const el = new Image();
      el.onload = () => erfuellen(el);
      el.onerror = () => ablehnen(new Error('Bild nicht lesbar'));
      el.src = url;
    });
    return { quelle: bild, breite: bild.naturalWidth, hoehe: bild.naturalHeight, freigeben: () => URL.revokeObjectURL(url) };
  } catch (fehler) {
    URL.revokeObjectURL(url);
    throw fehler;
  }
}

/** Verkleinert eine Bilddatei auf hoechstens `max` px und liefert ein JPEG als Data-URL. */
export async function verkleinereBild(datei: File, max = MAX_KANTE): Promise<VerkleinerungsErgebnis> {
  const name = dateinameOhneEndung(datei.name);
  if (!istErlaubtesBild(datei)) return { ok: false, name, grund: 'format', datei };
  if (istHeic(datei)) {
    // Safari decodiert HEIC, andere Browser nicht. Ein Versuch schadet nicht.
    try {
      return await zeichne(datei, name, max);
    } catch {
      return { ok: false, name, grund: 'heic', datei };
    }
  }
  try {
    return await zeichne(datei, name, max);
  } catch {
    return { ok: false, name, grund: 'fehler', datei };
  }
}

async function zeichne(datei: File, name: string, max: number): Promise<VerkleinerungsErgebnis> {
  const bild = await ladeBild(datei);
  try {
    const ziel = zielGroesse(bild.breite, bild.hoehe, max);
    if (!ziel.breite || !ziel.hoehe) throw new Error('Bild ohne Groesse');
    const canvas = document.createElement('canvas');
    canvas.width = ziel.breite;
    canvas.height = ziel.hoehe;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas nicht verfuegbar');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bild.quelle, 0, 0, ziel.breite, ziel.hoehe);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITAET);
    if (!dataUrl.startsWith('data:image/jpeg')) throw new Error('Kodierung fehlgeschlagen');
    return { ok: true, name, dataUrl, breite: ziel.breite, hoehe: ziel.hoehe };
  } finally {
    bild.freigeben();
  }
}
