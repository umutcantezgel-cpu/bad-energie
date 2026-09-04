/**
 * Legt einen Benutzer für den Intern-Bereich an.
 * npm run benutzer -- --email chef@bad-energie.de --name "Sabri Demir" --rolle chef --funktion "Geschäftsführer" [--pin 123456]
 */
import { randomInt, randomUUID } from 'node:crypto';
import { getDb } from '../src/db/client';
import { benutzer } from '../src/db/schema';
import { pinHashen, pinGueltig } from '../src/lib/services/pin';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg('email');
  const name = arg('name');
  const rolle = (arg('rolle') ?? 'buero') as 'chef' | 'bauleiter' | 'buero';
  const funktion = arg('funktion') ?? 'Bad & Energie GmbH';
  const signaturMail = arg('signatur') ?? 'info@bad-energie.de';
  let pin = arg('pin');
  if (!email || !name) throw new Error('--email und --name sind Pflicht');
  if (!['chef', 'bauleiter', 'buero'].includes(rolle)) throw new Error('--rolle muss chef, bauleiter oder buero sein');
  if (!pin) pin = String(randomInt(100000, 99999999)).padStart(6, '0');
  if (!pinGueltig(pin)) throw new Error('PIN muss aus 6 bis 8 Ziffern bestehen');
  const db = await getDb();
  await db.insert(benutzer).values({ id: randomUUID(), email: email.toLowerCase(), name, rolle, funktion, signaturMail, pinHash: pinHashen(pin) });
  console.log(`Benutzer angelegt: ${name} <${email}> Rolle ${rolle}. PIN (nur jetzt sichtbar): ${pin}`);
  process.exit(0);
}

main().catch((err) => { console.error(err.message ?? err); process.exit(1); });
