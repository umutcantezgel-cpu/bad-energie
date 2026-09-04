import React from 'react';
import Link from 'next/link';
import { Sliders, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, BadgePercent } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Heizungscheck & Hydraulischer Abgleich Wetzlar | Verfahren B | Bad & Energie GmbH',
    description: 'Hydraulischer Abgleich nach Verfahren B & Heizungsprüfung nach DIN EN 15378 in Wetzlar & Lahn-Dill. Voraussetzung für bis zu 70% KfW-Förderung.',
    alternates: { canonical: 'https://bad-energie.de/heizung/heizungscheck' }
};

export default function HeizungscheckPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        DIN EN 15378 &middot; Verfahren B
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Heizungscheck &amp; Hydraulischer Abgleich
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Verhindern Sie glühend heiße Heizkörper im Erdgeschoss und kalte Zimmer im Obergeschoss. Ein fachgerechter hydraulischer Abgleich optimiert die Wärmeverteilung, spart bis zu 15 % Energiekosten und ist Pflicht für staatliche KfW-Zuschüsse.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Verfahren B (Raumweise Heizlastberechnung)', desc: 'Exakte Berechnung der Heizlast für jeden einzelnen Raum nach DIN EN 12831 – vom Bundesamt (BAFA/KfW) gefordert für maximale Fördersätze.' },
                        { title: 'Voreinstellbare Thermostatventile', desc: 'Austausch alter Ventile gegen moderne, stufenlos voreinstellbare Ventilunterteile zur exakten Begrenzung des Volumenstroms.' },
                        { title: 'Hocheffizienz-Umwälzpumpen', desc: 'Optimierung oder Austausch der Heizkreispumpe gegen elektronisch geregelte Hocheffizienzpumpen spart bis zu 80 % Pumpenstrom.' },
                        { title: 'Beseitigung von Fließgeräuschen', desc: 'Rauschen und Pfeifen in den Leitungen und Heizkörpern wird durch die präzise Einregulierung zuverlässig eliminiert.' },
                        { title: 'Offizielles VdZ-Bestätigungsformular', desc: 'Wir händigen Ihnen das formal gültige VdZ-Formular für Ihren KfW- und Steuer-Förderantrag aus.' }
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
                <HeizungKonfigurator />
            </div>
        </div>
    );
}
