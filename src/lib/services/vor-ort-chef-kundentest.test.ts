import { beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/db/client';
import { migrieren } from '@/db/migrate';
import { seeden } from '@/db/seed';
import { benutzer, terminfenster } from '@/db/schema';
import { positionAusBaustein } from './calculation';
import { heizlastAusVerbrauchKoehler, waermepumpenAuslegung, speicherVorschlag } from './heizlast';
import { ladeKalkulationsdaten } from './kalkulationsdaten';
import { freigeben, speichereInternAnfrage } from './estimates';
import { renderPdf, pdfSeitenzahl } from './pdf';
import { renderKostenschaetzungHtml } from './templates';
import { ladeEingaben } from './dokument-eingabe';
import { fakeMailer, fakeStorage, type FakeMailer } from '../../../test/db';
import { gebaeudeSchema, type GebaeudeDaten, type InternAnfrage, type SessionInfo } from '../types';

let post: FakeMailer;

const session: SessionInfo = {
  benutzerId: randomUUID(),
  name: 'Meister Markus',
  rolle: 'chef',
  funktion: 'Geschäftsführer',
  signaturMail: 'markus@bad-energie.de',
};

describe('Vor-Ort-Ablauf: Chef beim Kunden (Tablet/Laptop/Handy)', () => {
  beforeAll(async () => {
    await migrieren();
    await seeden({ demoPreise: true });
    const db = await getDb();
    await db.insert(benutzer).values({
      id: session.benutzerId,
      name: session.name,
      email: session.signaturMail,
      pinHash: 'test',
      rolle: 'chef',
      funktion: session.funktion,
      signaturMail: session.signaturMail,
      aktiv: true,
    }).onConflictDoNothing();
    post = fakeMailer();
    fakeStorage();
  });

  it('führt den kompletten Ablauf vor Ort durch: Erfassung, Köhler-Auslegung, A4-PDF, Kunden-Mail und Chef-Dossier', async () => {
    const db = await getDb();

    // 1. Freie Terminfenster für den Vorschlag laden
    const fensterListe = await db.select().from(terminfenster).limit(2);
    expect(fensterListe.length).toBeGreaterThanOrEqual(2);
    const gewaehlteFenster = [fensterListe[0].id, fensterListe[1].id];

    // 2. Gebäudedaten & Köhler-Heizlast aus 24.610 kWh Gas
    const verbrauchGas = 24610;
    const gebaeude: GebaeudeDaten = gebaeudeSchema.parse({
      wohnflaeche: 160,
      baujahr: 1988,
      personen: 4,
      bestand: {
        energieart: 'gas',
        heizungsalterJahre: 22,
        kesseltyp: 'niedertemperatur',
        verbrauchJahr: verbrauchGas,
        solarthermie: false,
      },
      geraet: {
        hersteller: 'buderus',
      },
    });

    // Köhler-Berechnung
    const kwKoehler = heizlastAusVerbrauchKoehler(gebaeude.bestand);
    expect(kwKoehler).toBeCloseTo(9.36, 1);

    // Auswahl passender Bausteine
    const { vorlagen, matrix } = await ladeKalkulationsdaten();
    const wpVorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
    const auslegung = waermepumpenAuslegung(kwKoehler!, gebaeude.personen, 'buderus');
    expect(auslegung.normalKw).toBe(10);
    expect(auslegung.alternativKw).toBe(12);
    expect(auslegung.speicherLiterEmpfohlen).toBe(300);

    const positionen = wpVorlage!.bausteine.map((b) => {
      const istWp = b.groessenVarianten && b.groessenVarianten.length > 0;
      return positionAusBaustein(b, matrix, {
        varianteMatrixNr: istWp ? 2 : null, // 10 kW Variante
        kW: istWp ? 10 : undefined,
        liter: istWp ? auslegung.speicherLiterEmpfohlen : undefined,
        hersteller: 'buderus',
      });
    });

    // 3. Vor-Ort-Eingabe durch den Meister
    const kundenEingabe: InternAnfrage = {
      modus: 'intern',
      aktion: 'entwurf',
      quelle: 'intern',
      vorlageIds: ['waermepumpe_gas'],
      kontakt: {
        anrede: 'Frau',
        vorname: 'Erika',
        nachname: 'Mustermann',
        email: 'erika.mustermann@example.com',
        telefon: '06441 987654',
        strasse: 'Musterstraße 42',
        plzOrt: '35578 Wetzlar',
        kenntnisnahme: true,
      },
      objekt: {
        adresse: 'Musterstraße 42',
        plz: '35578',
        eigentum: 'eigentum',
        wohneinheiten: 1,
      },
      gebaeude,
      dringlichkeit: 'wochen_4',
      vorhabenKurz: 'Buderus Luft/Wasser-Wärmepumpe 10 kW',
      positionen,
      kalkulation: {
        stundensatz: 65,
        materialZuschlagProzent: 40,
      },
      foerderung: {
        aktiv: true,
        wohneinheiten: 1,
        selbstBewohnt: true,
        altOelOderGas: true,
        einkommenUnterGrenze: false,
        natuerlichesKaeltemittel: true,
        satzManuell: null,
      },
      persoenlicherSatz: 'Vielen Dank für das freundliche Gespräch bei Ihnen vor Ort in Wetzlar.',
      annahmen: ['Leitungsweg vom Keller zum Außengerät ca. 6 Meter.'],
      vorbehalte: ['Eventuelle Fundamentarbeiten erfolgen bauseits oder nach Aufmaß.'],
      ausfuehrungSatz: 'Die Montage kann voraussichtlich im 3. Quartal erfolgen.',
      terminfensterIds: gewaehlteFenster,
      notizen: {
        etage: 0,
        aufzug: false,
        montagehindernisse: 'Enge Kellertreppe (75 cm Durchgangsbreite)',
        leitungswege: 'Durchbruch durch Bruchsteinwand erforderlich',
        intern: 'Kunde legt Wert auf leises Außengerät; Buderus WLW186i passt ideal.',
      },
      skizzen: [
        {
          name: 'Skizze Heizraum',
          dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          breite: 800,
          hoehe: 600,
        },
      ],
      fotos: [
        {
          name: 'Typenschild Altgaskessel',
          beschreibung: 'Alter Gas-Heizwertkessel Baujahr 2002',
          dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
        },
      ],
    };

    // 4. Speichern des Vorgangs
    const anlage = await speichereInternAnfrage(kundenEingabe, session);
    expect(anlage.anfrageId).toBeDefined();
    expect(anlage.ksNummer).toMatch(/^KS-2026-\d{4}$/);

    // 5. PDF-Generierung (Echtes DIN A4)
    const geladen = await ladeEingaben(anlage.anfrageId);
    expect(geladen).not.toBeNull();
    const html = renderKostenschaetzungHtml(geladen!.dokument);
    const pdfBuffer = await renderPdf(html, { ksNummer: geladen!.dokument.ksNummer });
    expect(pdfBuffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdfSeitenzahl(pdfBuffer)).toBeGreaterThanOrEqual(2);

    // Sicherstellen: Das Kunden-HTML/PDF enthält KEINE internen Notizen oder Margen!
    expect(html).not.toContain('Enge Kellertreppe');
    expect(html).not.toContain('Bruchsteinwand');
    expect(html).not.toContain('Kunde legt Wert auf leises Außengerät');
    expect(html).not.toContain('materialZuschlagProzent');

    // 6. Sofortversand durch den Chef vor Ort (Freigabe + Sofortversand)
    const freigabeErgebnis = await freigeben(anlage.anfrageId, session, { art: 'erstkontakt', sofort: true });
    expect(freigabeErgebnis.ok).toBe(true);
    if (freigabeErgebnis.ok) {
      expect(freigabeErgebnis.versand).toEqual({ kunde: 'versendet', dossier: 'versendet' });
    }

    // 7. Postausgang prüfen (2 Mails)
    expect(post.mails).toHaveLength(2);

    // Mail 1: An den Kunden
    const kundenMail = post.an('erika.mustermann@example.com')[0];
    expect(kundenMail).toBeDefined();
    expect(kundenMail.betreff).toContain(anlage.ksNummer);
    expect(kundenMail.html).toContain('Vielen Dank für das freundliche Gespräch');
    expect(kundenMail.html).not.toContain('Enge Kellertreppe');
    expect(kundenMail.anhaenge).toHaveLength(1);
    expect(kundenMail.anhaenge![0].dateiname).toContain('.pdf');

    // Mail 2: An das Büro / Chef
    const dossierMail = post.an('info@bad-energie.de')[0];
    expect(dossierMail).toBeDefined();
    expect(dossierMail.betreff).toContain('Dossier');
    expect(dossierMail.text).toContain('Enge Kellertreppe');
    expect(dossierMail.text).toContain('Bruchsteinwand');
    expect(dossierMail.text).toContain('Kunde legt Wert auf leises Außengerät');

    // Anhänge des Dossiers: datenblatt.json, CSV-Zeile und Kunden-PDF
    const dossierAnhaengeNamen = (dossierMail.anhaenge ?? []).map((a) => a.dateiname);
    expect(dossierAnhaengeNamen).toContain('datenblatt.json');
    expect(dossierAnhaengeNamen.some((n) => n.endsWith('.csv'))).toBe(true);
    expect(dossierAnhaengeNamen.some((n) => n.endsWith('.pdf'))).toBe(true);
  });

  it('blockiert den Sofortversand, wenn der persönliche Satz vor Ort vergessen wurde', async () => {
    const db = await getDb();
    const fenster = (await db.select().from(terminfenster).limit(1))[0];
    const { vorlagen, matrix } = await ladeKalkulationsdaten();
    const wpVorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
    const positionen = wpVorlage!.bausteine.map((b) => positionAusBaustein(b, matrix, { varianteMatrixNr: 2, kW: 10, liter: 200 }));

    const anlage = await speichereInternAnfrage({
      modus: 'intern',
      aktion: 'entwurf',
      quelle: 'intern',
      vorlageIds: ['waermepumpe_gas'],
      kontakt: {
        anrede: 'Herr',
        vorname: 'Frank',
        nachname: 'Schneider',
        email: 'frank.schneider@example.com',
        telefon: '06441 11111',
        strasse: 'Hauptstraße 1',
        plzOrt: '35578 Wetzlar',
        kenntnisnahme: true,
      },
      objekt: { adresse: 'Hauptstraße 1', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
      gebaeude: gebaeudeSchema.parse({
        wohnflaeche: 140,
        baujahr: 1990,
        personen: 3,
        bestand: {
          energieart: 'gas',
          heizungsalterJahre: 20,
          kesseltyp: 'niedertemperatur',
          verbrauchJahr: 20000,
          solarthermie: false,
        },
        geraet: { hersteller: 'bosch', kw: 10, speicherLiter: 200 },
      }),
      dringlichkeit: 'wochen_4',
      vorhabenKurz: 'Bosch Wärmepumpe',
      positionen,
      kalkulation: {},
      foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: null },
      persoenlicherSatz: '', // Leer gelassen!
      annahmen: [],
      vorbehalte: [],
      ausfuehrungSatz: '',
      terminfensterIds: [fenster.id],
      notizen: { etage: 0, aufzug: false, montagehindernisse: '', leitungswege: '', intern: '' },
      skizzen: [],
      fotos: [],
    }, session);

    const ergebnis = await freigeben(anlage.anfrageId, session, { sofort: true });
    expect(ergebnis.ok).toBe(false);
    if (!ergebnis.ok) {
      expect(ergebnis.fehler).toContain('Persönlicher Satz fehlt');
    }
  });

  it('blockiert den Sofortversand, wenn kein Terminfenster ausgewählt wurde', async () => {
    const { vorlagen, matrix } = await ladeKalkulationsdaten();
    const wpVorlage = vorlagen.find((v) => v.id === 'waermepumpe_gas');
    const positionen = wpVorlage!.bausteine.map((b) => positionAusBaustein(b, matrix, { varianteMatrixNr: 2, kW: 10, liter: 200 }));

    const anlage = await speichereInternAnfrage({
      modus: 'intern',
      aktion: 'entwurf',
      quelle: 'intern',
      vorlageIds: ['waermepumpe_gas'],
      kontakt: {
        anrede: 'Herr',
        vorname: 'Frank',
        nachname: 'Schneider',
        email: 'frank.schneider@example.com',
        telefon: '06441 11111',
        strasse: 'Hauptstraße 1',
        plzOrt: '35578 Wetzlar',
        kenntnisnahme: true,
      },
      objekt: { adresse: 'Hauptstraße 1', plz: '35578', eigentum: 'eigentum', wohneinheiten: 1 },
      gebaeude: gebaeudeSchema.parse({
        wohnflaeche: 140,
        baujahr: 1990,
        personen: 3,
        bestand: {
          energieart: 'gas',
          heizungsalterJahre: 20,
          kesseltyp: 'niedertemperatur',
          verbrauchJahr: 20000,
          solarthermie: false,
        },
        geraet: { hersteller: 'bosch', kw: 10, speicherLiter: 200 },
      }),
      dringlichkeit: 'wochen_4',
      vorhabenKurz: 'Bosch Wärmepumpe',
      positionen,
      kalkulation: {},
      foerderung: { aktiv: true, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true, satzManuell: null },
      persoenlicherSatz: 'Vielen Dank für Ihre Zeit vor Ort.',
      annahmen: [],
      vorbehalte: [],
      ausfuehrungSatz: '',
      terminfensterIds: [], // Keine Terminfenster!
      notizen: { etage: 0, aufzug: false, montagehindernisse: '', leitungswege: '', intern: '' },
      skizzen: [],
      fotos: [],
    }, session);

    const ergebnis = await freigeben(anlage.anfrageId, session, { sofort: true });
    expect(ergebnis.ok).toBe(false);
    if (!ergebnis.ok) {
      expect(ergebnis.fehler).toContain('Terminvorschlag fehlt');
    }
  });
});
