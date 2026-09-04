import React from 'react';
import Link from 'next/link';
import { Flame, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Öl- & Gasheizung Wetzlar | Modernisierung, Austausch & Service | Bad & Energie GmbH',
    description: 'Öl- und Gasheizungen in Wetzlar & Lahn-Dill: Brennwerttechnik, Kesselaustausch, GEG-Konformität und Umstiegsberatung auf erneuerbare Energien.',
    alternates: { canonical: 'https://bad-energie.de/heizung/oel-gasheizung' }
};

export default function OelGasheizungPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Brennwertkessel &amp; Modernisierung
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Öl- &amp; Gasheizungen: <br />
                        <span className="text-[#35A7E9]">Effizienz optimieren oder zukunftssicher umsteigen</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Ob Modernisierung auf modernste Brennwerttechnik mit Bio-Öl-/Bio-Gas-Anteil nach GEG oder der geförderte Umstieg auf eine Wärmepumpe: Wir beraten Sie herstellerunabhängig.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'GEG-konforme Beratung', desc: 'Wir klären Sie transparent über die aktuellen Vorgaben des Gebäudeenergiegesetzes (65% Erneuerbare Energien) und Übergangsfristen auf.' },
                        { title: 'Öl-Brennwerttechnik', desc: 'Hocheffiziente Öl-Brennwertkessel für Gebäude ohne Gasnetzanschluss oder als Hybridlösung mit Solarthermie.' },
                        { title: 'Öltankentsorgung & Sanierung', desc: 'Fachgerechter Rückbau und Entsorgung alter Stahltanks oder Batterietanks durch zertifizierte Fachbetriebe.' },
                        { title: 'Brennertausch & Kundendienst', desc: 'Regelmäßige Wartung, Düsentausch und präzise Abgasmessung für geringste Emissionswerte.' },
                        { title: 'Bis zu 70 % Austausch-Prämie', desc: 'Tauschen Sie Ihre alte Öl- oder Gasheizung gegen eine NIBE Wärmepumpe und sichern Sie sich maximale staatliche Fördermittel.' }
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
