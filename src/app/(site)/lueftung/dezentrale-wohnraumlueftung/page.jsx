import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Dezentrale Wohnraumlüftung Wetzlar | Nachrüstung ohne Rohre | Bad & Energie GmbH',
    description: 'Dezentrale Lüftung mit Keramik-Wärmespeicher in Wetzlar & Lahn-Dill. Schnelle Nachrüstung per Kernbohrung, Schimmelschutz & bis zu 90% Wärmerückgewinnung.',
    alternates: { canonical: 'https://bad-energie.de/lueftung/dezentrale-wohnraumlueftung' }
};

export default function DezentraleWohnraumlueftungPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Perfekt für Sanierung &amp; Nachrüstung
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Dezentrale Wohnraumlüftung
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Frische Luft in einzelnen Räumen oder im ganzen Haus – ohne aufwändige Rohrleitungsverlegung. Schnelle Montage direkt in die Außenwand mittels Kernbohrung.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Reversierender Pendellüfter mit Keramikspeicher', desc: 'Alle 70 Sekunden wechselt der Lüfter die Richtung: Erst speichert der Keramikkörper die Abluftwärme, dann gibt er sie an die einströmende Frischluft ab.' },
                        { title: 'Paarweiser Dialog-Betrieb', desc: 'Zwei Geräte arbeiten synchron über Funk miteinander: Während eines entlüftet, belüftet das andere, sodass kein störender Unterdruck entsteht.' },
                        { title: 'Saubere Kernbohrung in wenigen Stunden', desc: 'Einbau in 160 mm oder 200 mm Kernbohrung – minimaler Schmutzaufwand bei bewohnten Räumen.' },
                        { title: 'Gezielte Entlüftung von Feuchträumen', desc: 'Abluftgeräte mit Feuchtesensor für Bad und WC verhindern zuverlässig Schimmelbildung nach dem Duschen.' },
                        { title: 'Flüsterleise für Schlafzimmer', desc: 'Spezielle Schalldämmmatten und strömungsoptimierte Lüfterräder garantieren ungestörten Schlaf bei geöffneter Lüftung.' }
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
        </div>
    );
}
