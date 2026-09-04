import React from 'react';
import Link from 'next/link';
import { 
    Layers, 
    Check, 
    ArrowRight, 
    Sparkles, 
    ShieldCheck, 
    Eye, 
    Phone, 
    Calculator 
} from 'lucide-react';
import { MUSTERBAEDER } from '@/config/musterbaeder';
import { COMPANY_DATA } from '@/config/company';

export const metadata = {
    title: 'Musterbäder & Badinspiration | Bad & Energie GmbH Wetzlar',
    description: 'Entdecken Sie unsere vorkalkulierten Musterbäder von 4,6 bis 15,9 m² mit Festpreisen & Markenkomponenten von VIGOUR, Duka, CONEL und COSMO.',
    alternates: { canonical: 'https://bad-energie.de/bad/musterbaeder' }
};

export default function MusterbaederPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Transparente Raumkonzepte
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Musterbad-Katalog &amp; Badinspiration
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Finden Sie die perfekte Inspiration für Ihr neues Bad. Alle Musterbäder enthalten exakte Ausstattungslisten und transparente Festpreis-Orientierungen mit Markenkomponenten von VIGOUR, Duka, CONEL und COSMO.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/bad/budgetkalkulator"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            <Calculator className="w-4 h-4" />
                            <span>Individuelles Bad online kalkulieren</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Musterbad Double-Bezel Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {MUSTERBAEDER.map((bath) => (
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
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Festpreis-Orientierung:</span>
                                            <span className="text-2xl font-black text-[#E4040E]">
                                                {bath.priceFormatted}
                                            </span>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-[#0C3A87] transition-colors">
                                        {bath.title}
                                    </h2>
                                    <p className="text-xs text-slate-600 mb-6 font-medium">
                                        {bath.headline}
                                    </p>

                                    <div className="space-y-2.5 mb-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ausstattungs-Highlights:</h3>
                                        <ul className="space-y-2">
                                            {bath.highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
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
                                        <span>Ausstattungsliste &amp; Details</span>
                                    </Link>

                                    <Link
                                        href="/bad/badanfrage"
                                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_8px_20px_rgba(228,4,14,0.35)] text-white font-black text-xs transition-all border border-white/20"
                                    >
                                        Anfragen &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
