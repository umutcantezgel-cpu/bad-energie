import { describe, expect, it } from 'vitest';
import { dummyHash, pinGueltig, pinHashen, pinPruefen } from './pin';

describe('pin', () => {
  it('hasht und prüft eine PIN', () => {
    const hash = pinHashen('123456');
    expect(hash.startsWith('scrypt$32768$8$1$')).toBe(true);
    expect(pinPruefen('123456', hash)).toBe(true);
    expect(pinPruefen('123457', hash)).toBe(false);
  });
  it('lehnt kaputte Hashes ab', () => {
    expect(pinPruefen('123456', 'unsinn')).toBe(false);
  });
  it('validiert das PIN-Format', () => {
    expect(pinGueltig('123456')).toBe(true);
    expect(pinGueltig('12345')).toBe(false);
    expect(pinGueltig('123456789')).toBe(false);
    expect(pinGueltig('12a456')).toBe(false);
  });
  it('liefert einen stabilen Dummy-Hash', () => {
    expect(dummyHash()).toBe(dummyHash());
  });
});
