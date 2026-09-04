/**
 * Journey Wärmepumpen-Check, sechs Schritte.
 * Seite: /heizung/waermepumpe/check. Beantwortet die Frage, ob eine Wärmepumpe
 * zum Haus passt. Deterministische Eignungsregeln, keine Eurobeträge im Datensatz.
 */
import type { Journey } from './typen';

export const waermepumpeJourney: Journey = {
  id: 'waermepumpe',
  name: 'Wärmepumpen-Check',
  pfad: '/heizung/waermepumpe/check',
  quelle: 'web_wp',
  gewerk: 'solar',
  ueberschrift: 'Passt eine Wärmepumpe zu Ihrem Haus?',
  unterzeile: 'Sechs kurze Fragen. Sie erhalten sofort eine ehrliche Einschätzung.',
  zusage:
    'Ihr Haus schauen wir uns genauer an. Ein Meister meldet sich innerhalb von zwei Werktagen und sagt Ihnen, was möglich ist.',
  standardAntworten: {
    journey: 'waermepumpe',
    heutig: 'gas',
    baujahr: '1978_1995',
    wohnflaeche: 140,
    verteilung: 'heizkoerper',
    komfort: 'heizen',
    selbstBewohnt: true,
    einkommenUnterGrenze: false,
  },
  schritte: [
    {
      id: 'heute',
      titel: 'Was heizt heute',
      art: 'fragen',
      frage: 'Womit heizen Sie heute?',
      fragen: [
        {
          id: 'heutig',
          ziel: 'antworten',
          feld: 'heutig',
          art: 'einzelauswahl',
          frage: 'Ihre heutige Heizung',
          fehler: 'Bitte wählen Sie Ihre heutige Heizung.',
          spalten: 3,
          optionen: [
            { wert: 'gas', titel: 'Gas', untertitel: 'Anschluss im Haus', piktogramm: 'gas' },
            { wert: 'oel', titel: 'Öl', untertitel: 'Mit Tanks im Keller', piktogramm: 'oel' },
            { wert: 'strom', titel: 'Strom', untertitel: 'Zum Beispiel Nachtspeicher', piktogramm: 'strom' },
            { wert: 'holz', titel: 'Holz oder Pellets', untertitel: 'Kessel oder Ofen', piktogramm: 'holz' },
            { wert: 'sonstiges', titel: 'Etwas anderes', untertitel: 'Sagen Sie es uns im Gespräch', piktogramm: 'fragezeichen' },
          ],
        },
      ],
    },
    {
      id: 'haus',
      titel: 'Bauzeit und Fläche',
      art: 'fragen',
      frage: 'Aus welcher Zeit stammt das Haus?',
      erklaerung: 'Bauzeit und Fläche sagen viel darüber, wie gut eine Wärmepumpe arbeitet.',
      fragen: [
        {
          id: 'baujahr',
          ziel: 'antworten',
          feld: 'baujahr',
          art: 'einzelauswahl',
          frage: 'Bauzeit des Hauses',
          fehler: 'Bitte wählen Sie eine Bauzeit.',
          optionen: [
            { wert: 'vor_1978', titel: 'Vor 1978', untertitel: 'Häufig noch ohne Dämmung', piktogramm: 'baujahr-alt' },
            { wert: '1978_1995', titel: '1978 bis 1995', untertitel: 'Erste Dämmung vorhanden', piktogramm: 'baujahr-mittel' },
            { wert: '1996_2015', titel: '1996 bis 2015', untertitel: 'Gut gedämmt', piktogramm: 'baujahr-neu' },
            { wert: 'ab_2016', titel: 'Ab 2016', untertitel: 'Neubaustandard', piktogramm: 'baujahr-neubau' },
          ],
        },
        {
          id: 'wohnflaeche',
          ziel: 'antworten',
          feld: 'wohnflaeche',
          art: 'zahl',
          frage: 'Wie viel Wohnfläche wird beheizt?',
          erklaerung: 'Eine Schätzung genügt.',
          min: 30,
          max: 600,
          schritt: 5,
          einheit: 'Quadratmeter',
        },
      ],
    },
    {
      id: 'verteilung',
      titel: 'Wärme im Raum',
      art: 'fragen',
      frage: 'Wie kommt die Wärme heute in Ihre Räume?',
      fragen: [
        {
          id: 'verteilung',
          ziel: 'antworten',
          feld: 'verteilung',
          art: 'einzelauswahl',
          frage: 'Ihre Wärme im Raum',
          fehler: 'Bitte wählen Sie eine Angabe.',
          spalten: 3,
          optionen: [
            { wert: 'heizkoerper', titel: 'Über Heizkörper', untertitel: 'An den Wänden, meist unter dem Fenster', piktogramm: 'heizkoerper' },
            { wert: 'fussboden', titel: 'Über den Fußboden', untertitel: 'Warme Flächen im ganzen Raum', piktogramm: 'fussbodenheizung' },
            { wert: 'gemischt', titel: 'Beides gemischt', untertitel: 'Je nach Raum verschieden', piktogramm: 'gemischt' },
          ],
        },
      ],
    },
    {
      id: 'komfort',
      titel: 'Komfort',
      art: 'fragen',
      frage: 'Was soll die Anlage können?',
      fragen: [
        {
          id: 'komfort',
          ziel: 'antworten',
          feld: 'komfort',
          art: 'einzelauswahl',
          frage: 'Ihr Wunschkomfort',
          fehler: 'Bitte wählen Sie eine Angabe.',
          spalten: 3,
          optionen: [
            { wert: 'heizen', titel: 'Nur heizen', untertitel: 'Warme Räume im Winter', piktogramm: 'waerme' },
            { wert: 'heizen_kuehlen', titel: 'Heizen und kühlen', untertitel: 'Im Sommer angenehm kühl', piktogramm: 'kuehlen' },
            { wert: 'heizen_kuehlen_warmwasser', titel: 'Heizen, kühlen und Warmwasser', untertitel: 'Auch das Wasser für Bad und Küche', piktogramm: 'warmwasser' },
          ],
        },
      ],
    },
    {
      id: 'zeit',
      titel: 'Zeit',
      art: 'fragen',
      frage: 'Wann soll es losgehen?',
      fragen: [
        {
          id: 'dringlichkeit',
          ziel: 'meta',
          feld: 'dringlichkeit',
          art: 'einzelauswahl',
          frage: 'Ihr Zeitraum',
          fehler: 'Bitte wählen Sie einen Zeitraum.',
          optionen: [
            { wert: 'sofort', titel: 'So schnell wie möglich', untertitel: 'Die Heizung macht Sorgen', piktogramm: 'sofort' },
            { wert: 'wochen_4', titel: 'In den nächsten Wochen', piktogramm: 'kalender' },
            { wert: 'monate_3', titel: 'In den nächsten Monaten', piktogramm: 'uhr' },
            { wert: 'unklar', titel: 'Noch offen', piktogramm: 'fragezeichen' },
          ],
        },
        {
          id: 'eigentum',
          ziel: 'objekt',
          feld: 'eigentum',
          art: 'einzelauswahl',
          frage: 'Gehört Ihnen das Haus?',
          fehler: 'Bitte wählen Sie eine Angabe.',
          spalten: 3,
          optionen: [
            { wert: 'eigentum', titel: 'Ja, mir', untertitel: 'Ich entscheide selbst', piktogramm: 'eigentum' },
            { wert: 'miete', titel: 'Nein, gemietet', untertitel: 'Die Eigentümerin oder der Eigentümer entscheidet mit', piktogramm: 'miete' },
            { wert: 'unklar', titel: 'Noch offen', untertitel: 'Klären wir gemeinsam', piktogramm: 'fragezeichen' },
          ],
        },
        {
          id: 'plz',
          ziel: 'objekt',
          feld: 'plz',
          art: 'text',
          frage: 'Postleitzahl des Hauses',
          erklaerung: 'Wir arbeiten rund um Wetzlar und im Lahn Dill Kreis.',
          fehler: 'Bitte geben Sie eine fünfstellige Postleitzahl an.',
          platzhalter: '35576',
          maxLaenge: 5,
          eingabemodus: 'numeric',
        },
      ],
    },
    {
      id: 'kontakt',
      titel: 'Ergebnis und Kontakt',
      art: 'kontakt',
      fragen: [],
    },
  ],
};

export default waermepumpeJourney;
