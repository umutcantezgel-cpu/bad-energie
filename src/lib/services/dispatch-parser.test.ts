import { describe, expect, it } from 'vitest';
import { dispatchBefehlSchema } from '../types';
import { parseDispatchText } from './dispatch-parser';

describe('Dispatch-Befehle', () => {
  it('erkennt „freigeben“ mit KS-Nummer', () => {
    const b = parseDispatchText('freigeben KS-2026-0031');
    expect(b.art).toBe('freigeben');
    if (b.art === 'freigeben') expect(b.ksNummer).toBe('KS-2026-0031');
  });

  it('erkennt „freigeben und sofort senden“ und schreibt die Nummer groß', () => {
    const b = parseDispatchText('Freigeben und sofort senden ks-2026-0031');
    expect(b.art).toBe('freigeben_sofort');
    if (b.art === 'freigeben_sofort') expect(b.ksNummer).toBe('KS-2026-0031');
  });

  it('erkennt die Anpassung als Notiz zum Vorgang', () => {
    const b = parseDispatchText('KS-2026-0031: Kunde möchte 300 Liter Speicher');
    expect(b.art).toBe('anpassung');
    if (b.art === 'anpassung') {
      expect(b.ksNummer).toBe('KS-2026-0031');
      expect(b.text).toBe('Kunde möchte 300 Liter Speicher');
    }
  });
});

describe('Dispatch-Neuanlage aus Freitext', () => {
  const text = 'Neue Anfrage. Frau Diflo, Hainbachstraße 3 in 35641 Schöffengrund, Klimaanlage mit Heizfunktion, 0171 1234567';
  const b = parseDispatchText(text);

  it('bleibt eine Neuanlage', () => {
    expect(b.art).toBe('neuanlage');
  });

  it('übernimmt nur, was im Text steht', () => {
    if (b.art !== 'neuanlage') throw new Error('Neuanlage erwartet.');
    expect(b.anrede).toBe('Frau');
    expect(b.nachname).toBe('Diflo');
    expect(b.strasse).toBe('Hainbachstraße 3');
    expect(b.plzOrt).toBe('35641 Schöffengrund');
    expect(b.telefon).toBe('0171 1234567');
    expect(b.vorlageIds).toContain('klima_multisplit');
  });

  it('erfindet ohne Angaben weder PLZ noch E-Mail und legt den Diktattext in den Rohtext', () => {
    const ohne = parseDispatchText('Neue Anfrage. Herr Horrer, alte Gasheizung raus, Wärmepumpe rein.');
    if (ohne.art !== 'neuanlage') throw new Error('Neuanlage erwartet.');
    expect(ohne.plzOrt).toBe('');
    expect(ohne.email).toBe('');
    expect(ohne.strasse).toBe('');
    expect(ohne.persoenlicherSatz).toBe('');
    expect(ohne.rohtext).toContain('Gasheizung');
    expect(ohne.vorlageIds).toEqual(['waermepumpe_gas']);
  });
});

describe('Dispatch mit eingefügtem Portal-Lead', () => {
  const lead = [
    'Interesse an: Heizung (Wärmepumpe)',
    'Bisheriges Heizsystem: Gasheizung, Solarthermie',
    'Größe der zu beheizenden Fläche in qm: 150',
    'Baujahr des Gebäudes: 1965',
    'Alter der Heizung in Jahren: 20',
  ].join('\n');

  it('geht in den Portal-Zweig statt in die Freitext-Neuanlage', () => {
    const b = parseDispatchText(lead);
    expect(b.art).toBe('portal_lead');
    if (b.art !== 'portal_lead') throw new Error('Portal-Lead erwartet.');
    expect(b.gebaeude.wohnflaeche).toBe(150);
    expect(b.gebaeude.bestand.heizungsalterJahre).toBe(20);
    expect(b.rohtext).toBe(lead);
  });

  it('lässt Befehle vor der Portal-Erkennung gewinnen', () => {
    const b = parseDispatchText('KS-2026-0031: Bisheriges Heizsystem: Gasheizung\nBaujahr des Gebäudes: 1965\nAlter der Heizung in Jahren: 20');
    expect(b.art).toBe('anpassung');
  });
});

describe('Jeder Befehl passiert die Prüfung des Endpunkts', () => {
  const eingaben = [
    'freigeben KS-2026-0031',
    'freigeben und sofort senden KS-2026-0031',
    'KS-2026-0031: Kunde möchte 300 Liter Speicher',
    'Neue Anfrage. Frau Diflo, Hainbachstraße 3 in 35641 Schöffengrund, Klimaanlage, 0171 1234567',
    'Interesse an: Heizung (Wärmepumpe)\nBisheriges Heizsystem: Gasheizung\nBaujahr des Gebäudes: 1965',
  ];

  for (const eingabe of eingaben) {
    it(`akzeptiert „${eingabe.split('\n')[0].slice(0, 40)}“`, () => {
      const pruefung = dispatchBefehlSchema.safeParse(parseDispatchText(eingabe));
      expect(pruefung.success).toBe(true);
    });
  }
});
