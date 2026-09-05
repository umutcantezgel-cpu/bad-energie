import { describe, expect, it } from 'vitest';
import { normalisiere, parsePortalLead } from './portal-lead-parser';

/** Beleg 7 und 8 aus `Arbeitsweise Chef/` (WattFox-Lead, Freiburg), Wort für Wort. */
const WATTFOX = `Interesse an: Heizung (Wärmepumpe)
Art der Wärmepumpe: Luft-Wärmepumpe
Nutzung der Wärmepumpe: zum Heizen, zur Brauchwassererwärmung
Bisheriges Heizsystem: Gasheizung, Solarthermie
Gebäudetyp: Ein- / Zweifamilienhaus
Größe der zu beheizenden Fläche in qm: 150
Art der durchzuführenden Tätigkeit: Austausch / Modernisierung
Wie viele Personen leben im Haushalt?: 1-2 Personen
Baujahr des Gebäudes: 1965
Alter der Heizung in Jahren: 20
Art des Erwerbs: Kauf
Sonstiges: - Einfamilienhaus - Gebäude steht im Eigentum der anfragenden Person - Anfragende Person ist dort wohnhaft - Standort der Heizung: Keller`;

describe('parsePortalLead: WattFox-Lead aus Beleg 7 und 8', () => {
  const lead = parsePortalLead(WATTFOX);

  it('erkennt das Portal', () => {
    expect(lead).not.toBeNull();
    expect(lead?.art).toBe('portal_lead');
    expect(lead?.portal).toBe('wattfox');
  });

  it('übernimmt Fläche, Baujahr, Baujahrklasse und Personen', () => {
    expect(lead?.gebaeude.wohnflaeche).toBe(150);
    expect(lead?.gebaeude.baujahr).toBe(1965);
    expect(lead?.gebaeude.baujahrKlasse).toBe('vor_1977');
    expect(lead?.gebaeude.personen).toBe(2);
  });

  it('übernimmt die bestehende Heizung mit Solarthermie, Alter und Standort', () => {
    expect(lead?.gebaeude.bestand.energieart).toBe('gas');
    expect(lead?.gebaeude.bestand.solarthermie).toBe(true);
    expect(lead?.gebaeude.bestand.heizungsalterJahre).toBe(20);
    expect(lead?.gebaeude.bestand.standort).toBe('keller');
  });

  it('löst Ein- oder Zweifamilienhaus über das Feld Sonstiges auf', () => {
    expect(lead?.gebaeude.lage).toBe('freistehend');
    expect(lead?.gebaeude.wohneinheiten).toBe(1);
    expect(lead?.objekt.wohneinheiten).toBe(1);
  });

  it('erkennt Eigentum, Selbstbewohnung und den Förderbonus für die alte Gasheizung', () => {
    expect(lead?.objekt.eigentum).toBe('eigentum');
    expect(lead?.foerderung.selbstBewohnt).toBe(true);
    expect(lead?.foerderung.altOelOderGas).toBe(true);
  });

  it('wählt die Vorlage Wärmepumpe Gas', () => {
    expect(lead?.vorlageIds).toEqual(['waermepumpe_gas']);
    expect(lead?.vorhabenKurz).toContain('Wärmepumpe');
  });

  it('erfindet keine Kontaktdaten und meldet die fehlende E-Mail', () => {
    expect(lead?.kontakt.email).toBe('');
    expect(lead?.kontakt.nachname).toBe('');
    expect(lead?.kontakt.telefon).toBe('');
    expect(lead?.objekt.plz).toBe('');
    expect(lead?.objekt.adresse).toBe('');
    expect(lead?.hinweise.some((h) => h.includes('E-Mail'))).toBe(true);
  });

  it('hält den Rohtext für die interne Notiz vollständig fest', () => {
    expect(lead?.rohtext).toBe(WATTFOX);
    expect(lead?.unbekannteZeilen).toEqual([]);
  });
});

