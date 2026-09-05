import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, dokument, versandauftrag } from '@/db/schema';
import type { VersandArt, VersandStatus } from '../types';
import type { DokumentEingabe, DossierEingabe, MailArtefakt } from '../dokumente/datenblatt';
import {
  renderAbschlussberichtMd, renderDossierMail, renderEingangsbestaetigung, renderErinnerungMail,
  renderErstkontaktMail, renderKostenschaetzungHtml, renderTerminmail,
} from './templates';
import { renderPdf } from './pdf';
import { getMailer, pdfDateiname, standardHeader, type MailAnhang } from './mail';
import { dokumentPfad, getStorage, sha256Hex } from './storage';
import { appUrl, bestaetigungsUrl, csvKopfzeile, erzeugeBestaetigungsToken, ladeEingaben } from './dokument-eingabe';
import { schreibeEreignis, setzeVersandStatus, setzeVorgangsStatus } from './statusmaschine';
import { ladeEinstellungen } from './kalkulationsdaten';
import { ipHash, pruefeLimit } from './ratelimit';
import { datumDeutsch, plusMinuten, plusTage } from './zeit';

/**
 * Versand eines Versandauftrags (Plan 4.5). Gesendet wird nur aus dem Status `freigegeben`
 * (Fachregel 1). Der Auftrag wird zuerst beansprucht (`UPDATE … SET beansprucht_am = jetzt
 * WHERE status = 'freigegeben' AND (beansprucht_am IS NULL OR beansprucht_am < jetzt − 10 min) RETURNING`),
 * damit zwei Läufe nie doppelt senden. Auf `versendet` wechselt der Auftrag erst, wenn die Kundenmail
 * draußen ist; bricht die Function vorher ab, verfällt die Beanspruchung und der nächste Lauf holt nach.
 * Kundenmail und Büro-Dossier laufen als eigene Aufträge parallel; ein Dossier-Fehler rollt den Kundenversand nie zurück.
 */

/** Wartezeiten zwischen den Versuchen in Minuten. */
export const BACKOFF_MINUTEN = [1, 5, 15, 60, 240];
export const MAX_VERSUCHE = 5;
/**
 * Nach dieser Zeit gilt eine Beanspruchung als verfallen. Die Function läuft höchstens 120 Sekunden,
 * zehn Minuten liegen sicher darüber und halten einen abgebrochenen Lauf nicht dauerhaft fest.
 */
export const BEANSPRUCHUNG_MINUTEN = 10;
/** Obergrenze für Anhänge des Dossiers; der Rest wird als Link genannt. */
export const DOSSIER_ANHANG_BYTES = 8 * 1024 * 1024;

export type VersandBericht = {
  auftragId: string;
  art: VersandArt;
  status: VersandStatus;
  fehler?: string;
  /** Ergebnis des parallel gesendeten Dossiers, wenn eines erzeugt wurde. */
  dossier?: { auftragId: string; status: VersandStatus; fehler?: string };
};

type Auftrag = typeof versandauftrag.$inferSelect;

const KUNDENARTEN: VersandArt[] = ['erstkontakt', 'erinnerung', 'terminmail'];

async function ladeAuftrag(auftragId: string): Promise<Auftrag | null> {
  const db = await getDb();
  const zeilen = await db.select().from(versandauftrag).where(eq(versandauftrag.id, auftragId)).limit(1);
  return zeilen[0] ?? null;
}

/** Legt einen Versandauftrag an oder liefert den bestehenden aktiven Auftrag dieser Art. */
export async function stelleAuftragBereit(
  anfrageId: string,
  art: VersandArt,
  felder: { empfaenger?: string; betreff?: string; faelligAm?: Date | null } = {},
): Promise<Auftrag> {
  const db = await getDb();
  const vorhanden = await db.select().from(versandauftrag)
    .where(and(
      eq(versandauftrag.anfrageId, anfrageId),
      eq(versandauftrag.art, art),
      sql`${versandauftrag.status} <> 'storniert'`,
    ))
    .limit(1);
  if (vorhanden[0]) return vorhanden[0];
  const zeilen = await db.insert(versandauftrag).values({
    id: randomUUID(),
    anfrageId,
    art,
    status: 'entwurf',
    empfaenger: felder.empfaenger ?? '',
    betreff: felder.betreff ?? '',
    faelligAm: felder.faelligAm ?? null,
  }).returning();
  return zeilen[0];
}

