"use client";
import React from 'react';
import { 
    CheckCircle, 
    ShieldCheck, 
    Award, 
    Users, 
    FileText, 
    Clock, 
    Sparkles, 
    Wrench,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';

const PROMISE_ICONS = [
    Users,
    Sparkles,
    FileText,
    CheckCircle,
    Award,
    ShieldCheck,
    Wrench,
    Clock
];

export default function QualityPromise() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-3 inline-block shadow-xs">
                        Meisterbetrieb Bad &amp; Energie GmbH
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Unser 8-Punkte Qualitäts-Versprechen <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-[#0C3A87] to-[#296BF5] bg-clip-text text-transparent">von Bad über Heizung bis Haustechnik</span>
                    </h2>
                    <p className="mt-4 text-sm text-slate-600 leading-relaxed font-normal">
                        Handwerkliche Exzellenz seit über 20 Jahren in Wetzlar und im Lahn-Dill-Kreis. Wir stehen zu unseren Vereinbarungen, Preisen und Terminen.
                    </p>
                </div>

                {/* 8-Point Glass Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {COMPANY_DATA.qualityPromises.map((promise, idx) => {
                        const Icon = PROMISE_ICONS[idx % PROMISE_ICONS.length];
                        return (
                            <div 
                                key={idx}
                                className="glass-surface rounded-[2rem] p-6 hover:shadow-[0_20px_40px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-white text-[#0C3A87] group-hover:bg-[#0C3A87] group-hover:text-white transition-colors flex items-center justify-center mb-5 font-bold shadow-xs border border-white/80">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Punkt 0{idx + 1}</span>
                                    <h3 className="text-base font-bold text-slate-900 mt-1 mb-2 group-hover:text-[#0C3A87] transition-colors leading-snug">
                                        {promise.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {promise.description}
                                    </p>
                                </div>
                                <div className="mt-5 pt-3 border-t border-slate-100/80 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Garantierter Standard</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Glass CTA Banner */}
                <div className="mt-14 p-1.5 rounded-[2.5rem] bg-gradient-to-r from-blue-600/30 via-white/40 to-blue-400/20 border border-white/80 shadow-2xl backdrop-blur-2xl">
                    <div className="rounded-[calc(2.5rem-6px)] bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1.5 text-center md:text-left">
                            <h4 className="text-xl sm:text-2xl font-black">Überzeugen Sie sich selbst von unserem Meister-Service</h4>
                            <p className="text-xs text-blue-200">Kostenfreie Erstberatung bei Ihnen vor Ort in Wetzlar, Gießen &amp; Umgebung.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="px-6 py-3.5 rounded-full bg-white/90 text-[#0C3A87] font-black text-xs hover:bg-white transition-all shadow-md"
                            >
                                {COMPANY_DATA.contact.phone}
                            </a>
                            <Link
                                href="/termin"
                                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs hover:shadow-[0_8px_20px_rgba(228,4,14,0.4)] transition-all shadow-md border border-white/20"
                            >
                                Termin buchen &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
