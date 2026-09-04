import React from 'react';
import Link from 'next/link';
import { Snowflake, Sun, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Zap } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Klimaanlage Wetzlar | Split-Klimageräte & Inverter | Bad & Energie GmbH',
    description: 'Klimaanlagen & Split-Klimageräte in Wetzlar & Lahn-Dill: Angenehm kühlen im Sommer, effizient heizen im Winter. Flüsterleise Marken-Invertertechnik.',
    alternates: { canonical: 'https://bad-energie.de/lueftung/klimaanlage' }
};

export default function KlimaanlagePage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Split-Klimaanlagen &amp; Luft-Luft-Wärmepumpen
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Moderne Klimaanlagen für Ihr Zuhause
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Entspannt schlafen im Sommer und behaglich wärmen im Winter: Moderne Inverter-Split-Klimageräte regulieren Raumtemperatur und Luftfeuchtigkeit flüsterleise und energieeffizient.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Klimaanlagen-Beratung anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Kühlen im Sommer & Heizen im Winter', desc: 'Als effiziente Luft-Luft-Wärmepumpen können moderne Split-Klimageräte an kalten Tagen blitzschnell angenehme Wärme spenden.' },
                        { title: 'Single- & Multi-Split Systeme', desc: 'Versorgen Sie wahlweise nur das Schlafzimmer oder bis zu fünf verschiedene Räume mit nur einem einzigen Außengerät.' },
                        { title: 'Inverter-Technologie (A+++)', desc: 'Stufenlose Drehzahlregelung verhindert energieintensive Ein-/Ausschaltzyklen und spart bis zu 40 % Strom.' },
                        { title: 'Integrierte Luftentfeuchtung', desc: 'Schwüle Sommerluft wird effektiv entfeuchtet – für erholsamen Schlaf und optimales Wohlbefinden.' },
                        { title: 'App- & WLAN-Steuerung', desc: 'Schalten Sie die Klimaanlage schon vom Büro oder unterwegs aus ein und betreten Sie ein perfekt temperiertes Zuhause.' },
                        { title: 'Kombination mit Photovoltaik', desc: 'Klimaanlagen kühlen genau dann am stärksten, wenn die Sonne scheint und die PV-Anlage auf dem Dach kostenlosen Solarstrom liefert.' }
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