/**
 * Beansprucht den Auftrag für diesen Lauf. Liefert null, wenn ein anderer Lauf schneller war.
 * Der Status bleibt `freigegeben`: Ein abgebrochener Lauf darf keinen Auftrag hinterlassen,
 * der als versendet gilt, obwohl keine Mail hinausging.
 */
async function beanspruche(auftragId: string, jetzt: Date): Promise<Auftrag | null> {
  const db = await getDb();
  const verfallen = plusMinuten(jetzt, -BEANSPRUCHUNG_MINUTEN);
  const zeilen = await db.update(versandauftrag)
    .set({ beanspruchtAm: jetzt })
    .where(and(
      eq(versandauftrag.id, auftragId),
      eq(versandauftrag.status, 'freigegeben'),
      or(isNull(versandauftrag.beanspruchtAm), lt(versandauftrag.beanspruchtAm, verfallen)),
    ))
    .returning();
  return zeilen[0] ?? null;
}

/**
 * Hebt einen Auftrag, der an einer bereits erteilten Freigabe hängt (Dossier, Eingangsbestätigung),
 * vor dem Senden auf `freigegeben`. Damit gilt Fachregel 1 auch in diesen Pfaden.
 */
async function gebeAbgeleitetenAuftragFrei(auftrag: Auftrag, jetzt: Date): Promise<void> {
  if (auftrag.status !== 'entwurf' && auftrag.status !== 'fehlgeschlagen') return;
  // Ein endgültig gescheiterter Auftrag wird nicht still wiederbelebt; das entscheidet ein Mensch.
  if (auftrag.status === 'fehlgeschlagen' && auftrag.versuch >= MAX_VERSUCHE) return;
  await setzeVersandStatus(auftrag.id, ['entwurf', 'fehlgeschlagen'], 'freigegeben', {
    freigegebenAm: auftrag.freigegebenAm ?? jetzt,
  });
}

async function merkeFehler(auftrag: Auftrag, fehler: unknown, jetzt: Date): Promise<VersandStatus> {
  const db = await getDb();
  const text = fehler instanceof Error ? fehler.message : String(fehler);
  const versuch = auftrag.versuch + 1;
  const endgueltig = versuch >= MAX_VERSUCHE;
  const wartezeit = BACKOFF_MINUTEN[Math.min(versuch - 1, BACKOFF_MINUTEN.length - 1)];
  await db.update(versandauftrag).set({
    status: 'fehlgeschlagen',
    versuch,
    versendetAm: null,
    // Die Beanspruchung fällt zurück, damit der nächste Lauf den Auftrag sofort wieder aufnehmen darf.
    beanspruchtAm: null,
    fehler: text.slice(0, 500),
    naechsterVersuchAm: endgueltig ? null : plusMinuten(jetzt, wartezeit),
  }).where(eq(versandauftrag.id, auftrag.id));
  await schreibeEreignis({
    anfrageId: auftrag.anfrageId,
    typ: 'versand:fehlgeschlagen',
    payload: { art: auftrag.art, versuch, endgueltig, fehler: text.slice(0, 300) },
  });
  return 'fehlgeschlagen';
}

/**
 * Ein fehlgeschlagener Auftrag wird für den nächsten Lauf wieder freigegeben. Die Wartezeit ist
 * abgelaufen, wenn der Job hier ankommt; sie wird gelöscht und bei einem erneuten Fehler neu gesetzt.
 * Liefert false, wenn ein anderer Lauf den Auftrag schon aufgenommen hat.
 */
