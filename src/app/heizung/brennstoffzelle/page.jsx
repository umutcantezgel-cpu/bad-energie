import React from 'react';
import Link from 'next/link';
import { Zap, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Brennstoffzelle & BHKW Wetzlar | Strom & Wärme gleichzeitig erzeugen | Bad & Energie GmbH',
    description: 'Brennstoffzellenheizungen und Blockheizkraftwerke (BHKW) in Wetzlar & Lahn-Dill. Kraft-Wärme-Kopplung für maximale Energieautarkie.',
    alternates: { canonical: 'https://bad-energie.de/heizung/brennstoffzelle' }
};

export default function BrennstoffzellePage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Kraft-Wärme-Kopplung (KWK)
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Brennstoffzellen &amp; BHKW: <br />
                        <span className="text-[#35A7E9]">Gleichzeitige Erzeugung von eigenem Strom &amp; Wärme</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Werden Sie zum Selbstversorger. Brennstoffzellenheizungen wandeln Erdgas oder Flüssiggas über eine elektrochemische Reaktion hocheffizient in Strom und Heizwärme um.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Dezentrale Stromerzeugung', desc: 'Produzieren Sie den Strom für Haushalt und E-Auto direkt im Keller – das senkt Strombezugskosten um bis zu 40–60 %.' },
                        { title: 'Geräuschlos & emissionsarm', desc: 'Brennstoffzellen arbeiten ohne mechanische Kolben oder Turbinen fast geräuschlos und mit minimalen Schadstoffemissionen.' },
                        { title: 'Integrierter Spitzenlastkessel', desc: 'An besonders kalten Wintertagen schaltet sich automatisch ein integrierter Brennwertbrenner für sichere Wärmeversorgung zu.' },
                        { title: 'Mini-BHKW für Mehrfamilienhäuser', desc: 'Blockheizkraftwerke mit Verbrennungsmotor eignen sich hervorragend für Mehrfamilienhäuser, Hotels und Gewerbebetriebe mit hohem Wärmebedarf.' },
                        { title: 'Einspeisevergütung nach KWKG', desc: 'Für überschüssigen Strom, der nicht im Gebäude verbraucht wird, erhalten Sie eine garantierte Vergütung nach dem Kraft-Wärme-Kopplungs-Gesetz.' }
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
