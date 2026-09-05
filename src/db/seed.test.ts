import { beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { getDb } from './client';
import { migrieren } from './migrate';
import { DEMO_STANDARDSATZ, demoPreiseSetzen, seeden } from './seed';
import { foerderRegel, richtpreis, vorlage, vorlageZeile } from './schema';

/**
 * Läufe gegen eine frische PGlite-Datenbank im Speicher.
 * Der Demo-Preissatz ist ein Vorführhilfsmittel; er darf gepflegte Preise weder überschreiben
 * noch beim Abschalten mitnehmen. Vorlagentexte müssen dagegen nachgezogen werden.
 */

type MitDb = typeof globalThis & { __badEnergieDb?: unknown };

beforeAll(async () => {
  (globalThis as MitDb).__badEnergieDb = undefined;
  process.env.DATABASE_URL = 'pglite://memory';
  await migrieren();
  await seeden({ demoPreise: true });
});

async function zeile(nr: number) {
  const db = await getDb();
  const treffer = await db.select().from(richtpreis).where(sql`${richtpreis.nr} = ${nr}`);
  return treffer[0];
}

describe('Demo-Preise abschalten', () => {
  it('lässt vom Betrieb gepflegte Zeilen stehen und räumt nur die Demo-Zeilen ab', async () => {
    const db = await getDb();
    const vorher = await zeile(2);
    expect(vorher.von).toBe(19800);
    expect(vorher.hinweis).toMatch(/ \| Demo \(R\)$/);

    // Der Chef pflegt Zeile 2 von Hand; das Demo-Kennzeichen verschwindet dabei aus dem Hinweis.
    await db.update(richtpreis)
      .set({ von: 21000, bis: 25000, hinweis: 'Vom Chef gepflegt am 05.09.2026' })
      .where(sql`${richtpreis.nr} = 2`);

    await demoPreiseSetzen(false);

    const gepflegt = await zeile(2);
    expect(gepflegt.von).toBe(21000);
    expect(gepflegt.bis).toBe(25000);
    expect(gepflegt.hinweis).toBe('Vom Chef gepflegt am 05.09.2026');

    const demo = await zeile(1);
    expect(demo.von).toBeNull();
    expect(demo.bis).toBeNull();
    expect(demo.hinweis).not.toMatch(/Demo/);
  });

  it('nimmt den Standardfördersatz beim Abschalten nicht mit', async () => {
    const db = await getDb();
    const regeln = await db.select().from(foerderRegel).where(sql`${foerderRegel.id} = 1`);
    // Keine Rechenfunktion liest das Feld; ein von Hand gesetzter Wert darf nicht stillschweigend verschwinden.
    expect(regeln[0].standardsatz).toBe(DEMO_STANDARDSATZ);
  });
});

describe('Vorlagentexte nachziehen', () => {
  it('aktualisiert Zeilentexte und Annahmen eines bereits vorhandenen Datenbestands', async () => {
    const db = await getDb();
    const alteZeilen = await db.select().from(vorlageZeile).where(sql`${vorlageZeile.vorlageId} = 'waermepumpe_gas'`);
    const groesse = alteZeilen.find((z) => z.position === 1);
    expect(groesse?.text).toContain('[Hersteller] Luft/Wasser Wärmepumpe [kW] kW');

    // Alter Bestand: feste Marke im Text, Fachbegriff in der Annahme.
    await db.update(vorlageZeile)
      .set({ text: 'Buderus Luft/Wasser Wärmepumpe [kW] kW mit [Liter] Liter Speicher' })
      .where(sql`${vorlageZeile.vorlageId} = 'waermepumpe_gas' and ${vorlageZeile.position} = 1`);
    await db.update(vorlage)
      .set({ annahmenStandard: ['Die vorhandenen Heizkörper bleiben und reichen bei der bisherigen Vorlauftemperatur aus.'] })
      .where(sql`${vorlage.id} = 'waermepumpe_gas'`);

    await seeden();

    const neu = await db.select().from(vorlageZeile).where(sql`${vorlageZeile.vorlageId} = 'waermepumpe_gas'`);
    expect(neu.find((z) => z.position === 1)?.text).toContain('[Hersteller] Luft/Wasser Wärmepumpe [kW] kW');
    expect(neu).toHaveLength(alteZeilen.length);

    const kopf = await db.select().from(vorlage).where(sql`${vorlage.id} = 'waermepumpe_gas'`);
    expect(kopf[0].annahmenStandard).toContain('Die vorhandenen Heizkörper bleiben und reichen bei der bisherigen Betriebsweise aus.');
    expect(kopf[0].annahmenStandard.join(' ')).not.toContain('Vorlauftemperatur');
  });
});
