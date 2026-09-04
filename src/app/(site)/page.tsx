import React from 'react';
import Link from 'next/link';
import { 
    Phone, 
    Calendar, 
    ShieldCheck, 
    Sparkles, 
    CheckCircle2, 
    ArrowRight, 
    Droplets, 
    Flame, 
    Wind, 
    Shield, 
    Award, 
    Sun, 
    Calculator, 
    Star, 
    Check, 
    Clock, 
    Zap,
    MapPin
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import { SERVICES } from '@/config/services';
import QualityPromise from '@/components/sections/QualityPromise';
import MusterbadTeaser from '@/components/sections/MusterbadTeaser';
import ReviewsSection from '@/components/sections/ReviewsSection';
import BadanfrageFunnel from '@/components/funnels/BadanfrageFunnel';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import BudgetKalkulator from '@/components/funnels/BudgetKalkulator';

export const metadata = {
    title: 'Bad & Energie GmbH | Meisterbetrieb für Badsanierung & Heiztechnik Wetzlar',
    description: 'Ihr Meisterbetrieb für Badsanierung, NIBE Wärmepumpen, Gas-Brennwert, Wohnraumlüftung und Trinkwasserhygiene in Wetzlar, Gießen & Lahn-Dill. Bis zu 70% Förderung.',
    alternates: {
        canonical: 'https://bad-energie.de'
    }
};

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            
            {/* AMBIENT GLOW ORBS */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />
            <div className="ambient-glow-red top-[1400px] left-1/3 opacity-40" />

            {/* HERO SECTION - DOUBLE-BEZEL GLASS LUXURY */}
            <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Hero Text Content (Left 7 Cols) */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            
                            {/* Eyebrow Pill Badges */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#0C3A87] text-[11px] font-black tracking-wider uppercase border border-blue-200/70 shadow-xs">
                                    <ShieldCheck className="w-4 h-4 text-[#0C3A87]" />
                                    Meisterbetrieb seit 2001 &middot; Wetzlar
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50/90 backdrop-blur-md text-[#E4040E] text-[11px] font-black tracking-wider uppercase border border-red-200/70 shadow-xs">
                                    <Award className="w-4 h-4 text-[#E4040E]" />
                                    Offizieller NIBE Effizienz Partner
                                </span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                                Ihr Meisterbetrieb für <br />
                                <span className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#296BF5] bg-clip-text text-transparent">Wohlfühlbäder</span> &amp; <br />
                                <span className="bg-gradient-to-r from-[#E4040E] to-[#B91C1C] bg-clip-text text-transparent">moderne Energietechnik</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                Von schlüsselfertiger Badsanierung nach Maß über zukunftssichere NIBE Wärmepumpensysteme mit bis zu 70 % Förderung bis hin zu kontrollierter Wohnraumlüftung und Trinkwasserhygiene im gesamten Lahn-Dill-Kreis.
                            </p>

                            {/* Button-in-Button CTA Cluster */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                                <Link
                                    href="/termin"
                                    className="w-full sm:w-auto inline-flex items-center justify-between gap-3 pl-6 pr-2 py-2 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-sm shadow-[0_12px_28px_rgba(228,4,14,0.35)] hover:shadow-[0_16px_36px_rgba(228,4,14,0.45)] transition-all transform hover:-translate-y-0.5 border border-white/20 group"
                                >
                                    <span>Beratungstermin buchen</span>
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <Calendar className="w-4 h-4 text-white" />
                                    </div>
                                </Link>

                                <Link
                                    href="/bad/budgetkalkulator"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/85 backdrop-blur-md hover:bg-white text-[#0C3A87] font-black text-sm border border-blue-200/80 shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5"
                                >
                                    <Calculator className="w-4 h-4 text-[#0C3A87]" />
                                    <span>Bad-Kalkulator</span>
                                </Link>

                                <a
                                    href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-blue-50/80 backdrop-blur-md hover:bg-blue-100/90 text-[#0C3A87] font-extrabold text-sm border border-blue-200/60 transition-colors"
                                    title="Direkt anrufen"
                                >
                                    <Phone className="w-4 h-4 text-[#0C3A87]" />
                                    <span>{COMPANY_DATA.contact.phone}</span>
                                </a>
                            </div>

                            {/* Trust Signals */}
                            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Festpreisgarantie &amp; Termintreue
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Staubarme Badsanierung
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Bis zu 70 % BEG / KfW Zuschuss
                                </span>
                            </div>
                        </div>

                        {/* Hero Double-Bezel Glass Interactive Quick-Finder (Right 5 Cols) */}
                        <div className="lg:col-span-5">
                            <div className="p-1.5 rounded-[2.5rem] bg-gradient-to-b from-white/90 via-white/60 to-white/30 border border-white/80 shadow-[0_25px_60px_rgba(12,58,135,0.12)] backdrop-blur-2xl">
                                <div className="rounded-[calc(2.5rem-6px)] bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] relative">
                                    <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/20">
                                        Schnell-Finder
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-1">
                                        Was möchten Sie modernisieren?
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-5 font-medium">
                                        Wählen Sie Ihr Fachgewerk für eine maßgeschneiderte Lösung:
                                    </p>

                                    <div className="space-y-2.5">
                                        <Link
                                            href="/bad/badsanierung"
                                            className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-[#0C3A87] hover:bg-blue-50/70 transition-all flex items-center justify-between group block shadow-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0C3A87] flex items-center justify-center font-bold">
                                                    <Droplets className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0C3A87]">
                                                        Badsanierung &amp; Barrierefreiheit
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500">Musterbäder, DIN 18040-2, 3D-Planung</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0C3A87] group-hover:translate-x-1 transition-all" />
                                        </Link>

                                        <Link
                                            href="/heizung/waermepumpe"
                                            className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-[#E4040E] hover:bg-red-50/70 transition-all flex items-center justify-between group block shadow-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#E4040E] flex items-center justify-center font-bold">
                                                    <Flame className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#E4040E]">
                                                        Wärmepumpen &amp; NIBE Effizienz
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500">Bis zu 70 % Förderung, Heizungstausch</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#E4040E] group-hover:translate-x-1 transition-all" />
                                        </Link>

                                        <Link
                                            href="/lueftung"
                                            className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-[#35A7E9] hover:bg-cyan-50/70 transition-all flex items-center justify-between group block shadow-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-[#0284C7] flex items-center justify-center font-bold">
                                                    <Wind className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0284C7]">
                                                        Wohnraumlüftung &amp; Klimaanlagen
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500">Wärmerückgewinnung &amp; Schimmelschutz</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284C7] group-hover:translate-x-1 transition-all" />
                                        </Link>

                                        <Link
                                            href="/haustechnik/legionellen"
                                            className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-slate-400 hover:bg-slate-50/70 transition-all flex items-center justify-between group block shadow-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                                                        Trinkwasserhygiene &amp; Legionellen
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500">Filter, Entkalkung &amp; Prüfpflicht</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <span>Notdienst für Bestandskunden:</span>
                                        <Link href="/notdienst" className="font-bold text-[#E4040E] hover:underline">
                                            Hier anrufen &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CORE SERVICES OVERVIEW - FROSTED GLASS BENTO */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-3 inline-block shadow-xs">
                            Ganzheitliche Handwerksleistungen
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Unsere Kernbereiche &amp; Gewerke
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                            Ob privates Eigenheim, Wohnungsgesellschaft oder Großgewerbe: Bad &amp; Energie GmbH vereint Meistertradition mit innovativer Spitzentechnologie.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SERVICES.map((srv) => (
                            <div
                                key={srv.id}
                                className="glass-surface rounded-[2rem] p-8 hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-white text-[#0C3A87] shadow-sm flex items-center justify-center mb-6 font-bold border border-white/80 group-hover:bg-[#0C3A87] group-hover:text-white transition-colors">
                                        {srv.id === 'bad' && <Droplets className="w-7 h-7" />}
                                        {srv.id === 'heizung' && <Flame className="w-7 h-7" />}
                                        {srv.id === 'lueftung' && <Wind className="w-7 h-7" />}
                                        {srv.id === 'haustechnik' && <Shield className="w-7 h-7" />}
                                        {srv.id === 'energie' && <Sun className="w-7 h-7" />}
                                        {srv.id === 'gewerbe' && <Award className="w-7 h-7" />}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#0C3A87] transition-colors">
                                        {srv.name}
                                    </h3>
                                    <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                                        {srv.shortDescription}
                                    </p>

                                    <div className="space-y-2 mb-6">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Leistungsschwerpunkte:
                                        </span>
                                        <ul className="space-y-1.5">
                                            {srv.features.slice(0, 3).map((feat, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                                    <Link
                                        href={srv.link}
                                        className="text-xs font-bold text-[#0C3A87] hover:underline flex items-center gap-1"
                                    >
                                        <span>Details &amp; Fachinformationen</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MUSTERBAD TEASER */}
            <MusterbadTeaser />

            {/* NIBE EFFIZIENZ PARTNER SPOTLIGHT - DARK OCEAN GLASS */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden">
                        
                        {/* Background light glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                            <div className="lg:col-span-7 space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-extrabold">
                                    <Award className="w-4 h-4 text-[#FF1E16]" />
                                    Zertifizierter Fachbetrieb
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
                                    Offizieller NIBE Effizienz Partner in Wetzlar &amp; Lahn-Dill
                                </h2>

                                <p className="text-sm text-blue-100 leading-relaxed">
                                    Als autorisierter NIBE Effizienz Partner planen und installieren wir hocheffiziente Luft-Wasser- und Sole-Wasser-Wärmepumpen der schwedischen Spitzenmarke. Modernste Inverter-Technologie, natürliche Kältemittel wie Propan (R290) und intelligente Smart-Home-Anbindung garantieren minimale Heizkosten und maximale Betriebssicherheit.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-inner">
                                        <span className="text-3xl font-black text-amber-300">bis zu 70 %</span>
                                        <p className="text-xs text-blue-100 mt-1">BEG / KfW 458 Zuschuss für Heizungstausch</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-inner">
                                        <span className="text-3xl font-black text-amber-300">5 Jahre</span>
                                        <p className="text-xs text-blue-100 mt-1">NIBE Systemgarantie bei Meistermontage</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-4">
                                    <Link
                                        href="/heizung/nibe-partner"
                                        className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                                    >
                                        NIBE Wärmepumpen entdecken &rarr;
                                    </Link>
                                    <Link
                                        href="/foerderung"
                                        className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all backdrop-blur-md"
                                    >
                                        Fördermittel-Check
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:col-span-5">
                                <div className="glass-surface text-slate-900 p-8 rounded-3xl shadow-2xl border border-white/70">
                                    <h3 className="text-xl font-black text-[#0C3A87] mb-2">
                                        Heizungs-Check &amp; Beratung
                                    </h3>
                                    <p className="text-xs text-slate-600 mb-6 font-medium">
                                        Lassen Sie Ihre Bestandsheizung unverbindlich von unseren Meistern auf Wärmepumpen-Eignung prüfen:
                                    </p>

                                    <ul className="space-y-3 mb-6 text-xs text-slate-700 font-medium">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Exakte Heizlastberechnung nach DIN EN 12831</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Hydraulischer Abgleich nach Verfahren B</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Komplette Antragsbegleitung KfW 458</span>
                                        </li>
                                    </ul>

                                    <Link
                                        href="/termin"
                                        className="w-full py-4 px-4 rounded-2xl bg-[#0C3A87] hover:bg-[#0E1C76] text-white font-bold text-xs text-center block transition-all shadow-md hover:shadow-lg"
                                    >
                                        Vor-Ort-Heizungscheck buchen &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8-POINT QUALITY PROMISE */}
            <QualityPromise />

            {/* INTERACTIVE BUDGET & HEATING CONFIGURATORS SECTION */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-3 inline-block shadow-xs">
                            Transparente Kosten &amp; Planung
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Interaktive Online-Rechner &amp; Konfiguratoren
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                            Kalkulieren Sie in wenigen Klicks Richtwerte für Ihre Badsanierung oder berechnen Sie die Fördermittel für Ihre neue Wärmepumpe.
                        </p>
                    </div>

                    <div className="space-y-16">
                        <BudgetKalkulator />
                        <HeizungKonfigurator />
                    </div>
                </div>
            </section>

            {/* CUSTOMER REVIEWS & 5/5 SOCIAL PROOF */}
            <ReviewsSection />

            {/* BADANFRAGE FORM & FINAL CTA */}
            <section className="py-24 relative" id="anfrage">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-xs uppercase font-black tracking-wider text-[#E4040E] bg-red-50/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-200/70 mb-3 inline-block shadow-xs">
                            Unverbindliche Anfrage
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Starten Sie Ihr Modernisierungsprojekt
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Füllen Sie unsere multi-step Anfrage aus oder buchen Sie direkt einen persönlichen Vor-Ort-Termin mit unserem Meister.
                        </p>
                    </div>

                    <BadanfrageFunnel />
                </div>
            </section>
        </div>
    );
}
