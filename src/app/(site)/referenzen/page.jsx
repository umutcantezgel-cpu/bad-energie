import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Star, MapPin } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import ReviewsSection from '@/components/sections/ReviewsSection';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Referenzen & Kundenprojekte | Bad, Heizung & Lüftung | Bad & Energie GmbH',
    description: 'Erfolgreiche Kundenprojekte der Bad & Energie GmbH in Wetzlar, Gießen & Lahn-Dill: Komplettbäder, NIBE Wärmepumpen, Wohnraumlüftung & Haustechnik.',
    alternates: { canonical: 'https://bad-energie.de/referenzen' }
};

export default function ReferenzenPage() {
    const projects = [
        {
            title: 'Modernes Familienbad 8,2 ㎡ mit Walk-In Dusche',
            category: 'Badsanierung',
            location: 'Wetzlar',
            desc: 'Komplette Entkernung und Neugestaltung mit VIGOUR derby Mineralguss-Waschtischanlage, Duka ESG-Echtglaswand und drehbarem COSMO Designheizkörper.',
            duration: '10 Werktage'
        },
        {
            title: 'Barrierefreier Badumbau nach DIN 18040-2',
            category: 'Barrierefreies Bad',
            location: 'Gießen',
            desc: 'Altersgerechte Modernisierung mit bodengleicher Duschzone, VIGOUR Haltegriffsystem und 4.000 € Zuschuss der Pflegekasse.',
            duration: '7 Werktage'
        },
        {
            title: 'NIBE Luft-Wasser-Wärmepumpe im Bestandsbau',
            category: 'Heizung & Wärmepumpe',
            location: 'Lahn-Dill-Kreis',
            desc: 'Austausch einer 24 Jahre alten Ölheizung gegen eine hocheffiziente NIBE F2120 Wärmepumpe mit natürlichem Kältemittel R290 und 70% BEG-Förderung.',
            duration: '3 Tage'
        },
        {
            title: 'Zentrale Wohnraumlüftung mit 92% Wärmerückgewinnung',
            category: 'Lüftung & Klima',
            location: 'Aßlar',
            desc: 'Installation eines zentralen Lüftungssystems mit Enthalpietauscher im Neubau für dauerhaften Schimmelschutz und Pollenfilterung.',
            duration: '4 Tage'
        },
        {
            title: 'Trinkwasser-Enthärtungsanlage & Filter',
            category: 'Haustechnik',
            location: 'Braunfels',
            desc: 'Einbau einer DVGW-geprüften Ionenaustauscher-Enthärtungsanlage mit rückspülbarem Feinfilter zum Schutz des gesamten Rohrnetzes.',
            duration: '1 Tag'
        },
        {
            title: 'Gewerbliche Sanitäranlage mit Sensorarmaturen',
            category: 'Gewerbe',
            location: 'Wetzlar',
            desc: 'Sanierung der Sanitärräume eines Bürogebäudes nach ASR A4.1 mit berührungslosen Infrarotarmaturen und vandalensicherer Keramik.',
            duration: '14 Werktage'
        }
    ];

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Erfolgreiche Meisterarbeit
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Referenzen &amp; Kundenprojekte
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Ein Auszug aus über 1.000 erfolgreich realisierten Projekten in Wetzlar, Gießen und im gesamten Lahn-Dill-Kreis.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((p, idx) => (
                        <div key={idx} className="glass-surface p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-[#0C3A87] border border-blue-200/60 shadow-xs">
                                        {p.category}
                                    </span>
                                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-[#0C3A87]" />
                                        {p.location}
                                    </span>
                                </div>
                                <h2 className="font-black text-lg text-slate-900 leading-snug">{p.title}</h2>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{p.desc}</p>
                            </div>
                            <div className="pt-4 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
                                <span className="text-slate-500">Bauzeit: <strong className="text-slate-900 font-bold">{p.duration}</strong></span>
                                <span className="text-emerald-600 font-black flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Abgenommen
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ReviewsSection />
            <QualityPromise />
        </div>
    );
}
