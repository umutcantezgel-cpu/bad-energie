import { describe, expect, it, beforeEach } from 'vitest';
import type { InternAnfrage, InternAnfrageDTO, KalkulationsErgebnis, Position, PositionErgebnis } from '@/lib/types';
import {
  lohntServerEntwurf,
  LEINWAND_BREITE,
  LEINWAND_HOEHE,
  UNDO_TIEFE,
  abstandPunktZuSegment,
  aktiveBausteine,
  anhangName,
  ansichtSkalierung,
  ansichtLesen,
  ansichtSetzen,
  ansichtZuruecksetzen,
  anwenden,
  ausDTO,
  begrenzeZoom,
  ersteBlockierte,
  fehlendeAngaben,
  istWaermepumpenVorlage,
  kannRueckgaengig,
  kwFuerVariante,
  kannWiederholen,
  leereAnfrage,
  massLabel,
  meisterReduzierer,
  neuerStack,
  normalisiereAnfrage,
  radiere,
  rueckgaengig,
  schrittPruefung,
  schrittSperrt,
  textregelWarnungen,
  trifftElement,
  wiederholen,
  zuLeinwand,
  type Element,
} from './meister-utils';
import { leeresGebaeude } from '@/lib/services/heizlast';

function position(teil: Partial<Position> = {}): Position {
  return {
    id: 'p1',
    titel: 'Wärmepumpe',
    gewerk: 'waermepumpe',
    text: 'Lieferung',
    menge: 1,
    einheit: 'pauschal',
    von: 100,
    bis: 200,
    matrixNr: 1,
    vorlageZeileId: null,
    varianteMatrixNr: null,
    zuschlag: false,
    aktiv: true,
    quelle: 'vorlage',
    notizIntern: '',
    intern: {},
    ...teil,
  };
}

describe('Textregeln', () => {
  it('meldet Bindestriche im Fliesstext', () => {
    expect(textregelWarnungen('Wir bauen die Luft-Wasser Pumpe ein.')[0]).toContain('Bindestrich');
  });

  it('meldet Emojis', () => {
    expect(textregelWarnungen('Alles klar \u{1F600}').some((w) => w.includes('Emoji'))).toBe(true);
  });

  it('meldet die Floskel', () => {
    expect(textregelWarnungen('Vielen Dank für Ihr Interesse an uns.').some((w) => w.includes('Floskel'))).toBe(true);
  });

  it('laesst sauberen Text ohne Warnung', () => {
    expect(textregelWarnungen('Ich habe den Heizraum gesehen und alles passt.')).toEqual([]);
  });
});

describe('Anhangname', () => {
  it('folgt der Pflichtform', () => {
    expect(anhangName('KS-2026-0031')).toBe('Kostenschaetzung KS-2026-0031 Bad und Energie.pdf');
  });
});

describe('Fehlende Angaben', () => {
  it('benennt Anrede, Telefon, Objektadresse, Termine und Satz', () => {
    const fehlt = fehlendeAngaben(leereAnfrage());
    expect(fehlt).toContain('Anrede');
    expect(fehlt).toContain('E-Mail');
    expect(fehlt).toContain('Telefon');
    expect(fehlt).toContain('Objektadresse');
    expect(fehlt).toContain('Zwei Terminfenster');
    expect(fehlt).toContain('Persoenlicher Satz');
  });
});

