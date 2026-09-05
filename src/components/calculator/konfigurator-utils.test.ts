import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { UNVERBINDLICHKEITS_HINWEIS, heizkostenSatz } from './konfigurator-utils';

/**
 * Fachregel 4: der Unverbindlichkeitshinweis steht wörtlich im Kundendokument und auf der
 * Ergebnisseite. Beide Fassungen müssen wortgleich sein, sonst steht auf der Website ein
 * anderer Rechtstext als im PDF.
 */

const TEMPLATE = readFileSync(
  path.resolve(process.cwd(), 'src/lib/dokumente/assets/kostenschaetzung-template.html'),
  'utf8',
);

/** Der Absatz mit dem Paragrafen, ohne Auszeichnung und mit einfachen Abständen. */
function hinweisAusTemplate(): string {
  const absatz = [...TEMPLATE.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1])
    .find((inhalt) => inhalt.includes('145 BGB'));
  return (absatz ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

describe('Unverbindlichkeitshinweis', () => {
  it('ist im Konfigurator wortgleich mit dem Kostenschätzungs-Template', () => {
    const ausTemplate = hinweisAusTemplate();
    expect(ausTemplate).not.toBe('');
    expect(UNVERBINDLICHKEITS_HINWEIS).toBe(ausTemplate);
  });

  it('nennt den Paragrafen, das Angebot nach dem Termin und die Materialpreise', () => {
    expect(UNVERBINDLICHKEITS_HINWEIS).toContain('§ 145 BGB');
    expect(UNVERBINDLICHKEITS_HINWEIS).toContain('nach dem Termin vor Ort');
    expect(UNVERBINDLICHKEITS_HINWEIS).toContain('Materialpreise');
    // Das Dokument heißt Kostenschätzung, nie Angebot.
    expect(UNVERBINDLICHKEITS_HINWEIS.startsWith('Diese Kostenschätzung')).toBe(true);
  });
});

describe('Heizkostensatz', () => {
  it('bleibt leer, solange keine Beträge vorliegen', () => {
    expect(heizkostenSatz({ pfad: 'vorangebot', nichtEnthalten: [] })).toBe('');
  });
});