export async function bereiteWiederholungVor(auftragId: string): Promise<boolean> {
  return setzeVersandStatus(auftragId, 'fehlgeschlagen', 'freigegeben', { naechsterVersuchAm: null });
}

// ---------------------------------------------------------------------------
// Dokumente ablegen
// ---------------------------------------------------------------------------

type DokumentArt = typeof dokument.$inferInsert['art'];

async function legeDokumentAb(anfrageId: string, art: DokumentArt, inhalt: Buffer | string, endung: string): Promise<string> {
  const db = await getDb();
  const daten = Buffer.isBuffer(inhalt) ? inhalt : Buffer.from(inhalt, 'utf8');
  const sha = sha256Hex(daten);
  const pfad = dokumentPfad(anfrageId, sha, endung);
  await getStorage().put(pfad, daten, endung === 'pdf' ? 'application/pdf' : 'text/plain; charset=utf-8');
  const bestand = await db.select({ version: dokument.version }).from(dokument)
    .where(and(eq(dokument.anfrageId, anfrageId), eq(dokument.art, art)));
  const version = bestand.reduce((max, z) => Math.max(max, z.version), 0) + 1;
  const id = randomUUID();
  await db.insert(dokument).values({ id, anfrageId, art, version, blobPfad: pfad, sha256: sha, groesse: daten.length });
  return id;
}

// ---------------------------------------------------------------------------
// Artefakte je Versandart
// ---------------------------------------------------------------------------

type Artefakte = {
  mail: MailArtefakt;
  pdf: Buffer | null;
  dokumentIds: string[];
  dokument: DokumentEingabe;
  dossier: DossierEingabe;
};

async function baueArtefakte(auftrag: Auftrag, jetzt: Date): Promise<Artefakte> {
  const braucht = auftrag.art === 'erstkontakt' || auftrag.art === 'erinnerung';
  let url: string | null = null;
  if (auftrag.art === 'erstkontakt' || auftrag.art === 'terminmail') {
    url = bestaetigungsUrl(await erzeugeBestaetigungsToken(auftrag.anfrageId, jetzt));
  }
  const geladen = await ladeEingaben(auftrag.anfrageId, { bestaetigungsUrl: url, jetzt });
  if (!geladen) throw new Error('Anfrage nicht gefunden.');
  const dokumentIds: string[] = [];
  let pdf: Buffer | null = null;
  if (braucht) {
    const html = renderKostenschaetzungHtml(geladen.dokument);
    pdf = await renderPdf(html, { ksNummer: geladen.dokument.ksNummer });
    dokumentIds.push(await legeDokumentAb(auftrag.anfrageId, 'kostenschaetzung_html', html, 'html'));
    dokumentIds.push(await legeDokumentAb(auftrag.anfrageId, 'kostenschaetzung_pdf', pdf, 'pdf'));
  }
  const mail = auftrag.art === 'erinnerung'
    ? renderErinnerungMail(geladen.dokument)
    : auftrag.art === 'terminmail'
      ? renderTerminmail(geladen.dokument)
      : renderErstkontaktMail(geladen.dokument);
  const htmlArt: DokumentArt = auftrag.art === 'erinnerung' ? 'erinnerung_html' : auftrag.art === 'terminmail' ? 'terminmail_html' : 'mail_html';
  const textArt: DokumentArt = auftrag.art === 'erinnerung' ? 'erinnerung_txt' : auftrag.art === 'terminmail' ? 'terminmail_txt' : 'mail_txt';
  dokumentIds.push(await legeDokumentAb(auftrag.anfrageId, htmlArt, mail.html, 'html'));
  dokumentIds.push(await legeDokumentAb(auftrag.anfrageId, textArt, mail.text, 'txt'));
  return { mail, pdf, dokumentIds, dokument: geladen.dokument, dossier: geladen.dossier };
}

