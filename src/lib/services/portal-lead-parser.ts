/**
 * Parser für Portal-Leads (Plan 9.1, Beleg 7 und 8: WattFox).
 *
 * Der Chef bekommt Leads als Ausdruck oder Mailtext mit Zeilen der Form „Label: Wert“.
 * Dieser Parser erkennt das Format, belegt Gebäude, Kontakt und Vorlage vor und meldet,
 * was er nicht verstanden hat. Reine Funktion ohne Datenzugriff, läuft auch im Browser
 * (Live-Vorschau im Dispatch).
 *
 * Grundsatz: nichts erfinden. Fehlt eine Angabe, bleibt sie leer oder null.
 */
import type { Energieart, GebaeudeDaten, HeizungsStandort, Lage, PortalLead } from '../types';
import { HEIZWERT, baujahrKlasseAus, leeresGebaeude } from './heizlast';

// ---------------------------------------------------------------------------
// Normalisierung und kleine Helfer
// ---------------------------------------------------------------------------

/** klein, Umlaute ausgeschrieben, alles andere zu einfachen Leerzeichen. */
export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Zahlen aus einem Rohwert; Punkt als Tausendertrenner, Komma als Dezimaltrenner. */
function zahlen(wert: string): number[] {
  const bereinigt = wert.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2');
  const treffer = bereinigt.match(/\d+(?:,\d+)?/g);
  if (!treffer) return [];
  return treffer.map((t) => Number(t.replace(',', '.'))).filter((n) => Number.isFinite(n));
}

function ersteZahl(wert: string): number | null {
  const alle = zahlen(wert);
  return alle.length ? alle[0] : null;
}

function groessteZahl(wert: string): number | null {
  const alle = zahlen(wert);
  return alle.length ? Math.max(...alle) : null;
}

function begrenze(wert: number, von: number, bis: number): number {
  return Math.min(Math.max(wert, von), bis);
}

// ---------------------------------------------------------------------------
// Labelliste
// ---------------------------------------------------------------------------

/** Portal-eigene Felder (WattFox, Beleg 7 und 8). */
const PORTAL_LABEL: Record<string, string> = {
  'interesse an': 'interesse',
  'art der waermepumpe': 'wpArt',
  'nutzung der waermepumpe': 'nutzung',
  'bisheriges heizsystem': 'heizsystem',
  'gebaeudetyp': 'gebaeudetyp',
  'groesse der zu beheizenden flaeche in qm': 'flaeche',
  'groesse der zu beheizenden flaeche in m': 'flaeche',
  'groesse der zu beheizenden flaeche': 'flaeche',
  wohnflaeche: 'flaeche',
  'art der durchzufuehrenden taetigkeit': 'taetigkeit',
  'wie viele personen leben im haushalt': 'personen',
  personen: 'personen',
  'baujahr des gebaeudes': 'baujahr',
  baujahr: 'baujahr',
  'alter der heizung in jahren': 'heizungsalter',
  'alter der heizung': 'heizungsalter',
  'art des erwerbs': 'erwerb',
  sonstiges: 'sonstiges',
};

/** Kontaktfelder, die viele Portale zusätzlich mitschicken. */
const KONTAKT_LABEL: Record<string, string> = {
  anrede: 'anrede',
  name: 'name',
  vorname: 'vorname',
  nachname: 'nachname',
  'e mail': 'email',
  email: 'email',
  'e mail adresse': 'email',
  mail: 'email',
  telefon: 'telefon',
  telefonnummer: 'telefon',
  mobil: 'telefon',
  handy: 'telefon',
  strasse: 'strasse',
  'strasse hausnummer': 'strasse',
  'strasse und hausnummer': 'strasse',
  adresse: 'strasse',
  plz: 'plz',
  postleitzahl: 'plz',
  'plz ort': 'plzOrt',
  ort: 'ort',
  wohnort: 'ort',
};

// ---------------------------------------------------------------------------
// Werte deuten
// ---------------------------------------------------------------------------

function energieartAus(wert: string): Energieart | null {
  const n = normalisiere(wert);
  if (n.includes('oel')) return 'oel';
  if (n.includes('fluessiggas')) return 'fluessiggas';
  if (n.includes('gas')) return 'gas';
  if (n.includes('pellet')) return 'pellets';
  if (n.includes('nachtspeicher') || n.includes('strom')) return 'nachtspeicher';
  if (n.includes('holz') || n.includes('kamin')) return 'holz_hart';
  return null;
}

