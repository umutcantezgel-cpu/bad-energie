import React from 'react';
import Link from 'next/link';
import { Sun, Zap, Battery, CheckCircle2, ArrowRight, ShieldCheck, Phone, Calendar } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Regenerative Energien & Solar Wetzlar | Photovoltaik & Solarthermie | Bad & Energie GmbH',
    description: 'Erneuerbare Energien in Wetzlar & Lahn-Dill: Photovoltaik, Stromspeicher & Solarthermie zur optimalen Kopplung mit NIBE Wärmepumpen.',
    alternates: { canonical: 'https://bad-energie.de/energie' }
};

export default function EnergiePage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Sonnenkraft &middot; Sektorenkopplung
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Regenerative Energien &amp; Solarsysteme
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Machen Sie sich unabhängig von steigenden Strom- und Heizölpreisen. Wir kombinieren Photovoltaik, Stromspeicher und Solarthermie mit modernen Wärmepumpen zu hocheffizienten Gesamtsystemen.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Solar-Potenzialanalyse anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sub-Services Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: 'Photovoltaik & Stromspeicher', desc: 'Erzeugen Sie Ihren eigenen Strom für Haushalt, E-Auto und Wärmepumpe mit modernsten Glas-Glas-Modulen und Batteriespeichern.', path: '/energie/photovoltaik', icon: Zap },
                        { title: 'Solarthermie', desc: 'Kostenlose Sonnenwärme für die Warmwasserbereitung und Heizungsunterstützung spart bis zu 60 % Warmwasserkosten.', path: '/energie/solarthermie', icon: Sun }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.path}
                                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl hover:border-[#0C3A87] transition-all group block"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h2 className="font-bold text-lg text-slate-900 group-hover:text-[#0C3A87] transition-colors mb-2">
                                    {item.title}
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                                <span className="text-xs font-bold text-[#0C3A87] flex items-center gap-1">
                                    <span>Details ansehen</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
