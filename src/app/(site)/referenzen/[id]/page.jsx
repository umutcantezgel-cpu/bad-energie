"use client";
import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, CheckCircle2, Ruler, Clock, ArrowRight, Quote, ShieldCheck, Sparkles } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { projects as configProjects, categories } from '@/config/projects';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const content = useContent();

    const projectsData = content?.projects || configProjects;
    const projectList = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || []);

    const project = useMemo(() => projectList.find(p => p.id.toString() === id), [projectList, id]);

    if (!project) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-black text-slate-900 mb-4">Projekt nicht gefunden</h1>
                <p className="text-xs text-slate-500 mb-8">Das gesuchte Referenzprojekt existiert leider nicht.</p>
                <Link href="/referenzen" className="px-6 py-3 rounded-full bg-[#0C3A87] text-white font-bold text-xs shadow-md">
                    Zurück zur Projekt-Übersicht
                </Link>
            </div>
        );
    }

    const categoryName = categories.find(c => c.id === project.category)?.name || project.category;
    const primaryImage = project.images?.find(img => img.type === 'after')?.url || project.images?.[0]?.url;

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 space-y-6 relative overflow-hidden">
                    <Link href="/referenzen" className="inline-flex items-center text-xs font-bold text-blue-200/80 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                        Zurück zur Referenzen-Übersicht
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-white/10 backdrop-blur-md text-cyan-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/15">
                            {categoryName}
                        </span>
                        {project.year && (
                            <span className="text-white/80 flex items-center text-xs font-bold backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/15">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-cyan-300" />
                                {project.year}
                            </span>
                        )}
                        <span className="text-white/80 flex items-center text-xs font-bold backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/15">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-cyan-300" />
                            {project.location}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-4xl">
                        {project.title}
                    </h1>

                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal">
                        {project.description}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-surface p-8 sm:p-10 rounded-[2.5rem] space-y-6">
                            <h2 className="text-2xl font-black text-slate-900">
                                Projekt-Überblick: {project.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                Für dieses Projekt im Bereich {categoryName} in {project.location} übernahm unser Meisterbetrieb die vollständige Konzeption, Demontage der Altanlage, präzise Neuinstallation und fachgerechte Inbetriebnahme. Durch die enge Abstimmung mit dem Bauherrn konnten alle Arbeiten termingerecht und im vereinbarten Festpreisrahmen abgeschlossen werden.
                            </p>

                            {/* Challenge & Solution */}
                            <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                {project.challenge && (
                                    <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                                        <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">Herausforderung vor Ort</h3>
                                        <p className="text-xs text-amber-800 leading-relaxed font-medium">{project.challenge}</p>
                                    </div>
                                )}
                                {project.solution && (
                                    <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60">
                                        <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-2">Meisterlösung</h3>
                                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">{project.solution}</p>
                                    </div>
                                )}
                            </div>

                            {/* Key Highlights */}
                            <div className="pt-4 border-t border-slate-200/60">
                                <h3 className="text-lg font-black text-slate-900 mb-3">Qualitätsmerkmale der Ausführung</h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Normgerechte Meisterausführung</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Geprüfte Markenkomponenten</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Höchste Energieeffizienz</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Verbindlicher Festpreis &amp; Garantie</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial */}
                        {project.testimonial && (
                            <div className="glass-surface p-8 rounded-[2rem] border-l-4 border-[#0C3A87]">
                                <blockquote className="space-y-3">
                                    <p className="text-xs sm:text-sm italic text-slate-700 font-medium leading-relaxed">
                                        &bdquo;{project.testimonial.text}&ldquo;
                                    </p>
                                    <footer className="text-xs font-black text-slate-900">
                                        — {project.testimonial.author}
                                        {project.testimonial.role && <span className="text-slate-500 font-normal">, {project.testimonial.role}</span>}
                                    </footer>
                                </blockquote>
                            </div>
                        )}
                    </div>

                    {/* Double-Bezel Sidebar */}
                    <div className="glass-bezel-outer shadow-2xl sticky top-28">
                        <div className="glass-bezel-inner p-8 space-y-6">
                            <h3 className="text-xl font-black text-slate-900">
                                Projektdaten im Detail
                            </h3>

                            <div className="space-y-3 text-xs">
                                {project.duration && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#0C3A87]" />
                                            Bauzeit
                                        </span>
                                        <span className="font-black text-slate-900">{project.duration}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <Ruler className="w-3.5 h-3.5 text-[#0C3A87]" />
                                        Kategorie
                                    </span>
                                    <span className="font-black text-slate-900 capitalize">{categoryName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-[#0C3A87]" />
                                        Standort
                                    </span>
                                    <span className="font-black text-slate-900">{project.location}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs text-slate-600 mb-3 font-medium text-center">
                                    Planen Sie ein ähnliches Projekt?
                                </p>
                                <Link
                                    href="/termin"
                                    className="block w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs text-center shadow-md hover:shadow-lg transition-all border border-white/20"
                                >
                                    Jetzt Beratung anfragen &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