function lageAus(wert: string): Lage | null {
  const n = normalisiere(wert);
  if (n.includes('reihenhaus') || n.includes('reihenmittelhaus')) return 'reihenhaus';
  if (n.includes('doppelhaus') || n.includes('reihenendhaus') || n.includes('reiheneck')) return 'reiheneck';
  if (n.includes('mehrfamilien') || n.includes('wohnung')) return 'siedlung';
  if (n.includes('einfamilien') || n.includes('zweifamilien') || n.includes('bungalow')) return 'freistehend';
  return null;
}

function standortAus(wert: string): HeizungsStandort | null {
  const n = normalisiere(wert);
  if (n.includes('keller')) return 'keller';
  if (n.includes('erdgeschoss')) return 'erdgeschoss';
  if (n.includes('dachgeschoss') || n.includes('dachboden') || n.includes('spitzboden')) return 'dachgeschoss';
  if (n.includes('anbau')) return 'anbau';
  if (n.includes('aussen') || n.includes('garage') || n.includes('schuppen')) return 'aussen';
  return null;
}

function anredeAus(wert: string): 'Frau' | 'Herr' | '' {
  const n = normalisiere(wert);
  if (n.startsWith('frau')) return 'Frau';
  if (n.startsWith('herr')) return 'Herr';
  return '';
}

