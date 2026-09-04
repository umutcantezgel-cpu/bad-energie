import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

/** Hash im Format scrypt$N$r$p$salt$hash (base64). */
export function pinHashen(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function pinPruefen(pin: string, gespeichert: string): boolean {
  const teile = gespeichert.split('$');
  if (teile.length !== 6 || teile[0] !== 'scrypt') return false;
  const n = Number(teile[1]);
  const r = Number(teile[2]);
  const p = Number(teile[3]);
  const salt = Buffer.from(teile[4], 'base64');
  const erwartet = Buffer.from(teile[5], 'base64');
  const hash = scryptSync(pin, salt, erwartet.length, { N: n, r, p, maxmem: MAXMEM });
  return hash.length === erwartet.length && timingSafeEqual(hash, erwartet);
}

let dummy: string | undefined;
/** Vergleichs-Hash für unbekannte Benutzer, damit die Antwortzeit konstant bleibt. */
export function dummyHash(): string {
  if (!dummy) dummy = pinHashen('00000000');
  return dummy;
}

export function pinGueltig(pin: string): boolean {
  return /^\d{6,8}$/.test(pin);
}
