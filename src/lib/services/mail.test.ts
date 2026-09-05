import { describe, expect, it } from 'vitest';
import { MAX_BETREFF, mitTestEmpfaenger, pruefeMail, type Mail, type Mailer } from './mail';

function fake(): Mailer & { gesendet: Mail[] } {
  const gesendet: Mail[] = [];
  return { gesendet, async senden(m) { gesendet.push(m); return { id: 'x' }; } };
}

const mail: Mail = { an: 'kundin@example.de', betreff: 'Ihre Kostenschätzung KS-2026-0001', html: '<p>x</p>', text: 'x', replyTo: 'chef@bad-energie.de' };

describe('Auffangadresse MAIL_TEST_TO', () => {
  it('leitet an die Testadresse um und nennt den echten Empfänger im Betreff', async () => {
    const f = fake();
    await mitTestEmpfaenger(f, 'test@example.de').senden(mail);
    expect(f.gesendet[0].an).toBe('test@example.de');
    expect(f.gesendet[0].betreff).toBe('Ihre Kostenschätzung KS-2026-0001 [an: kundin@example.de]');
    expect(f.gesendet[0].replyTo).toBe('chef@bad-energie.de');
    expect(f.gesendet[0].header?.['X-Original-To']).toBe('kundin@example.de');
  });

  it('kürzt zu lange Betreffzeilen, damit die Prüfung bestehen bleibt', async () => {
    const f = fake();
    await mitTestEmpfaenger(f, 'test@example.de').senden({ ...mail, betreff: 'A'.repeat(MAX_BETREFF) });
    expect(f.gesendet[0].betreff.length).toBeLessThanOrEqual(MAX_BETREFF);
    expect(() => pruefeMail(f.gesendet[0])).not.toThrow();
  });

  it('weist eine ungültige Testadresse ab', () => {
    expect(() => mitTestEmpfaenger(fake(), 'keine-adresse')).toThrow(/MAIL_TEST_TO/);
  });
});