async function anhaengeFuerDossier(dossier: DossierEingabe, pdf: Buffer | null, ksNummer: string): Promise<{ anhaenge: MailAnhang[]; ausgelassen: string[] }> {
  const anhaenge: MailAnhang[] = [
    { dateiname: 'datenblatt.json', inhalt: Buffer.from(dossier.datenblattJson, 'utf8'), mime: 'application/json' },
    { dateiname: 'Uebersicht-Zeile.csv', inhalt: Buffer.from(`${csvKopfzeile()}\n${dossier.csvZeile}\n`, 'utf8'), mime: 'text/csv; charset=utf-8' },
  ];
  let summe = anhaenge.reduce((s, a) => s + a.inhalt.length, 0);
  const ausgelassen: string[] = [];
  if (pdf) {
    anhaenge.push({ dateiname: pdfDateiname(ksNummer), inhalt: pdf, mime: 'application/pdf' });
    summe += pdf.length;
  }
  const db = await getDb();
  const { anhang } = await import('@/db/schema');
  const dateien = await db.select().from(anhang).where(and(
    eq(anhang.anfrageId, dossier.anfrageId),
    inArray(anhang.art, ['skizze', 'foto', 'foto_annotiert']),
  ));
  for (const datei of dateien) {
    const objekt = await getStorage().get(datei.blobPfad);
    if (!objekt) { ausgelassen.push(datei.dateiname || datei.id); continue; }
    if (summe + objekt.daten.length > DOSSIER_ANHANG_BYTES) { ausgelassen.push(datei.dateiname || datei.id); continue; }
    summe += objekt.daten.length;
    anhaenge.push({ dateiname: datei.dateiname || `${datei.art}-${datei.id}.jpg`, inhalt: objekt.daten, mime: objekt.mime });
  }
  return { anhaenge, ausgelassen };
}

// ---------------------------------------------------------------------------
// Versand
// ---------------------------------------------------------------------------

async function sendeDossier(auftrag: Auftrag, artefakte: Artefakte, jetzt: Date): Promise<VersandStatus> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  // Das Dossier hängt an der Kundenfreigabe; es wird ausdrücklich freigegeben und dann wie jeder Auftrag beansprucht.
  await gebeAbgeleitetenAuftragFrei(auftrag, jetzt);
  const beansprucht = await beanspruche(auftrag.id, jetzt);
  if (!beansprucht) return (await ladeAuftrag(auftrag.id))?.status ?? 'versendet';
  try {
    const mail = renderDossierMail(artefakte.dossier);
    const { anhaenge, ausgelassen } = await anhaengeFuerDossier(artefakte.dossier, artefakte.pdf, artefakte.dossier.ksNummer);
    const text = ausgelassen.length
      ? `${mail.text}\n\nNicht angehängt (zu groß), Abruf über den Intern-Bereich: ${ausgelassen.join(', ')}\n${artefakte.dossier.internUrl}`
      : mail.text;
    const ergebnis = await getMailer().senden({
      an: einst.bueroEmail,
      betreff: mail.betreff,
      html: mail.html,
      text,
      anhaenge,
      idempotencyKey: beansprucht.id,
      tag: 'dossier',
      header: { 'Auto-Submitted': 'auto-generated' },
    });
    const dokumentId = await legeDokumentAb(auftrag.anfrageId, 'dossier_html', mail.html, 'html');
    // Erst jetzt, nach dem tatsächlichen Versand, gilt der Auftrag als versendet.
    await db.update(versandauftrag).set({
      status: 'versendet', versendetAm: jetzt,
      empfaenger: einst.bueroEmail, betreff: mail.betreff, messageId: ergebnis.id, resendId: ergebnis.id,
      fehler: null, dokumentIds: [dokumentId],
    }).where(eq(versandauftrag.id, auftrag.id));
    await schreibeEreignis({ anfrageId: auftrag.anfrageId, typ: 'versand:dossier', payload: { empfaenger: einst.bueroEmail } });
    return 'versendet';
  } catch (fehler) {
    return merkeFehler(beansprucht, fehler, jetzt);
  }
}

