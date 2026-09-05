/**
 * Gemeinsamer Vorführfall für die Jobtests (Plan AP7, Vorführablauf Schritt 1 und 3):
 * 150 m², Baujahr 1965, Gasheizung mit 22.000 kWh, zwei Personen, Demo-Preise.
 *
 * Diese Datei wird ausschließlich von Testdateien importiert; sie gehört zu keinem Laufzeitpfad.
 */
import { positionAusBaustein } from '@/lib/services/calculation';
import { ladeTerminfenster, speichereInternAnfrage } from '@/lib/services/estimates';
import { geraeteVorschlag, heizlastSchaetzen, leeresGebaeude, speicherVorschlag } from '@/lib/services/heizlast';
import { ladeKalkulationsdaten } from '@/lib/services/kalkulationsdaten';
import type { InternAnfrage, SessionInfo } from '@/lib/types';

/** Versandfertiger Vorgang: Positionen mit Spanne, persönlicher Satz, zwei Terminfenster. */
export async function versandfertigerVorgang(
  session: SessionInfo,
  felder: { email?: string; nachname?: string; fensterAb?: number } = {},
): Promise<{ anfrageId: string; ksNummer: string }> {
  const { vorlagen, matrix } = await ladeKalkulationsdaten();
  const vorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
  if (!vorlage) throw new Error('Vorlage waermepumpe_gas fehlt im Seed.');
  const gebaeude = leeresGebaeude();
  gebaeude.wohnflaeche = 150;
  gebaeude.baujahr = 1965;
  gebaeude.lage = 'freistehend';
  gebaeude.personen = 2;
  gebaeude.bestand.energieart = 'gas';
  gebaeude.bestand.verbrauchJahr = 22000;
  gebaeude.bestand.verbrauchEinheit = 'kwh';
  gebaeude.bestand.heizungsalterJahre = 25;
  const schaetzung = heizlastSchaetzen(gebaeude);
  const positionen = vorlage.bausteine.map((b) => {
    const vorschlag = schaetzung ? geraeteVorschlag(schaetzung.kwEmpfohlen, b.groessenVarianten, 'bosch') : null;
    const variante = b.groessenVarianten?.find((v) => v.matrixNr === vorschlag?.matrixNr) ?? null;
    const speicher = vorschlag ? speicherVorschlag(gebaeude.personen, variante?.speicherLiterOptionen) : null;
    return positionAusBaustein(b, matrix, {
      varianteMatrixNr: vorschlag?.matrixNr ?? null, kW: vorschlag?.geraetKw, liter: speicher?.liter,
    });
  });
  const fenster = await ladeTerminfenster();
  const eingabe: InternAnfrage = {
    modus: 'intern', aktion: 'entwurf', quelle: 'intern', vorlageIds: ['waermepumpe_gas'],
    kontakt: {
      anrede: 'Herr', vorname: 'Max', nachname: felder.nachname ?? 'Mustermann',
      email: felder.email ?? 'max.mustermann@example.de',
      telefon: '06441 123456', strasse: 'Musterweg 4', plzOrt: '35578 Wetzlar', kenntnisnahme: true,
    },
    objekt: { adresse: 'Musterweg 4', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
    gebaeude,
    dringlichkeit: 'wochen_4',
    vorhabenKurz: 'Luft/Wasser Wärmepumpe statt Gasheizung',
    positionen,
    kalkulation: {},
    foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: null },
    persoenlicherSatz: 'Nach unserem Telefonat haben wir Ihnen die Zahlen für die Wärmepumpe zusammengestellt.',
    annahmen: [], vorbehalte: [], ausfuehrungSatz: 'Wir führen die Arbeiten in etwa einer Woche aus.',
    // Zwei freie Fenster; zwei Vorgänge im selben Test dürfen sich nicht dieselben reservieren (Regel 6).
    terminfensterIds: fenster.slice(felder.fensterAb ?? 0, (felder.fensterAb ?? 0) + 2).map((f) => f.id),
    notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: '' },
    skizzen: [], fotos: [],
  };
  const anlage = await speichereInternAnfrage(eingabe, session);
  return { anfrageId: anlage.anfrageId, ksNummer: anlage.ksNummer };
}