describe('Reduzierer', () => {
  it('schaltet Vorlagen an und aus', () => {
    const eins = meisterReduzierer(leereAnfrage(), { typ: 'vorlage', vorlageId: 'v1', an: true });
    expect(eins.vorlageIds).toEqual(['v1']);
    const zwei = meisterReduzierer(eins, { typ: 'vorlage', vorlageId: 'v1', an: false });
    expect(zwei.vorlageIds).toEqual([]);
  });

  it('setzt Positionen ein und aktualisiert sie an derselben Stelle', () => {
    const a = meisterReduzierer(leereAnfrage(), { typ: 'positionSetzen', position: position() });
    const b = meisterReduzierer(a, { typ: 'positionSetzen', position: position({ menge: 3 }) });
    expect(b.positionen).toHaveLength(1);
    expect(b.positionen[0].menge).toBe(3);
  });

  it('aendert nur die benannte Position', () => {
    const a = meisterReduzierer(leereAnfrage(), { typ: 'positionSetzen', position: position() });
    const b = meisterReduzierer(a, { typ: 'positionSetzen', position: position({ id: 'p2' }) });
    const c = meisterReduzierer(b, { typ: 'positionAendern', id: 'p2', teil: { notizIntern: 'eng' } });
    expect(c.positionen[0].notizIntern).toBe('');
    expect(c.positionen[1].notizIntern).toBe('eng');
  });

  it('begrenzt den Terminvorschlag auf zwei Fenster', () => {
    const a = meisterReduzierer(leereAnfrage(), { typ: 'termin', ids: ['a', 'b', 'c'] });
    expect(a.terminfensterIds).toEqual(['a', 'b']);
  });

  it('haengt Skizzen an und entfernt sie', () => {
    const skizze = { name: 'Skizze', dataUrl: 'data:image/png;base64,AA', breite: 10, hoehe: 10 };
    const a = meisterReduzierer(leereAnfrage(), { typ: 'skizzeSetzen', index: 0, skizze });
    expect(a.skizzen).toHaveLength(1);
    const b = meisterReduzierer(a, { typ: 'skizzeEntfernen', index: 0 });
    expect(b.skizzen).toHaveLength(0);
  });

  it('laesst den Zustand unveraendert, wenn nichts passiert', () => {
    const start = leereAnfrage();
    expect(meisterReduzierer(start, { typ: 'vorlage', vorlageId: 'v1', an: false })).toBe(start);
  });
});

describe('ausDTO', () => {
  it('uebernimmt Kontakt, Positionen und Notizen', () => {
    const dto: InternAnfrageDTO = {
      anfrageId: 'a1',
      ksNummer: 'KS-2026-0031',
      status: 'geplant',
      bemerkung: '',
      quelle: 'intern',
      vorlageIds: ['v1'],
      kontakt: { anrede: 'Frau', vorname: 'Anna', nachname: 'Diflo', email: 'a@b.de', telefon: '0641', strasse: 'Weg 1', plzOrt: '35578 Wetzlar' },
      objekt: { adresse: 'Weg 1', plz: '35578', eigentum: 'eigentum', wohneinheiten: 2, entfernungKm: 3 },
      gebaeude: leeresGebaeude(),
      dringlichkeit: 'sofort',
      vorhabenKurz: 'Bad',
      gewerkHaupt: 'bad',
      positionen: [position()],
      kalkulation: { stundensatz: 68 },
      foerderung: { aktiv: true, wohneinheiten: 2, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: null },
      persoenlicherSatz: 'Guten Tag',
      annahmen: ['A'],
      vorbehalte: ['V'],
      ausfuehrungSatz: 'Zwei Wochen',
      terminfensterIds: ['t1'],
      notizen: { etage: 2, aufzug: false, montagehindernisse: '', leitungswege: '', intern: 'eng' },
      konfiguratorAntworten: {},
      triageVorschlag: '',
      anhaenge: [],
      versandauftraege: [],
      ereignisse: [],
      bearbeiter: 'Sabri',
      erstelltAm: '2026-09-01',
    };
    const anfrage = ausDTO(dto);
    expect(anfrage.anfrageId).toBe('a1');
    expect(anfrage.kontakt.anrede).toBe('Frau');
    expect(anfrage.positionen).toHaveLength(1);
    expect(anfrage.notizen.intern).toBe('eng');
    expect(anfrage.modus).toBe('intern');
  });
});

