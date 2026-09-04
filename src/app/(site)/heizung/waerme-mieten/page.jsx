import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Clock } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Wärme mieten Wetzlar | Heizungs-Contracting ohne Anschaffungskosten | Bad & Energie GmbH',
    description: 'Heizung mieten statt kaufen in Wetzlar & Lahn-Dill: 0 € Anschaffungskosten, inklusive Installation, Wartung, Schornsteinfeger und 24/7 Notdienst.',
    alternates: { canonical: 'https://bad-energie.de/heizung/waerme-mieten' }
};

export default function WaermeMietenPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Heizungs-Contracting Modell
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Wärme mieten: <br />
                        <span className="text-[#35A7E9]">Moderne Heizung für 0 € Anschaffungskosten</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Genießen Sie hocheffiziente Markenheiztechnik ganz ohne hohe Anfangsinvestition. In einer festen monatlichen Rate sind Installation, Wartung, Reparaturen und Notdienst komplett enthalten.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: '0 € Anschaffungskosten', desc: 'Keine hohe Einmalzahlung notwendig – schonen Sie Ihr Erspartes für andere wichtige Projekte im Eigenheim.' },
                        { title: '100 % Rundum-Sorglos-Garantie', desc: 'Sämtliche Wartungen, Verschleißreparaturen, Ersatzteile und Schornsteinfegergebühren sind über die gesamte Vertragslaufzeit abgedeckt.' },
                        { title: 'Sofortige Heizkostensenkung', desc: 'Durch den Einbau modernster Wärmepumpen- oder Brennwerttechnik sinkt Ihr Brennstoff- bzw. Stromverbrauch sofort spürbar.' },
                        { title: '24/7 Notdienst-Priorität', desc: 'Als Mietkunde genießen Sie bevorzugten Kundendienst- und Notfalleinsatz durch unser Meisterteam.' },
                        { title: 'Flexible Vertragslaufzeiten', desc: 'Transparente monatliche Raten über 10 bis 15 Jahre – nach Ablauf Übernahme zum Restwert oder Kesseltausch.' }
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
