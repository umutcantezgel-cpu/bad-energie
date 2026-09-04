import React from 'react';
import Link from 'next/link';
import { 
    Droplets, 
    CheckCircle2, 
    ShieldCheck, 
    Clock, 
    Sparkles, 
    Calendar, 
    Phone, 
    ArrowRight,
    Calculator,
    Check
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import BadanfrageFunnel from '@/components/funnels/BadanfrageFunnel';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Badsanierung Wetzlar | Komplettbäder aus Meisterhand | Bad & Energie GmbH',
    description: 'Badsanierung in Wetzlar & Lahn-Dill: Komplettbad aus einer Hand mit Festpreisgarantie, 3D-Planung und staubarmer Sanierung. Jetzt unverbindlich anfragen!',
    alternates: { canonical: 'https://bad-energie.de/bad/badsanierung' }
};

export default function BadsanierungPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Meisterbetrieb Bad &amp; Energie GmbH &middot; Wetzlar
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Badsanierung in Wetzlar: <br />
                        <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Ihr neues Traumbad ohne Stress &amp; zum Festpreis</span>
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Wir verwandeln alte, unpraktische Bäder in moderne Wohlfühloasen. Schlüsselfertige Ausführung, eigene Fachhandwerker und saubere Baustellenführung.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/bad/budgetkalkulator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Kosten online berechnen &rarr;
                        </Link>
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-2 backdrop-blur-md"
                        >
                            <Phone className="w-4 h-4" />
                            {COMPANY_DATA.contact.phone}
                        </a>
                    </div>
                </div>
            </div>

            {/* 6-Step Workflow Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/70 mb-2 inline-block shadow-xs">
                        Der Weg zum neuen Bad
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        In 6 Schritten zu Ihrem schlüsselfertigen Wohlfühlbad
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Vollständige Gewerke-Koordination durch Bad &amp; Energie GmbH. Sie lehnen sich entspannt zurück.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { step: '01', title: 'Vor-Ort-Beratung & Aufmaß', desc: 'Wir messen Ihr bestehendes Bad millimetergenau aus und erfassen Ihre Wünsche, Lebensgewohnheiten und Ihr Budget.' },
                        { step: '02', title: '3D-Visualisierung & Produktauswahl', desc: 'Erleben Sie Ihr neues Bad vorab in fotorealistischem 3D. Gemeinsame Auswahl von Keramik, Armaturen, Fliesen und Beleuchtung.' },
                        { step: '03', title: 'Verbindliches Festpreisangebot', desc: 'Sie erhalten ein detailliertes Angebot mit Festpreisgarantie und einem verbindlichen Bauzeitplan ohne versteckte Kosten.' },
                        { step: '04', title: 'Staubarme Demontage', desc: 'Modernste Luftreiniger und Schutzvliese verhindern die Staubausbreitung in Ihren Wohnräumen beim Rückbau der alten Installationen.' },
                        { step: '05', title: 'Fachgerechte Meisterinstallation', desc: 'Rohrleitungsinstallation, Trockenbau, Elektroinstallation, Fliesenverlegung und Montage der Sanitärkomponenten durch unser Meisterteam.' },
                        { step: '06', title: 'Endreinigung & Schlüsselfertige Übergabe', desc: 'Gründliche Endreinigung, Funktionsprüfung aller Elemente, Einweisung in Pflege und Übergabe der Garantieurkunden.' }
                    ].map((st) => (
                        <div key={st.step} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <span className="text-2xl sm:text-3xl font-black text-[#0C3A87] mb-2 block">{st.step}</span>
                            <h3 className="text-base font-black text-slate-900 mb-2">{st.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{st.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quality Promise */}
            <QualityPromise />

            {/* Funnel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <BadanfrageFunnel />
            </div>
        </div>
    );
}
