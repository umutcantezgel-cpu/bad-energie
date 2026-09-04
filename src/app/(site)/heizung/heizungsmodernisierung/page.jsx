import React from 'react';
import Link from 'next/link';
import { Flame, Zap, Award, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, BadgePercent } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Heizungsmodernisierung Wetzlar | Heizungstausch & GEG-Fahrplan | Bad & Energie GmbH',
    description: 'Heizung modernisieren in Wetzlar & Lahn-Dill: Schritt für Schritt vom Altbau zur effizienten Wärmepumpe mit bis zu 70% staatlicher Förderung.',
    alternates: { canonical: 'https://bad-energie.de/heizung/heizungsmodernisierung' }
};

export default function HeizungsmodernisierungPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Leitfaden für Hausbesitzer
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Heizungsmodernisierung in Wetzlar: <br />
                        <span className="text-[#35A7E9]">Zukunftssicher umrüsten mit bis zu 70 % Förderung</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Ist Ihre Heizung älter als 15 oder 20 Jahre? Ein rechtzeitiger Tausch schützt vor teuren Havarien im tiefsten Winter, senkt Ihre Heizkosten um bis zu 60 % und erfüllt alle gesetzlichen Vorgaben des Gebäudeenergiegesetzes (GEG).
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/heizung/heizungskonfigurator"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Heizungstausch berechnen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { step: '1. Analyse', title: 'Heizlast- & Gebäudecheck', desc: 'Wir analysieren den Dämmzustand, bisherigen Verbrauch und die Dimensionierung Ihrer Heizkörper.' },
                        { step: '2. Konzept', title: 'System- & Förderauswahl', desc: 'Wir vergleichen Wärmepumpe, Hybrid und Pelletheizung und ermitteln die maximale Zuschusshöhe.' },
                        { step: '3. Antrag', title: 'KfW-Förderbegleitung', desc: 'Wir erstellen den Bestätigungsantrag (BzA) für die KfW 458 Heizungsförderung, bevor der Auftrag startet.' },
                        { step: '4. Montage', title: 'Meisterhafte Installation', desc: 'Sauberer Rückbau des Altsystems, Einbau der neuen NIBE Anlage und hydraulischer Abgleich.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <span className="text-xs font-black text-[#E4040E] uppercase tracking-wider block mb-1">{item.step}</span>
                                <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <TouchConfigurator modus="kunde" journey="heizung" quelle="web_heizung" />
            </div>
        </div>
    );
}
