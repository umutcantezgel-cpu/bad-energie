import React from 'react';
import Link from 'next/link';
import { 
    Flame, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Phone, 
    Calendar, 
    ArrowRight, 
    Check 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Gas-Brennwerttechnik Wetzlar | Hocheffiziente Brennwertkessel & Hybrid | Bad & Energie GmbH',
    description: 'Moderne Gas-Brennwerttechnik in Wetzlar & Lahn-Dill. Bis zu 30% weniger Gasverbrauch, H2-Ready und perfekte Kombination mit Wärmepumpen oder Solarthermie.',
    alternates: { canonical: 'https://bad-energie.de/heizung/gas-brennwerttechnik' }
};

export default function GasBrennwerttechnikPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Brennwert- &amp; Hybridtechnologie
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Gas-Brennwerttechnik: <br />
                        <span className="text-[#35A7E9]">Maximale Energieausnutzung &amp; Hybrid-Optionen</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Nutzen Sie auch die im Abgas enthaltene Kondensationswärme. Moderne Gas-Brennwertgeräte erzielen Normnutzungsgrade von bis zu 98 % und lassen sich flexibel mit Wärmepumpen oder Solarthermie zu Hybridsystemen erweitern.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Beratungstermin vereinbaren &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Bis zu 30 % Brennstoffersparnis', desc: 'Im Vergleich zu veralteten Standard- oder Niedertemperaturkesseln senkt ein moderner Brennwertkessel Ihre Gasrechnung spürbar ab dem ersten Tag.' },
                        { title: 'H2-Ready (Wasserstoff-fähig)', desc: 'Zukunftssichere Markenmodelle können bereits heute mit einem Wasserstoffanteil von 20 % oder mehr im Erdgasnetz betrieben werden.' },
                        { title: 'Hybridfähig mit Wärmepumpe', desc: 'Kombinieren Sie Gas-Brennwert für eiskalte Wintertage mit einer NIBE Wärmepumpe für die Übergangszeit – intelligente bivalente Steuerung.' },
                        { title: 'Kompakte Wand- & Standgeräte', desc: 'Platzsparende Montage auch auf engstem Raum im Hauswirtschaftsraum oder Dachboden ohne separaten Heizungskeller.' },
                        { title: 'Hydraulischer Abgleich', desc: 'Durch die exakte Regulierung aller Heizkörper stellen wir sicher, dass das Brennwertgerät immer im optimalen Brennwertbereich kondensiert.' },
                        { title: 'Wartung & Abgasmessung', desc: 'Regelmäßige Inspektion durch unsere SHK-Meister sichert dauerhaft schadstoffarme Verbrennung und Werterhalt.' }
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
