/**
 * Dokumenten-Engine: Kostenschätzung (DIN A4), Kundenmails, Büro-Dossier, Freigabeblatt.
 *
 * Die Vorlagen liegen als Dateien unter src/lib/dokumente/assets/ und stammen aus dem
 * Altsystem (legacy/kostenschaetzung-altsystem/.../00 Vorlagen). Die Fülllogik folgt
 * render.py: erst die Zeilen ausrollen, dann die Blöcke behalten oder entfernen,
 * zuletzt die Tokens ersetzen. Die Reihenfolge ist tragend.
 *
 * Benannte Abweichungen vom Altsystem (Freigabe durch den Chef):
 *   1. „Guten Tag {{anrede}} {{nachname}}“ wird zu „Guten Tag {{anrede_zeile}}“.
 *   2. Die Legende ist dynamisch und zeigt nur vorkommende Gewerke, Elektro eingeschlossen.
 *   3. Die Piktogramme im PDF sind vektoriell (Inline-SVG), PNG bleibt Mail-Fallback.
 *   4. Neuer Block „Nicht enthalten und bauseits“ vor „So geht es weiter“.
 *   5. Der Button „Termin bestätigen“ zeigt auf die Bestätigungsseite, mailto steht darunter.
 *   6. Alle Werte werden HTML-escaped.
 *   7. Liberation Sans ist als Base64-@font-face eingebettet.
 * Alles Übrige bleibt strukturell unverändert: Kopf, Fuß, Wasserzeichen, Tabellen,
 * der § 145-Disclaimer und der Mail-Fuß wörtlich, kein Abmeldelink.
 */
import 'server-only';

import { ladeBase64, ladeText, schriftRegeln } from '../dokumente/assets';
import { anredeZeile } from '../dokumente/datenblatt';
import type { DokumentEingabe, DossierEingabe, DossierPosition, EingangsbestaetigungEingabe, MailArtefakt } from '../dokumente/datenblatt';
import { piktogramm, PIKTOGRAMM_REIHENFOLGE, type PiktogrammSchluessel } from '../dokumente/piktogramme';
import { EINHEIT_LABEL, GEWERK_FARBE_DOKUMENT, GEWERK_ICON, GEWERK_LABEL, type Gewerk } from '../types';
import { bruttoAusNetto, euro } from './calculation';

// ---------------------------------------------------------------------------
// Template-Engine
// ---------------------------------------------------------------------------

export const TOKEN_REGEX = /\{\{(\w+)\}\}/g;
const ROW_REGEX = /<!--\s*ROW\s*-->([\s\S]*?)<!--\s*\/ROW\s*-->/g;

export type TokenWert = string | number | null | undefined;
export type TokenWerte = Record<string, TokenWert>;

/**
 * Tokens, die die Engine selbst erzeugt und deren Inhalt bereits aus escaped Teilen besteht.
 * Nur diese werden roh eingebaut. Alles andere wird HTML-escaped.
 */
export const ROH_TOKENS: ReadonlySet<string> = new Set([
  // Vorgabe aus der Spezifikation
  'row_icon',
  'gewerk_chips',
  'annahmen_liste',
  'vorbehalte_liste',
  'legende',
  'logo_base64',
  'icon_flamme',
  'icon_wasser',
  'icon_sonne',
  'icon_luft',
  'icon_elektro',
  'font_base64',
  // Zusätzlich im internen Dossier, ebenfalls aus escaped Teilen gebaut
  'positionen_tabelle',
  'faktoren_liste',
  'notizen_liste',
  'fehlende_liste',
  'warnungen_liste',
  'anhaenge_liste',
]);

