import 'server-only';

// STUB: Vertrag des PDF-Renderers. Implementierung im Arbeitsstrang Dokumente
// (puppeteer-core + @sparticuz/chromium in Produktion, lokales Chrome in Entwicklung).
export async function renderPdf(_html: string): Promise<Buffer> { throw new Error('renderPdf: nicht implementiert'); }
/** Zählt die Seiten eines PDF-Buffers (für das Zwei-Seiten-Badge). */
export function pdfSeitenzahl(_pdf: Buffer): number { throw new Error('pdfSeitenzahl: nicht implementiert'); }
