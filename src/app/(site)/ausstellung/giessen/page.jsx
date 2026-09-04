import React from 'react';
import Link from 'next/link';
import { Eye, MapPin, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Virtuelle Badausstellung Gießen | Bäder & Heizung | Bad & Energie GmbH',
    description: 'Virtuelle Ausstellung für Gießen & Umgebung: Badinspiration, bodengleiche Duschen, NIBE Wärmepumpen & Vor-Ort-Beratung.',
    alternates: { canonical: 'https://bad-energie.de/ausstellung/giessen' }
};

export default function AusstellungGiessenPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Showroom &amp; Inspiration für Gießen
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Virtuelle Badausstellung Gießen
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Inspiration für Ihr neues Badezimmer und moderne Energietechnik für Bauherren und Sanierer in Gießen, Pohlheim, Linden und Umgebung.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Beratung für Gießen buchen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="glass-bezel-outer shadow-2xl max-w-4xl mx-auto">
                    <div className="glass-bezel-inner p-8 sm:p-12 text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-50 text-[#0C3A87] rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-200/60">
                            <Eye className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                            Ihr Partner für Gießen &amp; das Lahntal
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            Unser Meisterteam ist regelmäßig im gesamten Raum Gießen im Einsatz. Gerne beraten wir Sie direkt vor Ort in Ihrer Immobilie mit Materialmustern und 3D-Visualisierung.
                        </p>
                    </div>
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
