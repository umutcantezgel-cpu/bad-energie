import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Ausbildung Anlagenmechaniker SHK Wetzlar | Bad & Energie GmbH',
    description: 'Starte deine Ausbildung zum Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik (m/w/d) in Wetzlar. Meisterbetrieb mit Zukunft & bester Übernahmechance.',
    alternates: { canonical: 'https://bad-energie.de/karriere/ausbildung' }
};

export default function AusbildungPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Ausbildungsberuf mit Zukunft
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Ausbildung zum Anlagenmechaniker SHK (m/w/d)
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Klimaschützer und Traumbad-Erbauer werden: Lerne bei der Bad &amp; Energie GmbH in Wetzlar die zukunftsweisende Verbindung aus erneuerbaren Energien, Wärmepumpen und modernster Sanitärtechnik.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { title: 'Was du lernst', desc: 'Installation modernster NIBE Wärmepumpen, 3D-Bäderbau, Rohrleitungsverlegung, Smarthome-Regelungen und Kundendiensttechnik.' },
                        { title: 'Was wir dir bieten', desc: 'Feste Ausbildungsvergütung, eigenes Werkzeugset, erfahrene Ausbilder, Prüfungsvorbereitung und 100 % Übernahmechancen.' },
                        { title: 'Was du mitbringst', desc: 'Handwerkliches Geschick, Interesse an moderner Technik und erneuerbaren Energien, Teamgeist und Zuverlässigkeit.' }
                    ].map((b, i) => (
                        <div key={i} className="glass-surface p-8 rounded-[2rem] hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h2 className="font-black text-lg text-slate-900 mb-2">{b.title}</h2>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-bezel-outer shadow-2xl max-w-2xl mx-auto">
                    <div className="glass-bezel-inner p-8 text-center space-y-3">
                        <h3 className="text-xl font-black text-slate-900">Bereit für deine Zukunft?</h3>
                        <p className="text-xs text-slate-600 font-medium">
                            Bewirb dich unkompliziert per E-Mail oder ruf uns direkt an für ein lockeres Kennenlernen oder Schnupperpraktikum.
                        </p>
                        <div className="pt-2">
                            <a
                                href={`mailto:${COMPANY_DATA.headquarters.email}?subject=Bewerbung%20Ausbildung%20Anlagenmechaniker`}
                                className="inline-block px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_8px_20px_rgba(228,4,14,0.35)] text-white font-black text-xs shadow-md transition-all border border-white/20"
                            >
                                Jetzt per E-Mail bewerben &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
