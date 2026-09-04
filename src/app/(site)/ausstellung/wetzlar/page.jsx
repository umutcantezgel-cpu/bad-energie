import React from 'react';
import Link from 'next/link';
import { Eye, MapPin, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Virtuelle Badausstellung Wetzlar | 360° Rundgang & Showroom | Bad & Energie GmbH',
    description: 'Erleben Sie die Badausstellung Wetzlar virtuell im 360°-Rundgang: Moderne Musterbäder, VIGOUR Designkeramik, Walk-In Duschen & NIBE Wärmepumpen.',
    alternates: { canonical: 'https://bad-energie.de/ausstellung/wetzlar' }
};

export default function AusstellungWetzlarPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Digitaler Showroom Wetzlar
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Virtuelle Badausstellung Wetzlar
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Entdecken Sie unsere Bäderwelten und innovative Heiztechnik bequem von zu Hause aus im virtuellen Rundgang.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Persönliche Beratung in Wetzlar buchen &rarr;
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
                            360°-Erlebnis &amp; Bemusterung vor Ort
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            In unserem Showroom in der Hans-Sachs-Straße 12 in 35576 Wetzlar können Sie Materialien, Oberflächen, Badmöbel von VIGOUR, Duka Duschwände und funktionierende NIBE Wärmepumpen hautnah erleben und anfassen.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                                <span className="font-black text-xs text-slate-900 block mb-1">Musterbäder live</span>
                                <span className="text-[11px] text-slate-500 font-medium">Von 4,6 bis 15,9 m² mit Markenkeramik</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                                <span className="font-black text-xs text-slate-900 block mb-1">Materialmuster</span>
                                <span className="text-[11px] text-slate-500 font-medium">Fliesen, Mineralguss, Echtholz &amp; Glas</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                                <span className="font-black text-xs text-slate-900 block mb-1">NIBE Wärmepumpen</span>
                                <span className="text-[11px] text-slate-500 font-medium">Funktionsweise &amp; Geräuschpegel testen</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
