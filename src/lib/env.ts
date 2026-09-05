import { z } from 'zod';

/**
 * Serverseitige Umgebungsvariablen. Wird beim Start (instrumentation.ts) validiert;
 * in Produktion verweigert ein Fehler den Start.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1).default('pglite://./data/pglite'),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  MAIL_FROM: z.string().default('Bad & Energie GmbH <info@bad-energie.de>'),
  MAIL_TRANSPORT: z.enum(['resend', 'file']).default('file'),
  /** Auffangadresse: solange gesetzt, gehen alle Mails dorthin (Vorführung, Tests). */
  MAIL_TEST_TO: z.string().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(32).optional(),
  INTAKE_AI: z.enum(['on', 'off']).default('off'),
  CHROME_EXECUTABLE_PATH: z.string().optional(),
  SKIP_ENV_VALIDATION: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Ungültige Umgebungsvariablen: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  }
  cached = parsed.data;
  return cached;
}

/** Harte Anforderungen für den Produktionsbetrieb. */
export function validateEnv(): void {
  if (process.env.SKIP_ENV_VALIDATION === '1') return;
  const env = getEnv();
  if (env.NODE_ENV !== 'production') return;
  const fehlend: string[] = [];
  if (!env.APP_URL.startsWith('https://')) fehlend.push('APP_URL muss https sein');
  if (env.DATABASE_URL.startsWith('pglite://')) fehlend.push('DATABASE_URL muss auf Postgres zeigen');
  if (!env.SESSION_SECRET) fehlend.push('SESSION_SECRET (mindestens 32 Zeichen)');
  if (!env.CRON_SECRET) fehlend.push('CRON_SECRET (mindestens 32 Zeichen)');
  if (!env.BLOB_READ_WRITE_TOKEN) fehlend.push('BLOB_READ_WRITE_TOKEN');
  if (env.MAIL_TRANSPORT === 'resend' && !env.RESEND_API_KEY) fehlend.push('RESEND_API_KEY');
  if (env.MAIL_TRANSPORT === 'resend' && !env.RESEND_WEBHOOK_SECRET) fehlend.push('RESEND_WEBHOOK_SECRET (Webhook sonst ungeschützt)');
  if (env.MAIL_TRANSPORT !== 'resend') fehlend.push('MAIL_TRANSPORT=resend (der Dateiadapter hat auf Vercel keine Platte)');
  if (fehlend.length) throw new Error(`Produktionsstart verweigert. Fehlend oder falsch: ${fehlend.join(', ')}`);
}

export function istProduktion(): boolean {
  return getEnv().NODE_ENV === 'production';
}