/** Liste aus dem Feld „Sonstiges“: Bindestriche, Kommas, Semikolons und Zeilenumbrüche trennen. */
function listenteile(wert: string): string[] {
  return wert
    .split(/(?:^|\s)[-•*–]\s+|\s*[,;]\s*|\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

const MINDEST_LABELZEILEN = 3;
const MINDEST_BEKANNTE = 2;

/**
 * Erkennt einen eingefügten Portal-Lead und belegt daraus einen Vorgang vor.
 * Rückgabe null, wenn der Text kein Schlüssel-Wert-Format ist (dann bleibt es beim Freitext).
 */
export function parsePortalLead(eingabeText: string): PortalLead | null {
  const rohtext = eingabeText.trim();
  if (!rohtext) return null;

  const felder = new Map<string, string>();
  const unbekannteZeilen: string[] = [];
  let labelZeilen = 0;
  let bekannteZeilen = 0;
  let portalZeilen = 0;
  let aktuellesFeld: string | null = null;

  const setze = (feld: string, wert: string): void => {
    const vorhanden = felder.get(feld);
    if (vorhanden === undefined || vorhanden === '') felder.set(feld, wert);
    else if (feld === 'sonstiges' && wert) felder.set(feld, `${vorhanden}\n${wert}`);
  };

  for (const rohzeile of rohtext.split(/\r?\n/)) {
    const zeile = rohzeile.trim();
    if (!zeile) continue;
    const paar = zeile.match(/^([^:]{2,80}):\s*(.*)$/);
    const listenzeile = /^[-•*–]\s*/.test(zeile);

    // Folgezeilen einer Liste gehören zum zuletzt erkannten Feld (typisch „Sonstiges“).
    if (aktuellesFeld && (listenzeile || !paar)) {
      setze(aktuellesFeld, zeile);
      continue;
    }
    if (!paar) continue;

    labelZeilen += 1;
    const norm = normalisiere(paar[1]);
    const wert = paar[2].trim();
    const portalFeld = PORTAL_LABEL[norm];
    if (portalFeld) {
      portalZeilen += 1;
      bekannteZeilen += 1;
      setze(portalFeld, wert);
      aktuellesFeld = portalFeld === 'sonstiges' ? 'sonstiges' : null;
      continue;
    }
    const kontaktFeld = KONTAKT_LABEL[norm];
    if (kontaktFeld) {
      bekannteZeilen += 1;
      setze(kontaktFeld, wert);
      aktuellesFeld = null;
      continue;
    }
    unbekannteZeilen.push(zeile.slice(0, 300));
    aktuellesFeld = null;
  }

  if (labelZeilen < MINDEST_LABELZEILEN || bekannteZeilen < MINDEST_BEKANNTE || portalZeilen < 1) return null;

  // -------------------------------------------------------------------------
  // Gebäude und Heizung
  // -------------------------------------------------------------------------
  const hinweise: string[] = [];
  const gebaeude: GebaeudeDaten = leeresGebaeude();
  let eigentum: PortalLead['objekt']['eigentum'] = 'unklar';
  let selbstBewohnt = false;
  let wohneinheiten = 1;
  let gebaeudetypUnklar = false;

  const heizsystem = felder.get('heizsystem') ?? '';
  if (heizsystem) {
    const art = energieartAus(heizsystem);
    if (art) {
      gebaeude.bestand.energieart = art;
      gebaeude.bestand.verbrauchEinheit = HEIZWERT[art].einheit;
    }
    if (normalisiere(heizsystem).includes('solarthermie')) {
      gebaeude.bestand.solarthermie = true;
      hinweise.push('Solarthermie ist vorhanden. Einbindung vor Ort prüfen.');
    }
  }

  const gebaeudetyp = felder.get('gebaeudetyp') ?? '';
  if (gebaeudetyp) {
    const lage = lageAus(gebaeudetyp);
    if (lage) gebaeude.lage = lage;
    const n = normalisiere(gebaeudetyp);
    const zwei = n.includes('zweifamilien');
    const ein = n.includes('einfamilien') || /(^| )ein( |$)/.test(n);
    if (zwei && ein) {
      gebaeudetypUnklar = true;
    } else if (zwei) {
      wohneinheiten = 2;
    } else if (n.includes('mehrfamilien')) {
      hinweise.push('Mehrfamilienhaus: Anzahl der Wohneinheiten für die Förderstaffel nachtragen.');
    }
  }

  const flaeche = felder.get('flaeche');
  if (flaeche) {
    const n = ersteZahl(flaeche);
    if (n !== null && n >= 10 && n <= 2000) gebaeude.wohnflaeche = n;
    else if (n !== null) hinweise.push(`Wohnfläche „${flaeche}“ ist nicht plausibel und wurde nicht übernommen.`);
  }

  const personen = felder.get('personen');
  if (personen) {
    const n = groessteZahl(personen);
    if (n !== null && n >= 1) gebaeude.personen = Math.round(begrenze(n, 1, 20));
  }

  const baujahr = felder.get('baujahr');
  if (baujahr) {
    const n = ersteZahl(baujahr);
    if (n !== null && n >= 1800 && n <= 2100) {
      gebaeude.baujahr = Math.round(n);
      gebaeude.baujahrKlasse = baujahrKlasseAus(Math.round(n));
    }
  }

  const heizungsalter = felder.get('heizungsalter');
  if (heizungsalter) {
    const n = groessteZahl(heizungsalter);
    if (n !== null) {
      const ueber = /ueber|mehr als|aelter|>/.test(normalisiere(heizungsalter)) || heizungsalter.includes('>');
      gebaeude.bestand.heizungsalterJahre = Math.round(begrenze(ueber ? n + 5 : n, 0, 80));
    }
  }

  const wpArt = felder.get('wpArt');
  if (wpArt && !normalisiere(wpArt).includes('luft')) {
    hinweise.push(`Gewünscht ist „${wpArt}“. Die Vorlagen rechnen mit einer Luftwärmepumpe, bitte prüfen.`);
  }
  const nutzung = felder.get('nutzung');
  if (nutzung && !normalisiere(nutzung).includes('brauchwasser') && !normalisiere(nutzung).includes('warmwasser')) {
    hinweise.push('Warmwasser ist im Portal nicht angekreuzt. Speichergröße vor Ort klären.');
  }
  const taetigkeit = felder.get('taetigkeit');
  if (taetigkeit && !/austausch|modernisierung|sanierung|erneuerung|neue heizung/.test(normalisiere(taetigkeit))) {
    hinweise.push(`Tätigkeit „${taetigkeit}“ weicht vom Heizungstausch ab. Vorlage prüfen.`);
  }

  const erwerb = felder.get('erwerb');
  if (erwerb) {
    const n = normalisiere(erwerb);
    if (n.includes('kauf') || n.includes('eigentum')) eigentum = 'eigentum';
    else if (n.includes('miet')) eigentum = 'miete';
  }

  const sonstiges = felder.get('sonstiges');
  if (sonstiges) {
    for (const teil of listenteile(sonstiges)) {
      const n = normalisiere(teil);
      if (n.includes('eigentum')) eigentum = 'eigentum';
      if (n.includes('miet')) eigentum = 'miete';
      if (n.includes('wohnhaft')) selbstBewohnt = true;
      if (n.includes('standort der heizung')) {
        const standort = standortAus(teil.split(':').slice(1).join(':') || teil);
        if (standort) gebaeude.bestand.standort = standort;
      }
      if (n.includes('einfamilienhaus')) {
        gebaeudetypUnklar = false;
        wohneinheiten = 1;
        if (!gebaeude.lage) gebaeude.lage = 'freistehend';
      } else if (n.includes('zweifamilienhaus')) {
        gebaeudetypUnklar = false;
        wohneinheiten = 2;
      }
    }
  }

  if (gebaeudetypUnklar) {
    hinweise.push('Gebäudetyp ist Ein- oder Zweifamilienhaus. Wohneinheiten stehen auf 1, bitte prüfen.');
  }
  gebaeude.wohneinheiten = wohneinheiten;

  // -------------------------------------------------------------------------
  // Kontakt und Objekt
  // -------------------------------------------------------------------------
  let vorname = (felder.get('vorname') ?? '').trim();
  let nachname = (felder.get('nachname') ?? '').trim();
  const name = (felder.get('name') ?? '').trim();
  if (!nachname && name) {
    const teile = name.split(/\s+/).filter(Boolean);
    nachname = teile.length ? teile[teile.length - 1] : '';
    if (!vorname && teile.length > 1) vorname = teile.slice(0, -1).join(' ');
  }
  const anrede = anredeAus(felder.get('anrede') ?? '');
  const email = (felder.get('email') ?? '').trim();
  const telefon = (felder.get('telefon') ?? '').trim();
  const strasse = (felder.get('strasse') ?? '').trim();
  const plzFeld = (felder.get('plz') ?? '').trim();
  const ortFeld = (felder.get('ort') ?? '').trim();
  const plzOrtFeld = (felder.get('plzOrt') ?? '').trim();
  const plzOrt = plzOrtFeld || [plzFeld, ortFeld].filter(Boolean).join(' ');
  const plz = (plzFeld.match(/\d{5}/)?.[0] ?? plzOrt.match(/\d{5}/)?.[0] ?? '').trim();

  if (!email) hinweise.push('E-Mail fehlt. Ohne E-Mail bleibt der Versand gesperrt.');
  if (!nachname) hinweise.push('Nachname fehlt. Bitte im Konfigurator ergänzen.');

  // -------------------------------------------------------------------------
  // Vorlage und Förderung
  // -------------------------------------------------------------------------
  const energieart = gebaeude.bestand.energieart;
  let vorlageId = 'waermepumpe_gas';
  let vorhabenKurz = 'Heizungstausch zu Wärmepumpe';
  if (energieart === 'oel') {
    vorlageId = 'waermepumpe_oel';
    vorhabenKurz = 'Heizungstausch Öl zu Wärmepumpe';
  } else if (energieart === 'gas' || energieart === 'fluessiggas') {
    vorlageId = 'waermepumpe_gas';
    vorhabenKurz = 'Heizungstausch Gas zu Wärmepumpe';
  } else {
    hinweise.push(
      energieart
        ? 'Bisheriges Heizsystem ist weder Gas noch Öl. Vorlage Wärmepumpe (Gas) vorbelegt, bitte prüfen.'
        : 'Bisheriges Heizsystem nicht erkannt. Vorlage Wärmepumpe (Gas) vorbelegt, bitte prüfen.',
    );
  }

  const alter = gebaeude.bestand.heizungsalterJahre;
  const altOelOderGas = (energieart === 'gas' || energieart === 'oel') && alter !== null && alter >= 20;

  return {
    art: 'portal_lead',
    portal: portalZeilen >= 2 ? 'wattfox' : 'unbekannt',
    kontakt: { anrede, vorname, nachname, email, telefon, strasse, plzOrt },
    objekt: { adresse: strasse, plz, eigentum, wohneinheiten },
    gebaeude,
    vorlageIds: [vorlageId],
    vorhabenKurz,
    foerderung: { selbstBewohnt, altOelOderGas },
    // Deckel wie im Schema: lange Ausdrucke sollen die Vorschau nicht sprengen.
    hinweise: hinweise.slice(0, 20),
    unbekannteZeilen: unbekannteZeilen.slice(0, 50),
    rohtext: rohtext.slice(0, 8000),
  };
}
