import { describe, expect, it } from 'vitest';
import { istJobName, slotFuer, JOBS } from './runner';
import { testUhr } from '@/lib/services/zeit';

describe('Jobs Runner & Slotting', () => {
  it('erkennt alle 5 konfigurierten Job-Namen', () => {
    expect(JOBS).toEqual(['versand', 'wiedervorlage', 'eingang', 'speicherfrist', 'bereinigung']);
    expect(istJobName('versand')).toBe(true);
    expect(istJobName('wiedervorlage')).toBe(true);
    expect(istJobName('eingang')).toBe(true);
    expect(istJobName('speicherfrist')).toBe(true);
    expect(istJobName('bereinigung')).toBe(true);
    expect(istJobName('unbekannt')).toBe(false);
    expect(istJobName('')).toBe(false);
  });

  it('erzeugt für versand Minuten-Slots und für Tagesjobs Tages-Slots', () => {
    const uhr = testUhr('2026-09-04T18:30:00.000Z');
    const jetzt = uhr.now();
    const versandSlot = slotFuer('versand', jetzt);
    expect(versandSlot).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

    const wiedervorlageSlot = slotFuer('wiedervorlage', jetzt);
    expect(wiedervorlageSlot).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const eingangSlot = slotFuer('eingang', jetzt);
    expect(eingangSlot).toBe(wiedervorlageSlot);

    const speicherSlot = slotFuer('speicherfrist', jetzt);
    expect(speicherSlot).toBe(wiedervorlageSlot);

    const bereinigungSlot = slotFuer('bereinigung', jetzt);
    expect(bereinigungSlot).toBe(wiedervorlageSlot);
  });
});
