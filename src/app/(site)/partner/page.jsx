import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { partnerBrands } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Partner & Hersteller | NIBE, VIGOUR, COSMO, Duka, CONEL | Bad & Energie GmbH',
    description: 'Unsere renommierten Markenpartner für Badsanierung & Heiztechnik in Wetzlar: NIBE, VIGOUR, COSMO, Duka, CONEL, Buderus, Vaillant, Viessmann & Wolf.',
    alternates: { canonical: 'https://bad-energie.de/partner' }
};

export default function PartnerPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Markenqualität ohne Kompromisse
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Unsere Partner &amp; Hersteller
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Qualität zahlt sich aus: Wir installieren ausschließlich erprobte Markenprodukte führender europäischer Hersteller für maximale Lebensdauer, Liefersicherheit und Ersatzteilgarantie.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partnerBrands.map((brand, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-[#0C3A87] inline-block mb-3 border border-blue-200/60 shadow-xs">
                                {brand.partnerStatus}
                            </span>
                            <h2 className="text-xl font-black text-slate-900 mb-1">{brand.name}</h2>
                            <p className="text-xs text-slate-500 font-medium">{brand.category}</p>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