async function sendeKundenmail(auftrag: Auftrag, artefakte: Artefakte, jetzt: Date): Promise<VersandStatus> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  const empfaenger = artefakte.dokument.kunde.email;
  const anhaenge: MailAnhang[] = artefakte.pdf
    ? [{ dateiname: pdfDateiname(artefakte.dokument.ksNummer), inhalt: artefakte.pdf, mime: 'application/pdf' }]
    : [];
  const header = standardHeader(einst.bueroEmail, artefakte.dokument.ksNummer);
  if (auftrag.art === 'erinnerung') {
    const erst = await db.select().from(versandauftrag).where(and(
      eq(versandauftrag.anfrageId, auftrag.anfrageId), eq(versandauftrag.art, 'erstkontakt'),
    )).limit(1);
    const vorgaenger = erst[0]?.messageId;
    if (vorgaenger) {
      header['In-Reply-To'] = `<${vorgaenger}>`;
      header['References'] = `<${vorgaenger}>`;
    }
  }
  const ergebnis = await getMailer().senden({
    an: empfaenger,
    betreff: artefakte.mail.betreff,
    html: artefakte.mail.html,
    text: artefakte.mail.text,
    replyTo: artefakte.dokument.bearbeiter.mail,
    anhaenge,
    header,
    idempotencyKey: auftrag.id,
    tag: auftrag.art,
  });
  // Erst jetzt, nach dem tatsächlichen Versand, gilt der Auftrag als versendet.
  await db.update(versandauftrag).set({
    status: 'versendet', versendetAm: jetzt,
    empfaenger, betreff: artefakte.mail.betreff, messageId: ergebnis.id, resendId: ergebnis.id,
    fehler: null, dokumentIds: artefakte.dokumentIds,
  }).where(eq(versandauftrag.id, auftrag.id));
  return 'versendet';
}

async function schliesseVorgangAb(auftrag: Auftrag, artefakte: Artefakte, jetzt: Date): Promise<void> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  if (auftrag.art === 'erinnerung') {
    await setzeVorgangsStatus(auftrag.anfrageId, ['versendet'], 'erinnert', {
      erinnertAm: jetzt,
      wiedervorlageAm: plusTage(jetzt, einst.erinnerungTage),
    }, { typ: 'versand:erinnerung' });
    return;
  }
  const gesetzt = await setzeVorgangsStatus(auftrag.anfrageId, ['geplant', 'eingang', 'blockiert'], 'versendet', {
    versendetAm: jetzt,
    wiedervorlageAm: plusTage(jetzt, einst.wiedervorlageTage),
  }, { typ: `versand:${auftrag.art}` });
  if (!gesetzt) {
    await db.update(anfrageTabelle)
      .set({ versendetAm: jetzt, wiedervorlageAm: plusTage(jetzt, einst.wiedervorlageTage), geaendertAm: jetzt })
      .where(eq(anfrageTabelle.id, auftrag.anfrageId));
  }
  const bericht = renderAbschlussberichtMd(artefakte.dokument, {
    versandDatum: datumDeutsch(jetzt),
    wiedervorlage: datumDeutsch(plusTage(jetzt, einst.wiedervorlageTage)),
  });
  await legeDokumentAb(auftrag.anfrageId, 'abschlussbericht_md', bericht, 'md');
}

/**
 * Versendet einen Auftrag. Für Kundenarten wird zusätzlich das Büro-Dossier als eigener Auftrag
 * parallel verschickt; ein Fehler dort ändert den Kundenversand nicht.
 */
