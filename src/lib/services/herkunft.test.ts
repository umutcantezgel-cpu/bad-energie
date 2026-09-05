/**
 * Herkunftsprüfung: Vergleichsmaß ist allein die eingestellte eigene Adresse.
 * Header, die der Aufrufer selbst setzt (`host`, `x-forwarded-host`), dürfen nichts erlauben.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pruefeHerkunft } from './herkunft';

const EIGEN = 'https://bad-energie-nu.vercel.app';
const FREMD = 'https://angreifer.example';

let vorherigeAppUrl: string | undefined;

beforeEach(() => {
  vorherigeAppUrl = process.env.APP_URL;
  process.env.APP_URL = EIGEN;
});

afterEach(() => {
  if (vorherigeAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = vorherigeAppUrl;
});

function post(kopf: Record<string, string>): Request {
  return new Request(`${EIGEN}/api/intern/estimate`, { method: 'POST', headers: kopf });
}

describe('pruefeHerkunft', () => {
  it('lässt same-origin und same-site durch', () => {
    expect(pruefeHerkunft(post({ 'sec-fetch-site': 'same-origin' })).ok).toBe(true);
    expect(pruefeHerkunft(post({ 'sec-fetch-site': 'same-site' })).ok).toBe(true);
    expect(pruefeHerkunft(post({ 'sec-fetch-site': 'none' })).ok).toBe(true);
  });

  it('weist cross-site ab', () => {
    const ergebnis = pruefeHerkunft(post({ 'sec-fetch-site': 'cross-site' }));
    expect(ergebnis.ok).toBe(false);
  });

  it('lässt den Origin der eigenen Adresse durch', () => {
    expect(pruefeHerkunft(post({ origin: EIGEN })).ok).toBe(true);
  });

  it('weist einen fremden Origin ab, auch mit passendem x-forwarded-host', () => {
    const ergebnis = pruefeHerkunft(post({
      origin: FREMD,
      'x-forwarded-host': 'angreifer.example',
      host: 'angreifer.example',
    }));
    expect(ergebnis.ok).toBe(false);
  });

  it('weist einen fremden Origin ab, auch wenn x-forwarded-host eine Liste ist', () => {
    const ergebnis = pruefeHerkunft(post({
      origin: FREMD,
      'x-forwarded-host': 'angreifer.example, bad-energie-nu.vercel.app',
    }));
    expect(ergebnis.ok).toBe(false);
  });

  it('lässt Aufrufe ohne Origin und ohne Referer durch (Cron, Tests)', () => {
    expect(pruefeHerkunft(post({})).ok).toBe(true);
  });

  it('weist einen fremden Referer ab und lässt den eigenen durch', () => {
    expect(pruefeHerkunft(post({ referer: `${FREMD}/formular` })).ok).toBe(false);
    expect(pruefeHerkunft(post({ referer: `${EIGEN}/intern/board` })).ok).toBe(true);
  });

  it('lässt außerhalb der Produktion localhost mit beliebigem Port durch', () => {
    expect(pruefeHerkunft(post({ origin: 'http://localhost:3000' })).ok).toBe(true);
    expect(pruefeHerkunft(post({ origin: 'http://127.0.0.1:4173' })).ok).toBe(true);
  });

  it('weist ohne gesetzte APP_URL trotzdem fremde Adressen ab', () => {
    delete process.env.APP_URL;
    expect(pruefeHerkunft(post({ origin: FREMD })).ok).toBe(false);
  });
});
