import React from 'react';
import Link from 'next/link';
import { Zap, Battery, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Sun } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Photovoltaik & Stromspeicher Wetzlar | Solarstrom & Wärmepumpe | Bad & Energie GmbH',
    description: 'Photovoltaikanlagen mit Batteriespeicher in Wetzlar & Lahn-Dill: Eigener Solarstrom für Haushalt, NIBE Wärmepumpe & Wallbox. 0% Mehrwertsteuer.',
    alternates: { canonical: 'https://bad-energie.de/energie/photovoltaik' }
};

export default function PhotovoltaikPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        0 % MwSt. auf PV &middot; Eigene Energiezentrale
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Photovoltaik &amp; Stromspeicher
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Produzieren Sie Ihren eigenen sauberen Strom. Durch die intelligente Kopplung von Photovoltaik und NIBE Wärmepumpe betreiben Sie Ihre Heizung im Frühjahr, Sommer und Herbst nahezu kostenlos.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            PV-Beratung anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Smarte Wärmepumpen-Kopplung (SG Ready)', desc: 'Wenn die PV-Anlage Überschussstrom liefert, hebt die NIBE Wärmepumpe automatisch die Speichertemperatur an und speichert Energie thermisch.' },
                        { title: 'Hochleistungs-Batteriespeicher mit Notstrom', desc: 'Lithium-Eisenphosphat-Speicher (LFP) sichern höchste Zyklenfestigkeit und versorgen das Haus auch nachts und bei Stromausfall zuverlässig.' },
                        { title: 'Glas-Glas PV-Module mit 30 Jahren Garantie', desc: 'Maximale Robustheit gegen Hagel, Schneelast und Witterung mit bifazialer Technologie für bis zu 25 % Mehrertrag.' },
                        { title: '0 % Mehrwertsteuer für private Betreiber', desc: 'Kauf und Installation von PV-Anlagen und Speichern bis 30 kWp sind komplett von der gesetzlichen Umsatzsteuer befreit.' },
                        { title: 'Alles aus einer Hand', desc: 'Wir übernehmen Dachmontage, Verkabelung, Wechselrichter-Einrichtung, Speicheranschluss und die Anmeldung beim Netzbetreiber.' }
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
