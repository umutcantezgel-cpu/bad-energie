"use client";
import React from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    Check, 
    ArrowRight, 
    Layers, 
    Calculator,
    Eye
} from 'lucide-react';
import { MUSTERBAEDER } from '@/config/musterbaeder';

export default function MusterbadTeaser() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-3 inline-block shadow-xs">
                            Badinspiration &amp; Musterbäder
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Transparente Raumkonzepte &amp; Musterbäder
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed font-normal">
                            Erleben Sie unsere vorkalkulierten Komplettbad-Lösungen von 4,6 ㎡ bis 15,9 ㎡ mit hochwertigen Komponenten von VIGOUR, Duka, CONEL und COSMO.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/bad/budgetkalkulator"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 backdrop-blur-md text-[#0C3A87] font-black text-xs hover:bg-white transition-all border border-blue-200/60 shadow-xs"
                        >
                            <Calculator className="w-4 h-4" />
                            <span>Budgetkalkulator</span>
                        </Link>
                        <Link
                            href="/bad/musterbaeder"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0C3A87] text-white font-black text-xs hover:bg-[#0E1C76] transition-all shadow-md"
                        >
                            <span>Alle Musterbäder</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Musterbad Grid - Double-Bezel Glass Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {MUSTERBAEDER.slice(0, 2).map((bath) => (
                        <div 
                            key={bath.id}
                            className="glass-bezel-outer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(12,58,135,0.12)] group"
                        >
                            <div className="glass-bezel-inner p-8 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white shadow-xs">
                                                {bath.size}
                                            </span>
                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0C3A87] border border-blue-200/60">
                                                {bath.tier}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Festpreis-Orientierung:</span>
                                            <span className="text-2xl font-black text-[#E4040E]">
                                                {bath.priceFormatted}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-[#0C3A87] transition-colors">
                                        {bath.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 mb-6 font-medium">
                                        {bath.headline}
                                    </p>

                                    <div className="space-y-2.5 mb-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ausstattungs-Highlights:</h4>
                                        <ul className="space-y-2">
                                            {bath.highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                                                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between">
                                    <Link 
                                        href={`/bad/musterbaeder/${bath.slug}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#0C3A87] hover:underline"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Ausstattungsliste &amp; Grundriss</span>
                                    </Link>

                                    <Link
                                        href="/bad/badanfrage"
                                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_8px_20px_rgba(228,4,14,0.35)] text-white font-black text-xs transition-all border border-white/20"
                                    >
                                        Jetzt anfragen &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
