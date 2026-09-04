import React from 'react';
import Link from 'next/link';
import { 
    ShieldCheck, 
    BadgePercent, 
    CheckCircle2, 
    Check, 
    Phone, 
    Calendar, 
    ArrowRight, 
    Info, 
    HeartHandshake 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';

export const metadata = {
    title: 'Barrierefreie Badmodernisierung Wetzlar | Bis 4.000 € Pflegekassenzuschuss',
    description: 'Altersgerechte und barrierefreie Badmodernisierung nach DIN 18040-2 in Wetzlar. Bodengleiche Duschen, Dusch-WC & bis zu 4.000 € Zuschuss der Pflegekasse.',
    alternates: { canonical: 'https://bad-energie.de/bad/barrierefreies-bad' }
};

export default function BarrierefreiesBadPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        DIN 18040-2 &middot; Barrierefreies Wohnen
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Barrierefreie Badmodernisierung in Wetzlar: <br />
                        <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Sicherheit, Komfort &amp; bis zu 4.000 € Zuschuss</span>
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Selbstbestimmt und sicher im eigenen Zuhause leben: Wir gestalten Ihr Badezimmer altersgerecht, rollstuhlgerecht oder barrierearm – mit bodengleichen Duschen, rutschfesten Böden und Unterstützung bei der Pflegekassen-Förderung.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Pflegekassen-Beratung vereinbaren &rarr;
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

            {/* Grant / Funding Highlight Box - Double Bezel */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2 space-y-2">
                            <div className="flex items-center gap-2 text-[#E4040E] font-black text-xs">
                                <BadgePercent className="w-5 h-5" />
                                <span>Zuschuss für wohnumfeldverbessernde Maßnahmen (§ 40 SGB XI)</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">
                                Bis zu 4.000 € Zuschuss von der Pflegekasse
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Bereits ab Pflegegrad 1 bezuschusst die Pflegekasse den Umbau auf ein barrierefreies Bad mit bis zu 4.000 € pro Person (bei Ehepaaren mit Pflegegrad sogar bis zu 8.000 €). Wir erstellen für Sie den förderkonformen Kostenvoranschlag.
                            </p>
                        </div>
                        <div className="text-center md:text-right">
                            <Link
                                href="/termin"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
                            >
                                <span>Beratung anfordern</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Solutions Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Unsere barrierefreien Bad-Lösungen im Detail
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Ästhetik trifft auf maximale Sicherheit – ohne sterilen Krankenhaus-Charakter.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Bodengleiche Walk-In Duschen', desc: 'Schwellenloser Einstieg ohne Stolperfallen. Integrierte Duschrinne, rutschhemmende Fliesen (R10B) und breite Duka Glaszugänge.' },
                        { title: 'Wanne-zur-Dusche-Umbau', desc: 'In nur 24 bis 48 Stunden tauschen wir Ihre alte, hohe Badewanne gegen eine moderne, begehbare Duschzone aus.' },
                        { title: 'Unterfahrbare Waschtische', desc: 'Ergonomische Waschtischanlagen mit Beinfreiheit für Rollstuhlfahrer und komfortable Einhebel- oder Sensorarmaturen.' },
                        { title: 'Komfort- & Dusch-WCs', desc: 'Höhenverstellbare oder erhöhte WCs für bequemes Aufstehen sowie moderne Dusch-WCs für optimale Intimhygiene auf Knopfdruck.' },
                        { title: 'Design-Haltegriffsysteme', desc: 'Stabile, geprüfte Stützklappgriffe und Duschhandläufe, die sich harmonisch in modernes Baddesign einfügen.' },
                        { title: 'Rutschhemmung & Beleuchtung', desc: 'Sichere Bodenbeläge, blendfreie LED-Beleuchtung mit Orientierungslicht und schwellenlose Bewegungsflächen.' }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-black text-base text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Funnel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <TouchConfigurator modus="kunde" journey="bad" quelle="web_bad" />
            </div>
        </div>
    );
}
