import React from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    ShieldCheck, 
    CheckCircle2, 
    Check, 
    Phone, 
    Calendar, 
    ArrowRight,
    Users,
    Clock,
    Wrench,
    FileCheck
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Bad aus einer Hand Wetzlar | Schlüsselfertige Badsanierung | Bad & Energie GmbH',
    description: 'Bad aus einer Hand in Wetzlar & Lahn-Dill: Ein Ansprechpartner, ein Festpreis, verbindliche Termine. Wir koordinieren Sanitär, Fliesen, Elektrik & Malerarbeiten.',
    alternates: { canonical: 'https://bad-energie.de/bad/bad-aus-einer-hand' }
};

export default function BadAusEinerHandPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Rundum-Sorglos-Service Wetzlar
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Bad aus einer Hand: <br />
                        <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Ein Ansprechpartner. Ein Festpreis. Null Stress.</span>
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Kein Ärger mit verschiedenen Handwerkern und Terminen. Bad &amp; Energie GmbH übernimmt die lückenlose Koordination von Sanitär, Fliesen, Elektrik, Trockenbau und Malerarbeiten bis zur schlüsselfertigen Übergabe.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/bad/budgetkalkulator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Bad-Kosten berechnen &rarr;
                        </Link>
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all backdrop-blur-md"
                        >
                            Beratungstermin buchen
                        </Link>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Ihre Vorteile mit unserem Komplettbad-Service
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Warum über 1.000 Kunden im Lahn-Dill-Kreis auf Bad &amp; Energie vertrauen:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Users, title: 'Ein fester Meister-Ansprechpartner', desc: 'Sie müssen nicht mit fünf verschiedenen Firmen telefonieren. Ihr Bauleiter betreut Sie von A bis Z.' },
                        { icon: FileCheck, title: 'Verbindlicher Festpreis', desc: 'Transparente Gesamtkalkulation aller Gewerke ohne versteckte Kosten oder böse Überraschungen.' },
                        { icon: Clock, title: 'Garantierter Bauzeitplan', desc: 'Wir definieren exakte Start- und Übergabetermine und halten uns zuverlässig an die Vereinbarung.' },
                        { icon: Wrench, title: 'Staubarme Ausführung', desc: 'Einsatz von Unterdruckgeräten, Staubschutzwänden und Schonabdeckungen für saubere Wohnräume.' }
                    ].map((b, i) => {
                        const Icon = b.icon;
                        return (
                            <div key={i} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0C3A87] flex items-center justify-center mb-4 font-bold shadow-xs border border-blue-200/60">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-black text-slate-900 mb-2">{b.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <QualityPromise />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <TouchConfigurator modus="kunde" journey="bad" quelle="web_bad" />
            </div>
        </div>
    );
}
