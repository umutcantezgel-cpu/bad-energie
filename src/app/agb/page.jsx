import React from 'react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';

export const metadata = {
    title: 'AGB | Allgemeine Geschäftsbedingungen | Bad & Energie GmbH Wetzlar',
    description: 'Allgemeine Geschäftsbedingungen (AGB) der Bad & Energie GmbH für Handwerks-, Montage- und Wartungsleistungen in Wetzlar & Lahn-Dill.',
    alternates: { canonical: 'https://bad-energie.de/agb' }
};

export default function AGBPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 space-y-8 text-slate-800">
                    <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#0C3A87]">
                            Geschäftsbedingungen für Werk- und Montageleistungen
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">Allgemeine Geschäftsbedingungen (AGB)</h1>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">§ 1 Geltungsbereich &amp; Vertragspartner</h2>
                        <p>
                            (1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über Lieferungen, Montage-, Installations- und Wartungsleistungen zwischen der <strong>Bad &amp; Energie GmbH</strong>, Hans-Sachs-Straße 12, 35576 Wetzlar (nachfolgend &bdquo;Auftragnehmer&ldquo;) und ihren Kunden (nachfolgend &bdquo;Auftraggeber&ldquo;).
                        </p>
                        <p>
                            (2) Abweichende oder ergänzende Bedingungen des Auftraggebers werden nicht Vertragsbestandteil, es sei denn, der Auftragnehmer stimmt ihrer Geltung ausdrücklich schriftlich zu.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">§ 2 Angebot, Festpreis &amp; Vertragsschluss</h2>
                        <p>
                            (1) Angebote des Auftragnehmers sind, sofern nicht ausdrücklich als verbindlich gekennzeichnet, freibleibend.
                        </p>
                        <p>
                            (2) Ein verbindlicher Vertrag kommt durch schriftliche Auftragsbestätigung oder durch Beginn der Ausführungsarbeiten zustande.
                        </p>
                        <p>
                            (3) Sofern ein Festpreis vereinbart wurde, gilt dieser für die im Angebot exakt beschriebenen Leistungen. Mehrleistungen, die auf nachträglichen Sonderwünschen des Auftraggebers oder unvorhersehbaren bauseitigen Hindernissen beruhen, werden gesondert nach tatsächlichem Aufwand bzw. Nachtragsangebot vergütet.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">§ 3 Ausführungsfristen &amp; Mitwirkungspflichten</h2>
                        <p>
                            (1) Ausführungsfristen sind verbindlich, sofern sie im Bauzeitenplan schriftlich fixiert wurden.
                        </p>
                        <p>
                            (2) Der Auftraggeber sorgt für ungehinderten Zugang zur Baustelle sowie die kostenlose Bereitstellung von Wasser und Baustrom.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">§ 4 Abnahme &amp; Gewährleistung</h2>
                        <p>
                            (1) Nach Fertigstellung der Leistung erfolgt eine gemeinsame förmliche Abnahme.
                        </p>
                        <p>
                            (2) Für Werkleistungen an Bauwerken (Badsanierungen, Heizungsinstallationen) gilt die gesetzliche Gewährleistungsfrist nach BGB (5 Jahre). Für Wartungs- und Reparaturarbeiten gilt die gesetzliche Frist von 2 Jahren bzw. die Bedingungen des Herstellers (z. B. 5 Jahre NIBE Systemgarantie).
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                        <h2 className="text-base font-bold text-slate-900">§ 5 Gerichtsstand &amp; Schlussbestimmungen</h2>
                        <p>
                            (1) Es gilt das Recht der Bundesrepublik Deutschland.
                        </p>
                        <p>
                            (2) Erfüllungsort und Gerichtsstand für alle Streitigkeiten mit Kaufleuten oder juristischen Personen des öffentlichen Rechts ist <strong>Wetzlar</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
