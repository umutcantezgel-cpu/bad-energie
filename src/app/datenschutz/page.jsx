import React from 'react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';

export const metadata = {
    title: 'Datenschutzerklärung | Bad & Energie GmbH Wetzlar',
    description: 'Datenschutzerklärung der Bad & Energie GmbH nach DSGVO und BDSG. Informationen zur Erhebung und Verarbeitung personenbezogener Daten.',
    alternates: { canonical: 'https://bad-energie.de/datenschutz' }
};

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
                            <p><strong>Bad &amp; Energie GmbH</strong></p>
                            <p>Geschäftsführer: Sabri Demir</p>
                            <p>Hans-Sachs-Straße 12, 35576 Wetzlar</p>
                            <p>Telefon: {COMPANY_DATA.headquarters.phone}</p>
                            <p>E-Mail: {COMPANY_DATA.headquarters.email}</p>
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

                    {/* 4. SSL/TLS & Datensicherheit */}
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                        <h2 className="text-base font-bold text-slate-900">4. SSL- bzw. TLS-Verschlüsselung</h2>
                        <p>
                            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von &bdquo;http://&ldquo; auf &bdquo;https://&ldquo; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
