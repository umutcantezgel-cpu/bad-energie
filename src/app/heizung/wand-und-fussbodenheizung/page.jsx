import React from 'react';
import Link from 'next/link';
import { Sun, CheckCircle2, ShieldCheck, Zap, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Wand- & Fußbodenheizung Wetzlar | Behagliche Strahlungswärme | Bad & Energie GmbH',
    description: 'Flächenheizungen für Neubau & Altbausanierung in Wetzlar. Fußbodenheizung einfräsen, Dünnbettsysteme & Wandheizung. Perfekt für Wärmepumpen.',
    alternates: { canonical: 'https://bad-energie.de/heizung/wand-und-fussbodenheizung' }
};

export default function WandFussbodenheizungPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Flächenheizung &amp; Strahlungswärme
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Wand- &amp; Fußbodenheizung: <br />
                        <span className="text-[#35A7E9]">Maximale Behaglichkeit bei niedrigsten Vorlauftemperaturen</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Die ideale Ergänzung zu Ihrer NIBE Wärmepumpe. Niedrige Systemtemperaturen (ca. 30–35 °C) sparen Energie und erzeugen ein gleichmäßiges, staubfreies Wohlfühlklima.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Nachträgliches Einfräsen im Altbau', desc: 'In bestehende Estriche fräsen wir staubarm Kanäle für die Heizrohre ein – ganz ohne Aufbauhöhe oder Türenkürzen in nur 1–2 Tagen.' },
                        { title: 'Dünnschichtsysteme & Trockenbau', desc: 'Mit nur 15–20 mm Aufbauhöhe ideal für Holzbalkendecken und Sanierungen bei begrenzter Raumhöhe.' },
                        { title: 'Wandheizung für Allergiker', desc: 'Angenehme Strahlungswärme über die Wandfläche verhindert Luftverwirbelungen und trockene Schleimhäute.' },
                        { title: 'Perfekt für Wärmepumpen-Effizienz', desc: 'Jedes Grad weniger Vorlauftemperatur spart rund 2,5 % Heizstrom und erhöht die Jahresarbeitszahl Ihrer Wärmepumpe.' },
                        { title: 'Einzelraumregelung mit Smarthome', desc: 'Präzise Raumthermostate steuern jeden Raum bedarfsgerecht – auch bequem per Smartphone App.' }
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
