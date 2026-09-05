/**
 * Einzelläufer-Sperre: ein Slot bleibt gesperrt, solange ein Lauf arbeitet oder erfolgreich war,
 * gibt einen gescheiterten oder abgebrochenen Lauf aber wieder frei.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { jobLauf } from '@/db/schema';
import { plusMinuten, tagesBucket } from '@/lib/services/zeit';
import { LAUF_ABBRUCH_MINUTEN, mitJobSperre, slotFuer, type JobErgebnis } from './runner';
import { frischeDb } from '../../../test/db';

const ERLEDIGT: JobErgebnis = { verarbeitet: 3, blockiert: 0, zusammenfassung: 'Alles erledigt.' };

beforeEach(async () => {
  await frischeDb();
});

describe('mitJobSperre', () => {
  it('sperrt einen erfolgreichen Slot gegen jeden weiteren Lauf', async () => {
    const jetzt = new Date('2026-09-05T02:00:00.000Z');
    const erster = await mitJobSperre('wiedervorlage', 'cron', jetzt, async () => ERLEDIGT);
    expect(erster.ok).toBe(true);

    const zweiter = await mitJobSperre('wiedervorlage', 'manuell', jetzt, async () => ERLEDIGT);
    expect(zweiter.ok).toBe(false);
    if (!zweiter.ok) expect(zweiter.grund).toBe('gesperrt');
  });

  it('lässt nach einem gescheiterten Lauf denselben Slot erneut laufen', async () => {
    const jetzt = new Date('2026-09-05T02:00:00.000Z');
    const gescheitert = await mitJobSperre('wiedervorlage', 'cron', jetzt, async () => {
      throw new Error('Datenbank nicht erreichbar.');
    });
    expect(gescheitert.ok).toBe(false);
    if (!gescheitert.ok) expect(gescheitert.grund).toBe('fehler');

    // Ohne diese Wiederaufnahme bliebe der Tagesjob nach einem einzigen Fehler bis morgen tot.
    const nachgeholt = await mitJobSperre('wiedervorlage', 'manuell', jetzt, async () => ERLEDIGT);
    expect(nachgeholt.ok).toBe(true);
    if (nachgeholt.ok) expect(nachgeholt.verarbeitet).toBe(3);

    // Der geglückte Lauf sperrt den Slot wieder.
    const dritter = await mitJobSperre('wiedervorlage', 'manuell', jetzt, async () => ERLEDIGT);
    expect(dritter.ok).toBe(false);

    const db = await getDb();
    const zeilen = await db.select().from(jobLauf).where(and(
      eq(jobLauf.job, 'wiedervorlage'), eq(jobLauf.slot, slotFuer('wiedervorlage', jetzt)),
    ));
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0].fehler).toBeNull();
    expect(zeilen[0].zusammenfassung).toBe('Alles erledigt.');
  });

  it('nimmt einen abgebrochenen Lauf nach Ablauf der Abbruchzeit wieder auf', async () => {
    const jetzt = new Date('2026-09-05T02:00:00.000Z');
    const db = await getDb();
    const slot = tagesBucket(jetzt);
    await db.insert(jobLauf).values({
      job: 'eingang', slot, ausgeloestDurch: 'cron', gestartet: plusMinuten(jetzt, -(LAUF_ABBRUCH_MINUTEN + 1)),
    });

    const wiederaufgenommen = await mitJobSperre('eingang', 'cron', jetzt, async () => ERLEDIGT);
    expect(wiederaufgenommen.ok).toBe(true);
  });

  it('lässt einen laufenden Lauf in Ruhe', async () => {
    const jetzt = new Date('2026-09-05T02:00:00.000Z');
    const db = await getDb();
    await db.insert(jobLauf).values({
      job: 'eingang', slot: tagesBucket(jetzt), ausgeloestDurch: 'cron', gestartet: plusMinuten(jetzt, -1),
    });

    const gesperrt = await mitJobSperre('eingang', 'cron', jetzt, async () => ERLEDIGT);
    expect(gesperrt.ok).toBe(false);
    if (!gesperrt.ok) expect(gesperrt.grund).toBe('gesperrt');
  });
});
