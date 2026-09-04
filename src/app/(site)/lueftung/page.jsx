import React from 'react';
import Link from 'next/link';
import { Wind, Snowflake, CheckCircle2, ArrowRight, ShieldCheck, Phone, Calendar, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Lüftung & Klimatechnik Wetzlar | Wohnraumlüftung & Klimaanlagen | Bad & Energie GmbH',
    description: 'Lüftungs- und Klimatechnik in Wetzlar & Lahn-Dill: Zentrale & dezentrale Wohnraumlüftung mit Wärmerückgewinnung, Schimmelschutz & moderne Split-Klimaanlagen.',
    alternates: { canonical: 'https://bad-energie.de/lueftung' }
};

export default function LueftungPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-cyan -top-20 -left-20" />
            <div className="ambient-glow-blue top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Gesundes Raumklima &amp; Bautenschutz
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Lüftungs- &amp; Klimatechnik für Ihr Zuhause
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Frische, gefilterte Luft rund um die Uhr bei geschlossenen Fenstern. Unsere Wohnraumlüftungssysteme schützen vor Schimmelbildung und senken Lüftungswärmeverluste um bis zu 90 %.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Lüftungsberatung anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sub-Services Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Zentrale Wohnraumlüftung', desc: 'Bis zu 92 % Wärmerückgewinnung – ideal für Neubau & Kernsanierung', path: '/lueftung/zentrale-wohnraumlueftung', icon: Wind },
                        { title: 'Dezentrale Wohnraumlüftung', desc: 'Einfache Nachrüstung per Kernbohrung ohne Rohrleitungsnetz', path: '/lueftung/dezentrale-wohnraumlueftung', icon: Sparkles },
                        { title: 'Klimaanlagen & Split-Geräte', desc: 'Effizientes Kühlen im Sommer und Zuheizen im Winter per Inverter', path: '/lueftung/klimaanlage', icon: Snowflake }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.path}
                                className="glass-surface p-8 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500 group block"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-colors flex items-center justify-center mb-4 shadow-xs border border-white/80">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h2 className="font-black text-lg text-slate-900 group-hover:text-[#0C3A87] transition-colors mb-2">
                                    {item.title}
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">{item.desc}</p>
                                <span className="text-xs font-black text-[#0C3A87] flex items-center gap-1">
                                    <span>Details ansehen</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Why Ventilation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Warum moderne Gebäude eine kontrollierte Wohnraumlüftung brauchen
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Moderne Fenster und Wärmedämmungen machen Häuser luftdicht. Ohne aktiven Luftaustausch drohen Feuchtigkeitsschäden und Sauerstoffmangel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Zuverlässiger Schimmelschutz', desc: 'Automatischer Feuchteabtransport schützt Wände, Ecken und Möbel dauerhaft vor Schimmelpilzbefall.' },
                        { title: 'Allergikerfreundlich (F7 Filter)', desc: 'Hochwirksame Pollen- und Feinstaubfilter halten Allergene und Straßenstaub draußen.' },
                        { title: 'Wärmerückgewinnung bis 92 %', desc: 'Die Wärme der verbrauchten Abluft heizt die frische Zuluft vor – ohne Energieverschwendung durch Dauerkippen.' },
                        { title: 'Lärm- & Einbruchschutz', desc: 'Frische Luft ohne offene Fenster: Kein Straßenlärm, keine Zugluft und kein Einbruchrisiko durch gekippte Fenster.' }
                    ].map((b, i) => (
                        <div key={i} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-black text-base text-slate-900 mb-2">{b.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
