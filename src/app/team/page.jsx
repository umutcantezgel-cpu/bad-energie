import React from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, Award, CheckCircle2, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Unser Team | Handwerksmeister & Fachhandwerker | Bad & Energie GmbH Wetzlar',
    description: 'Das Team der Bad & Energie GmbH: Geschäftsführer Sabri Demir, Handwerksmeister, Anlagenmechaniker SHK, Kundendienst-Monteure und Auszubildende in Wetzlar.',
    alternates: { canonical: 'https://bad-energie.de/team' }
};

export default function TeamPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Kompetenz &amp; Leidenschaft
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Unser Team – Handwerk aus Überzeugung
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Hinter jedem erfolgreichen Badprojekt und jeder effizienten Wärmepumpe steht ein eingespieltes Team aus Meistern, erfahrenen Gesellen und motivierten Nachwuchskräften.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Sabri Demir', role: 'Geschäftsführer & Leitung', desc: 'Verantwortlich für Unternehmensstrategie, technische Beratung, Projektleitung und Großkundenbetreuung.' },
                        { name: 'Meister- & Bauleitung', role: 'SHK-Meisterteam', desc: 'Präzise 3D-Badplanung, technische Heizlastberechnungen und Qualitätsüberwachung vor Ort auf Ihrer Baustelle.' },
                        { name: 'Service- & Montageteam', role: 'Anlagenmechaniker & Kundendienst', desc: 'Fachgerechte Installation von Rohrleitungen, Badkeramik, Wärmepumpen sowie 24/7 Störungsdienst.' }
                    ].map((m, idx) => (
                        <div key={idx} className="glass-surface p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                            <div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0C3A87] to-[#0E1C76] text-white flex items-center justify-center font-black text-xl mb-4 shadow-md border border-white/20">
                                    {m.name.charAt(0)}
                                </div>
                                <h3 className="font-black text-xl text-slate-900 mb-1">{m.name}</h3>
                                <p className="text-xs font-black text-[#E4040E] uppercase tracking-wider mb-3">{m.role}</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{m.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
