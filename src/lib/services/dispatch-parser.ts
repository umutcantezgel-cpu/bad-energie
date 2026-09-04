/**
 * Deterministischer Parser für den mobilen Dispatch (Plan 4.6).
 *
 * Befehle:
 * 1. freigeben KS-JJJJ-NNNN
 * 2. freigeben und sofort senden KS-JJJJ-NNNN
 * 3. KS-JJJJ-NNNN: <Änderungssatz>
 * 4. Sonst: Neuanlage (Name, Adresse, Telefon, E-Mail, Vorlagen, persönlicher Satz)
 */

export type DispatchBefehl =
  | { art: 'freigeben'; ksNummer: string }
  | { art: 'freigeben_sofort'; ksNummer: string }
  | { art: 'anpassung'; ksNummer: string; text: string }
  | {
      art: 'neuanlage';
      anrede: string;
      vorname: string;
      nachname: string;
      email: string;
      telefon: string;
      strasse: string;
      plzOrt: string;
      vorlageIds: string[];
      persoenlicherSatz: string;
      vorhabenKurz: string;
    };

export function parseDispatchText(eingabeText: string): DispatchBefehl {
  const text = eingabeText.trim();

  // 1. freigeben und sofort senden
  const sofortMatch = text.match(/^freigeben\s+und\s+sofort\s+senden\s+(KS-\d{4}-\d{4})/i);
  if (sofortMatch) {
    return { art: 'freigeben_sofort', ksNummer: sofortMatch[1].toUpperCase() };
  }

  // 2. freigeben
  const freigabeMatch = text.match(/^freigeben\s+(KS-\d{4}-\d{4})/i);
  if (freigabeMatch) {
    return { art: 'freigeben', ksNummer: freigabeMatch[1].toUpperCase() };
  }

  // 3. Anpassung
  const anpassungMatch = text.match(/^(KS-\d{4}-\d{4}):\s*([\s\S]+)$/i);
  if (anpassungMatch) {
    return {
      art: 'anpassung',
      ksNummer: anpassungMatch[1].toUpperCase(),
      text: anpassungMatch[2].trim(),
    };
  }

  // 4. Neuanlage parsen
  let rest = text;

  // E-Mail extrahieren
  let email = '';
  const emailMatch = rest.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    email = emailMatch[1];
    rest = rest.replace(emailMatch[0], ' ');
  }

  // Telefon extrahieren
  let telefon = '';
  const telefonMatch = rest.match(/(?:(?:\+|00)49|0)[1-9][0-9\s/()-]{6,16}/);
  if (telefonMatch) {
    telefon = telefonMatch[0].trim();
    rest = rest.replace(telefonMatch[0], ' ');
  }

  // Anrede & Nachname
  let anrede = '';
  let nachname = '';
  const anredeMatch = rest.match(/\b(Herr(?:n)?|Frau)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i);
  if (anredeMatch) {
    anrede = anredeMatch[1].toLowerCase().startsWith('frau') ? 'Frau' : 'Herr';
    nachname = anredeMatch[2];
    rest = rest.replace(anredeMatch[0], ' ');
  }

  // PLZ & Ort
  let plzOrt = '';
  const plzMatch = rest.match(/\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüß]+)/);
  if (plzMatch) {
    plzOrt = `${plzMatch[1]} ${plzMatch[2]}`;
    rest = rest.replace(plzMatch[0], ' ');
  }

  // Straße & Hausnummer
  let strasse = '';
  const strassenMatch = rest.match(/\b([A-ZÄÖÜ][a-zäöüß.-]+(?:straße|strasse|str\.|weg|platz|gasse|ring|allee))\s+(\d+[a-zA-Z]?)/i);
  if (strassenMatch) {
    strasse = `${strassenMatch[1]} ${strassenMatch[2]}`;
    rest = rest.replace(strassenMatch[0], ' ');
  }

  // Vorlagen erkennen
  const vorlageIds: string[] = [];
  const textLower = text.toLowerCase();
  let vorhabenKurz = '';

  if (textLower.includes('klima') || textLower.includes('multisplit')) {
    vorlageIds.push('klima_multisplit');
    vorhabenKurz = 'Klimaanlage mit Heizfunktion';
  }
  if (textLower.includes('öl') || textLower.includes('oel')) {
    vorlageIds.push('waermepumpe_oel');
    vorhabenKurz = vorhabenKurz ? `${vorhabenKurz} & Öl-Heizungstausch` : 'Heizungstausch Öl zu Wärmepumpe';
  } else if (textLower.includes('gas') || textLower.includes('gasheizung')) {
    vorlageIds.push('waermepumpe_gas');
    vorhabenKurz = vorhabenKurz ? `${vorhabenKurz} & Gas-Heizungstausch` : 'Heizungstausch Gas zu Wärmepumpe';
  }
  if (textLower.includes('bad') || textLower.includes('badsanierung') || textLower.includes('dusche')) {
    vorlageIds.push('bad_einfach');
    vorhabenKurz = vorhabenKurz ? `${vorhabenKurz} & Badmodernisierung` : 'Badmodernisierung';
  }

  // Wenn keine Vorlage erkannt, Standard Wärmepumpe Gas
  if (vorlageIds.length === 0) {
    vorlageIds.push('waermepumpe_gas');
    vorhabenKurz = 'Heizungstausch / Wärmepumpe';
  }

  // Restsatz als persönlicher Satz
  const persoenlicherSatz = rest
    .replace(/^Neue Anfrage\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    art: 'neuanlage',
    anrede,
    vorname: '',
    nachname: nachname || 'Interessent',
    email,
    telefon,
    strasse,
    plzOrt: plzOrt || '35578 Wetzlar',
    vorlageIds,
    persoenlicherSatz: persoenlicherSatz || `Vielen Dank für Ihre Anfrage zu Ihrem Vorhaben (${vorhabenKurz}).`,
    vorhabenKurz,
  };
}
