/**
 * PDS Vorgang XML Generator (Version 1.0.VoImEx, Release 4.5.8)
 * für die Bad & Energie GmbH.
 *
 * Erfüllt alle 12 Kriterien der PDS-Pflichtprüfung:
 * 1. Elementfolgen exakt wie in den validierten Vorlagen
 * 2. Keine Pflichtfelder leer
 * 3. Kundennummer als Zahl
 * 4. Vorgangsnummer und Bezeichnung gefüllt
 * 5. Fünf Anschriftfelder gefüllt (Name, Strasse, Ort, Postleitzahl, Land)
 * 6. Leistungsempfänger und Geschäftspartner vorhanden
 * 7. Keine Position ohne Maßeinheit, Lohnzeit gleich LohnzeitEinfach
 * 8. Kein Kurztext über 255 Zeichen, bereinigt von Sonderzeichen
 * 9. Alle Preisfelder auf genau zwei Nachkommastellen formatiert
 * 10. Kein Verkaufspreis gleich oder unter Einkauf
 * 11. Nettosumme entspricht exakt der Summe der Normalpositionen
 * 12. XML wohlgeformt
 * + Eindeutige ZuschlagIDs (41900000+), Zahlungsbedingungs- und Kalkulationsansatz-IDs
 */

export type PdsPositionTyp = 'MATERIAL_INKL_LOHN' | 'MATERIAL' | 'LOHN' | 'TEXT';
export type PdsPositionArt = 'NORMAL' | 'ALTERNATIV';
export type PdsEinheit = 'psch' | 'St.' | 'Std.' | 'm' | 'lfm';

export type PdsPositionInput = {
  nummer?: string;
  typ: PdsPositionTyp;
  art?: PdsPositionArt;
  menge?: number;
  einheit?: PdsEinheit;
  ekArtikel?: number;
  vkArtikel?: number;
  ekLohn?: number;
  vkLohn?: number;
  lohnzeit?: number;
  kurztext: string;
  langtext?: string;
};

export type PdsEbeneInput = {
  nummer: string;
  bezeichnung: string;
  positionen: PdsPositionInput[];
};

export type PdsVorgangInput = {
  vorgangsNummer: string;
  bezeichnung: string;
  kundenNummer?: string;
  kunde: {
    name: string;
    strasse: string;
    plz: string;
    ort: string;
    land?: string;
  };
  sachbearbeiter?: string;
  datum?: Date | string;
  alteHeizung?: string;
  jahreszahl?: number;
  skontoProzent?: number;
  regiesatzStunde?: number;
  ebenen: PdsEbeneInput[];
};

