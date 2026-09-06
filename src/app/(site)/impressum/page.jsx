import React from 'react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';

export default function ImpressumPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-8 sm:p-12 space-y-8 text-slate-800">
                        <div>
                            <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-full inline-block border border-blue-200/60 shadow-xs mb-2">
                                Rechtliche Pflichtangaben nach § 5 Digitale-Dienste-Gesetz (DDG)
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Impressum</h1>
                        </div>

                        {/* Company Details */}
                        <div className="space-y-2 border-b border-slate-200/60 pb-6 text-xs sm:text-sm">
                            <h2 className="text-base font-black text-slate-900">Angaben gemäß § 5 DDG:</h2>
                            <p className="font-black text-slate-900">Bad &amp; Energie GmbH</p>
                            <p>Hans-Sachs-Straße 12</p>
                            <p>35576 Wetzlar</p>
                            <p className="text-xs text-slate-500 font-medium pt-1">
                                Zweiter Standort / Betriebsstätte: Siegmund-Hiepe-Straße 20, 35578 Wetzlar
                            </p>
                        </div>

                        {/* Representation */}
                        <div className="space-y-2 border-b border-slate-200/60 pb-6 text-xs sm:text-sm">
                            <h2 className="text-base font-black text-slate-900">Vertreten durch:</h2>
                            <p>Geschäftsführer: <strong className="text-slate-900 font-black">{COMPANY_DATA.owner.fullName}</strong></p>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2 border-b border-slate-200/60 pb-6 text-xs sm:text-sm">
                            <h2 className="text-base font-black text-slate-900">Kontakt:</h2>
                            <p>Telefon: <a href={`tel:${COMPANY_DATA.headquarters.phoneLink}`} className="text-[#0C3A87] font-black underline">{COMPANY_DATA.headquarters.phone}</a></p>
                            <p>Telefon (Standort Lahn-Dill): <a href={`tel:${COMPANY_DATA.branchLahnDill.phoneLink}`} className="text-[#0C3A87] font-black underline">{COMPANY_DATA.branchLahnDill.phone}</a></p>
                            <p>Telefax: {COMPANY_DATA.branchLahnDill.fax}</p>
                            <p>E-Mail: <a href={`mailto:${COMPANY_DATA.headquarters.email}`} className="text-[#0C3A87] font-black underline">{COMPANY_DATA.headquarters.email}</a></p>
                            <p>E-Mail (Allgemein): <a href={`mailto:${COMPANY_DATA.branchLahnDill.email}`} className="text-[#0C3A87] font-black underline">{COMPANY_DATA.branchLahnDill.email}</a></p>
                        </div>

                        {/* Register & Tax */}
                        <div className="space-y-2 border-b border-slate-200/60 pb-6 text-xs sm:text-sm">
                            <h2 className="text-base font-black text-slate-900">Registereintragung:</h2>
                            <p>Eintragung im Handelsregister.</p>
                            <p>Registergericht: <strong className="text-slate-900 font-black">{COMPANY_DATA.tax.court}</strong></p>
                            <p>Registernummer: <strong className="text-slate-900 font-black">{COMPANY_DATA.tax.registerNumber}</strong></p>
                            <p className="pt-2">Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: <strong className="text-slate-900 font-black">{COMPANY_DATA.tax.ustId}</strong></p>
                            <p>Steuernummer: <strong className="text-slate-900 font-black">{COMPANY_DATA.tax.taxNumber}</strong></p>
                        </div>

                        {/* Chamber & Professional Regulation */}
                        <div className="space-y-2 border-b border-slate-200/60 pb-6 text-xs sm:text-sm">
                            <h2 className="text-base font-black text-slate-900">Zuständige Kammer &amp; Aufsichtsbehörde:</h2>
                            <p>Handwerkskammer Wiesbaden</p>
                            <p>Bierstadter Str. 45, 65189 Wiesbaden</p>
                            <p className="pt-2">Berufsbezeichnung: Meisterbetrieb für Sanitär-, Heizungs- und Klimatechnik (verliehen in der Bundesrepublik Deutschland)</p>
                            <p>Berufsrechtliche Regelungen: Handwerksordnung (HwO) (einsehbar unter: <a href="https://www.gesetze-im-internet.de/hwo/" target="_blank" rel="noopener noreferrer" className="text-[#0C3A87] underline font-semibold">www.gesetze-im-internet.de/hwo/</a>)</p>
                        </div>

                        {/* Dispute Resolution */}
                        <div className="space-y-3 border-b border-slate-200/60 pb-6 text-xs text-slate-600 leading-relaxed font-medium">
                            <h2 className="text-base font-black text-slate-900">Verbraucherstreitbeilegung / Universalschlichtungsstelle:</h2>
                            <p>
                                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                            </p>
                            <p>
                                Plattform der EU-Kommission zur Online-Streitbeilegung: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#0C3A87] underline font-bold">https://ec.europa.eu/consumers/odr</a>. Unsere E-Mail-Adresse finden Sie oben im Impressum.
                            </p>
                        </div>

                        {/* Disclaimers */}
                        <div className="space-y-4 text-xs text-slate-500 leading-relaxed font-medium">
                            <h3 className="font-black text-slate-800 text-sm">Haftung für Inhalte</h3>
                            <p>
                                Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                            </p>

                            <h3 className="font-black text-slate-800 text-sm">Haftung für Links</h3>
                            <p>
                                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                            </p>

                            <h3 className="font-black text-slate-800 text-sm">Urheberrecht</h3>
                            <p>
                                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