describe('Bausteine und Hinweise', () => {
  it('filtert und sortiert nach Vorlagenreihenfolge', () => {
    const b = (id: string, vorlageId: string, pos: number) => ({
      id,
      vorlageId,
      position: pos,
      titel: id,
      gewerk: 'bad' as const,
      text: '',
      matrixNr: null,
      zuschlag: false,
      mengeDefault: 1,
      einheit: 'pauschal' as const,
      groessenVarianten: null,
      matrixHinweis: null,
      spanne: null,
    });
    const liste = [b('x', 'v2', 1), b('y', 'v1', 2), b('z', 'v1', 1), b('q', 'v3', 1)];
    expect(aktiveBausteine(liste, ['v1', 'v2']).map((e) => e.id)).toEqual(['z', 'y', 'x']);
  });

  it('findet die erste blockierte Position', () => {
    expect(ersteBlockierte([{ code: 'foerdersatz_fehlt', text: 'x' }, { code: 'matrix_fehlt', text: 'y', positionId: 'p9' }])).toBe('p9');
    expect(ersteBlockierte([])).toBeNull();
  });
});

describe('Undo-Stack', () => {
  it('geht zurueck und wieder vor', () => {
    let stack = neuerStack(0);
    stack = anwenden(stack, 1);
    stack = anwenden(stack, 2);
    expect(stack.gegenwart).toBe(2);
    expect(kannRueckgaengig(stack)).toBe(true);
    stack = rueckgaengig(stack);
    expect(stack.gegenwart).toBe(1);
    expect(kannWiederholen(stack)).toBe(true);
    stack = wiederholen(stack);
    expect(stack.gegenwart).toBe(2);
  });

  it('haelt hoechstens 30 Schritte', () => {
    let stack = neuerStack(0);
    for (let i = 1; i <= 40; i += 1) stack = anwenden(stack, i);
    expect(stack.vergangenheit).toHaveLength(UNDO_TIEFE);
  });

  it('verwirft die Zukunft nach einer neuen Aenderung', () => {
    let stack = anwenden(anwenden(neuerStack(0), 1), 2);
    stack = rueckgaengig(stack);
    stack = anwenden(stack, 9);
    expect(stack.zukunft).toEqual([]);
    expect(kannWiederholen(stack)).toBe(false);
  });

  it('bleibt an den Enden stabil', () => {
    const stack = neuerStack('a');
    expect(rueckgaengig(stack)).toBe(stack);
    expect(wiederholen(stack)).toBe(stack);
  });
});

