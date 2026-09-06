import React from 'react';
import Link from 'next/link';
import { Shield, Droplets, Filter, CheckCircle2, ArrowRight, ShieldCheck, Phone, Calendar, RefreshCw, Wrench } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Haustechnik & Wasserhygiene Wetzlar | Trinkwasser & Filter',
    description: 'Moderne Haustechnik in Wetzlar & Lahn-Dill: Trinkwasserfilter, Entkalkungsanlagen, Legionellenprüfung nach TrinkwV & Sanitärinstallation.',
    path: '/haustechnik'
});

export default function HaustechnikPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Trinkwasserhygiene &amp; Haustechnik
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Haustechnik, Wasseraufbereitung &amp; Legionellenschutz
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Trinkwasser ist das wichtigste Lebensmittel. Wir schützen Ihre Gesundheit und den Werterhalt Ihrer Rohrleitungsnetze durch professionelle Filtration, Enthärtung und präventive Hygiene-Konzepte nach TrinkwV.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Trinkwasser-Check vereinbaren &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sub-Services Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Legionellen & Hygiene', desc: 'Gesetzliche Prüfpflicht, Desinfektion & Filter', path: '/haustechnik/legionellen', icon: Shield },
                        { title: 'Entkalkungsanlagen', desc: 'Weiches Wasser schützt Armaturen & Rohre', path: '/haustechnik/entkalkung', icon: Droplets },
                        { title: 'Trinkwasserfilter', desc: 'Rückspülbare Feinfilter gegen Rost & Sand', path: '/haustechnik/trinkwasserfilter', icon: Filter },
                        { title: 'Regen- & Grauwasser', desc: 'Nachhaltige Ressourcenschonung', path: '/haustechnik/regen-und-grauwassernutzung', icon: RefreshCw }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.path}
                                className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500 group block"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0C3A87] group-hover:bg-[#0C3A87] group-hover:text-white transition-colors flex items-center justify-center mb-3 shadow-xs border border-white/80">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h2 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-[#0C3A87] transition-colors mb-1">
                                    {item.title}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Quality & Hygiene Rules */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Höchste Standards für Ihr Trinkwassersystem
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Fachgerechte Dimensionierung und Wartung nach DIN EN 806 und DIN 1988.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Schutz vor Lochfraß & Korrosion', desc: 'Partikelfilter und Druckminderer verhindern den Eintrag von Fremdkörpern und schützen Rohrleitungen vor Druckschlägen.' },
                        { title: 'Kalkschutz für Heizanlagen & Geräte', desc: 'Ionenaustauscher reduzieren die Wasserhärte und verhindern Kalkablagerungen in Wärmetauschern, Kaffeemaschinen und Duschköpfen.' },
                        { title: 'Prüfpflicht für Vermieter', desc: 'Rechtssichere Probenahme, Laborauswertung und Gefährdungsanalysen bei Überschreitung des Legionellen-Maßnahmenwerts (100 KBE/100ml).' }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-black text-base text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
