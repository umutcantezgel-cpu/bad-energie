import 'server-only';
import type { DokumentEingabe, DossierEingabe, EingangsbestaetigungEingabe, MailArtefakt } from '../dokumente/datenblatt';

// STUB: Vertrag der Dokumenten-Engine. Implementierung im Arbeitsstrang Dokumente.
const nichtImplementiert = (name: string) => new Error(`${name}: nicht implementiert`);

/** Zweiseitiges DIN-A4-HTML (Briefbogen) aus dem Altsystem-Template, Assets inline, Werte escaped. */
export function renderKostenschaetzungHtml(_e: DokumentEingabe): string { throw nichtImplementiert('renderKostenschaetzungHtml'); }
export function renderErstkontaktMail(_e: DokumentEingabe): MailArtefakt { throw nichtImplementiert('renderErstkontaktMail'); }
export function renderErinnerungMail(_e: DokumentEingabe): MailArtefakt { throw nichtImplementiert('renderErinnerungMail'); }
export function renderTerminmail(_e: DokumentEingabe): MailArtefakt { throw nichtImplementiert('renderTerminmail'); }
export function renderEingangsbestaetigung(_e: EingangsbestaetigungEingabe): MailArtefakt { throw nichtImplementiert('renderEingangsbestaetigung'); }
export function renderDossierMail(_e: DossierEingabe): MailArtefakt { throw nichtImplementiert('renderDossierMail'); }
/** Freigabeblatt (Markdown) nach render.py, plus Textregel-Warnungen. */
export function renderAnnahmenMd(_e: DokumentEingabe, _extra: { fehlendeAngaben: string[]; warnungen: string[] }): string { throw nichtImplementiert('renderAnnahmenMd'); }
export function renderAbschlussberichtMd(_e: DokumentEingabe, _versand: { versandDatum: string; wiedervorlage: string }): string { throw nichtImplementiert('renderAbschlussberichtMd'); }