describe('parsePortalLead: Abgrenzung und weitere Formate', () => {
  it('gibt bei Freitext null zurück', () => {
    const text = 'Neue Anfrage. Frau Diflo, Hainbachstraße 3 in 35641 Schöffengrund, Klimaanlage mit Heizfunktion, 0171 1234567';
    expect(parsePortalLead(text)).toBeNull();
  });

  it('gibt bei zu wenigen Schlüssel-Wert-Zeilen null zurück', () => {
    expect(parsePortalLead('Baujahr des Gebäudes: 1965\nIrgendwas: dazu')).toBeNull();
  });

  it('legt unbekannte Labels in unbekannteZeilen ab', () => {
    const lead = parsePortalLead(
      'Bisheriges Heizsystem: Ölheizung\nBaujahr des Gebäudes: 1980\nDachform: Satteldach\nAnfrage-Nr: 4711',
    );
    expect(lead?.unbekannteZeilen).toEqual(['Dachform: Satteldach', 'Anfrage-Nr: 4711']);
    expect(lead?.gebaeude.bestand.energieart).toBe('oel');
    expect(lead?.vorlageIds).toEqual(['waermepumpe_oel']);
    expect(lead?.gebaeude.baujahrKlasse).toBe('vor_1982');
  });

  it('übernimmt Kontaktfelder, wenn das Portal sie mitschickt', () => {
    const lead = parsePortalLead(
      [
        'Anrede: Frau',
        'Name: Tamara Diflo',
        'E-Mail: tamara.diflo@example.de',
        'Telefon: 0171 1234567',
        'Straße: Hainbachstr. 3',
        'PLZ: 35641',
        'Ort: Schöffengrund',
        'Bisheriges Heizsystem: Gasheizung',
        'Größe der zu beheizenden Fläche in qm: 70',
        'Alter der Heizung in Jahren: über 20',
      ].join('\n'),
    );
    expect(lead?.kontakt.anrede).toBe('Frau');
    expect(lead?.kontakt.vorname).toBe('Tamara');
    expect(lead?.kontakt.nachname).toBe('Diflo');
    expect(lead?.kontakt.email).toBe('tamara.diflo@example.de');
    expect(lead?.kontakt.plzOrt).toBe('35641 Schöffengrund');
    expect(lead?.objekt.plz).toBe('35641');
    expect(lead?.objekt.adresse).toBe('Hainbachstr. 3');
    expect(lead?.gebaeude.bestand.heizungsalterJahre).toBe(25);
    expect(lead?.foerderung.altOelOderGas).toBe(true);
  });

  it('setzt den Förderbonus nicht bei junger Heizung und weist auf fremde Energieart hin', () => {
    const lead = parsePortalLead(
      'Bisheriges Heizsystem: Pelletheizung\nAlter der Heizung in Jahren: 8\nGrösse der zu beheizenden Fläche in qm: 180\nWie viele Personen leben im Haushalt?: 4 Personen',
    );
    expect(lead?.gebaeude.bestand.energieart).toBe('pellets');
    expect(lead?.foerderung.altOelOderGas).toBe(false);
    expect(lead?.gebaeude.personen).toBe(4);
    expect(lead?.vorlageIds).toEqual(['waermepumpe_gas']);
    expect(lead?.hinweise.some((h) => h.includes('weder Gas noch Öl'))).toBe(true);
  });

  it('erkennt Miete und Zweifamilienhaus', () => {
    const lead = parsePortalLead(
      'Gebäudetyp: Zweifamilienhaus\nArt des Erwerbs: Miete\nBisheriges Heizsystem: Gasheizung\nBaujahr des Gebäudes: 1999',
    );
    expect(lead?.objekt.eigentum).toBe('miete');
    expect(lead?.objekt.wohneinheiten).toBe(2);
    expect(lead?.gebaeude.wohneinheiten).toBe(2);
    expect(lead?.gebaeude.baujahrKlasse).toBe('vor_2002');
  });

  it('normalisiert Labels unabhängig von Umlauten und Satzzeichen', () => {
    expect(normalisiere('Größe der zu beheizenden Fläche in qm')).toBe('groesse der zu beheizenden flaeche in qm');
    expect(normalisiere('E-Mail:')).toBe('e mail');
  });
});
