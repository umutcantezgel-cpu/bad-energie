import React from 'react';
import Link from 'next/link';
import { Flame, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Flüssiggas-Heizung Wetzlar | Flüssiggastank & Brennwerttechnik | Bad & Energie GmbH',
    description: 'Flüssiggasanlagen in Wetzlar & Umgebung: Unabhängige Wärmeversorgung ohne Erdgasanschluss. Unterirdische Tanks, Brennwertthermen & Zertifizierung.',
    alternates: { canonical: 'https://bad-energie.de/heizung/fluessiggas' }
};

export default function FluessiggasPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Unabhängige Gasversorgung
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Flüssiggas-Heizungen: <br />
                        <span className="text-[#35A7E9]">Komfortable Gaswärme auch ohne öffentliches Gasnetz</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Die ideale Lösung für ländliche Gebiete im Lahn-Dill-Kreis. Flüssiggas verbrennt sauber, ist lagerfähig im oberirdischen oder unsichtbaren Erdtank und beliebig mit Solaranlagen kombinierbar.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Unterirdische oder oberirdische Tanks', desc: 'Erdgedeckte Tanks verschwinden komplett unsichtbar im Garten – nur der begehbare Domschacht bleibt sichtbar.' },
                        { title: 'Saubere Verbrennung', desc: 'Flüssiggas verbrennt rußfrei und stößt im Vergleich zu Heizöl deutlich weniger Feinstaub und CO2 aus.' },
                        { title: 'Hybridsysteme mit Wärmepumpe', desc: 'Flüssiggas-Brennwertkessel dienen als ideale Spitzenlastunterstützung bei sehr kalten Außentemperaturen.' },
                        { title: 'Zertifizierter Fachbetrieb (TRF)', desc: 'Fachgerechte Leitungsverlegung, Druckprüfung und Dichtheitsprüfung nach den Technischen Regeln Flüssiggas (TRF).' },
                        { title: 'Umrüstung von Erdgas auf Flüssiggas', desc: 'Bestehende Gas-Brennwertthermen können oft mit wenigen Handgriffen und Düsenwechsel auf Flüssiggas umgestellt werden.' }
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
