import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
    Check, 
    Layers, 
    ArrowLeft, 
    ArrowRight, 
    ShieldCheck, 
    Phone, 
    Calendar, 
    CheckCircle2, 
    Sparkles 
} from 'lucide-react';
import { MUSTERBAEDER } from '@/config/musterbaeder';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';

import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, buildProjectNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const dynamicParams = false;

export async function generateStaticParams() {
    return MUSTERBAEDER.map((b) => ({
        slug: b.slug
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const bath = MUSTERBAEDER.find((b) => b.slug === slug);
    if (!bath) return { title: 'Musterbad | Bad & Energie GmbH' };

    return createMetadata({
        title: `${bath.title} (${bath.size})`,
        description: `${bath.headline}. Detaillierte Ausstattung mit VIGOUR, Duka & CONEL Elementen. Jetzt unverbindlich anfragen!`,
        path: `/bad/musterbaeder/${bath.slug}`,
        image: bath.image,
    });
}

export default async function MusterbadDetailPage({ params }) {
    const { slug } = await params;
    const bath = MUSTERBAEDER.find((b) => b.slug === slug);

    if (!bath) {
        notFound();
    }

    const pageUrl = `${SITE_URL}/bad/musterbaeder/${bath.slug}`;
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Bäder', path: '/bad' },
        { name: 'Musterbäder', path: '/bad/musterbaeder' },
        { name: bath.title, path: pageUrl },
    ];
    const schemaGraph = buildGraph([
        buildWebPageNode({
            url: pageUrl,
            name: `${bath.title} | Bad & Energie GmbH`,
            description: bath.headline,
            breadcrumbItems: breadcrumbs,
        }),
        buildBreadcrumbNode(breadcrumbs, pageUrl),
        buildProjectNode({
            name: bath.title,
            description: bath.headline,
            url: pageUrl,
            image: bath.image,
        }),
    ]);

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            <JsonLd schema={schemaGraph} />
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Header - Glass Surface Dark */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 space-y-4 relative overflow-hidden">
                    <Link
                        href="/bad/musterbaeder"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Zurück zur Musterbad-Übersicht</span>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-xs font-black bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white px-3.5 py-1 rounded-full shadow-xs border border-white/20">
                            {bath.size}
                        </span>
                        <span className="text-xs font-bold bg-white/20 text-white px-3.5 py-1 rounded-full border border-white/20">
                            {bath.tier}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        {bath.title}
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal">
                        {bath.headline}
                    </p>

                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 inline-flex items-center gap-6 shadow-inner">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-blue-200 block tracking-wider">Kalkulation:</span>
                            <span className="text-2xl sm:text-3xl font-black text-amber-300">{bath.priceFormatted || "auf Anfrage"}</span>
                        </div>
                        <span className="text-xs text-blue-200 hidden sm:inline font-medium">Individuelles Festpreisangebot nach Vor-Ort-Aufmaß</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Components Breakdown (Left 8 Cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                                Detaillierte Ausstattungs- und Komponentenliste
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Transparente Auflistung der verbauten Markenartikel von VIGOUR, Duka, CONEL und COSMO.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {bath.components.map((comp, idx) => (
                                <div
                                    key={idx}
                                    className="glass-surface rounded-[2rem] p-6 sm:p-8 hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] transition-all duration-500"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
                                        <h3 className="font-black text-base text-[#0C3A87]">
                                            {comp.category}
                                        </h3>
                                        <span className="text-xs font-black text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/60 shadow-xs">
                                            auf Anfrage
                                        </span>
                                    </div>

                                    <ul className="space-y-2.5">
                                        {comp.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Actions (Right 4 Cols) - Double Bezel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-bezel-outer sticky top-28 shadow-2xl">
                            <div className="glass-bezel-inner p-6 sm:p-8 space-y-4">
                                <h3 className="font-black text-lg text-slate-900">
                                    Dieses Musterbad anfragen
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Gefällt Ihnen das Konzept {bath.title}? Wir passen die Maße und Ausstattung individuell an Ihren Grundriss an.
                                </p>

                                <div className="space-y-3 pt-2">
                                    <Link
                                        href="/bad/badanfrage"
                                        className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_8px_20px_rgba(228,4,14,0.35)] text-white font-black text-xs text-center block shadow-md transition-all border border-white/20"
                                    >
                                        Konzept unverbindlich anfragen &rarr;
                                    </Link>

                                    <a
                                        href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                        className="w-full py-3 px-4 rounded-full bg-white text-[#0C3A87] font-black text-xs text-center border border-blue-200/80 block transition-all shadow-xs"
                                    >
                                        Direkt anrufen: {COMPANY_DATA.contact.phone}
                                    </a>
                                </div>

                                <div className="border-t border-slate-200/60 pt-4 space-y-2 text-xs text-slate-500 font-semibold">
                                    <p className="font-bold text-slate-800">Ihre Sicherheiten bei Bad &amp; Energie:</p>
                                    <p className="flex items-center gap-1.5 text-emerald-600">
                                        <Check className="w-3.5 h-3.5" />
                                        Festpreisgarantie
                                    </p>
                                    <p className="flex items-center gap-1.5 text-emerald-600">
                                        <Check className="w-3.5 h-3.5" />
                                        Verbindlicher Bauzeitplan
                                    </p>
                                    <p className="flex items-center gap-1.5 text-emerald-600">
                                        <Check className="w-3.5 h-3.5" />
                                        Staubarme Sanierung
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Funnel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <TouchConfigurator modus="kunde" journey="bad" quelle="web_bad" />
            </div>
        </div>
    );
}