describe('Geometrie', () => {
  it('skaliert die Leinwand in den Viewport', () => {
    expect(ansichtSkalierung(LEINWAND_BREITE, LEINWAND_HOEHE)).toBeCloseTo(1, 5);
    expect(ansichtSkalierung(LEINWAND_BREITE / 2, LEINWAND_HOEHE)).toBeCloseTo(0.5, 5);
    expect(ansichtSkalierung(0, 0)).toBe(1);
  });

  it('begrenzt den Zoom', () => {
    expect(begrenzeZoom(100)).toBe(6);
    expect(begrenzeZoom(0.01)).toBe(0.5);
    expect(begrenzeZoom(Number.NaN)).toBe(1);
  });

  it('rechnet Bildschirm nach Leinwand um', () => {
    const punkt = zuLeinwand(100, 50, 0.5, { zoom: 2, panX: 20, panY: 10 });
    expect(punkt.x).toBeCloseTo(80, 5);
    expect(punkt.y).toBeCloseTo(40, 5);
  });

  it('misst den Abstand zu einem Segment', () => {
    expect(abstandPunktZuSegment({ x: 0, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(5, 5);
    expect(abstandPunktZuSegment({ x: 20, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(10, 5);
    expect(abstandPunktZuSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(5, 5);
  });
});

describe('Radierer', () => {
  const strich: Element = {
    id: 's1',
    art: 'strich',
    werkzeug: 'stift',
    farbe: '#000',
    breite: 10,
    punkte: [
      { x: 0, y: 0, druck: 0.5 },
      { x: 100, y: 0, druck: 0.5 },
    ],
  };
  const mass: Element = { id: 'm1', art: 'mass', farbe: '#000', von: { x: 0, y: 200 }, bis: { x: 100, y: 200 }, label: '50 cm' };
  const text: Element = { id: 't1', art: 'text', farbe: '#000', position: { x: 400, y: 400 }, groesse: 48, text: 'Bad' };

  it('trifft nahe Elemente und laesst ferne stehen', () => {
    expect(trifftElement(strich, { x: 50, y: 10 }, 24)).toBe(true);
    expect(trifftElement(strich, { x: 50, y: 300 }, 24)).toBe(false);
    expect(trifftElement(mass, { x: 50, y: 210 }, 24)).toBe(true);
    expect(trifftElement(text, { x: 410, y: 400 }, 24)).toBe(true);
  });

  it('entfernt nur getroffene Elemente', () => {
    const rest = radiere([strich, mass, text], { x: 50, y: 5 }, 24);
    expect(rest.map((e) => e.id)).toEqual(['m1', 't1']);
  });
});

describe('Massband', () => {
  it('rechnet die Leinwandbreite auf Zentimeter', () => {
    expect(massLabel({ x: 0, y: 0 }, { x: LEINWAND_BREITE, y: 0 }, 600)).toBe('600 cm');
    expect(massLabel({ x: 0, y: 0 }, { x: LEINWAND_BREITE / 2, y: 0 }, 600)).toBe('300 cm');
  });
});


function positionErgebnis(teil: Partial<PositionErgebnis> = {}): PositionErgebnis {
  return {
    positionId: 'p1',
    titel: 'Wärmepumpe',
    gewerk: 'waermepumpe',
    text: '',
    menge: 1,
    einheit: 'pauschal',
    einzelVon: 100,
    einzelBis: 200,
    von: 100,
    bis: 200,
    blockiert: false,
    zuschlag: false,
    ...teil,
  };
}

function kalkulation(positionen: PositionErgebnis[] = []): KalkulationsErgebnis {
  return {
    positionen,
    nettoVon: 0,
    nettoBis: 0,
    rabattProzent: 0,
    bruttoVon: 0,
    bruttoBis: 0,
    foerderung: null,
    blockiert: [],
    vollstaendig: true,
  };
}

describe('Gebäude im Reduzierer', () => {
  it('setzt Gebäude, Bestand, Platz und Gerät getrennt', () => {
    const a = meisterReduzierer(leereAnfrage(), { typ: 'gebaeude', teil: { wohnflaeche: 150, baujahr: 1965 } });
    expect(a.gebaeude.wohnflaeche).toBe(150);
    const b = meisterReduzierer(a, { typ: 'gebaeudeBestand', teil: { energieart: 'gas', verbrauchJahr: 22000 } });
    expect(b.gebaeude.bestand.energieart).toBe('gas');
    expect(b.gebaeude.wohnflaeche).toBe(150);
    const c = meisterReduzierer(b, { typ: 'gebaeudePlatz', teil: { tuerbreiteCm: 73 } });
    expect(c.gebaeude.platz.tuerbreiteCm).toBe(73);
    const d = meisterReduzierer(c, { typ: 'gebaeudeGeraet', teil: { kw: 10, speicherLiter: 300 } });
    expect(d.gebaeude.geraet.kw).toBe(10);
    expect(d.gebaeude.geraet.speicherLiter).toBe(300);
    expect(d.gebaeude.bestand.verbrauchJahr).toBe(22000);
  });

  it('spiegelt die Wohneinheiten aus dem Objekt nach Förderung und Gebäude', () => {
    const a = meisterReduzierer(leereAnfrage(), { typ: 'objekt', teil: { wohneinheiten: 3 } });
    expect(a.objekt.wohneinheiten).toBe(3);
    expect(a.foerderung.wohneinheiten).toBe(3);
    expect(a.gebaeude.wohneinheiten).toBe(3);
  });

  it('ändert die Beschreibung eines Fotos', () => {
    const mit = meisterReduzierer(leereAnfrage(), {
      typ: 'fotosHinzu',
      fotos: [{ name: 'a.jpg', dataUrl: 'data:image/png;base64,AA', beschreibung: '' }],
    });
    const b = meisterReduzierer(mit, { typ: 'fotoBeschreibung', index: 0, beschreibung: 'Heizraum von der Tür' });
    expect(b.fotos[0].beschreibung).toBe('Heizraum von der Tür');
  });
});

describe('Fehlende Angaben zu Zugang und Bestand', () => {
  it('warnt bei einer Türbreite unter 80 cm', () => {
    const eng = meisterReduzierer(leereAnfrage(), { typ: 'gebaeudePlatz', teil: { tuerbreiteCm: 73 } });
    expect(fehlendeAngaben(eng).some((f) => f.includes('Türbreite unter 80 cm'))).toBe(true);
    const breit = meisterReduzierer(leereAnfrage(), { typ: 'gebaeudePlatz', teil: { tuerbreiteCm: 90 } });
    expect(breit.gebaeude.platz.tuerbreiteCm).toBe(90);
    expect(fehlendeAngaben(breit).some((f) => f.includes('Türbreite'))).toBe(false);
  });

  it('verlangt die bestehende Heizung bei einer Wärmepumpen-Vorlage', () => {
    expect(istWaermepumpenVorlage(['waermepumpe_gas'])).toBe(true);
    expect(istWaermepumpenVorlage(['bad_komplett'])).toBe(false);
    const wp = meisterReduzierer(leereAnfrage(), { typ: 'vorlage', vorlageId: 'waermepumpe_gas', an: true });
    expect(fehlendeAngaben(wp)).toContain('Bestehende Heizung');
    const mitEnergieart = meisterReduzierer(wp, { typ: 'gebaeudeBestand', teil: { energieart: 'gas' } });
    expect(fehlendeAngaben(mitEnergieart)).not.toContain('Bestehende Heizung');
  });
});

describe('Schrittprüfung des geführten Modus', () => {
  it('verlangt ein Vorhaben, Kontakt, Wohnfläche und Dokument', () => {
    const leer = leereAnfrage();
    expect(schrittPruefung('vorhaben', leer, kalkulation())).toHaveLength(1);
    expect(schrittPruefung('kunde', leer, kalkulation())).toHaveLength(2);
    expect(schrittPruefung('gebaeude', leer, kalkulation()).some((t) => t.includes('Wohnfläche'))).toBe(true);
    expect(schrittPruefung('notizen', leer, kalkulation())).toEqual([]);
    expect(schrittPruefung('dokument', leer, kalkulation())).toHaveLength(2);
  });

  it('nimmt Telefon statt E-Mail und meldet nur blockierte Basispositionen', () => {
    let a = meisterReduzierer(leereAnfrage(), { typ: 'kontakt', teil: { nachname: 'Diflo', telefon: '06441 42956' } });
    expect(schrittPruefung('kunde', a, kalkulation())).toEqual([]);
    a = meisterReduzierer(a, { typ: 'vorlage', vorlageId: 'waermepumpe_gas', an: true });
    expect(schrittPruefung('vorhaben', a, kalkulation())).toEqual([]);
    const mitBlockade = kalkulation([
      positionErgebnis({ blockiert: true }),
      positionErgebnis({ positionId: 'p2', titel: 'Zuschlag', zuschlag: true, blockiert: true }),
    ]);
    expect(schrittPruefung('bausteine', a, mitBlockade)).toHaveLength(1);
    expect(schrittSperrt('bausteine', mitBlockade)).toBe(true);
    expect(schrittSperrt('kunde', mitBlockade)).toBe(false);
    expect(schrittSperrt('bausteine', kalkulation([positionErgebnis()]))).toBe(false);
  });

  it('verlangt die bestehende Heizung im Gebäudeschritt bei Wärmepumpe', () => {
    let a = meisterReduzierer(leereAnfrage(), { typ: 'vorlage', vorlageId: 'waermepumpe_gas', an: true });
    a = meisterReduzierer(a, { typ: 'gebaeude', teil: { wohnflaeche: 150 } });
    expect(schrittPruefung('gebaeude', a, kalkulation())).toEqual(['Bestehende Heizung fehlt.']);
  });
});

describe('normalisiereAnfrage', () => {
  it('ergänzt einen alten Entwurf ohne Gebäude', () => {
    const alt = leereAnfrage() as Partial<InternAnfrage>;
    delete alt.gebaeude;
    alt.kontakt = { ...leereAnfrage().kontakt, nachname: 'Horrer' };
    alt.notizen = { ...leereAnfrage().notizen, intern: 'eng im Keller' };
    const a = normalisiereAnfrage(alt);
    expect(a.gebaeude).toEqual(leeresGebaeude());
    expect(a.kontakt.nachname).toBe('Horrer');
    expect(a.notizen.intern).toBe('eng im Keller');
    expect(a.modus).toBe('intern');
  });

  it('ergänzt fehlende Teile des Gebäudes und hält vorhandene Werte', () => {
    const alt = { ...leereAnfrage(), gebaeude: { wohnflaeche: 96, personen: 1 } };
    const a = normalisiereAnfrage(alt);
    expect(a.gebaeude.wohnflaeche).toBe(96);
    expect(a.gebaeude.bestand.standort).toBe('unbekannt');
    expect(a.gebaeude.platz.tuerbreiteCm).toBeNull();
    expect(a.gebaeude.geraet.hersteller).toBe('bosch');
  });

  it('liefert bei unbrauchbarer Eingabe die leere Anfrage', () => {
    expect(normalisiereAnfrage(null).vorlageIds).toEqual([]);
    expect(normalisiereAnfrage('kaputt').positionen).toEqual([]);
  });
});

describe('Kilowattwert der Größenvariante', () => {
  const klein = { matrixNr: 1, label: '5 bis 7 kW', heizlastKwVon: 0, heizlastKwBis: 7, kwLabel: '5 bis 7' };
  const mittel = { matrixNr: 2, label: '10 kW', heizlastKwVon: 8, heizlastKwBis: 11, kwLabel: '10' };

  it('nimmt das bestätigte Gerät, wenn es zur Variante passt', () => {
    expect(kwFuerVariante(mittel, 10)).toBe(10);
    expect(kwFuerVariante(klein, 7)).toBe(7);
  });

  it('fällt sonst auf die Beschriftung der Variante zurück', () => {
    expect(kwFuerVariante(klein, 10)).toBe('5 bis 7');
    expect(kwFuerVariante(mittel, null)).toBe('10');
    expect(kwFuerVariante(null, 10)).toBeUndefined();
  });
});

describe('Ansichtsschalter', () => {
  beforeEach(() => {
    ansichtZuruecksetzen();
  });

  it('setzt Kundenansicht und Baustellen-Modus', () => {
    ansichtSetzen({ kundenansicht: true });
    expect(ansichtLesen().kundenansicht).toBe(true);
    expect(ansichtLesen().baustelle).toBe(false);
    ansichtSetzen({ baustelle: true });
    expect(ansichtLesen().baustelle).toBe(true);
  });
});


describe('lohntServerEntwurf', () => {
  it('sendet leere Entwuerfe nie an den Server, bestehende Anfragen immer', () => {
    const leer = leereAnfrage();
    expect(lohntServerEntwurf(leer, false)).toBe(false);
    expect(lohntServerEntwurf({ ...leer, vorlageIds: ['waermepumpe_gas'] }, false)).toBe(false);
    expect(lohntServerEntwurf({ ...leer, vorlageIds: ['waermepumpe_gas'], kontakt: { ...leer.kontakt, nachname: 'Diflo' } }, false)).toBe(true);
    expect(lohntServerEntwurf({ ...leer, vorlageIds: ['waermepumpe_gas'], kontakt: { ...leer.kontakt, telefon: '0641' } }, false)).toBe(true);
    expect(lohntServerEntwurf(leer, true)).toBe(true);
  });
});