/** Jüngste abgelegte Kostenschätzung (PDF) eines Vorgangs, für ein nachgeholtes Dossier. */
async function ladeJuengstesPdf(anfrageId: string): Promise<Buffer | null> {
  const db = await getDb();
  const zeilen = await db.select().from(dokument)
    .where(and(eq(dokument.anfrageId, anfrageId), eq(dokument.art, 'kostenschaetzung_pdf')))
    .orderBy(desc(dokument.version))
    .limit(1);
  const d = zeilen[0];
  if (!d) return null;
  const datei = await getStorage().get(d.blobPfad);
  return datei ? Buffer.from(datei.daten) : null;
}

export async function versendeAuftrag(auftragId: string, optionen: { jetzt?: Date } = {}): Promise<VersandBericht> {
  const jetzt = optionen.jetzt ?? new Date();
  const auftrag = await ladeAuftrag(auftragId);
  if (!auftrag) return { auftragId, art: 'erstkontakt', status: 'storniert', fehler: 'Auftrag nicht gefunden.' };

  if (auftrag.art === 'dossier') {
    const geladen = await ladeEingaben(auftrag.anfrageId, { jetzt });
    if (!geladen) return { auftragId, art: auftrag.art, status: 'fehlgeschlagen', fehler: 'Anfrage nicht gefunden.' };
    // Ein nachgeholtes Dossier trägt dieselbe Kostenschätzung wie der Erstversand: das abgelegte PDF.
    const pdf = await ladeJuengstesPdf(auftrag.anfrageId);
    const artefakte: Artefakte = { mail: { betreff: '', html: '', text: '' }, pdf, dokumentIds: [], dokument: geladen.dokument, dossier: geladen.dossier };
    const status = await sendeDossier(auftrag, artefakte, jetzt);
    return { auftragId, art: auftrag.art, status };
  }

  if (auftrag.art === 'eingangsbestaetigung') {
    const status = await sendeEingangsbestaetigungAuftrag(auftrag, jetzt);
    return { auftragId, art: auftrag.art, status };
  }

  const beansprucht = await beanspruche(auftragId, jetzt);
  if (!beansprucht) {
    const aktuell = await ladeAuftrag(auftragId);
    return { auftragId, art: auftrag.art, status: aktuell?.status ?? 'versendet', fehler: 'Auftrag war nicht versandbereit.' };
  }

  let artefakte: Artefakte;
  try {
    artefakte = await baueArtefakte(beansprucht, jetzt);
  } catch (fehler) {
    const status = await merkeFehler(beansprucht, fehler, jetzt);
    return { auftragId, art: auftrag.art, status, fehler: fehler instanceof Error ? fehler.message : String(fehler) };
  }

  const dossierAuftrag = KUNDENARTEN.includes(auftrag.art) && auftrag.art !== 'erinnerung'
    ? await stelleAuftragBereit(auftrag.anfrageId, 'dossier')
    : null;
  // Ein Dossier mit eigenem Wiederholungstermin (oder endgültig gescheitert) zählt nur einmal je Lauf:
  // Der Versandjob holt es selbst nach; hier wird es nicht ein zweites Mal angestoßen.
  const dossierWartet = dossierAuftrag !== null && dossierAuftrag.status === 'fehlgeschlagen'
    && (dossierAuftrag.naechsterVersuchAm !== null || dossierAuftrag.versuch >= MAX_VERSUCHE);

  const [kundeErgebnis, dossierErgebnis] = await Promise.allSettled([
    sendeKundenmail(beansprucht, artefakte, jetzt),
    dossierAuftrag && !dossierWartet ? sendeDossier(dossierAuftrag, artefakte, jetzt) : Promise.resolve<VersandStatus>('storniert'),
  ]);

  let status: VersandStatus = 'versendet';
  let fehlertext: string | undefined;
  if (kundeErgebnis.status === 'rejected') {
    status = await merkeFehler(beansprucht, kundeErgebnis.reason, jetzt);
    fehlertext = kundeErgebnis.reason instanceof Error ? kundeErgebnis.reason.message : String(kundeErgebnis.reason);
  } else {
    // Die Mail ist beim Kunden. Ein Fehler in der Nachbereitung (Vorgangsstatus, Abschlussbericht)
    // darf den Versand nicht nachträglich als gescheitert ausweisen; er wird nur als Ereignis vermerkt.
    try {
      await schliesseVorgangAb(beansprucht, artefakte, jetzt);
    } catch (fehler) {
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      await schreibeEreignis({
        anfrageId: beansprucht.anfrageId,
        typ: 'versand:nachbereitung_fehlgeschlagen',
        payload: { art: beansprucht.art, fehler: text.slice(0, 300) },
      });
    }
  }

  const bericht: VersandBericht = { auftragId, art: auftrag.art, status, ...(fehlertext ? { fehler: fehlertext } : {}) };
  if (dossierAuftrag && dossierWartet) {
    bericht.dossier = {
      auftragId: dossierAuftrag.id, status: 'fehlgeschlagen',
      fehler: dossierAuftrag.versuch >= MAX_VERSUCHE ? 'endgültig gescheitert, bitte von Hand erneut versuchen' : 'Wiederholung über den Versandjob',
    };
  } else if (dossierAuftrag) {
    bericht.dossier = dossierErgebnis.status === 'fulfilled'
      ? { auftragId: dossierAuftrag.id, status: dossierErgebnis.value }
      : { auftragId: dossierAuftrag.id, status: 'fehlgeschlagen', fehler: String(dossierErgebnis.reason) };
  }
  return bericht;
}

