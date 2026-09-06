import React from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Heart, Award, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export default function KarrierePage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Werde Teil unseres Meisterteams
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Karriere bei der Bad &amp; Energie GmbH
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Sichere Arbeitsplätze mit Zukunft im Bereich erneuerbare Energien und moderne Badsanierung. Bei uns zählen Wertschätzung, modernstes Werkzeug und echter Teamgeist.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { title: 'Attraktive Vergütung', desc: 'Überdurchschnittliches Gehalt, Weihnachts- und Urlaubsgeld sowie steuerfreie Sachbezüge.' },
                        { title: 'Eigenes Servicefahrzeug', desc: 'Voll ausgestatteter Marken-Transporter mit Hilti-Maschinenpark und Arbeitskleidung von Engelbert Strauss.' },
                        { title: 'Weiterbildung & NIBE Schulung', desc: 'Regelmäßige Zertifizierungen direkt bei Herstellern für Wärmepumpen und moderne Badtechnik.' },
                        { title: 'Regionale Baustellen', desc: 'Keine tagelange Montage fern der Heimat: Unsere Projekte liegen alle im Raum Wetzlar & Lahn-Dill.' }
                    ].map((b, i) => (
                        <div key={i} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-black text-base text-slate-900 mb-2">{b.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Job Openings */}
                <div className="space-y-6 max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8">
                        Aktuelle Stellenangebote in Wetzlar
                    </h2>

                    {[
                        { title: 'Anlagenmechaniker SHK (m/w/d) – Badsanierung & Heizung', type: 'Vollzeit / Unbefristet', loc: 'Wetzlar & Lahn-Dill-Kreis', desc: 'Selbstständige Montage von Bädern, Rohrleitungen und modernen Wärmepumpenanlagen im Privat- und Gewerbekundenbereich.' },
                        { title: 'Kundendienstmonteur SHK / Servicetechniker (m/w/d)', type: 'Vollzeit / Unbefristet', loc: 'Wetzlar & Umgebung', desc: 'Wartung, Inbetriebnahme und Störungsbeseitigung an Wärmepumpen, Gas- und Ölbrennanlagen sowie Trinkwasserfiltern.' },
                        { title: 'Fliesenleger / Allround-Handwerker (m/w/d)', type: 'Vollzeit / Unbefristet', loc: 'Wetzlar & Umgebung', desc: 'Präzise Fliesenverlegung im Rahmen unserer schlüsselfertigen Komplettbadsanierungen.' }
                    ].map((job, idx) => (
                        <div key={idx} className="glass-surface p-8 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-0.5 transition-all duration-500">
                            <div>
                                <span className="text-xs font-black text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-full inline-block mb-2 border border-blue-200/60 shadow-xs">
                                    {job.type} &middot; {job.loc}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{job.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{job.desc}</p>
                            </div>
                            <div className="shrink-0">
                                <a
                                    href={`mailto:${COMPANY_DATA.headquarters.email}?subject=Bewerbung%20${encodeURIComponent(job.title)}`}
                                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white font-black text-xs shadow-md hover:shadow-lg transition-all block text-center border border-white/20"
                                >
                                    Jetzt bewerben &rarr;
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
