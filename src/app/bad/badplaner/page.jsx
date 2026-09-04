import React from 'react';
import Link from 'next/link';
import { 
    Maximize2, 
    Monitor, 
    Smartphone, 
    CheckCircle2, 
    Sparkles, 
    Calendar, 
    Phone, 
    ArrowRight, 
    Layers 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import BadanfrageFunnel from '@/components/funnels/BadanfrageFunnel';

export const metadata = {
    title: '3D-Badplaner Guide | Bad & Energie GmbH Wetzlar',
    description: 'Planen Sie Ihr Badezimmer in fotorealistischem 3D. Anleitung & Tipps für die digitale Badplanung am PC, Tablet oder vor Ort mit unseren Meistern.',
    alternates: { canonical: 'https://bad-energie.de/bad/badplaner' }
};

export default function BadplanerPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Digitale 3D-Raumgestaltung
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Ihr 3D-Badplaner Guide
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Erleben Sie Ihr neues Badezimmer schon vor dem ersten Hammerschlag in 3D. Entdecken Sie Grundriss-Varianten, Farben, Sanitärmöbel und Lichtkonzepte.
                    </p>
                </div>
            </div>

            {/* Desktop Notice Box - Double Bezel */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0C3A87] flex items-center justify-center shrink-0 shadow-xs border border-blue-200/60">
                            <Monitor className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-black text-base text-slate-900">
                                Empfehlung: Für das beste Erlebnis am PC oder Tablet planen
                            </h2>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Die detaillierte 3D-Badgestaltung mit exaktem Aufmaß, Fenstern, Dachschrägen und Anschlüssen gelingt am komfortabelsten auf einem größeren Bildschirm. Gerne führen wir die 3D-Planung auch gemeinsam mit Ihnen bei unserem Vor-Ort-Termin durch!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3-Step Guide */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        So funktioniert die 3D-Badplanung
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        In drei einfachen Schritten von Ihrer Idee zur fotorealistischen Visualisierung.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { num: '01', title: 'Raummaße & Anschlüsse erfassen', desc: 'Messen Sie Länge, Breite und Raumhöhe aus und notieren Sie die Positionen von Türen, Fenstern, Heizkörpern und Rohrleitungsanschlüssen.' },
                        { num: '02', title: 'Sanitärelemente platzieren', desc: 'Wählen Sie Ihre Wunschausstattung: Walk-In Dusche, Badewanne, Waschtischmöbel, Spiegelschränke und WC nach Belieben anordnen.' },
                        { num: '03', title: 'Farben, Fliesen & Licht abstimmen', desc: 'Kombinieren Sie Fliesenoberflächen, Wandfarben und moderne LED-Beleuchtung für eine harmonische Wohlfühlatmosphäre.' }
                    ].map((step) => (
                        <div key={step.num} className="glass-surface p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <div>
                                <span className="text-3xl sm:text-4xl font-black text-[#0C3A87] mb-3 block">{step.num}</span>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Funnel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <BadanfrageFunnel />
            </div>
        </div>
    );
}
