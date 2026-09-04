import React from 'react';
import Link from 'next/link';
import { 
    Award, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Phone, 
    Calendar, 
    ArrowRight,
    Star,
    Check
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import HeizungKonfigurator from '@/components/funnels/HeizungKonfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'NIBE Effizienz Partner Wetzlar | Schwedische Premium-Wärmepumpen | Bad & Energie GmbH',
    description: 'Offizieller NIBE Effizienz Partner in Wetzlar & Lahn-Dill. Höchste Jahresarbeitszahlen, Propan R290, 5 Jahre NIBE Systemgarantie & bis 70% BEG-Förderung.',
    alternates: { canonical: 'https://bad-energie.de/heizung/nibe-partner' }
};

export default function NibePartnerPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-red -top-20 -right-20" />
            <div className="ambient-glow-blue top-96 -left-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-red-300 bg-red-600/30 px-4 py-1.5 rounded-full border border-red-500/40 inline-block backdrop-blur-md">
                        Autorisierter Fachpartner
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Wir sind zertifizierter NIBE Effizienz Partner
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Schwedische Spitzentechnologie für Ihr Zuhause. Als offizieller NIBE Partner garantieren wir herstellergeschulte Meistermontage, exakte Systemeinregulierung und 5 Jahre NIBE Systemgarantie.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/heizung/heizungskonfigurator"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            NIBE Wärmepumpe berechnen &rarr;
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

            {/* NIBE Advantages Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Warum NIBE Wärmepumpen die erste Wahl sind
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Über 70 Jahre Erfahrung in skandinavischer Klimatechnik garantieren maximale Zuverlässigkeit selbst bei arktischen Außentemperaturen bis -25 °C.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Natürliches Kältemittel Propan (R290)', desc: 'Zukunftssicher und klimafreundlich mit extrem niedrigem GWP (Global Warming Potential von 3). Sichert zusätzlich 5% BEG-Effizienzbonus.' },
                        { title: 'Inverter-Leistungsregelung', desc: 'Die Wärmepumpe passt ihre Leistung stufenlos an den tatsächlichen Wärmebedarf des Hauses an. Das spart Strom und schont den Kompressor.' },
                        { title: 'Vorlauftemperaturen bis zu 75 °C', desc: 'Perfekt geeignet für den unkomplizierten Heizungstausch im Altbau mit bestehenden Heizkörpern ohne aufwändige Dämmmaßnahmen.' },
                        { title: 'Flüsterleiser Betrieb (Silent Mode)', desc: 'Spezielle Ventilatorgeometrie und Schalldämmung sorgen für minimale Geräuschentwicklung. Ideal auch bei dichter Reihenhausbebauung.' },
                        { title: 'Smart-Home & NIBE myUplink', desc: 'Steuern und überwachen Sie Ihre Heizung bequem per Smartphone App. Automatische wettergeführte Vorhersagefunktion.' },
                        { title: '5 Jahre NIBE Systemgarantie', desc: 'Bei Installation durch den zertifizierten NIBE Effizienz Partner Bad & Energie GmbH genießen Sie vollen Herstellerschutz.' }
                    ].map((adv, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(228,4,14,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-black text-base text-slate-900 mb-2">{adv.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{adv.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <HeizungKonfigurator />
            </div>
        </div>
    );
}
