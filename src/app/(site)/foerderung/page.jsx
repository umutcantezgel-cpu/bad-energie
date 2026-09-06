import React from 'react';
import Link from 'next/link';
import { BadgePercent, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight, Sparkles, Award } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export default function FoerderungPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-red -top-20 -right-20" />
            <div className="ambient-glow-blue top-96 -left-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        BEG &middot; KfW 458 &middot; Pflegekasse (§ 40 SGB XI)
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Fördermittelberatung für Heizung &amp; Bad
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Verschenken Sie kein Geld: Für den Einbau einer neuen NIBE Wärmepumpe erhalten Sie bis zu 70 % staatlichen Zuschuss – für barrierefreie Bäder bis zu 4.000 € von der Pflegekasse. Wir begleiten Ihren Antrag von Anfang an.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/heizung/heizungskonfigurator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Förderquote online berechnen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Grant Details Matrix */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        So setzt sich die 70 % Heizungsförderung zusammen (KfW 458)
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Maximale förderfähige Investitionskosten: 30.000 € für ein Einfamilienhaus (max. Zuschuss 21.000 €).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { rate: '30 %', title: 'Grundförderung', desc: 'Für alle Eigentümer beim Einbau einer Wärmepumpe oder Biomasseheizung.' },
                        { rate: '+ 20 %', title: 'Geschwindigkeits-Bonus', desc: 'Für selbstnutzende Eigentümer bei vorzeitigem Austausch alter funktionierender Öl-/Gasheizungen.' },
                        { rate: '+ 30 %', title: 'Einkommens-Bonus', desc: 'Für selbstnutzende Eigentümer mit einem zu versteuernden Haushaltsjahreseinkommen bis 40.000 €.' },
                        { rate: '+ 5 %', title: 'Effizienz-Bonus', desc: 'Für Wärmepumpen mit natürlichem Kältemittel wie Propan (R290 bei NIBE) oder Erdwärme.' }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(228,4,14,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <span className="text-3xl sm:text-4xl font-black text-[#E4040E] mb-1 block">{item.rate}</span>
                                <h3 className="font-black text-base text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bathroom Grant - Double Bezel */}
                <div className="glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2 space-y-2">
                            <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-full inline-block border border-blue-200/60">
                                Barrierefreie Bäder (§ 40 SGB XI)
                            </span>
                            <h3 className="text-2xl font-black text-slate-900">
                                Bis zu 4.000 € Zuschuss für Ihr barrierefreies Bad
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Für Pflegebedürftige (Pflegegrad 1–5) übernimmt die Pflegekasse bis zu 4.000 € für Maßnahmen zur Wohnumfeldverbesserung (z. B. bodengleiche Dusche statt Badewanne, schwellenlose Zugänge). Wir erstellen den prüffähigen Kostenvoranschlag.
                            </p>
                        </div>
                        <div className="text-center md:text-right">
                            <Link
                                href="/termin"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
                            >
                                <span>Beratung vereinbaren</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <QualityPromise />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <TouchConfigurator modus="kunde" journey="heizung" quelle="web_heizung" />
            </div>
        </div>
    );
}
