import React from 'react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';

export const metadata = {
    title: 'Erklärung zur Barrierefreiheit | BFSG & EN 301 549 | Bad & Energie GmbH',
    description: 'Erklärung zur digitalen Barrierefreiheit der Bad & Energie GmbH gemäß Barrierefreiheitsstärkungsgesetz (BFSG) und europäischen Standards EN 301 549.',
    alternates: { canonical: 'https://bad-energie.de/barrierefreiheit' }
};

export default function BarrierefreiheitPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 space-y-8 text-slate-800">
                    <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#0C3A87]">
                            Barrierefreiheitsstärkungsgesetz (BFSG) &middot; EN 301 549 / WCAG 2.1 AA
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">Erklärung zur Barrierefreiheit</h1>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <p>
                            Die <strong>Bad &amp; Energie GmbH</strong> ist bemüht, ihre Website im Einklang mit den nationalen Rechtsvorschriften zur Umsetzung des Barrierefreiheitsstärkungsgesetzes (BFSG) sowie den Vorgaben der europäischen Norm <strong>EN 301 549</strong> (Web Content Accessibility Guidelines WCAG 2.1 auf Konformitätsstufe AA) barrierefrei zugänglich zu machen.
                        </p>
                        <p>
                            Diese Erklärung zur Barrierefreiheit gilt für das Webangebot unter <a href="https://bad-energie.de" className="text-[#0C3A87] underline font-semibold">https://bad-energie.de</a>.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">Stand der Vereinbarkeit mit den Anforderungen</h2>
                        <p>
                            Dieses Webangebot ist mit den Vorgaben der WCAG 2.1 Stufe AA größtenteils vereinbar. Folgende Maßnahmen wurden implementiert:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5">
                            <li>Vollständige semantische HTML5-Strukturierung (Überschriftenhierarchien H1–H4, ARIA-Landmarks)</li>
                            <li>Tastaturnavigierbarkeit aller interaktiven Menüs, Schaltflächen, Funnels und Rechner</li>
                            <li>Hohe Farbkontrastverhältnisse (mindestens 4,5:1 für Fließtexte und 3:1 für Bedienelemente)</li>
                            <li>Auszeichnung von Alternativtexten für informative Bildelemente</li>
                            <li>Skalierbarkeit von Schriften und responsive Darstellbarkeit ohne horizontalen Bildlauf</li>
                        </ul>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">Feedback und Kontaktangaben</h2>
                        <p>
                            Sind Ihnen Mängel beim barrierefreien Zugang zu Inhalten von <a href="https://bad-energie.de" className="text-[#0C3A87] underline">https://bad-energie.de</a> aufgefallen? Oder haben Sie Fragen zur Umsetzung der Barrierefreiheit? Sie können sich jederzeit bei uns melden:
                        </p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-medium text-slate-800">
                            <p><strong>{COMPANY_DATA.legalName}</strong></p>
                            <p>Ansprechpartner: {COMPANY_DATA.owner.fullName}</p>
                            <p>{COMPANY_DATA.headquarters.street}, {COMPANY_DATA.headquarters.postalCode} {COMPANY_DATA.headquarters.city}</p>
                            <p>Telefon: {COMPANY_DATA.contact.phone}</p>
                            <p>Telefax: {COMPANY_DATA.contact.fax}</p>
                            <p>E-Mail: <a href={`mailto:${COMPANY_DATA.contact.email}`} className="text-[#0C3A87] underline">{COMPANY_DATA.contact.email}</a></p>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                        <h2 className="text-base font-bold text-slate-900">Durchsetzungsverfahren / Schlichtungsstelle</h2>
                        <p>
                            Sollten Sie auf Mitteilungen oder Anfragen zur Barrierefreiheit innerhalb von sechs Wochen keine zufriedenstellende Antwort erhalten, können Sie sich an die Schlichtungsstelle nach dem Behindertengleichstellungsgesetz (BGG) wenden:
                        </p>
                        <p className="font-semibold text-slate-800">
                            Schlichtungsstelle nach dem Behindertengleichstellungsgesetz bei dem Beauftragten der Bundesregierung für die Belange von Menschen mit Behinderungen<br />
                            Mauerstraße 53, 10117 Berlin<br />
                            Telefon: 030 18 527-2805<br />
                            E-Mail: <a href="mailto:info@schlichtungsstelle-bgg.de" className="text-[#0C3A87] underline">info@schlichtungsstelle-bgg.de</a><br />
                            Website: <a href="https://www.schlichtungsstelle-bgg.de" target="_blank" rel="noopener noreferrer" className="text-[#0C3A87] underline">www.schlichtungsstelle-bgg.de</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
