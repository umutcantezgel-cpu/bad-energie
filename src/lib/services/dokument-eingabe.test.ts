import { describe, expect, it } from 'vitest';
import { gebaeudeSchema, type FoerderRegeln, type GebaeudeDaten } from '../types';
import { berechne } from './calculation';
import { csvFeld, fehlendeAngaben, type VorgangDaten } from './dokument-eingabe';

/**
 * Reine Prüfungen der Dossier-Eingabe: die Übersichts-CSV geht ins Büro und darf keine
 * Formeln ausführen, und die Liste „Fehlende Angaben“ muss serverseitig dieselben Lücken
 * zeigen wie der Meister-Client.
 */

const REGELN: FoerderRegeln = {
  grund: 30, effizienz: 5, klimageschwindigkeit: 20, einkommen: 30, einkommenGrenze: 40000, deckel: 70,
  kostenWe1: 30000, kostenJeWeitere: 15000, maxWe: 6, standardsatz: null, eigenanteilRundung: 1000,
};

const LEERES_ERGEBNIS = berechne({ positionen: [], foerderRegeln: REGELN });

function vorgang(gebaeude: GebaeudeDaten | null, vorlageIds: string[] = ['waermepumpe_gas']): VorgangDaten {
  return {
    anfrage: {
      objektAdresse: 'Hainbachstraße 3', persoenlicherSatz: 'Danke für Ihren Anruf.', gebaeude,
    },
    kunde: { anrede: 'Herr', telefon: '06441 1', email: 'kunde@example.org' },
    zeilen: [],
    bearbeiter: null,
    vorlageIds,
    anhaenge: [],
    fenster: [{ id: 'f1', beschriftung: 'Montag, 10 Uhr' }, { id: 'f2', beschriftung: 'Dienstag, 14 Uhr' }],
  } as unknown as VorgangDaten;
}

function gebaeudeMit(teil: Record<string, unknown>): GebaeudeDaten {
  return gebaeudeSchema.parse(teil);
}

describe('CSV für das Büro', () => {
  it('neutralisiert Formelzeichen am Anfang eines Feldes', () => {
    expect(csvFeld('=HYPERLINK("http://beispiel.test";"Klick")')).toBe('"\'=HYPERLINK(""http://beispiel.test"";""Klick"")"');
    expect(csvFeld('@SUM(1+1)')).toBe("'@SUM(1+1)");
    expect(csvFeld('+49 6441 1')).toBe("'+49 6441 1");
    expect(csvFeld('-Meier')).toBe("'-Meier");
    expect(csvFeld('\t=1+1')).toBe("'=1+1");
  });

  it('lässt gewöhnliche Werte unverändert und maskiert weiter Anführungszeichen und Semikolon', () => {
    expect(csvFeld('Meier')).toBe('Meier');
    expect(csvFeld('KS-2026-0032')).toBe('KS-2026-0032');
    expect(csvFeld('Wetzlar; Innenstadt')).toBe('"Wetzlar; Innenstadt"');
    expect(csvFeld('Kunde sagt "gerne"')).toBe('"Kunde sagt ""gerne"""');
    expect(csvFeld('')).toBe('');
  });
});

describe('Fehlende Angaben, serverseitig', () => {
  it('meldet eine zu schmale Tür und die fehlende bestehende Heizung', () => {
    const g = gebaeudeMit({ wohnflaeche: 150, baujahrKlasse: 'vor_1977', platz: { tuerbreiteCm: 73 } });
    const fehlt = fehlendeAngaben(vorgang(g), LEERES_ERGEBNIS);
    expect(fehlt).toContain('Türbreite unter 80 cm, Transportweg klären');
    expect(fehlt).toContain('Bestehende Heizung');
  });

  it('meldet eine Gerätewahl ohne Verbrauch und eine Heizlast über der Baureihe', () => {
    const ohneVerbrauch = gebaeudeMit({ wohnflaeche: 150, baujahrKlasse: 'vor_1977', bestand: { energieart: 'gas' } });
    const fehlt = fehlendeAngaben(vorgang(ohneVerbrauch), LEERES_ERGEBNIS);
    expect(fehlt.some((f) => f.includes('Jahresverbrauch fehlt'))).toBe(true);
    // 18,9 kW aus der Fläche liegen über der Bosch-Baureihe bis 12 kW.
    expect(fehlt).toContain('Die errechnete Heizlast liegt über der Baureihe, die Auslegung klären wir vor Ort.');
  });

  it('schweigt, wenn Verbrauch und Zugang stimmen', () => {
    const g = gebaeudeMit({
      wohnflaeche: 150, baujahrKlasse: 'vor_1977', fenster: 'zweifach',
      platz: { tuerbreiteCm: 90 },
      bestand: { energieart: 'gas', verbrauchJahr: 22000, kesseltyp: 'standard' },
    });
    const fehlt = fehlendeAngaben(vorgang(g), LEERES_ERGEBNIS);
    expect(fehlt.some((f) => f.includes('Türbreite'))).toBe(false);
    expect(fehlt.some((f) => f.includes('Bestehende Heizung'))).toBe(false);
    expect(fehlt.some((f) => f.includes('Jahresverbrauch'))).toBe(false);
    expect(fehlt.some((f) => f.includes('Baureihe'))).toBe(false);
  });

  it('prüft Gebäudeangaben nur bei einer Wärmepumpen-Vorlage', () => {
    const g = gebaeudeMit({ wohnflaeche: 150, baujahrKlasse: 'vor_1977' });
    const fehlt = fehlendeAngaben(vorgang(g, ['bad_komplett']), LEERES_ERGEBNIS);
    expect(fehlt.some((f) => f.includes('Bestehende Heizung'))).toBe(false);
    expect(fehlt.some((f) => f.includes('Jahresverbrauch'))).toBe(false);
  });
});
