import React from 'react';
import Link from 'next/link';
import { 
    Droplets, 
    CheckCircle2, 
    ArrowRight, 
    Calculator, 
    Sparkles, 
    Layers, 
    ShieldCheck, 
    Eye, 
    Phone, 
    Calendar,
    BadgePercent
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import { MUSTERBAEDER, QUALITY_TIERS } from '@/config/musterbaeder';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';

export const metadata = {
    title: 'Badsanierung & Badrenovierung Wetzlar | Bad & Energie GmbH',
    description: 'Ihr Meisterbetrieb für schlüsselfertige Badsanierung, Musterbäder, barrierefreie Bäder nach DIN 18040-2 und 3D-Badplanung in Wetzlar und Umgebung.',
    alternates: { canonical: 'https://bad-energie.de/bad' }
};

export default function BadPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero Header - Deep Ocean Glass */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Meisterbetrieb für Badsanierung Wetzlar
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Ihr Traumbad schlüsselfertig aus Meisterhand
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
                        Von der ersten 3D-Skizze bis zur schlüsselfertigen Übergabe: Wir koordinieren alle Gewerke, bieten transparente Festpreise und verbauen hochwertige Markenprodukte von VIGOUR, Duka, CONEL und COSMO.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/bad/budgetkalkulator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Bad-Budget sofort berechnen &rarr;
                        </Link>
                        <Link
                            href="/bad/musterbaeder"
                            className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all backdrop-blur-md"
                        >
                            Musterbäder entdecken
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sub-Services Navigation Grid - Double Bezel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Badsanierung Wetzlar', desc: 'Komplettbad schlüsselfertig', path: '/bad/badsanierung', icon: Droplets },
                        { title: 'Barrierefreies Bad', desc: 'DIN 18040-2 & bis zu 4.000 € Zuschuss', path: '/bad/barrierefreies-bad', icon: ShieldCheck },
                        { title: 'Bad aus einer Hand', desc: 'Fliesen, Sanitär & Elektro koordiniert', path: '/bad/bad-aus-einer-hand', icon: Sparkles },
                        { title: 'Musterbad-Konzepte', desc: 'Basic, Premium & Luxus (4,6 bis 15,9 m²)', path: '/bad/musterbaeder', icon: Layers }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.path}
                                className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500 group block"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-white text-[#0C3A87] group-hover:bg-[#0C3A87] group-hover:text-white transition-colors flex items-center justify-center mb-3 shadow-xs border border-white/80">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-[#0C3A87] transition-colors mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Quality Tiers */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-2 inline-block shadow-xs">
                        Transparente Standards
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Unsere Qualitäts-Kategorien im Überblick
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Wählen Sie das passende Konzept für Ihre Ansprüche und Ihr Budget.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {QUALITY_TIERS.map((tier, idx) => (
                        <div key={idx} className="glass-surface p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                            <div className="space-y-3">
                                <span className="text-xs font-black px-3.5 py-1 rounded-full bg-blue-50 text-[#0C3A87] inline-block border border-blue-200/60">
                                    {tier.name}
                                </span>
                                <h3 className="text-xl font-black text-slate-900">{tier.subtitle}</h3>
                                <div className="text-xl font-black text-[#0C3A87]">{tier.priceRange}</div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{tier.description}</p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-200/60">
                                <Link
                                    href="/bad/musterbaeder"
                                    className="text-xs font-black text-[#0C3A87] hover:underline flex items-center gap-1"
                                >
                                    <span>Musterbäder ansehen</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Calculator Component */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10" id="anfrage">
                <TouchConfigurator modus="kunde" journey="bad" quelle="web_bad" />
            </div>
        </div>
    );
}