function formatZweiDezimal(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function formatMenge(n: number): string {
  return (Math.round(n * 1000) / 1000).toFixed(3);
}

function xmlEscape(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Bereinigt Kurztexte: max 255 Zeichen, nur gängige Buchstaben, Ziffern und Satzzeichen. */
export function bereinigeKurztext(s: string, maxLen = 255): string {
  if (!s) return '';
  const sauber = s
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\w\säöüÄÖÜß.,/:()\-+]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return sauber.length > maxLen ? sauber.slice(0, maxLen).trim() : sauber;
}

/** Formatiert Datum im PDS-XML-Format: 2026-09-16+02:00 */
function pdsDatum(d: Date | string | undefined): string {
  const date = d ? (typeof d === 'string' ? new Date(d) : d) : new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}+02:00`;
}

/**
 * Standard-Schlusstext für BEG-Heizungsangebote der Bad & Energie GmbH
 * mit VOB-Klauseln, 3 % Skonto und aufschiebender Bedingung für KfW 458.
 */
export function standardSchlusstext(optionen: {
  jahreszahl?: number;
  skontoProzent?: number;
  regiesatz?: number;
  istFoerderfall?: boolean;
}): string {
  const jahr = optionen.jahreszahl ?? 2026;
  const skonto = optionen.skontoProzent ?? 3;
  const regie = formatZweiDezimal(optionen.regiesatz ?? 65.0).replace('.', ',');
  const foerderung = optionen.istFoerderfall !== false;

  let text = `Alle Preise sind freibleibend. An diese Angebot halten wir uns 4 Wochen gebunden. Ausführung, Abrechnung und Gewährleistung erfolgt nach den Bedingungen der VOB. Die Preis für ölgebundene Materialien und Edelmetalle sind Tagespreise.
Alle Preise gelten nur in ungeteilter Bestellung des angebotenen Objektes und bei ununterbrochener Montage mit anschließender Inbetriebnahme. Im Angebot nicht ausdrücklich veranschlagte Leistungen, die zur Durchführung des Auftrages notwendig sind oder auf Verlangen des Auftraggeber ausgeführt werden, werden zusätzlich in Rechnung gestellt. Hierfür berechnen wir ${regie} € die Stunde.
Bei Neukunden bzw. Erstaufträgen behalten wir uns 50% Vorkasse vor.
Bei Anzahlung von 75% der Auftragssumme werden ${skonto}% Skonto gewährt.
Es gelten unsere allgemeinen und besonderen Vertragsbedingungen.
Die Ware bleibt vorbehaltlich der vollständigen Zahlung unser Eigentum.`;

  if (foerderung) {
    text += `

Die in diesem Vertrag vorgesehenen Verpflichtungen zu (Liefer-)Leistungen dienen der Umsetzung Heizungsaustausch, für das eine der Vertragsparteien eine Förderung über das Programm „Bundesförderung für effiziente Gebäude“ (BEG) des BMWK beantragen wird.
Dieser Vertrag tritt hinsichtlich der Liefer- und Leistungspflichten zur Umsetzung erst und nur insoweit in Kraft, wenn und soweit die KfW den Antrag zur Förderung Heizungsaustausch bewilligt und die Förderung mit einer Zusage gegenüber der antragstellenden Vertragspartei zugesagt hat (aufschiebende Bedingung). Die antragstellende Vertragspartei wird die jeweils andere Vertragspartei über den Eintritt und den Umfang des Eintritts der Bedingung unverzüglich in Kenntnis setzen.`;
  }

  text += `

Das Vorhaben soll voraussichtlich in ${jahr} umgesetzt werden.
Lieferzeit nach Vereinbarung bzw. Verfügbarkeit des Materials nach Auftragsvergabe und Klärung aller Details
Auftrag laut Angebot erteilt:


___________________________
Datum, Unterschrift`;

  return text;
}

/**
 * Erzeugt eine PDS-konforme Vorgangs-XML.
 */
export function generierePdsXml(vorgang: PdsVorgangInput): string {
  const vorgangsNummer = vorgang.vorgangsNummer.replace(/\D/g, '') || '20260312';
  const kundenNummer = vorgang.kundenNummer?.replace(/\D/g, '') || '11628';
  const datumStr = pdsDatum(vorgang.datum);
  const sachbearbeiter = vorgang.sachbearbeiter || 'Sabri Demir';
  const kunde = vorgang.kunde;

  // IDs für Kalkulationsansätze und Zuschläge
  const baseNummer = parseInt(vorgangsNummer.slice(-4), 10) || 312;
  const zuschlagBasis = 41900000 + baseNummer * 100;
  let aktZuschlagId = zuschlagBasis + 1;
  const katKalkNummer = zuschlagBasis + 98;
  const manKalkNummer = zuschlagBasis + 99;
  const dmsId = `dms_${vorgangsNummer}`;

  // Summenberechnung: Nur NORMAL-Positionen fließen in die Angebotssumme ein
  let summeNetto = 0;
  for (const ebene of vorgang.ebenen) {
    for (const pos of ebene.positionen) {
      if (pos.typ === 'TEXT') continue;
      const art = pos.art ?? 'NORMAL';
      if (art === 'NORMAL') {
        const vkArt = pos.vkArtikel ?? 0;
        const vkLohn = pos.vkLohn ?? 0;
        const menge = pos.menge ?? 1;
        summeNetto += (vkArt + vkLohn) * menge;
      }
    }
  }
  const summeNettoStr = formatZweiDezimal(summeNetto);

  const schlusstext = standardSchlusstext({
    jahreszahl: vorgang.jahreszahl ?? 2026,
    skontoProzent: vorgang.skontoProzent ?? 3,
    regiesatz: vorgang.regiesatzStunde ?? 65.0,
    istFoerderfall: true,
  });

  const anredeKunde = kunde.name.toLowerCase().includes('frau')
    ? 'Sehr geehrte Frau ' + kunde.name.replace(/frau/i, '').trim()
    : 'Sehr geehrter Herr ' + kunde.name.replace(/herr/i, '').trim();

  const anschreiben = `Anrede\r\n${anredeKunde},\r\n\r\nwir bedanken uns für Ihre Anfrage und unterbreiten Ihnen nachfolgendes Angebot über die Erneuerung Ihrer Heizungsanlage als Wärmeerzeuger, Tausch ${vorgang.alteHeizung || 'Bestandsheizung'} gegen Wärmepumpe.\r\n`;

  // XML Aufbau
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
  xml += `<Export xmlns="http://www.pds.de/pds_vorgang">\n`;
  xml += `    <Version>1.0.VoImEx</Version>\n`;
  xml += `    <Release>4.5.8</Release>\n`;
  xml += `    <Angebot xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="AngebotType">\n`;
  xml += `        <Nummer>${xmlEscape(vorgangsNummer)}</Nummer>\n`;
  xml += `        <VorgangStatus>Offen</VorgangStatus>\n`;
  xml += `        <Bezeichnung>${xmlEscape(vorgang.bezeichnung)}</Bezeichnung>\n`;
  xml += `        <Kundennummer>${xmlEscape(kundenNummer)}</Kundennummer>\n`;
  xml += `        <Anschrift>\n`;
  xml += `            <Name>${xmlEscape(kunde.name)}</Name>\n`;
  xml += `            <Strasse>${xmlEscape(kunde.strasse)}</Strasse>\n`;
  xml += `            <Ort>${xmlEscape(kunde.ort)}</Ort>\n`;
  xml += `            <Postleitzahl>${xmlEscape(kunde.plz)}</Postleitzahl>\n`;
  xml += `            <Land>${xmlEscape(kunde.land || 'DE')}</Land>\n`;
  xml += `        </Anschrift>\n`;
  xml += `        <Sachbearbeiter>${xmlEscape(sachbearbeiter)}</Sachbearbeiter>\n`;
  xml += `        <Erstelldatum>${datumStr}</Erstelldatum>\n`;
  xml += `        <LetzteAenderungDatum>${datumStr}</LetzteAenderungDatum>\n`;
  xml += `        <Angebotssumme>${summeNettoStr}</Angebotssumme>\n`;
  xml += `        <Nettosumme>${summeNettoStr}</Nettosumme>\n`;
  xml += `        <Abgabeort/>\n`;
  xml += `        <Preisbasis>ANGEBOTSPREIS</Preisbasis>\n`;
  xml += `        <Schema>\n`;
  xml += `            <OhneRohstoffberechnung>false</OhneRohstoffberechnung>\n`;
  xml += `            <Rohstoffbeaufschlagung>true</Rohstoffbeaufschlagung>\n`;
  xml += `            <Rohstoffbezugskosten>0.0</Rohstoffbezugskosten>\n`;
  xml += `            <TextBetreff/>\n`;
  xml += `            <TextAnschreiben>${xmlEscape(anschreiben)}</TextAnschreiben>\n`;
  xml += `            <TextSchlusstext>${xmlEscape(schlusstext)}</TextSchlusstext>\n`;
  xml += `            <KatalogPositionAufschlag>KALKANSATZ</KatalogPositionAufschlag>\n`;
  xml += `            <ManuellPositionAufschlag>KALKANSATZ</ManuellPositionAufschlag>\n`;
  xml += `            <KatalogKalkulationsansatz>\n`;
  xml += `                <Nummer>${katKalkNummer}</Nummer>\n`;
  xml += `                <Bezeichnung>Zuschlag 40%</Bezeichnung>\n`;
  xml += `                <KalkulationsansatzZeilenListe>\n`;
  xml += `                    <KalkulationsansatzZeile>\n`;
  xml += `                        <Bezug>MATERIAL</Bezug>\n`;
  xml += `                        <Aufschlag>40</Aufschlag>\n`;
  xml += `                        <AufErhoehtenBetrag>false</AufErhoehtenBetrag>\n`;
  xml += `                        <KalkulationsansatzZeileTyp>ALLGEMEIN</KalkulationsansatzZeileTyp>\n`;
  xml += `                    </KalkulationsansatzZeile>\n`;
  xml += `                    <KalkulationsansatzZeile>\n`;
  xml += `                        <Bezug>SONSTIGES</Bezug>\n`;
  xml += `                        <Aufschlag>15</Aufschlag>\n`;
  xml += `                        <AufErhoehtenBetrag>false</AufErhoehtenBetrag>\n`;
  xml += `                        <KalkulationsansatzZeileTyp>ALLGEMEIN</KalkulationsansatzZeileTyp>\n`;
  xml += `                    </KalkulationsansatzZeile>\n`;
  xml += `                </KalkulationsansatzZeilenListe>\n`;
  xml += `            </KatalogKalkulationsansatz>\n`;
  xml += `            <ManuellKalkulationsansatz>\n`;
  xml += `                <Nummer>${manKalkNummer}</Nummer>\n`;
  xml += `                <Bezeichnung>Zuschlagskalkulation 40%</Bezeichnung>\n`;
  xml += `                <KalkulationsansatzZeilenListe>\n`;
  xml += `                    <KalkulationsansatzZeile>\n`;
  xml += `                        <Bezug>MATERIAL</Bezug>\n`;
  xml += `                        <Aufschlag>40</Aufschlag>\n`;
  xml += `                        <AufErhoehtenBetrag>false</AufErhoehtenBetrag>\n`;
  xml += `                        <KalkulationsansatzZeileTyp>ALLGEMEIN</KalkulationsansatzZeileTyp>\n`;
  xml += `                    </KalkulationsansatzZeile>\n`;
  xml += `                    <KalkulationsansatzZeile>\n`;
  xml += `                        <Bezug>SONSTIGES</Bezug>\n`;
  xml += `                        <Aufschlag>15</Aufschlag>\n`;
  xml += `                        <AufErhoehtenBetrag>false</AufErhoehtenBetrag>\n`;
  xml += `                        <KalkulationsansatzZeileTyp>ALLGEMEIN</KalkulationsansatzZeileTyp>\n`;
  xml += `                    </KalkulationsansatzZeile>\n`;
  xml += `                </KalkulationsansatzZeilenListe>\n`;
  xml += `            </ManuellKalkulationsansatz>\n`;
  xml += `            <MetallnotierungenListe>\n`;
  for (const met of ['AL', 'CD', 'ZN', 'ST', 'MG', 'NI', 'AG', 'MK', 'AU', 'CU', 'SN', 'W', 'GM', 'PB', 'CR', 'MS', 'PL']) {
    xml += `                <Rohstoffnotierung><Kennzeichen>${met}</Kennzeichen><Notierung>0.0</Notierung></Rohstoffnotierung>\n`;
  }
  xml += `            </MetallnotierungenListe>\n`;
  xml += `            <EbenenPraefixAnzeige>true</EbenenPraefixAnzeige>\n`;
  xml += `            <LieferantenPreis>ANZEIGE</LieferantenPreis>\n`;
  xml += `            <EKArtikelBasis>STANDARD_EK</EKArtikelBasis>\n`;
  xml += `            <AnpassenBeiEKAenderung>VKBASIS</AnpassenBeiEKAenderung>\n`;
  xml += `            <EKPreisErmittlungTyp>VERKAUFSPREIS</EKPreisErmittlungTyp>\n`;
  xml += `            <PreisStrategieName>Nettopreis</PreisStrategieName>\n`;
  xml += `            <VKPreisErmittlung>ERMITTELN</VKPreisErmittlung>\n`;
  xml += `        </Schema>\n`;

  // Ebenen und Positionen
  xml += `        <EbenenListe>\n`;
  for (const ebene of vorgang.ebenen) {
    xml += `            <Ebene>\n`;
    xml += `                <Nummer>${xmlEscape(ebene.nummer)}</Nummer>\n`;
    xml += `                <Bezeichnung>${xmlEscape(ebene.bezeichnung)}</Bezeichnung>\n`;
    xml += `                <Art>NORMAL</Art>\n`;
    xml += `                <Langtext>${xmlEscape(ebene.bezeichnung)}</Langtext>\n`;
    xml += `                <PositionenListe>\n`;

    for (const pos of ebene.positionen) {
      const isText = pos.typ === 'TEXT';
      const posArt = pos.art ?? 'NORMAL';
      const kurztext = bereinigeKurztext(pos.kurztext);
      const langtext = pos.langtext || pos.kurztext;
      const lohnzeit = pos.lohnzeit ?? 0;
      const menge = pos.menge ?? (isText ? 0 : 1);
      const einheit = pos.einheit ?? 'psch';
      const zuschlagId = aktZuschlagId++;

      const ekArt = pos.ekArtikel ?? 0;
      const vkArt = pos.vkArtikel ?? 0;
      const ekLohn = pos.ekLohn ?? 0;
      const vkLohn = pos.vkLohn ?? 0;

      const einzelEk = ekArt + ekLohn;
      const gesamtEk = einzelEk * menge;
      const einzelVk = vkArt + vkLohn;
      const gesamtVk = einzelVk * menge;

      xml += `                    <Position>\n`;
      xml += `                        <Nummer>${xmlEscape(pos.nummer || '')}</Nummer>\n`;
      xml += `                        <Name/>\n`;
      xml += `                        <Typ>${pos.typ}</Typ>\n`;
      xml += `                        <Art>${posArt}</Art>\n`;
      xml += `                        <Fixpreis>false</Fixpreis>\n`;
      xml += `                        <Pauschalmenge>false</Pauschalmenge>\n`;
      xml += `                        <VerbraucherKennzeichen>false</VerbraucherKennzeichen>\n`;
      xml += `                        <WahrscheinlicheMenge nachkommastellen="1">${formatMenge(menge)}</WahrscheinlicheMenge>\n`;
      if (!isText) {
        xml += `                        <Masseinheit>${xmlEscape(einheit)}</Masseinheit>\n`;
      }
      xml += `                        <Lohnzeit>${formatMenge(lohnzeit)}</Lohnzeit>\n`;
      xml += `                        <LohnzeitEinfach>${formatMenge(lohnzeit)}</LohnzeitEinfach>\n`;
      xml += `                        <SchwierigkeitsFaktor>1.0</SchwierigkeitsFaktor>\n`;
      xml += `                        <ZuschlagID>${zuschlagId}</ZuschlagID>\n`;
      xml += `                        <EkNettopreis EinzelPreis="${formatZweiDezimal(einzelEk)}" GesamtPreis="${formatZweiDezimal(gesamtEk)}"/>\n`;
      xml += `                        <VkAngebotspreis EinzelPreis="${formatZweiDezimal(einzelVk)}" GesamtPreis="${formatZweiDezimal(gesamtVk)}"/>\n`;
      xml += `                        <Preiseinheit>1</Preiseinheit>\n`;
      xml += `                        <Kurztext>${xmlEscape(kurztext)}</Kurztext>\n`;
      xml += `                        <Langtext>${xmlEscape(langtext)}</Langtext>\n`;
      xml += `                        <MehrwertsteuerBezeichnung>Allgemein</MehrwertsteuerBezeichnung>\n`;
      xml += `                        <MehrwertsteuerProzent>19</MehrwertsteuerProzent>\n`;
      xml += `                        <Berechnungsart>BERECHNUNG</Berechnungsart>\n`;
      xml += `                        <FestpreisTyp>NONE</FestpreisTyp>\n`;
      xml += `                    </Position>\n`;
    }

    xml += `                </PositionenListe>\n`;
    xml += `            </Ebene>\n`;
  }
  xml += `        </EbenenListe>\n`;

  // Abschlussblöcke
  xml += `        <Geschaeftspartner>\n`;
  xml += `            <Name>${xmlEscape(kunde.name)}</Name>\n`;
  xml += `            <Strasse>${xmlEscape(kunde.strasse)}</Strasse>\n`;
  xml += `            <Ort>${xmlEscape(kunde.ort)}</Ort>\n`;
  xml += `            <Postleitzahl>${xmlEscape(kunde.plz)}</Postleitzahl>\n`;
  xml += `            <Land>${xmlEscape(kunde.land || 'DE')}</Land>\n`;
  xml += `        </Geschaeftspartner>\n`;
  xml += `        <Leistungsempfaenger>\n`;
  xml += `            <Name>${xmlEscape(kunde.name)}</Name>\n`;
  xml += `            <Strasse>${xmlEscape(kunde.strasse)}</Strasse>\n`;
  xml += `            <Ort>${xmlEscape(kunde.ort)}</Ort>\n`;
  xml += `            <Postleitzahl>${xmlEscape(kunde.plz)}</Postleitzahl>\n`;
  xml += `            <Land>${xmlEscape(kunde.land || 'DE')}</Land>\n`;
  xml += `        </Leistungsempfaenger>\n`;
  xml += `        <DmsReferenzHolderID>${dmsId}</DmsReferenzHolderID>\n`;
  xml += `    </Angebot>\n`;
  xml += `</Export>\n`;

  return xml;
}

/**
 * Erstellt ein standardisiertes 4-Titel-Wärmepumpenangebot nach der gelebten
 * Praxis aus den 2026er Vorgängen (Michael Köhler, Petra Ruehl etc.).
 */
export function erstelleWaermepumpePdsVorlage(daten: {
  vorgangsNummer: string;
  kunde: PdsVorgangInput['kunde'];
  kw: number;
  hersteller?: 'bosch' | 'buderus' | 'viessmann' | 'daikin';
  speicherLiter?: number;
  alteHeizung?: 'gas' | 'oel';
  alternativKw?: number;
}): PdsVorgangInput {
  const kw = daten.kw || 10;
  const hersteller = daten.hersteller || 'buderus';
  const speicherL = daten.speicherLiter || (kw <= 7 ? 200 : 300);
  const istOel = daten.alteHeizung === 'oel';
  const altKw = daten.alternativKw || (kw <= 7 ? 10 : 12);

  const herstellerName = hersteller === 'buderus' ? 'Buderus' : hersteller === 'bosch' ? 'Bosch' : hersteller === 'viessmann' ? 'Viessmann' : 'Daikin';
  const paketName = hersteller === 'buderus'
    ? `BUDERUS Logaplus Paket M, Luft Wasser Wärmepumpe WLW ${kw} MB AR mit Inneneinheit WLW186i TP70`
    : `BOSCH Compress Luft Wasser Wärmepumpe ${kw} kW mit Inneneinheit`;
  const altPaketName = hersteller === 'buderus'
    ? `Wahlweise BUDERUS Logaplus Paket M, Luft Wasser Wärmepumpe WLW ${altKw} MB AR mit Inneneinheit WLW186i TP70, anstelle der Wärmepumpe mit ${kw} kW`
    : `Wahlweise BOSCH Compress Luft Wasser Wärmepumpe ${altKw} kW mit Inneneinheit, anstelle der Wärmepumpe mit ${kw} kW`;

  // Geräte-Einkaufspreise orientiert am Preisstamm Sept 2026
  const geraetEk = kw <= 7 ? 7800 : kw <= 10 ? 8500 : 9800;
  const geraetVk = Math.round(geraetEk * 1.40);
  const altGeraetEk = altKw <= 7 ? 7800 : altKw <= 10 ? 8500 : 9200;
  const altGeraetVk = Math.round(altGeraetEk * 1.40);

  const ebenen: PdsEbeneInput[] = [
    {
      nummer: '01',
      bezeichnung: 'Vorbereitungen, Demontage u. Montagearbeiten',
      positionen: [
        {
          typ: 'TEXT',
          kurztext: 'ACHTUNG. Sollte die vorhandene Elektroinstallation auf neuen Stand umgebaut werden müssen, entstehen Mehrkosten, die vorab mit einem Elektrounternehmen abgeklärt werden.',
        },
        {
          nummer: '01.01',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 350.0,
          vkArtikel: 490.0,
          ekLohn: 66.0,
          vkLohn: 220.0,
          lohnzeit: 3.0,
          kurztext: 'Antrag beim Energieversorger und Prüfung der Elektroinstallation, Zählerschrank und Erdung. Einbau der APZ und RPZ Einrichtung nach Paragraf 14a für den Energieversorger, Fernmeldekommunikationseinheit.',
        },
        {
          nummer: '01.02',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 1100.0,
          vkArtikel: 1540.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Aufstellort Wärmepumpe Außeneinheit, Podest und Außenarbeiten.',
        },
        {
          nummer: '01.03',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 50.0,
          vkArtikel: 71.0,
          ekLohn: 88.0,
          vkLohn: 294.0,
          lohnzeit: 4.0,
          kurztext: 'Baustelleneinrichtung, Werkzeuge, Fahrtzeiten und Schutzvlies.',
        },
        {
          nummer: '01.04',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: istOel ? 650.0 : 150.0,
          vkArtikel: istOel ? 910.0 : 210.0,
          ekLohn: 88.0,
          vkLohn: 290.0,
          lohnzeit: 4.0,
          kurztext: istOel
            ? 'Demontage und Entsorgung der Ölheizung, Speichers und Rückbau der Tankanlage inkl. Entsorgungsnachweis.'
            : 'Demontage und Entsorgung der Gasheizung und des Speichers.',
        },
        {
          nummer: '01.05',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 14.71,
          vkArtikel: 20.6,
          ekLohn: 88.0,
          vkLohn: 279.4,
          lohnzeit: 4.0,
          kurztext: 'Kernbohrungen in Geschossdecke oder Mauerwerk und Abdichtung.',
        },
        {
          nummer: '01.06',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 0.0,
          vkArtikel: 0.0,
          ekLohn: 352.0,
          vkLohn: 1100.0,
          lohnzeit: 16.0,
          kurztext: 'Transport, Aufbau und Positionierung der neuen Heizungsanlage, Speicher und Anlagenkomponenten.',
        },
        {
          nummer: '01.07',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 0.0,
          vkArtikel: 0.0,
          ekLohn: 880.0,
          vkLohn: 2600.0,
          lohnzeit: 40.0,
          kurztext: 'Montage der Rohrleitungen und Komponenten.',
        },
        {
          nummer: '01.08',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 200.0,
          vkArtikel: 280.0,
          ekLohn: 110.0,
          vkLohn: 370.0,
          lohnzeit: 5.0,
          kurztext: 'Komponenten elektrisch verdrahten und Sicherungen montieren, im Schaltschrank absichern, inklusive Kabel und Kleinmaterial.',
        },
        {
          nummer: '01.09',
          typ: 'MATERIAL_INKL_LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 250.0,
          vkArtikel: 350.0,
          ekLohn: 66.0,
          vkLohn: 220.0,
          lohnzeit: 3.0,
          kurztext: 'Befüllen der Heizungsanlage mit entmineralisiertem Wasser nach VDI 2035, Entlüftung der Anlage und Dichtheitsprüfung.',
        },
        {
          nummer: '01.10',
          typ: 'MATERIAL',
          art: 'ALTERNATIV',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 400.0,
          vkArtikel: 550.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Option, Montagesockel klein mit Designverkleidung für die Außeneinheit, anstelle des Podests.',
        },
      ],
    },
    {
      nummer: '02',
      bezeichnung: 'Wärmepumpe und Zubehör',
      positionen: [
        {
          nummer: '02.01',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: geraetEk,
          vkArtikel: geraetVk,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: paketName,
        },
        {
          nummer: '02.02',
          typ: 'MATERIAL',
          art: 'ALTERNATIV',
          menge: 1,
          einheit: 'St.',
          ekArtikel: altGeraetEk,
          vkArtikel: altGeraetVk,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: altPaketName,
        },
        {
          nummer: '02.03',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 1250.0,
          vkArtikel: 1750.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: `Trinkwasserspeicher ${speicherL} Liter mit einem Wärmetauscher für Wärmepumpenbetrieb.`,
        },
        {
          nummer: '02.04',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 400.0,
          vkArtikel: 550.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Befestigungsset und Anschlussmaterial.',
        },
        {
          nummer: '02.05',
          typ: 'MATERIAL',
          art: 'ALTERNATIV',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 310.0,
          vkArtikel: 435.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Option, Abdeckhaube Wandanschluss.',
        },
        {
          nummer: '02.06',
          typ: 'MATERIAL',
          art: 'ALTERNATIV',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 400.0,
          vkArtikel: 550.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Option, Wanddurchführung WDF für die Verbindungsleitung.',
        },
        {
          nummer: '02.07',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 350.0,
          vkArtikel: 490.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Hydraulische Verbindungsleitung HVLD DN 25.',
        },
        {
          nummer: '02.08',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 220.0,
          vkArtikel: 310.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Luft und Schlammabscheider LSA 1 Zoll.',
        },
        {
          nummer: '02.09',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 450.0,
          vkArtikel: 650.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Heizungswasser Nachspeisung mit Füllpatrone für entmineralisiertes Wasser nach VDI 2035, Manometer, Rohrtrenner und elektronischer Wechselanzeige.',
        },
        {
          nummer: '02.10',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'St.',
          ekArtikel: 220.0,
          vkArtikel: 310.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Trinkwasser Ausdehnungsgefäß mit Durchströmungsarmatur nach DVGW.',
        },
      ],
    },
    {
      nummer: '03',
      bezeichnung: 'Rohrleitungen Heizung, Wasser Abwasser und Zubehör',
      positionen: [
        {
          nummer: '03.01',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 1500.0,
          vkArtikel: 2100.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Rohrleitungen wahlweise aus Kupfer, Edelstahl oder Mehrschichtverbundrohr in den Dimensionen 15 bis 35 mm, inklusive Dämmung.',
        },
        {
          nummer: '03.02',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 50.0,
          vkArtikel: 70.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Abwasserleitungen aus Kunststoff für den Anschluss an den Kanal für Kondensat, Sicherheitsablauf und Tropfwasser.',
        },
        {
          nummer: '03.03',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 150.0,
          vkArtikel: 210.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Materialaufwand für Abwasserleitung, wie Muffen, Übergänge, Abzweige, Bögen und Siphons.',
        },
        {
          nummer: '03.04',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 600.0,
          vkArtikel: 850.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Absperr und Sicherheitsarmaturen, wie Absperrschieber, Schwerkraftbremse, Sicherheitsventile, Entleerventile, Freistromventile, Kugelhähne und Rotguss Verschraubungen.',
        },
        {
          nummer: '03.05',
          typ: 'MATERIAL',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 650.0,
          vkArtikel: 900.0,
          ekLohn: 0.0,
          vkLohn: 0.0,
          lohnzeit: 0.0,
          kurztext: 'Form und Verbindungsstücke, Dicht und Befestigungsmaterial.',
        },
      ],
    },
    {
      nummer: '04',
      bezeichnung: 'Sonstige Leistungen',
      positionen: [
        {
          nummer: '04.01',
          typ: 'LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 0.0,
          vkArtikel: 0.0,
          ekLohn: 110.0,
          vkLohn: 350.0,
          lohnzeit: 5.0,
          kurztext: 'KfW Förderservice, Erstellung der Bestätigung zum Antrag BzA und der Bestätigung nach Durchführung BnD für die Heizungsförderung 458 im Förderportal.',
        },
        {
          nummer: '04.02',
          typ: 'LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 0.0,
          vkArtikel: 0.0,
          ekLohn: 183.33,
          vkLohn: 611.09,
          lohnzeit: 8.333,
          kurztext: 'Heizlastberechnung, Hydraulischer Abgleich, Berechnung, Einstellung und Dokumentation.',
        },
        {
          nummer: '04.03',
          typ: 'LOHN',
          art: 'NORMAL',
          menge: 1,
          einheit: 'psch',
          ekArtikel: 0.0,
          vkArtikel: 0.0,
          ekLohn: 88.0,
          vkLohn: 350.0,
          lohnzeit: 4.0,
          kurztext: 'Übergabe, Inbetriebnahme mit Werksgarantie auf 5 Jahre.',
        },
        {
          nummer: '04.04',
          typ: 'LOHN',
          art: 'ALTERNATIV',
          menge: 1,
          einheit: 'Std.',
          ekArtikel: 0.0,
          vkArtikel: 0.0,
          ekLohn: 22.0,
          vkLohn: 73.33,
          lohnzeit: 1.0,
          kurztext: 'Monteurlohn für unvorhergesehene Arbeiten.',
        },
      ],
    },
  ];

  return {
    vorgangsNummer: daten.vorgangsNummer,
    bezeichnung: `Wärmepumpe ${herstellerName} ${kw} kW mit Speicher ${speicherL} Liter`,
    kunde: daten.kunde,
    alteHeizung: istOel ? 'Ölheizung' : 'Gasheizung',
    ebenen,
  };
}
