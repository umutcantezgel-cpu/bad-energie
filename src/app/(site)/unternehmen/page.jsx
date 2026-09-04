import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Clock, Users, CheckCircle2, ArrowRight, HeartHandshake, Sparkles } from 'lucide-react';
import { COMPANY_DATA, historyTimeline } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Über uns & Historie seit 1926 | Bad & Energie GmbH Wetzlar',
    description: 'Fast 100 Jahre Handwerkstradition in Wetzlar: Karl Schmidt (1926) -> Rudolf Schmidt (1945) -> Rudolf Diesfeld (2001) -> Sabri Demir (2021). Meisterbetrieb für Bad & Wärme.',
    alternates: { canonical: 'https://bad-energie.de/unternehmen' }
};

export default function UnternehmenPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Tradition seit 1926 &middot; Meisterbetrieb seit 2001
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Über die Bad &amp; Energie GmbH
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Verlässlichkeit, handwerkliche Perfektion und zukunftsorientierte Energielösungen. Seit fast einem Jahrhundert steht unser Name in Wetzlar und im Lahn-Dill-Kreis für höchste Qualität.
                    </p>
                </div>
            </div>

            {/* History Timeline */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Unsere fast 100-jährige Unternehmensgeschichte
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Vom traditionellen Wetzlarer Handwerksbetrieb zum modernen Dienstleister für erneuerbare Energien.
                    </p>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:left-8 md:before:left-1/2 before:-translate-x-px before:w-0.5 before:bg-blue-200/60">
                    {historyTimeline.map((item, idx) => (
                        <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
                            <div className="flex items-center justify-start md:justify-end md:w-1/2 md:pr-10">
                                <div className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-0.5 transition-all duration-500 w-full">
                                    <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-[#0C3A87] inline-block mb-2 border border-blue-200/60 shadow-xs">
                                        {item.year}
                                    </span>
                                    <h3 className="font-black text-base text-slate-900 mb-1">{item.title}</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.description}</p>
                                </div>
                            </div>

                            {/* Node Center Marker */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0C3A87] border-4 border-white shadow-md z-10" />

                            <div className="hidden md:block md:w-1/2 md:pl-10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Leadership & Values - Double Bezel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <div className="glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-4">
                            <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87]">Geschäftsführung</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                                Sabri Demir &amp; das Meisterteam
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                &ldquo;Unser Anspruch ist es, jedem Kunden die bestmögliche Lösung zu bieten – egal ob es um das kleine barrierefreie Gästebad oder eine komplexe Wärmepumpenkaskade im Mehrfamilienhaus geht. Wir stehen mit unserem Team für Sauberkeit, Termintreue und transparente Festpreise.&rdquo;
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Meisterbetrieb seit 2001
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    NIBE Effizienz Partner
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    HWK Wiesbaden Mitglied
                                </span>
                            </div>
                        </div>

                        <div className="lg:col-span-4 text-center lg:text-right">
                            <Link
                                href="/termin"
                                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-lg transition-all transform hover:-translate-y-0.5 border border-white/20"
                            >
                                <span>Lernen Sie uns persönlich kennen</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