// ---------------------------------------------------------------------------
// Eingangsbestätigung
// ---------------------------------------------------------------------------

export const EINGANG_JE_EMPFAENGER = 1;
export const EINGANG_FENSTER_MS = 24 * 60 * 60 * 1000;
export const EINGANG_GLOBAL = 50;
export const EINGANG_GLOBAL_FENSTER_MS = 60 * 60 * 1000;
export const EINGANG_ABLEHNUNGEN_BIS_STOPP = 5;

async function sendeEingangsbestaetigungAuftrag(auftrag: Auftrag, jetzt: Date): Promise<VersandStatus> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  const geladen = await ladeEingaben(auftrag.anfrageId, { jetzt });
  if (!geladen) return 'fehlgeschlagen';
  const empfaenger = geladen.dokument.kunde.email;
  // Die Bestätigung folgt der Anfrage des Kunden selbst; sie wird ausdrücklich freigegeben und dann beansprucht.
  await gebeAbgeleitetenAuftragFrei(auftrag, jetzt);
  const beansprucht = await beanspruche(auftrag.id, jetzt);
  if (!beansprucht) return (await ladeAuftrag(auftrag.id))?.status ?? 'versendet';
  try {
    const mail = renderEingangsbestaetigung({
      ksNummer: geladen.dokument.ksNummer,
      anredeZeile: [geladen.dokument.kunde.anrede, geladen.dokument.kunde.vorname, geladen.dokument.kunde.nachname].filter(Boolean).join(' ').trim(),
      briefbogen: einst.briefbogen,
      bearbeiter: geladen.dokument.bearbeiter,
      appUrl: geladen.dokument.appUrl,
    });
    const ergebnis = await getMailer().senden({
      an: empfaenger,
      betreff: mail.betreff,
      html: mail.html,
      text: mail.text,
      header: { 'Auto-Submitted': 'auto-generated', ...standardHeader(einst.bueroEmail, geladen.dokument.ksNummer) },
      idempotencyKey: beansprucht.id,
      tag: 'eingangsbestaetigung',
    });
    // Erst jetzt, nach dem tatsächlichen Versand, gilt der Auftrag als versendet.
    await db.update(versandauftrag).set({
      status: 'versendet', versendetAm: jetzt,
      empfaenger, betreff: mail.betreff, messageId: ergebnis.id, resendId: ergebnis.id, fehler: null,
    }).where(eq(versandauftrag.id, auftrag.id));
    return 'versendet';
  } catch (fehler) {
    return merkeFehler(beansprucht, fehler, jetzt);
  }
}

