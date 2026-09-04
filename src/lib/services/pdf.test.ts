import { afterAll, describe, expect, it } from 'vitest';

import { eingabeAus } from '../../../test/fixtures/eingabe';
import { lokalerChromePfad, pdfSeitenzahl, renderPdf, schliesseBrowser } from './pdf';
import { renderKostenschaetzungHtml } from './templates';

const chrome = lokalerChromePfad();

describe('pdfSeitenzahl', () => {
  it('zählt /Type /Page und ignoriert /Type /Pages', () => {
    const puffer = Buffer.from('<</Type /Pages /Count 2>> <</Type /Page>> <</Type/Page>>', 'latin1');
    expect(pdfSeitenzahl(puffer)).toBe(2);
  });

  it('zählt in einem leeren Puffer nichts', () => {
    expect(pdfSeitenzahl(Buffer.alloc(0))).toBe(0);
  });
});

describe.skipIf(!chrome)('renderPdf (braucht ein lokales Chrome)', () => {
  afterAll(async () => {
    await schliesseBrowser();
  });

  it('rendert KS-2026-0032 auf zwei DIN-A4-Seiten', async () => {
    const html = renderKostenschaetzungHtml(eingabeAus('0032'));
    const pdf = await renderPdf(html, { ksNummer: 'KS-2026-0032' });
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.byteLength).toBeGreaterThan(10_000);
    expect(pdfSeitenzahl(pdf)).toBe(2);
  }, 60_000);
});
