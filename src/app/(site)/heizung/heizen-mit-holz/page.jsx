import React from 'react';
import Link from 'next/link';
import { Flame, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Heizen mit Holz & Pellets Wetzlar | CO2-neutrale Biomasse | Bad & Energie GmbH',
    description: 'Pelletheizungen, Holzvergaserkessel & Hackschnitzelanlagen in Wetzlar & Lahn-Dill. Bis zu 70% BEG-Förderung mit Staubemissionsbonus.',
    alternates: { canonical: 'https://bad-energie.de/heizung/heizen-mit-holz' }
};

export default function HeizenMitHolzPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Biomasse &amp; Erneuerbare Wärme
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Heizen mit Holz &amp; Pellets: <br />
                        <span className="text-[#35A7E9]">CO2-neutral, krisensicher &amp; regional</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Nutzen Sie heimisches Holz als nachhaltige Energiequelle. Vollautomatische Pelletkessel oder robuste Holzvergaserkessel bieten hohen Komfort und attraktive Förderungen.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Vollautomatische Pelletheizung', desc: 'Automatischer Brennstofftransport vom Lagerraum zum Kessel, automatische Zündung und Ascheaustragung für höchsten Bedienkomfort.' },
                        { title: 'Holzvergaserkessel (Stückholz)', desc: 'Hocheffiziente Verbrennung von Scheitholz mit Pufferspeicher. Ideal für Waldbesitzer und Kunden mit eigenem Holzzugang.' },
                        { title: 'Kombikessel (Holz & Pellets)', desc: 'Flexibler Betrieb: Heizen mit günstigem Scheitholz, wenn Zeit da ist – und automatische Umschaltung auf Pellets bei Abwesenheit.' },
                        { title: 'Kombination mit Solarthermie', desc: 'Im Sommer bleibt der Pelletkessel komplett ausgeschaltet, während Solarkollektoren das Warmwasser kostenlos erwärmen.' },
                        { title: 'Emissionsbonus (+2.500 €)', desc: 'Besonders staubarme Pelletkessel mit Partikelfilter (Staubgehalt < 2,5 mg/m³) erhalten einen zusätzlichen BEG-Bonus.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
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
