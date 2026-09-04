import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Mailversand über einen Adapter. Standard ist Resend; ohne API-Schlüssel schreibt der
 * Dateiadapter .eml-Dateien in ./data/outbox. Vor jedem Versand werden Kopfzeilen validiert.
 */

export type MailAnhang = { dateiname: string; inhalt: Buffer; mime: string };

export type Mail = {
  an: string;
  betreff: string;
  html: string;
  text: string;
  replyTo?: string;
  anhaenge?: MailAnhang[];
  header?: Record<string, string>;
  idempotencyKey?: string;
  tag?: string;
};

export type Mailer = { senden(m: Mail): Promise<{ id: string }> };

export const MAX_BETREFF = 120;
const BETREFF_REGEX = /^[^\r\n]{1,120}$/;
// RFC 5322, praxistaugliche Fassung
const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const KS_REGEX = /KS-\d{4}-\d{4}/;

export function istEmail(adresse: string): boolean {
  const roh = adresse.trim();
  return roh.length <= 200 && EMAIL_REGEX.test(roh);
}

/** Wirft, wenn Betreff, Empfänger oder ein Anhangname die Vorgaben verletzen. */
export function pruefeMail(m: Mail): void {
  if (!BETREFF_REGEX.test(m.betreff)) throw new Error('Betreff ist leer, zu lang oder enthält einen Zeilenumbruch.');
  if (!istEmail(m.an)) throw new Error(`Empfängeradresse ist ungültig: ${m.an}`);
  if (m.replyTo && !istEmail(m.replyTo)) throw new Error('Antwortadresse ist ungültig.');
  for (const [name, wert] of Object.entries(m.header ?? {})) {
    if (/[\r\n]/.test(name) || /[\r\n]/.test(wert)) throw new Error('Mail-Header enthält einen Zeilenumbruch.');
  }
  for (const a of m.anhaenge ?? []) {
    if (/[\r\n/\\]/.test(a.dateiname)) throw new Error('Anhangname enthält unerlaubte Zeichen.');
    if (a.dateiname.toLowerCase().endsWith('.pdf') && !KS_REGEX.test(a.dateiname)) {
      throw new Error('Der PDF-Anhang muss die KS-Nummer im Namen tragen.');
    }
  }
}

function absender(): string {
  return process.env.MAIL_FROM ?? 'Bad & Energie GmbH <info@bad-energie.de>';
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const OUTBOX = path.resolve(process.cwd(), 'data/outbox');

function eml(m: Mail, id: string, von: string): string {
  const zeilen = [
    `Message-ID: <${id}@bad-energie.de>`,
    `Date: ${new Date().toUTCString()}`,
    `From: ${von}`,
    `To: ${m.an}`,
    ...(m.replyTo ? [`Reply-To: ${m.replyTo}`] : []),
    `Subject: ${m.betreff}`,
    ...Object.entries(m.header ?? {}).map(([k, v]) => `${k}: ${v}`),
    ...(m.anhaenge?.length ? [`X-Anhaenge: ${m.anhaenge.map((a) => `${a.dateiname} (${a.inhalt.length} Byte)`).join(', ')}`] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    m.text,
  ];
  return zeilen.join('\r\n');
}

/** Entwicklungs- und Testadapter: schreibt .eml nach ./data/outbox. */
export function dateiMailer(): Mailer {
  return {
    async senden(m) {
      pruefeMail(m);
      const id = m.idempotencyKey ?? randomUUID();
      await mkdir(OUTBOX, { recursive: true });
      const zeit = new Date().toISOString().replace(/[:.]/g, '-');
      const datei = path.join(OUTBOX, `${zeit}-${id.replace(/[^a-z0-9_-]/gi, '')}.eml`);
      await writeFile(datei, eml(m, id, absender()), 'utf8');
      return { id };
    },
  };
}

/** Resend-Adapter (Produktion). */
export function resendMailer(apiKey: string): Mailer {
  return {
    async senden(m) {
      pruefeMail(m);
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const antwort = await resend.emails.send(
        {
          from: absender(),
          to: m.an,
          subject: m.betreff,
          html: m.html,
          text: m.text,
          ...(m.replyTo ? { replyTo: m.replyTo } : {}),
          ...(m.header ? { headers: m.header } : {}),
          ...(m.tag ? { tags: [{ name: 'art', value: m.tag }] } : {}),
          ...(m.anhaenge?.length
            ? { attachments: m.anhaenge.map((a) => ({ filename: a.dateiname, content: a.inhalt, contentType: a.mime })) }
            : {}),
        },
        m.idempotencyKey ? { idempotencyKey: m.idempotencyKey } : undefined,
      );
      if (antwort.error) throw new Error(`Resend: ${antwort.error.message}`);
      if (!antwort.data?.id) throw new Error('Resend hat keine Nachrichten-ID geliefert.');
      return { id: antwort.data.id };
    },
  };
}

let zwischenspeicher: Mailer | undefined;

export function getMailer(): Mailer {
  if (zwischenspeicher) return zwischenspeicher;
  const transport = process.env.MAIL_TRANSPORT ?? (process.env.RESEND_API_KEY ? 'resend' : 'file');
  const key = process.env.RESEND_API_KEY;
  zwischenspeicher = transport === 'resend' && key ? resendMailer(key) : dateiMailer();
  return zwischenspeicher;
}

/** Nur für Tests: Adapter setzen oder zurücksetzen. */
export function setzeMailer(mailer: Mailer | undefined): void {
  zwischenspeicher = mailer;
}

// ---------------------------------------------------------------------------
// Kopfzeilen nach Regel 8
// ---------------------------------------------------------------------------

/** List-Unsubscribe als Header (Artikel-21-Weg), kein sichtbarer Abmeldelink. */
export function listUnsubscribe(bueroEmail: string, ksNummer: string): string {
  return `<mailto:${bueroEmail}?subject=${encodeURIComponent(`Widerspruch ${ksNummer}`)}>`;
}

export function standardHeader(bueroEmail: string, ksNummer: string, extra: Record<string, string> = {}): Record<string, string> {
  return { 'List-Unsubscribe': listUnsubscribe(bueroEmail, ksNummer), ...extra };
}

/** Pflichtname des Kunden-PDF nach Regel 8. */
export function pdfDateiname(ksNummer: string): string {
  return `Kostenschaetzung ${ksNummer} Bad und Energie.pdf`;
}