/** HTML-Escaping für alle Werte, die aus Daten stammen. */
export function escapeHtml(wert: TokenWert): string {
  if (wert === null || wert === undefined) return '';
  return String(wert)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** CR und CRLF zu LF vereinheitlichen. Schützt Textmails und alles, was in Header wandern könnte. */
export function normalisiereZeilenenden(wert: TokenWert): string {
  if (wert === null || wert === undefined) return '';
  return String(wert).replace(/\r\n?/g, '\n');
}

/** Betreffzeile ohne CR/LF, auf 120 Zeichen begrenzt (Mail-Header-Sicherheit). */
export function betreffSicher(betreff: string, ersatz: string): string {
  const sauber = betreff.replace(/[\r\n\u0085\u2028\u2029]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const gewaehlt = sauber || ersatz.replace(/[\r\n]+/g, ' ').trim();
  return gewaehlt.slice(0, 120);
}

/** Rollt den mit ROW markierten Block je Zeile aus. Muss vor stripBlock und fillTokens laufen. */
export function expandRows(vorlage: string, zeilen: TokenWerte[]): string {
  return vorlage.replace(ROW_REGEX, (_treffer, inhalt: string) =>
    zeilen.map((zeile) => fillTokens(inhalt, zeile)).join(''),
  );
}

/** Behält oder entfernt den Block zwischen `<!-- NAME -->` und `<!-- /NAME -->`. */
export function stripBlock(vorlage: string, name: string, behalten: boolean): string {
  const muster = new RegExp(`<!--\\s*${name}\\s*-->([\\s\\S]*?)<!--\\s*/${name}\\s*-->`, 'g');
  return vorlage.replace(muster, (_treffer, inhalt: string) => (behalten ? inhalt : ''));
}

/** Ersetzt `{{token}}`. Unbekannte Tokens werden zu „“. Werte werden escaped, außer ROH_TOKENS. */
export function fillTokens(vorlage: string, werte: TokenWerte): string {
  return vorlage.replace(TOKEN_REGEX, (_treffer, name: string) => {
    const wert = werte[name];
    if (wert === undefined || wert === null) return '';
    return ROH_TOKENS.has(name) ? String(wert) : escapeHtml(wert);
  });
}

/** Wie fillTokens, aber ohne HTML-Escaping (Textvorlagen). CR/LF werden vereinheitlicht. */
export function fillTokensText(vorlage: string, werte: TokenWerte): string {
  return normalisiereZeilenenden(vorlage).replace(TOKEN_REGEX, (_treffer, name: string) =>
    normalisiereZeilenenden(werte[name]),
  );
}

// ---------------------------------------------------------------------------
// Bausteine der Dokumente
// ---------------------------------------------------------------------------

const HEX_FARBE = /^#[0-9A-Fa-f]{3,8}$/;

function iconSchluessel(gewerk: Gewerk | null | undefined): PiktogrammSchluessel | null {
  return gewerk ? (GEWERK_ICON[gewerk] ?? null) : null;
}

/** Vorkommende Piktogramm-Schlüssel in der Reihenfolge der Legende, dedupliziert. */
function vorkommendeSchluessel(gewerke: (Gewerk | null | undefined)[]): PiktogrammSchluessel[] {
  const vorhanden = new Set<PiktogrammSchluessel>();
  for (const g of gewerke) {
    const s = iconSchluessel(g);
    if (s) vorhanden.add(s);
  }
  return PIKTOGRAMM_REIHENFOLGE.filter((s) => vorhanden.has(s));
}

/** Dynamische Legende (benannte Abweichung 2), vektoriell (3). */
function legendeHtml(gewerke: (Gewerk | null | undefined)[]): string {
  return vorkommendeSchluessel(gewerke)
    .map(
      (s) =>
        `<td>${piktogramm(s, { groesse: '4.5mm', stil: 'display:inline-block;vertical-align:middle;margin-right:1.5mm;' })}${escapeHtml(GEWERK_LABEL[s])}</td>`,
    )
    .join('');
}

/** Gewerke-Chips der Mail, dedupliziert nach Icon-Schlüssel wie chips_html in render.py. */
function chipsHtml(gewerke: (Gewerk | null | undefined)[]): string {
  const gesehen = new Set<PiktogrammSchluessel>();
  const zellen: string[] = [];
  for (const g of gewerke) {
    const s = iconSchluessel(g);
    if (!s || gesehen.has(s)) continue;
    gesehen.add(s);
    zellen.push(
      '<td style="padding:0 13px 0 0; white-space:nowrap;">' +
        `<span style="display:inline-block; width:10px; height:10px; border-radius:5px; background-color:${GEWERK_FARBE_DOKUMENT[s]}; vertical-align:middle; margin-right:6px;"></span>` +
        `<span style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; line-height:21px; color:#4A4F5C; vertical-align:middle;">${escapeHtml(GEWERK_LABEL[s])}</span></td>`,
    );
  }
  return zellen.join('');
}

function listeHtml(eintraege: string[], leer = ''): string {
  if (!eintraege.length) return leer ? `<li>${escapeHtml(leer)}</li>` : '';
  return eintraege.map((e) => `<li>${escapeHtml(e)}</li>`).join('\n');
}

function listeText(eintraege: string[], leer = 'keine'): string {
  if (!eintraege.length) return `- ${leer}`;
  return eintraege.map((e) => `- ${normalisiereZeilenenden(e)}`).join('\n');
}

/** Nur https- und mailto-Ziele dürfen in einen Button. */
function sicheresZiel(url: string | null | undefined): string | null {
  if (!url) return null;
  const wert = url.trim();
  if (/^https:\/\/[^\s"'<>]+$/i.test(wert)) return wert;
  if (/^http:\/\/localhost(:\d+)?(\/[^\s"'<>]*)?$/i.test(wert)) return wert;
  if (/^mailto:[^\s"'<>]+$/i.test(wert)) return wert;
  return null;
}

function mailtoTermin(e: DokumentEingabe): string {
  const adresse = e.bearbeiter.mail.trim() || e.briefbogen.email.trim();
  return `mailto:${adresse}?subject=Termin%20${encodeURIComponent(e.ksNummer)}`;
}

function telefonLink(briefbogen: DokumentEingabe['briefbogen']): string {
  const link = briefbogen.telefonLink?.trim();
  if (link && /^tel:\+?[0-9]{4,20}$/.test(link)) return link;
  const ziffern = briefbogen.telefon.replace(/[^0-9]/g, '');
  return ziffern ? `tel:+49${ziffern.replace(/^0/, '')}` : '';
}

function webUrl(briefbogen: DokumentEingabe['briefbogen']): string {
  const web = briefbogen.web.trim();
  if (!web) return '';
  return /^https?:\/\//i.test(web) ? web : `https://${web}`;
}

/** Briefbogen-Tokens für Kopf, Fuß und Signatur. */
function briefbogenTokens(e: DokumentEingabe | EingangsbestaetigungEingabe): TokenWerte {
  const b = e.briefbogen;
  return {
    firma: b.firma,
    firma_strasse: b.strasse,
    firma_plz_ort: b.plzOrt,
    firma_telefon: b.telefon,
    firma_telefon_link: telefonLink(b),
    firma_email: b.email,
    firma_email_link: b.email ? `mailto:${b.email}` : '',
    firma_web: b.web,
    firma_web_url: webUrl(b),
    firma_geschaeftsfuehrer: b.geschaeftsfuehrer,
    firma_register: b.register,
    firma_ust_id: b.ustId,
    bearbeiter: e.bearbeiter.name,
    bearbeiter_rolle: e.bearbeiter.rolle,
    bearbeiter_mail: e.bearbeiter.mail,
  };
}

/** Binärassets als Base64 (Logo, PNG-Piktogramme als Mail-Fallback, Schrift). */
function assetTokens(): TokenWerte {
  return {
    logo_base64: ladeBase64('logo-bad-energie.jpg'),
    icon_flamme: ladeBase64('icon_flamme.png'),
    icon_wasser: ladeBase64('icon_wasser.png'),
    icon_sonne: ladeBase64('icon_sonne.png'),
    icon_luft: ladeBase64('icon_luft.png'),
    icon_elektro: ladeBase64('icon_elektro.png'),
    font_base64: schriftRegeln(),
  };
}

/** Gemeinsame Tokens aller Kundendokumente. Enthält nie interne Felder. */
function basisTokens(e: DokumentEingabe): TokenWerte {
  const gewerke = e.positionen.map((p) => p.gewerk);
  const hauptSchluessel = iconSchluessel(e.gewerkHaupt) ?? iconSchluessel(e.positionen[0]?.gewerk) ?? null;
  const hauptFarbe = hauptSchluessel ? GEWERK_FARBE_DOKUMENT[hauptSchluessel] : '#1B3A8C';
  const ziel = sicheresZiel(e.bestaetigungsUrl);
  const mailto = mailtoTermin(e);
  return {
    ...briefbogenTokens(e),
    ...assetTokens(),
    ks_nummer: e.ksNummer,
    datum: e.datum,
    anrede: e.kunde.anrede,
    vorname: e.kunde.vorname,
    nachname: e.kunde.nachname,
    strasse: e.kunde.strasse,
    plz_ort: e.kunde.plzOrt,
    email: e.kunde.email,
    telefon: e.kunde.telefon,
    anrede_zeile: anredeZeile(e.kunde),
    objekt_adresse: e.objektAdresse,
    vorhaben_kurz: e.vorhabenKurz,
    vorlage: e.vorlage ?? '',
    persoenlicher_satz: e.persoenlicherSatz,
    terminvorschlag: e.terminvorschlag,
    ausfuehrung_satz: e.ausfuehrungSatz,
    mail_betreff: e.mailBetreff,
    mail_preheader: e.mailPreheader,
    gewerk_farbe: HEX_FARBE.test(hauptFarbe) ? hauptFarbe : '#1B3A8C',
    gewerk_chips: chipsHtml(gewerke),
    legende: legendeHtml(gewerke),
    summe_netto_von: euro(e.nettoVon),
    summe_netto_bis: euro(e.nettoBis),
    summe_brutto_von: euro(e.bruttoVon),
    summe_brutto_bis: euro(e.bruttoBis),
    annahmen_liste: listeHtml(e.annahmen),
    annahmen_text: listeText(e.annahmen),
    vorbehalte_liste: listeHtml(e.vorbehalte),
    vorbehalte_text: listeText(e.vorbehalte),
    foerder_kosten: e.foerderung ? euro(e.foerderung.kosten) : '',
    foerder_satz: e.foerderung ? String(e.foerderung.satz) : '',
    foerder_zuschuss: e.foerderung ? euro(e.foerderung.zuschuss) : '',
    eigenanteil_von: e.foerderung ? euro(e.foerderung.eigenanteilVon) : '',
    eigenanteil_bis: e.foerderung ? euro(e.foerderung.eigenanteilBis) : '',
    // Benannte Abweichung 5: Button auf die Bestätigungsseite, sonst mailto
    termin_href: ziel ?? mailto,
    termin_mailto: mailto,
    bestaetigungs_url: ziel ?? '',
  };
}

/** Nur bewertete, aktive Positionen erscheinen im Kundendokument. */
function kundenZeilen(e: DokumentEingabe) {
  return e.positionen.filter((p) => !p.blockiert && p.von !== null && p.bis !== null);
}

// ---------------------------------------------------------------------------
// Kostenschätzung (PDF-HTML)
// ---------------------------------------------------------------------------

/** Zweiseitiges DIN-A4-HTML (Briefbogen), Assets inline, alle Werte escaped. */
export function renderKostenschaetzungHtml(e: DokumentEingabe): string {
  const vorlage = ladeText('kostenschaetzung-template.html');
  const zeilen = kundenZeilen(e).map<TokenWerte>((p) => ({
    row_icon: (() => {
      const s = iconSchluessel(p.gewerk);
      return s ? piktogramm(s, { groesse: '6.5mm' }) : '';
    })(),
    row_titel: p.titel,
    row_text: p.text,
    row_von: euro(p.von),
    row_bis: euro(p.bis),
  }));
  const tokens = basisTokens(e);
  // Reihenfolge tragend: Zeilen ausrollen, dann Blöcke, dann Tokens.
  let html = expandRows(vorlage, zeilen);
  html = stripBlock(html, 'FOERDERUNG', Boolean(e.foerderung));
  html = stripBlock(html, 'VORBEHALTE', e.vorbehalte.length > 0);
  // Legende nur mit den Gewerken der tatsächlich gedruckten Zeilen
  tokens.legende = legendeHtml(kundenZeilen(e).map((p) => p.gewerk));
  tokens.gewerk_chips = chipsHtml(kundenZeilen(e).map((p) => p.gewerk));
  return fillTokens(html, tokens);
}

// ---------------------------------------------------------------------------
// Kundenmails
// ---------------------------------------------------------------------------

function mailArtefakt(
  e: DokumentEingabe,
  dateien: { html: string; text: string },
  betreff: string,
  optionen: { foerderung?: boolean; terminLink?: boolean } = {},
): MailArtefakt {
  const tokens = basisTokens(e);
  const mitFoerderung = optionen.foerderung ?? Boolean(e.foerderung);
  const mitLink = optionen.terminLink ?? Boolean(sicheresZiel(e.bestaetigungsUrl));

  let html = ladeText(dateien.html);
  html = stripBlock(html, 'FOERDERUNG', mitFoerderung);
  html = stripBlock(html, 'MAILTO_ZEILE', mitLink);
  html = fillTokens(html, tokens);

  let text = ladeText(dateien.text);
  text = stripBlock(text, 'FOERDERUNG', mitFoerderung);
  text = stripBlock(text, 'TERMIN_LINK', mitLink);
  text = fillTokensText(text, tokens);

  return { betreff: betreffSicher(betreff, `Kostenschätzung ${e.ksNummer}`), html, text };
}

/** Erstkontakt mit Kostenschätzung im Anhang. */
export function renderErstkontaktMail(e: DokumentEingabe): MailArtefakt {
  return mailArtefakt(e, { html: 'erstkontakt-mail.html', text: 'erstkontakt-mail.txt' }, e.mailBetreff);
}

/** Erinnerung nach 5 Tagen. Ohne Kernzahl-Kachel, das ist Absicht. */
export function renderErinnerungMail(e: DokumentEingabe): MailArtefakt {
  return mailArtefakt(
    e,
    { html: 'erinnerung-mail.html', text: 'erinnerung-mail.txt' },
    `Kurze Nachfrage zu Ihrer Kostenschätzung ${e.ksNummer}`,
  );
}

/** Terminmail (Regel 10): Versandpfad ohne PDF und ohne jeden Betrag. */
export function renderTerminmail(e: DokumentEingabe): MailArtefakt {
  const artefakt = mailArtefakt(
    e,
    { html: 'terminmail.html', text: 'terminmail.txt' },
    'Ihre Anfrage, Terminvorschlag',
    { foerderung: false },
  );
  // Die Textvorlage des Altsystems trägt eine Betreffzeile im Kopf, die nicht in den Body gehört.
  return { ...artefakt, text: artefakt.text.replace(/^Betreff:[^\n]*\n\n?/, '') };
}

/** Eingangsbestätigung: kurz, ohne Freitext des Absenders, nur Nummer und fester Satz. */
export function renderEingangsbestaetigung(e: EingangsbestaetigungEingabe): MailArtefakt {
  const tokens: TokenWerte = {
    ...briefbogenTokens(e),
    ...assetTokens(),
    ks_nummer: e.ksNummer,
    anrede_zeile: e.anredeZeile,
  };
  return {
    betreff: betreffSicher(`Ihre Anfrage ist eingegangen, ${e.ksNummer}`, 'Ihre Anfrage ist eingegangen'),
    html: fillTokens(ladeText('eingangsbestaetigung.html'), tokens),
    text: fillTokensText(ladeText('eingangsbestaetigung.txt'), tokens),
  };
}

// ---------------------------------------------------------------------------
// Büro-Dossier (intern)
// ---------------------------------------------------------------------------

function positionZeileHtml(p: DossierPosition): string {
  const klassen = [p.aktiv ? '' : 'inaktiv', p.blockiert ? 'blockiert' : ''].filter(Boolean).join(' ');
  const mengeLabel = `${p.menge} ${EINHEIT_LABEL[p.einheit]}`;
  const marker = [p.zuschlag ? 'Zuschlag' : '', p.aktiv ? '' : 'inaktiv', p.blockiert ? 'blockiert' : '', p.matrixNr !== null ? `Matrix ${p.matrixNr}` : '']
    .filter(Boolean)
    .join(' · ');
  const kopf =
    `<tr${klassen ? ` class="${klassen}"` : ''}>` +
    `<td class="titel">${escapeHtml(p.titel)}${marker ? `<br><span style="font-weight:normal;color:#4A4F5C;font-size:12px;">${escapeHtml(marker)}</span>` : ''}</td>` +
    `<td class="text">${escapeHtml(p.text)}</td>` +
    `<td class="z">${escapeHtml(mengeLabel)}</td>` +
    `<td class="z">${escapeHtml(euro(p.von))}</td>` +
    `<td class="z">${escapeHtml(euro(p.bis))}</td>` +
    `<td class="z">${escapeHtml(p.von === null ? '' : euro(bruttoAusNetto(p.von)))}</td>` +
    `<td class="z">${escapeHtml(p.bis === null ? '' : euro(bruttoAusNetto(p.bis)))}</td>` +
    '</tr>';
  if (!p.notizIntern.trim()) return kopf;
  return `${kopf}<tr><td class="notiz" colspan="7">Notiz: ${escapeHtml(p.notizIntern)}</td></tr>`;
}

function positionZeileText(p: DossierPosition): string {
  const teile = [
    `- ${normalisiereZeilenenden(p.titel)} (${p.menge} ${EINHEIT_LABEL[p.einheit]}${p.matrixNr !== null ? `, Matrix ${p.matrixNr}` : ''}${p.zuschlag ? ', Zuschlag' : ''}${p.aktiv ? '' : ', inaktiv'}${p.blockiert ? ', blockiert' : ''})`,
    `  ${normalisiereZeilenenden(p.text)}`,
    `  netto ${euro(p.von)} bis ${euro(p.bis)} Euro, brutto ${p.von === null ? '' : euro(bruttoAusNetto(p.von))} bis ${p.bis === null ? '' : euro(bruttoAusNetto(p.bis))} Euro`,
  ];
  if (p.notizIntern.trim()) teile.push(`  Notiz: ${normalisiereZeilenenden(p.notizIntern)}`);
  return teile.join('\n');
}

function faktorenEintraege(e: DossierEingabe): string[] {
  const k = e.kalkulation;
  const liste: string[] = [];
  if (k.stundensatz !== undefined) liste.push(`Stundensatz: ${k.stundensatz} Euro`);
  if (k.materialZuschlagProzent !== undefined) liste.push(`Materialzuschlag: ${k.materialZuschlagProzent} Prozent`);
  if (k.rabattProzent !== undefined) liste.push(`Rabatt: ${k.rabattProzent} Prozent`);
  if (k.margeHinweis) liste.push(`Margenhinweis: ${k.margeHinweis}`);
  return liste.length ? liste : ['keine internen Faktoren hinterlegt'];
}

function notizEintraege(e: DossierEingabe): string[] {
  const n = e.notizen;
  const liste: string[] = [];
  if (n.etage !== null) liste.push(`Etage: ${n.etage}`);
  if (n.aufzug !== null) liste.push(`Aufzug: ${n.aufzug ? 'ja' : 'nein'}`);
  if (n.montagehindernisse.trim()) liste.push(`Montagehindernisse: ${n.montagehindernisse}`);
  if (n.leitungswege.trim()) liste.push(`Leitungswege: ${n.leitungswege}`);
  if (n.intern.trim()) liste.push(`Interne Notiz: ${n.intern}`);
  return liste.length ? liste : ['keine Notizen'];
}

function anhangEintraegeHtml(e: DossierEingabe): string {
  if (!e.anhaenge.length) return '';
  return e.anhaenge
    .map((a) => {
      const ziel = sicheresZiel(a.url);
      const beschriftung = `${a.dateiname} (${a.art})`;
      return ziel
        ? `<li><a href="${escapeHtml(ziel)}">${escapeHtml(beschriftung)}</a></li>`
        : `<li>${escapeHtml(beschriftung)}</li>`;
    })
    .join('\n');
}

/**
 * Internes Dossier für das Büro. Enthält bewusst alles: Positionen mit Netto und Brutto,
 * Positionsnotizen, interne Faktoren, strukturierte Notizen, Annahmen, fehlende Angaben,
 * Warnungen, Anhänge als Links und den Deep-Link in den Intern-Bereich.
 * Die Anhänge datenblatt.json und CSV hängt das Backend an.
 */
export function renderDossierMail(e: DossierEingabe): MailArtefakt {
  const internUrl = sicheresZiel(e.internUrl) ?? '';
  const tokens: TokenWerte = {
    ...basisTokens(e),
    status: e.status,
    quelle: e.quelle,
    dringlichkeit: e.dringlichkeit,
    triage_vorschlag: e.triageVorschlag || 'kein Vorschlag',
    entfernung_km: e.entfernungKm === null ? 'unbekannt' : `${e.entfernungKm} km`,
    intern_url: internUrl,
    positionen_tabelle: e.positionenIntern.map(positionZeileHtml).join('\n'),
    positionen_text: e.positionenIntern.map(positionZeileText).join('\n'),
    faktoren_liste: listeHtml(faktorenEintraege(e)),
    faktoren_text: listeText(faktorenEintraege(e)),
    notizen_liste: listeHtml(notizEintraege(e)),
    notizen_text: listeText(notizEintraege(e)),
    fehlende_liste: listeHtml(e.fehlendeAngaben, 'keine'),
    fehlende_text: listeText(e.fehlendeAngaben),
    warnungen_liste: listeHtml(e.warnungen),
    warnungen_text: listeText(e.warnungen),
    anhaenge_liste: anhangEintraegeHtml(e),
    anhaenge_text: listeText(e.anhaenge.map((a) => `${a.dateiname} (${a.art}): ${a.url}`)),
  };
  // Die Annahmen-Liste des Dossiers darf leer nicht verschwinden
  tokens.annahmen_liste = listeHtml(e.annahmen, 'keine');
  tokens.vorbehalte_liste = listeHtml(e.vorbehalte, 'keine');

  const mitFoerderung = Boolean(e.foerderung);
  let html = ladeText('dossier-mail.html');
  html = stripBlock(html, 'FOERDERUNG', mitFoerderung);
  html = stripBlock(html, 'WARNUNGEN', e.warnungen.length > 0);
  html = stripBlock(html, 'ANHAENGE', e.anhaenge.length > 0);
  html = fillTokens(html, tokens);

  let text = ladeText('dossier-mail.txt');
  text = stripBlock(text, 'FOERDERUNG', mitFoerderung);
  text = stripBlock(text, 'WARNUNGEN', e.warnungen.length > 0);
  text = stripBlock(text, 'ANHAENGE', e.anhaenge.length > 0);
  text = fillTokensText(text, tokens);

  const betreff = `Dossier ${e.ksNummer} ${e.kunde.nachname}, ${e.vorhabenKurz}`;
  return { betreff: betreffSicher(betreff, `Dossier ${e.ksNummer}`), html, text };
}

// ---------------------------------------------------------------------------
// Interne Markdown-Blätter
// ---------------------------------------------------------------------------

/** Freigabeblatt nach render.py, ergänzt um die Textregel-Warnungen. */
export function renderAnnahmenMd(e: DokumentEingabe, extra: { fehlendeAngaben: string[]; warnungen: string[] }): string {
  const zeilen = [
    `# Freigabe ${e.ksNummer}`,
    '',
    `Kunde: ${e.kunde.anrede} ${e.kunde.vorname} ${e.kunde.nachname}, ${e.kunde.email}`,
    `Objekt: ${e.objektAdresse}`,
    `Vorhaben: ${e.vorhabenKurz}`,
    `Vorlage: ${e.vorlage ?? ''}`,
    `Spanne netto: ${euro(e.nettoVon)} bis ${euro(e.nettoBis)} €`,
    `Spanne brutto: ${euro(e.bruttoVon)} bis ${euro(e.bruttoBis)} €`,
    `Terminvorschlag: ${e.terminvorschlag}`,
    '',
    '## Annahmen, die im PDF stehen',
    listeText(e.annahmen),
    '',
    '## Fehlende Angaben',
    listeText(extra.fehlendeAngaben),
    '',
    '## Entscheidung',
    '- freigeben: Versand zur eingestellten Versandzeit',
    '- freigeben und sofort senden',
    '- als Entwurf lassen und anpassen',
    '- verwerfen: nicht senden',
    '',
    '## Warnungen',
    listeText(extra.warnungen),
    '',
  ];
  return normalisiereZeilenenden(zeilen.join('\n'));
}

/** Abschlussbericht nach dem Versand (Aufgabe 2 des Altsystems). */
export function renderAbschlussberichtMd(e: DokumentEingabe, versand: { versandDatum: string; wiedervorlage: string }): string {
  const zeilen = [
    `# Abschlussbericht ${e.ksNummer}`,
    '',
    `Kunde: ${e.kunde.anrede} ${e.kunde.vorname} ${e.kunde.nachname}, ${e.kunde.email}`,
    `Objekt: ${e.objektAdresse}`,
    `Vorhaben: ${e.vorhabenKurz}`,
    `Vorlage: ${e.vorlage ?? ''}`,
    `Spanne netto: ${euro(e.nettoVon)} bis ${euro(e.nettoBis)} €`,
    `Spanne brutto: ${euro(e.bruttoVon)} bis ${euro(e.bruttoBis)} €`,
    `Versendet am: ${versand.versandDatum}`,
    `Wiedervorlage: ${versand.wiedervorlage}`,
    `Terminvorschlag: ${e.terminvorschlag}`,
    '',
    '## Annahmen, die im PDF stehen',
    listeText(e.annahmen),
    '',
    '## Nicht enthalten und bauseits',
    listeText(e.vorbehalte),
    '',
  ];
  return normalisiereZeilenenden(zeilen.join('\n'));
}
