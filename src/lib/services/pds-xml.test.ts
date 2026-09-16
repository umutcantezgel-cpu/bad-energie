import { describe, expect, it } from 'vitest';
import {
  bereinigeKurztext,
  erstelleWaermepumpePdsVorlage,
  generierePdsXml,
  standardSchlusstext,
  type PdsVorgangInput,
} from './pds-xml';

describe('PDS XML Generator & 12-Punkte-Pflichtprüfung', () => {
  const beispielVorgang: PdsVorgangInput = erstelleWaermepumpePdsVorlage({
    vorgangsNummer: '20260312',
    kunde: {
      name: 'Michael Köhler',
      strasse: 'Gotenweg 26',
      plz: '35578',
      ort: 'Wetzlar',
      land: 'DE',
    },
    kw: 10,
    hersteller: 'buderus',
    speicherLiter: 300,
    alteHeizung: 'gas',
    alternativKw: 12,
  });

  const xml = generierePdsXml(beispielVorgang);

  it('Punkt 1 & 12: XML ist wohlgeformt und enthält das korrekte Wurzelelement und Release', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')).toBe(true);
    expect(xml).toContain('<Export xmlns="http://www.pds.de/pds_vorgang">');
    expect(xml).toContain('<Version>1.0.VoImEx</Version>');
    expect(xml).toContain('<Release>4.5.8</Release>');
    expect(xml.endsWith('</Export>\n')).toBe(true);
  });

  it('Punkt 2: Keine Pflichtfelder leer, Schema und Preisfelder vorhanden', () => {
    expect(xml).toContain('<Preisbasis>ANGEBOTSPREIS</Preisbasis>');
    expect(xml).toContain('<Schema>');
    expect(xml).toContain('<KatalogKalkulationsansatz>');
    expect(xml).toContain('<ManuellKalkulationsansatz>');
    expect(xml).toContain('<Rohstoffnotierung><Kennzeichen>CU</Kennzeichen>');
  });

  it('Punkt 3: Kundennummer ist eine Zahl', () => {
    const kdnrMatch = xml.match(/<Kundennummer>(\d+)<\/Kundennummer>/);
    expect(kdnrMatch).not.toBeNull();
    expect(Number(kdnrMatch![1])).toBeGreaterThan(0);
  });

  it('Punkt 4: Nummer und Bezeichnung gefüllt', () => {
    expect(xml).toContain('<Nummer>20260312</Nummer>');
    expect(xml).toContain('<Bezeichnung>Wärmepumpe Buderus 10 kW mit Speicher 300 Liter</Bezeichnung>');
  });

  it('Punkt 5 & 6: Fünf Anschriftfelder gefüllt, Geschäftspartner und Leistungsempfänger vorhanden', () => {
    expect(xml).toContain('<Anschrift>');
    expect(xml).toContain('<Name>Michael Köhler</Name>');
    expect(xml).toContain('<Strasse>Gotenweg 26</Strasse>');
    expect(xml).toContain('<Ort>Wetzlar</Ort>');
    expect(xml).toContain('<Postleitzahl>35578</Postleitzahl>');
    expect(xml).toContain('<Land>DE</Land>');

    expect(xml).toContain('<Geschaeftspartner>');
    expect(xml).toContain('<Leistungsempfaenger>');
    expect(xml).toContain('<DmsReferenzHolderID>dms_20260312</DmsReferenzHolderID>');
  });

  it('Punkt 7: Keine Position ohne Maßeinheit, Lohnzeit gleich LohnzeitEinfach', () => {
    const lohnzeitMatches = [...xml.matchAll(/<Lohnzeit>([\d.]+)<\/Lohnzeit>\s*<LohnzeitEinfach>([\d.]+)<\/LohnzeitEinfach>/g)];
    expect(lohnzeitMatches.length).toBeGreaterThan(10);
    for (const m of lohnzeitMatches) {
      expect(m[1]).toBe(m[2]);
    }

    const posOhneEinheit = [...xml.matchAll(/<Position>[\s\S]*?<\/Position>/g)].filter((posMatch) => {
      const posContent = posMatch[0];
      const isText = posContent.includes('<Typ>TEXT</Typ>');
      const hasEinheit = posContent.includes('<Masseinheit>');
      return !isText && !hasEinheit;
    });
    expect(posOhneEinheit).toHaveLength(0);
  });

  it('Punkt 8: Kein Kurztext über 255 Zeichen', () => {
    const kurztexte = [...xml.matchAll(/<Kurztext>([\s\S]*?)<\/Kurztext>/g)].map((m) => m[1]);
    expect(kurztexte.length).toBeGreaterThan(10);
    for (const kt of kurztexte) {
      expect(kt.length).toBeLessThanOrEqual(255);
    }
  });

  it('Punkt 9: Alle Preisfelder haben genau zwei Nachkommastellen', () => {
    const preise = [...xml.matchAll(/(?:EinzelPreis|GesamtPreis|Angebotssumme|Nettosumme)="?([\d.]+)"?/g)].map((m) => m[1]);
    expect(preise.length).toBeGreaterThan(15);
    for (const p of preise) {
      expect(p).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it('Punkt 10: Kein Verkaufspreis unter oder gleich Einkauf (außer 0 €)', () => {
    const posMatches = [...xml.matchAll(/<Position>[\s\S]*?<\/Position>/g)];
    for (const pm of posMatches) {
      const content = pm[0];
      if (content.includes('<Typ>TEXT</Typ>')) continue;

      const ekMatch = content.match(/<EkNettopreis EinzelPreis="([\d.]+)"/);
      const vkMatch = content.match(/<VkAngebotspreis EinzelPreis="([\d.]+)"/);
      if (ekMatch && vkMatch) {
        const ek = parseFloat(ekMatch[1]);
        const vk = parseFloat(vkMatch[1]);
        if (ek > 0) {
          expect(vk).toBeGreaterThan(ek);
        }
      }
    }
  });

  it('Punkt 11: Nettosumme entspricht exakt der Summe der Normalpositionen', () => {
    const sumMatch = xml.match(/<Angebotssumme>([\d.]+)<\/Angebotssumme>/);
    expect(sumMatch).not.toBeNull();
    const angebotssumme = parseFloat(sumMatch![1]);

    let nachgerechnet = 0;
    for (const ebene of beispielVorgang.ebenen) {
      for (const pos of ebene.positionen) {
        if (pos.typ === 'TEXT') continue;
        if (pos.art !== 'ALTERNATIV') {
          const vk = (pos.vkArtikel ?? 0) + (pos.vkLohn ?? 0);
          nachgerechnet += vk * (pos.menge ?? 1);
        }
      }
    }
    expect(angebotssumme).toBeCloseTo(nachgerechnet, 2);
  });

  it('Schlusstext enthält BEG-Bedingung, 3 % Skonto und 65 € Regiesatz', () => {
    const text = standardSchlusstext({ jahreszahl: 2026, skontoProzent: 3, regiesatz: 65 });
    expect(text).toContain('3% Skonto');
    expect(text).toContain('65,00 € die Stunde');
    expect(text).toContain('Bundesförderung für effiziente Gebäude');
    expect(text).toContain('aufschiebende Bedingung');
    expect(text).toContain('2026');
  });

  it('bereinigeKurztext kürzt und säubert zuverlässig', () => {
    const lang = 'A'.repeat(300);
    const sauber = bereinigeKurztext(lang, 255);
    expect(sauber.length).toBe(255);

    const schmutzig = 'Test  mit   vielen   Leerzeichen\r\nund Umbrüchen.';
    expect(bereinigeKurztext(schmutzig)).toBe('Test mit vielen Leerzeichen und Umbrüchen.');
  });
});