/**
 * Eingangsbestätigung mit Drosselung: eine je Empfängeradresse und Tag, global 50 je Stunde,
 * Abschaltung nach fünf Ablehnungen (Circuit Breaker).
 */
export async function sendeEingangsbestaetigung(anfrageId: string, email: string, jetzt: Date = new Date()): Promise<VersandStatus | 'uebersprungen'> {
  const einst = await ladeEinstellungen();
  if (!einst.eingangsbestaetigung) return 'uebersprungen';
  const stopp = await pruefeLimit('eingangsbestaetigung:stopp', EINGANG_ABLEHNUNGEN_BIS_STOPP, EINGANG_GLOBAL_FENSTER_MS, jetzt);
  if (!stopp.erlaubt) return 'uebersprungen';
  const global = await pruefeLimit('eingangsbestaetigung:global', EINGANG_GLOBAL, EINGANG_GLOBAL_FENSTER_MS, jetzt);
  if (!global.erlaubt) return 'uebersprungen';
  const jeEmpfaenger = await pruefeLimit(
    `eingangsbestaetigung:${ipHash(email.trim().toLowerCase(), jetzt)}`,
    EINGANG_JE_EMPFAENGER,
    EINGANG_FENSTER_MS,
    jetzt,
  );
  if (!jeEmpfaenger.erlaubt) return 'uebersprungen';
  const auftrag = await stelleAuftragBereit(anfrageId, 'eingangsbestaetigung', { empfaenger: email });
  return sendeEingangsbestaetigungAuftrag(auftrag, jetzt);
}

/** Kurze Benachrichtigung an das Büro, wenn ein Web-Lead eintrifft. */
export async function sendeBueroHinweis(anfrageId: string, jetzt: Date = new Date()): Promise<void> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  const zeilen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
  const a = zeilen[0];
  if (!a) return;
  const text = [
    `${a.ksNummer}, neue Anfrage über die Website.`,
    `Vorhaben: ${a.vorhabenKurz || 'noch offen'}.`,
    `Triage: ${a.triageVorschlag || 'ohne Vorschlag'}.`,
    // Der Link muss auf die laufende Anwendung zeigen, nicht auf die Webadresse des Briefbogens.
    `Vorgang: ${appUrl()}/intern/anfragen/${a.id}`,
  ].join('\n');
  await getMailer().senden({
    an: einst.bueroEmail,
    betreff: `Neue Anfrage ${a.ksNummer}`,
    html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
    text,
    header: { 'Auto-Submitted': 'auto-generated' },
    idempotencyKey: `hinweis-${a.id}`,
    tag: 'hinweis',
  });
  await schreibeEreignis({ anfrageId, typ: 'hinweis:buero', payload: { empfaenger: einst.bueroEmail, zeitpunkt: jetzt.toISOString() } });
}

/** Kurze Meldung an das Büro, wenn ein Kunde ein Terminfenster bestätigt hat. */
export async function sendeTerminMeldung(anfrageId: string, fensterBeschriftung: string): Promise<void> {
  const db = await getDb();
  const einst = await ladeEinstellungen();
  const zeilen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
  const a = zeilen[0];
  if (!a) return;
  // Der Link muss auf die laufende Anwendung zeigen, nicht auf die Webadresse des Briefbogens.
  const text = `${a.ksNummer}: Der Kunde hat den Termin bestätigt.\nGewählt: ${fensterBeschriftung}\n${appUrl()}/intern/anfragen/${a.id}`;
  await getMailer().senden({
    an: einst.bueroEmail,
    betreff: `Terminbestätigung ${a.ksNummer}`,
    html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
    text,
    header: { 'Auto-Submitted': 'auto-generated' },
    idempotencyKey: `termin-${a.id}`,
    tag: 'termin',
  });
}
