import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';

export const metadata = {
    title: 'Kontakt & Standorte Wetzlar | Bad & Energie GmbH',
    description: 'Kontaktieren Sie die Bad & Energie GmbH: Hauptsitz Hans-Sachs-Str. 12 (35576 Wetzlar, Tel. 06441 20 39 053) & Betriebsstätte Siegmund-Hiepe-Str. 20 (Tel. 06441 42956).',
    alternates: { canonical: 'https://bad-energie.de/kontakt' }
};

export default function KontaktPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Ihre Meister in Wetzlar &amp; Lahn-Dill
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Kontakt &amp; Standorte
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Wir freuen uns auf Ihre Anfrage. Rufen Sie uns direkt an, schreiben Sie uns eine E-Mail oder vereinbaren Sie einen persönlichen Termin.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    
                    {/* Headquarters - Double Bezel */}
                    <div className="glass-bezel-outer shadow-2xl">
                        <div className="glass-bezel-inner p-8 space-y-6 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black px-3.5 py-1 rounded-full bg-blue-50 text-[#0C3A87] border border-blue-200/60 shadow-xs">
                                        Hauptsitz &amp; Showroom
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">Zentrale</span>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-1">
                                        Bad &amp; Energie GmbH
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-[#0C3A87]" />
                                        Hans-Sachs-Straße 12, 35576 Wetzlar
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2 text-xs">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-[#0C3A87]" />
                                        <a href={`tel:${COMPANY_DATA.headquarters.phoneLink}`} className="font-black text-slate-900 hover:text-[#0C3A87]">
                                            {COMPANY_DATA.headquarters.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-[#0C3A87]" />
                                        <a href={`mailto:${COMPANY_DATA.headquarters.email}`} className="text-slate-600 font-medium hover:text-[#0C3A87]">
                                            {COMPANY_DATA.headquarters.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        <span className="text-slate-600 font-medium">{COMPANY_DATA.hours.formattedWeekdays} | {COMPANY_DATA.hours.formattedFriday}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60">
                                <a
                                    href={COMPANY_DATA.headquarters.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-full py-3.5 px-4 rounded-full bg-white hover:bg-slate-50 text-[#0C3A87] font-black text-xs text-center border border-blue-200/80 transition-all shadow-xs"
                                >
                                    Route in Google Maps planen &rarr;
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Branch Lahn-Dill - Double Bezel */}
                    <div className="glass-bezel-outer shadow-2xl">
                        <div className="glass-bezel-inner p-8 space-y-6 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                                        Standort Lahn-Dill
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">Betriebsstätte</span>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-1">
                                        Bad &amp; Energie GmbH Lahn-Dill
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-[#0C3A87]" />
                                        Siegmund-Hiepe-Straße 20, 35578 Wetzlar
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2 text-xs">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-[#0C3A87]" />
                                        <a href={`tel:${COMPANY_DATA.branchLahnDill.phoneLink}`} className="font-black text-slate-900 hover:text-[#0C3A87]">
                                            {COMPANY_DATA.branchLahnDill.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Printer className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600 font-medium">Fax: {COMPANY_DATA.branchLahnDill.fax}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-[#0C3A87]" />
                                        <a href={`mailto:${COMPANY_DATA.branchLahnDill.email}`} className="text-slate-600 font-medium hover:text-[#0C3A87]">
                                            {COMPANY_DATA.branchLahnDill.email}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60">
                                <Link
                                    href="/termin"
                                    className="inline-block w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_8px_20px_rgba(228,4,14,0.35)] text-white font-black text-xs text-center shadow-md transition-all border border-white/20"
                                >
                                    Jetzt Beratungstermin anfragen &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
