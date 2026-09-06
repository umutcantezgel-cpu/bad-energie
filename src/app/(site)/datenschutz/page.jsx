import React from 'react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';

export default function DatenschutzPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 space-y-8 text-slate-800">
                    <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#0C3A87]">
                            Datenschutz nach der Datenschutz-Grundverordnung (DSGVO) &amp; BDSG
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">Datenschutzerklärung</h1>
                    </div>

                    {/* 1. Datenschutz auf einen Blick */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">1. Datenschutz auf einen Blick</h2>
                        <h3 className="font-bold text-slate-800 text-sm">Allgemeine Hinweise</h3>
                        <p>
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Datenerfassung auf dieser Website</h3>
                        <p>
                            <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt &bdquo;Hinweis zur verantwortlichen Stelle&ldquo; in dieser Datenschutzerklärung entnehmen.
                        </p>
                        <p>
                            <strong>Wie erfassen wir Ihre Daten?</strong><br />
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular, den Budgetkalkulator oder die Terminanfrage eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
                        </p>
                    </div>

                    {/* 2. Verantwortliche Stelle */}
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">2. Hinweis zur verantwortlichen Stelle</h2>
                        <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 font-medium">
                            <p><strong>{COMPANY_DATA.legalName}</strong></p>
                            <p>Geschäftsführer: {COMPANY_DATA.owner.fullName}</p>
                            <p>{COMPANY_DATA.headquarters.street}, {COMPANY_DATA.headquarters.postalCode} {COMPANY_DATA.headquarters.city}</p>
                            <p>Telefon: {COMPANY_DATA.contact.phone}</p>
                            <p>Telefax: {COMPANY_DATA.contact.fax}</p>
                            <p>E-Mail: {COMPANY_DATA.contact.email}</p>
                        </div>
                    </div>

                    {/* 3. Ihre Rechte */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">3. Ihre Rechte als betroffene Person</h2>
                        <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Auskunft über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>
                            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                            <li>Löschung Ihrer Daten (&bdquo;Recht auf Vergessenwerden&ldquo;, Art. 17 DSGVO)</li>
                            <li>Einschränkung der Datenverarbeitung (Art. 18 DSGVO)</li>
                            <li>Datenübertragbarkeit in einem strukturierten Format (Art. 20 DSGVO)</li>
                            <li>Widerruf Ihrer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
                            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
                        </ul>
                        <p className="pt-2">
                            Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
                        <p>
                            Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde zu. Zuständige Aufsichtsbehörde in Hessen ist:
                        </p>
                        <p className="font-semibold text-slate-800">
                            Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
                            Gustav-Stresemann-Ring 1, 65189 Wiesbaden<br />
                            Website: <a href="https://datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" className="text-[#0C3A87] underline">https://datenschutz.hessen.de</a>
                        </p>
                    </div>

                    {/*
                      ENTWURF ZUR FREIGABE: Die folgenden drei Abschnitte beschreiben die Verarbeitung
                      im Konfigurator und in der Kostenschätzung. Vor dem Livegang durch den Betreiber
                      rechtlich prüfen lassen (Speicherfrist, Auftragsverarbeiter, Rechtsgrundlagen).
                    */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">5. Konfigurator, Kostenschätzung und Terminanfragen</h2>
                        <h3 className="font-bold text-slate-800 text-sm">Welche Daten wir verarbeiten</h3>
                        <p>
                            Wenn Sie unseren Konfigurator ausfüllen, eine Kostenschätzung anfordern oder einen Termin anfragen, verarbeiten wir: Ihre Angaben zum Vorhaben (etwa Raumgröße, Ausstattungswunsch, bestehende Heizung, gewünschter Zeitraum), Ihre Kontaktdaten (Anrede, Vorname, Nachname, E-Mail-Adresse, Telefonnummer), die Adresse des Objekts sowie freiwillig hochgeladene Fotos. Bei einer Beratung vor Ort kommen Angaben unserer Monteure hinzu, etwa Notizen zur Baustelle und Handskizzen.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Zweck und Rechtsgrundlage</h3>
                        <p>
                            Wir verarbeiten diese Daten, um Ihre Anfrage zu beantworten, eine unverbindliche Kostenschätzung zu erstellen und einen Termin abzustimmen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage hin). Soweit Sie zusätzlich in eine Eingangsbestätigung per E-Mail oder in den Upload von Fotos einwilligen, ist Rechtsgrundlage Art. 6 Abs. 1 lit. a DSGVO. Diese Einwilligung können Sie jederzeit für die Zukunft widerrufen.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Speicherdauer</h3>
                        <p>
                            Anfragen speichern wir bis zu 24 Monate nach dem letzten Kontakt zu dem Vorhaben und löschen sie danach automatisch, einschließlich der Fotos und Dokumente. Kommt ein Auftrag zustande, gelten die handels- und steuerrechtlichen Aufbewahrungsfristen von sechs beziehungsweise zehn Jahren.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Empfänger</h3>
                        <p>
                            Für Betrieb und Versand setzen wir sorgfältig ausgewählte Dienstleister als Auftragsverarbeiter nach Art. 28 DSGVO ein: Vercel für den Betrieb der Website, Neon für die Datenbank und Vercel Blob für Dateien, jeweils mit Standort in der Europäischen Union, sowie Resend für den Versand unserer E-Mails. Eine Weitergabe zu Werbezwecken findet nicht statt.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Bestätigungslink in unseren E-Mails</h3>
                        <p>
                            In der Kostenschätzung senden wir Ihnen einen persönlichen Link, über den Sie einen der beiden Terminvorschläge bestätigen können. Der Link enthält eine zufällige Kennung ohne Rückschluss auf Ihre Person, ist 30 Tage gültig und lässt sich nur einmal einlösen. Ein Öffnen der E-Mail wird nicht nachverfolgt.
                        </p>
                        <h3 className="font-bold text-slate-800 text-sm">Widerspruch</h3>
                        <p>
                            Sie können der Verarbeitung jederzeit widersprechen und die Löschung Ihrer Anfrage verlangen. Eine formlose Nachricht an <a href="mailto:info@bad-energie.de" className="text-[#0C3A87] underline">info@bad-energie.de</a> genügt.
                        </p>
                    </div>

                    {/* 6. Speicherung im Browser */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">6. Speicherung auf Ihrem Endgerät</h2>
                        <p>
                            Damit Ihre Angaben im Konfigurator beim Blättern zwischen den Schritten erhalten bleiben, speichern wir sie vorübergehend im Sitzungsspeicher Ihres Browsers unter dem Schlüssel <span className="font-mono">be-konfigurator</span>. Ihre Kontaktdaten werden dort nicht abgelegt. Der Eintrag wird gelöscht, sobald Sie die Anfrage absenden oder von vorn beginnen, spätestens beim Schließen des Browsers. Ihre Einwilligungsentscheidung speichern wir unter <span className="font-mono">baris_consent_settings</span>, damit wir Sie nicht bei jedem Besuch erneut fragen. Beides ist technisch notwendig nach § 25 Abs. 2 TDDDG und setzt keine Einwilligung voraus.
                        </p>
                    </div>

                    {/* 7. Externe Inhalte */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">7. Externe Inhalte und Reichweitenmessung</h2>
                        <p>
                            Auf der Seite Beratung binden wir den Terminkalender von Calendly ein. Er wird erst geladen, wenn Sie ausdrücklich zustimmen. Dabei werden Ihre IP-Adresse und Angaben zu Ihrem Gerät an Calendly übertragen.
                        </p>
                        <p>
                            Analyse- und Marketingdienste wie Google Analytics oder der Meta Pixel werden ausschließlich nach Ihrer Einwilligung geladen. Ohne Einwilligung werden keine entsprechenden Skripte ausgeführt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1 TDDDG. Ihre Auswahl können Sie jederzeit über die Schaltfläche „Datenschutz“ unten links ändern.
                        </p>
                    </div>

                    {/* 8. SSL/TLS & Datensicherheit */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                        <h2 className="text-base font-bold text-slate-900">8. SSL- bzw. TLS-Verschlüsselung</h2>
                        <p>
                            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von &bdquo;http://&ldquo; auf &bdquo;https://&ldquo; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
