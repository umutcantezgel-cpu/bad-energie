import React from 'react';
import Link from 'next/link';
import { 
    Grid, 
    CheckCircle2, 
    Check, 
    ShieldCheck, 
    Phone, 
    Calendar, 
    ArrowRight,
    Sparkles 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';

export const metadata = {
    title: 'Fliesenverlegung Wetzlar | Meisterhafte Fliesen- & Mosaikarbeiten | Bad & Energie GmbH',
    description: 'Fachgerechte Fliesenverlegung im Badezimmer: Großformatige Fliesen, Feinsteinzeug, Mosaike und Naturstein in Wetzlar & Lahn-Dill.',
    alternates: { canonical: 'https://bad-energie.de/bad/fliesen' }
};

export default function FliesenPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Fliesen- &amp; Natursteinhandwerk Wetzlar
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Perfekte Fliesenverlegung für Ihr neues Badezimmer
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Großformatige Fliesen (XXL), fugenarme Wandkonzepte, edler Naturstein und rutschhemmende Mosaike – millimetergenau und fachgerecht abgedichtet nach DIN 18534.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Beratung &amp; Bemusterung anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'XXL Großformatfliesen', desc: 'Fliesen bis 120 x 260 cm für moderne, fugenarme Wandflächen mit minimalem Pflegeaufwand und atemberaubender Raumwirkung.' },
                        { title: 'Verbundabdichtung nach DIN 18534', desc: 'Absolute Wasserdichtigkeit im Dusch- und Wannenbereich schützt das Mauerwerk und die Bausubstanz dauerhaft vor Durchfeuchtung.' },
                        { title: 'Rutschhemmung R10 / R11', desc: 'Sichere Bodenfliesen im Nassbereich für barrierefreie Bäder nach DIN 18040-2 zur Vermeidung von Ausrutschunfällen.' },
                        { title: 'Feinsteinzeug & Naturstein', desc: 'Robuste, kratzfeste und pflegeleichte Materialien in edler Beton-, Holz-, Marmor- oder Schieferoptik.' },
                        { title: 'Filigrane Mosaike & Nischen', desc: 'Individuell beleuchtete Shampoonischen, Wandablagen und akzentuierte Duschbereiche mit Mosaikfliesen.' },
                        { title: 'Gewerke-Kombination', desc: 'Keine Fugenabrisse oder Schnittstellenprobleme: Fliesenleger und Sanitärinstallateure arbeiten bei uns Hand in Hand.' }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-black text-base text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <TouchConfigurator modus="kunde" journey="bad" quelle="web_bad" />
            </div>
        </div>
    );
}
