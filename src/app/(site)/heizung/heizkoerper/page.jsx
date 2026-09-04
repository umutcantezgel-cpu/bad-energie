import React from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Heizkörper & Design-Badheizkörper Wetzlar | COSMO & Kermi | Bad & Energie GmbH',
    description: 'Niedertemperatur-Heizkörper, Bad-Designheizkörper und Ventilkompaktheizkörper von COSMO und Kermi in Wetzlar & Lahn-Dill. Perfekt für Wärmepumpen.',
    alternates: { canonical: 'https://bad-energie.de/heizung/heizkoerper' }
};

export default function HeizkoerperPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Heizkörper &amp; Designradiatoren
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Moderne Heizkörper &amp; Bad-Designheizkörper
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Effiziente Niedertemperatur-Heizkörper für Wärmepumpen sowie elegante Design- und Handtuchwärmekörper von führenden Marken wie COSMO und Kermi.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Niedertemperatur-Heizkörper (Wärmepumpen-Heizkörper)', desc: 'Spezielle Konvektoren mit integrierten Lüftern für hohe Wärmeleistung bei Vorlauftemperaturen von nur 35–45 °C.' },
                        { title: 'COSMO Bad-Designheizkörper (z. B. Modell Wien)', desc: 'Praktisch drehbare Handtuchwärmer in weiß oder anthrazit matt – funktionale Eleganz für jedes Badezimmer.' },
                        { title: 'Flach- & Planheizkörper', desc: 'Glatte, leicht zu reinigende Fronten für moderne Wohnräume mit hoher Strahlungswärme und zeitlosem Design.' },
                        { title: 'Austausch-Heizkörper nach DIN', desc: 'Passgenaue Nabenabstände ermöglichen den schnellen Austausch alter Guss- oder Rippenheizkörper ohne Rohränderung.' },
                        { title: 'Elektrische Zusatzheizung / Mischbetrieb', desc: 'Badheizkörper mit integriertem Heizstab für warme Handtücher auch in den Übergangsmonaten bei ausgeschalteter Zentralheizung.' }
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
