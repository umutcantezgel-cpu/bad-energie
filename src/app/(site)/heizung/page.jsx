import React from 'react';
import Link from 'next/link';
import { 
    Flame, 
    Zap, 
    Award, 
    CheckCircle2, 
    ArrowRight, 
    BadgePercent, 
    Phone, 
    Calendar, 
    ShieldCheck, 
    Sliders,
    Sun,
    Layers,
    Clock
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Heizung & Wärmepumpen Wetzlar | NIBE Effizienz Partner | Bad & Energie GmbH',
    description: 'Moderne Heiztechnik & Wärmepumpen in Wetzlar. Offizieller NIBE Partner, Gas-Brennwert, Fußbodenheizung, bis 70% BEG-Förderung & Meister-Kundendienst.',
    alternates: { canonical: 'https://bad-energie.de/heizung' }
};

export default function HeizungPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-red -top-20 -right-20" />
            <div className="ambient-glow-blue top-96 -left-20" />

            {/* Hero - Dark Glass */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs uppercase font-black tracking-wider text-red-300 bg-red-600/30 px-4 py-1.5 rounded-full border border-red-500/40 inline-block backdrop-blur-md">
                            NIBE Effizienz Partner Wetzlar
                        </span>
                        <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                            Bis zu 70 % staatliche Förderung (KfW 458)
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Zukunftssichere Heiztechnik &amp; Wärmepumpen
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
                        Senken Sie Ihre Heizkosten dauerhaft und machen Sie sich unabhängig von fossilen Brennstoffen. Bad &amp; Energie GmbH plant, installiert und wartet hocheffiziente Wärmepumpen-, Hybrid- und Brennwertsysteme mit maximaler Fördermittelausschöpfung.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/heizung/heizungskonfigurator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Heizung konfigurieren &amp; Förderung prüfen &rarr;
                        </Link>
                        <Link
                            href="/foerderung"
                            className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all backdrop-blur-md"
                        >
                            BEG &amp; KfW Förderleitfaden
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sub-Services Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Wärmepumpen', desc: 'Luft/Wasser, Sole & Grundwasser', path: '/heizung/waermepumpe', icon: Zap },
                        { title: 'NIBE Effizienz Partner', desc: 'Zertifizierter Premium-Partner', path: '/heizung/nibe-partner', icon: Award },
                        { title: 'Gas-Brennwerttechnik', desc: 'Effiziente Hybridsysteme', path: '/heizung/gas-brennwerttechnik', icon: Flame },
                        { title: 'Wand- & Fußbodenheizung', desc: 'Niedertemperatur Strahlungswärme', path: '/heizung/wand-und-fussbodenheizung', icon: Sun }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.path}
                                className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(228,4,14,0.12)] hover:-translate-y-1 transition-all duration-500 group block"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#E4040E] group-hover:bg-[#E4040E] group-hover:text-white transition-colors flex items-center justify-center mb-3 shadow-xs border border-white/80">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-[#E4040E] transition-colors mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Heating Systems Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-2 inline-block shadow-xs">
                        Umfassendes Portfolio
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Alle Heizsysteme &amp; Dienstleistungen
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Maßgeschneiderte Lösungen für Neubau und energetische Sanierung im Altbau.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Heizungsmodernisierung & Austausch', desc: 'Schritt-für-Schritt Umstieg von alten Öl- oder Gasheizungen auf moderne Wärmepumpen.', path: '/heizung/heizungsmodernisierung' },
                        { title: 'Heizungscheck & Hydraulischer Abgleich', desc: 'Exakte Berechnung nach Verfahren B – Voraussetzung für KfW-Zuschüsse und bis zu 15% weniger Verbrauch.', path: '/heizung/heizungscheck' },
                        { title: 'Wärme mieten (Contracting)', desc: 'Neue Heizung ohne hohe Investitionskosten inklusive 100% Rundum-Sorglos-Wartungsservice.', path: '/heizung/waerme-mieten' },
                        { title: 'Heizen mit Holz & Pellets', desc: 'CO2-neutrale Biomasseheizungen und Pelletskessel für regionale Unabhängigkeit.', path: '/heizung/heizen-mit-holz' },
                        { title: 'Heizkörper & Designradiatoren', desc: 'Niedertemperatur-Heizkörper von COSMO und Kermi für den optimalen Betrieb mit Wärmepumpen.', path: '/heizung/heizkoerper' },
                        { title: 'Kundendienst & 24/7 Notdienst', desc: 'Regelmäßige Inspektion, Reinigung und Wartungsverträge für dauerhafte Betriebssicherheit.', path: '/heizung/kundendienst-wartung' }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <div>
                                <h3 className="font-black text-base text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">{item.desc}</p>
                            </div>
                            <Link href={item.path} className="text-xs font-black text-[#0C3A87] hover:underline flex items-center gap-1">
                                <span>Mehr erfahren</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Heizungskonfigurator Component */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <HeizungKonfigurator />
            </div>

            <QualityPromise />
        </div>
    );
}
