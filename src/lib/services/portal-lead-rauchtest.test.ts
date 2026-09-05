import { beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/db/client';
import { migrieren } from '@/db/migrate';
import { seeden } from '@/db/seed';
import { benutzer } from '@/db/schema';
import { positionAusBaustein } from './calculation';
import { geraeteVorschlag, heizlastSchaetzen, speicherVorschlag } from './heizlast';
import { ladeKalkulationsdaten } from './kalkulationsdaten';
import { parsePortalLead } from './portal-lead-parser';
import { speichereInternAnfrage, triageFuerAnfrage } from './estimates';
import { ladeVorgang } from './dokument-eingabe';
import type { SessionInfo } from '../types';

const WATTFOX = `Interesse an: Heizung (Wärmepumpe)
Bisheriges Heizsystem: Gasheizung, Solarthermie
Gebäudetyp: Ein- / Zweifamilienhaus
Größe der zu beheizenden Fläche in qm: 150
Wie viele Personen leben im Haushalt?: 1-2 Personen
Baujahr des Gebäudes: 1965
Alter der Heizung in Jahren: 20
Art des Erwerbs: Kauf
Sonstiges: - Einfamilienhaus - Gebäude steht im Eigentum der anfragenden Person - Anfragende Person ist dort wohnhaft - Standort der Heizung: Keller`;

const session: SessionInfo = {
  benutzerId: randomUUID(),
  name: 'Testmeister',
  rolle: 'chef',
  funktion: 'Geschäftsführer',
  signaturMail: 'chef@bad-energie.de',
};

describe('Portal-Lead durch den Dispatch-Zweig (gegen die Datenbank)', () => {
  beforeAll(async () => {
    await migrieren();
    await seeden({ demoPreise: true });
    const db = await getDb();
    await db.insert(benutzer).values({
      id: session.benutzerId, name: session.name, email: session.signaturMail,
      pinHash: 'test', rolle: 'chef', funktion: session.funktion, signaturMail: session.signaturMail, aktiv: true,
    }).onConflictDoNothing();
  });

  it('legt aus dem Portal-Text einen Vorgang mit Gerätegröße, Gebäude, Notiz und Triage an', async () => {
    const lead = parsePortalLead(WATTFOX);
    expect(lead).not.toBeNull();
    if (!lead) return;

    const { vorlagen, matrix } = await ladeKalkulationsdaten();
    const schaetzung = heizlastSchaetzen(lead.gebaeude);
    expect(schaetzung).not.toBeNull();

    const positionen = lead.vorlageIds.flatMap((vId) => {
      const v = vorlagen.find((x) => x.id === vId);
      if (!v) return [];
      return v.bausteine.map((b) => {
        const vorschlag = schaetzung ? geraeteVorschlag(schaetzung.kwBis, b.groessenVarianten, 'bosch') : null;
        const variante = b.groessenVarianten?.find((x) => x.matrixNr === vorschlag?.matrixNr) ?? null;
        const speicher = vorschlag ? speicherVorschlag(lead.gebaeude.personen, variante?.speicherLiterOptionen) : null;
        return positionAusBaustein(b, matrix, {
          varianteMatrixNr: vorschlag?.matrixNr ?? null,
          kW: vorschlag?.geraetKw,
          liter: speicher?.liter,
        });
      });
    });
    expect(positionen.length).toBeGreaterThan(0);
    // Ohne Verbrauch rechnet nur der Weg über die Fläche (150 m², Baujahr 1965, freistehend → 18,9 kW),
    // deshalb die größte Variante. Der Hinweis fordert den Verbrauch nach; vor Ort korrigiert der Meister.
    expect(schaetzung?.methode).toBe('flaeche');
    expect(schaetzung?.hinweise.some((h) => h.includes('Verbrauch'))).toBe(true);
    const wpZeile = positionen.find((p) => p.varianteMatrixNr !== null);
    expect(wpZeile?.varianteMatrixNr).toBe(3);
    expect(wpZeile?.text).toContain('12');

    const res = await speichereInternAnfrage({
      modus: 'intern', aktion: 'entwurf', quelle: 'dispatch',
      vorlageIds: lead.vorlageIds,
      kontakt: { ...lead.kontakt, kenntnisnahme: true },
      objekt: lead.objekt,
      gebaeude: lead.gebaeude,
      dringlichkeit: 'unklar',
      vorhabenKurz: lead.vorhabenKurz,
      positionen,
      kalkulation: {},
      foerderung: {
        aktiv: true, wohneinheiten: lead.objekt.wohneinheiten, selbstBewohnt: lead.foerderung.selbstBewohnt,
        altOelOderGas: lead.foerderung.altOelOderGas, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true,
      },
      persoenlicherSatz: '', annahmen: [], vorbehalte: [], ausfuehrungSatz: '', terminfensterIds: [],
      notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: `Portal-Lead (WattFox):\n${lead.rohtext}` },
      skizzen: [], fotos: [],
    }, session);

    expect(res.ksNummer).toMatch(/^KS-\d{4}-\d{4}$/);

    const triage = await triageFuerAnfrage(res.anfrageId, { eigentum: lead.objekt.eigentum });
    expect(triage).not.toBeNull();

    const daten = await ladeVorgang(res.anfrageId);
    expect(daten?.anfrage.gebaeude?.wohnflaeche).toBe(150);
    expect(daten?.anfrage.gebaeude?.bestand.standort).toBe('keller');
    expect(daten?.anfrage.interneNotizen).toContain('Portal-Lead (WattFox):');
    expect(daten?.anfrage.persoenlicherSatz).toBe('');
    expect(daten?.anfrage.objektPlz).toBe('');
    expect(daten?.anfrage.triageVorschlag).toBe(triage?.text);
    expect(daten?.kunde.email).toBe('');
  });
});
