import React from 'react';
import Link from 'next/link';
import { 
    Zap, 
    Award, 
    CheckCircle2, 
    BadgePercent, 
    Phone, 
    Calendar, 
    ArrowRight, 
    Sun, 
    Layers, 
    Check 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Wärmepumpe Wetzlar | Installation, Förderung bis 70% | Bad & Energie GmbH',
    description: 'Wärmepumpen in Wetzlar & Lahn-Dill: Luft-Wasser, Sole-Wasser (Erdwärme) & Grundwasser. Offizieller NIBE Effizienz Partner mit bis zu 70% BEG-Förderung.',
    alternates: { canonical: 'https://bad-energie.de/heizung/waermepumpe' }
};

export default function WaermepumpePage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-red -top-20 -right-20" />
            <div className="ambient-glow-blue top-96 -left-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs uppercase font-black tracking-wider text-red-300 bg-red-600/30 px-4 py-1.5 rounded-full border border-red-500/40 inline-block backdrop-blur-md">
                            Zertifizierter NIBE Partner
                        </span>
                        <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                            Bis 70 % BEG-Zuschuss (KfW 458)
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Wärmepumpen in Wetzlar &amp; Lahn-Dill: <br />
                        <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">Umweltfreundlich, effizient &amp; zukunftssicher</span>
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Nutzen Sie kostenlose Umweltwärme aus Luft, Erde oder Grundwasser. Als offizieller NIBE Effizienz Partner sichern wir Ihnen höchste Jahresarbeitszahlen und maximale KfW-Zuschüsse.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/heizung/heizungskonfigurator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Förderung &amp; Heizung konfigurieren &rarr;
                        </Link>
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-2 backdrop-blur-md"
                        >
                            <Phone className="w-4 h-4" />
                            {COMPANY_DATA.contact.phone}
                        </a>
                    </div>
                </div>
            </div>

            {/* 3 Types of Heat Pumps */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Die 3 Wärmepumpen-Arten im Vergleich
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Wir wählen gemeinsam mit Ihnen das wirtschaftlich und baulich optimale System für Ihre Immobilie.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'Luft-Wasser-Wärmepumpe',
                            sub: 'Der beliebteste Allrounder',
                            desc: 'Nutzt die Außenluft als Energiequelle. Geringer Installationsaufwand, keine Erdarbeiten oder Genehmigungen nötig. Auch im Altbau mit bestehenden Heizkörpern hocheffizient.',
                            cop: 'JAZ 3,8 – 4,8',
                            grant: 'bis zu 70 % Förderung',
                            ideal: 'Ideal für Einfamilienhäuser & Sanierungen'
                        },
                        {
                            title: 'Sole-Wasser-Wärmepumpe (Erdwärme)',
                            sub: 'Höchste Effizienz das ganze Jahr',
                            desc: 'Gewinnt konstante Wärme aus dem Erdreich via Tiefenbohrung (Erdsonden bis 100 m) oder Flächenkollektoren. Extrem konstante Vorlauftemperaturen und passive Kühlung im Sommer.',
                            cop: 'JAZ 4,5 – 5,5',
                            grant: 'bis zu 70 % Förderung (+5% Effizienz-Bonus)',
                            ideal: 'Ideal für Neubauten & Grundstücke mit Garten'
                        },
                        {
                            title: 'Wasser-Wasser-Wärmepumpe',
                            sub: 'Maximale Energieausbeute',
                            desc: 'Nutzt Grundwasser über Förder- und Schluckbrunnen. Grundwasser hat ganzjährig ca. 10 °C und bietet den höchsten thermischen Wirkungsgrad aller Wärmepumpensysteme.',
                            cop: 'JAZ 5,0 – 6,0',
                            grant: 'bis zu 70 % Förderung (+5% Effizienz-Bonus)',
                            ideal: 'Ideal bei ausreichendem Grundwasservorkommen'
                        }
                    ].map((hp, idx) => (
                        <div key={idx} className="glass-surface p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                            <div className="space-y-4">
                                <span className="text-xs font-black px-3.5 py-1 rounded-full bg-blue-50 text-[#0C3A87] inline-block border border-blue-200/60">
                                    {hp.sub}
                                </span>
                                <h3 className="text-xl font-black text-slate-900">{hp.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{hp.desc}</p>

                                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 space-y-1.5 text-xs text-slate-700 shadow-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-semibold">Jahresarbeitszahl (JAZ):</span>
                                        <span className="font-black text-[#0C3A87]">{hp.cop}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-semibold">Staatl. Zuschuss:</span>
                                        <span className="font-black text-[#E4040E]">{hp.grant}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-200/60">
                                <p className="text-[11px] font-bold text-emerald-700">{hp.ideal}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configurator */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <TouchConfigurator modus="kunde" journey="waermepumpe" quelle="web_wp" />
            </div>

            <QualityPromise />
        </div>
    );
}
