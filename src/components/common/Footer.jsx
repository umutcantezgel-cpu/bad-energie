"use client";
import React from 'react';
import Link from 'next/link';
import { 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    ShieldCheck, 
    ChevronRight, 
    Award, 
    Printer, 
    AlertCircle, 
    FileText, 
    ExternalLink 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import { footerServiceLinks, quickLinks } from '@/config/navigation';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-b from-[#0B1736] via-[#060D24] to-[#030712] border-t border-white/10 text-slate-200 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Partner & Guarantee Banner */}
            <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur-md py-6 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-300">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#35A7E9]" />
                            <span className="font-bold text-white">Meisterbetrieb seit 2001</span> (Tradition seit 1926)
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#FF1E16]" />
                            <span className="font-bold text-white">Offizieller NIBE Effizienz Partner</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>Amtsgericht Wetzlar HRB 2449</span>
                        </div>
                    </div>
                    <div>
                        <Link 
                            href="/termin" 
                            className="inline-flex items-center gap-2 text-xs font-black text-[#FF1E16] hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-full border border-white/10"
                        >
                            <span>Unverbindliche Vor-Ort-Fachberatung buchen</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main 4-Column Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    
                    {/* Col 1: Company Profile & Narrative */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0C3A87] via-[#0E1C76] to-[#296BF5] p-0.5 shadow-md">
                                <div className="w-full h-full rounded-[14px] bg-[#0C3A87] flex items-center justify-center text-white font-black text-base border border-white/20">
                                    B&amp;E
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-white leading-tight">
                                    Bad &amp; Energie <span className="text-[#E4040E]">GmbH</span>
                                </h3>
                                <p className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">Meisterbetrieb Wetzlar</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                            Ihr verlässlicher Fachbetrieb für schlüsselfertige Badsanierung, moderne NIBE Wärmepumpen, energieeffiziente Heizsysteme, kontrollierte Wohnraumlüftung und Trinkwasserhygiene im gesamten Lahn-Dill-Kreis.
                        </p>

                        <div className="pt-2 border-t border-white/10 space-y-1 text-xs text-slate-400">
                            <p className="font-medium text-slate-300">Geschäftsführung: <span className="text-white font-bold">Sabri Demir</span></p>
                            <p>Handwerkskammer Wiesbaden</p>
                            <p>USt-IdNr.: <span className="font-mono text-slate-300">{COMPANY_DATA.tax.ustId}</span></p>
                        </div>
                    </div>

                    {/* Col 2: Locations, Contact & Opening Hours */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-white tracking-wide uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#35A7E9]" />
                            Standorte &amp; Kontakt
                        </h4>

                        <div className="space-y-3 text-xs">
                            {/* Headquarters */}
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-md">
                                <p className="font-bold text-white flex items-center justify-between">
                                    <span>Hauptsitz Wetzlar</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-bold border border-blue-400/30">Zentrale</span>
                                </p>
                                <p className="text-slate-300">Hans-Sachs-Straße 12, 35576 Wetzlar</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Phone className="w-3.5 h-3.5 text-[#35A7E9]" />
                                    <a href={`tel:${COMPANY_DATA.headquarters.phoneLink}`} className="text-white font-black hover:text-[#35A7E9] transition-colors">
                                        {COMPANY_DATA.headquarters.phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <a href={`mailto:${COMPANY_DATA.headquarters.email}`} className="text-slate-300 hover:text-white transition-colors">
                                        {COMPANY_DATA.headquarters.email}
                                    </a>
                                </div>
                            </div>

                            {/* Branch Lahn-Dill */}
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-md">
                                <p className="font-bold text-white flex items-center justify-between">
                                    <span>Standort Lahn-Dill</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">Betriebsstätte</span>
                                </p>
                                <p className="text-slate-300">Siegmund-Hiepe-Str. 20, 35578 Wetzlar</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Phone className="w-3.5 h-3.5 text-[#35A7E9]" />
                                    <a href={`tel:${COMPANY_DATA.branchLahnDill.phoneLink}`} className="text-white font-black hover:text-[#35A7E9] transition-colors">
                                        {COMPANY_DATA.branchLahnDill.phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-slate-300">Fax: {COMPANY_DATA.branchLahnDill.fax}</span>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="pt-1 text-[11px] text-slate-300 space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Öffnungszeiten:</span>
                                </div>
                                <p className="pl-5">{COMPANY_DATA.hours.formattedWeekdays}</p>
                                <p className="pl-5">{COMPANY_DATA.hours.formattedFriday}</p>
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Services & Key Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-white tracking-wide uppercase border-b border-white/10 pb-2">
                            Leistungen &amp; Gewerke
                        </h4>
                        <ul className="space-y-2 text-xs">
                            {footerServiceLinks.map((item) => (
                                <li key={item.name}>
                                    <Link 
                                        href={item.path} 
                                        className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors group"
                                    >
                                        <ChevronRight className="w-3 h-3 text-[#35A7E9] group-hover:translate-x-1 transition-transform" />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4: Service Region & Interactive Tools */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-white tracking-wide uppercase border-b border-white/10 pb-2">
                            Region &amp; Tools
                        </h4>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <p className="text-xs font-bold text-slate-300">Interaktive Konfiguratoren:</p>
                                <div className="space-y-1 text-xs">
                                    <Link href="/bad/budgetkalkulator" className="block text-cyan-300 hover:underline font-medium">
                                        &bull; Budgetkalkulator Bad (Sofortschätzung)
                                    </Link>
                                    <Link href="/heizung/heizungskonfigurator" className="block text-cyan-300 hover:underline font-medium">
                                        &bull; Heizungskonfigurator (Fördercheck)
                                    </Link>
                                    <Link href="/bad/badplaner" className="block text-cyan-300 hover:underline font-medium">
                                        &bull; 3D-Badplaner Guide
                                    </Link>
                                    <Link href="/foerderung" className="block text-[#FF1E16] hover:underline font-black">
                                        &bull; KfW 458 Förderrechner (bis 70%)
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/10">
                                <p className="text-xs font-bold text-slate-300 mb-2">Einsatzgebiet Lahn-Dill &amp; Hessen:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {COMPANY_DATA.business.serviceArea.slice(0, 10).map((city) => (
                                        <span 
                                            key={city}
                                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10"
                                        >
                                            {city}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Legal, GDPR & Accessibility Strip */}
                <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex flex-col sm:flex-row items-center gap-2 text-center md:text-left">
                        <span>&copy; {currentYear} Bad &amp; Energie GmbH &middot; Alle Rechte vorbehalten.</span>
                        <span className="hidden sm:inline text-slate-600">|</span>
                        <span>Geschäftsführer Sabri Demir &middot; Amtsgericht Wetzlar HRB 2449</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                        <Link href="/impressum" className="text-slate-400 hover:text-white transition-colors">
                            Impressum
                        </Link>
                        <span className="text-slate-600">&middot;</span>
                        <Link href="/datenschutz" className="text-slate-400 hover:text-white transition-colors">
                            Datenschutz
                        </Link>
                        <span className="text-slate-600">&middot;</span>
                        <Link href="/cookie-richtlinie" className="text-slate-400 hover:text-white transition-colors">
                            Cookie-Richtlinie (EU)
                        </Link>
                        <span className="text-slate-600">&middot;</span>
                        <Link href="/barrierefreiheit" className="text-slate-400 hover:text-white transition-colors">
                            Barrierefreiheit (BFSG)
                        </Link>
                        <span className="text-slate-600">&middot;</span>
                        <Link href="/agb" className="text-slate-400 hover:text-white transition-colors">
                            AGB
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
