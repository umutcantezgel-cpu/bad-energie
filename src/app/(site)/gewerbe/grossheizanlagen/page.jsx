import React from 'react';
import Link from 'next/link';
import { Flame, Zap, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Großheizanlagen & Kaskaden Wetzlar | Industrieheizung',
    description: 'Großheizanlagen in Wetzlar & Lahn-Dill: Wärmepumpen-Kaskaden bis Megawatt-Bereich, Industriebrennwert & Nahwärmenetze für Gewerbe & Wohnungsbau.',
    path: '/gewerbe/grossheizanlagen'
});

export default function GrossheizanlagenPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Industrie- &amp; Großwärme
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Großheizanlagen &amp; Wärmepumpen-Kaskaden
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Leistungsstarke Wärmelösungen für große Gebäudevolumen. Durch Kaskadenschaltungen von NIBE Wärmepumpen oder modernen Brennwertkesseln erzielen wir höchste Betriebssicherheit und Teillasteffizienz.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Großprojekt anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Effiziente Großwärme &amp; Kaskadenlösungen
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600">
                        Maximale Ausfallsicherheit, modulare Skalierbarkeit und intelligente Gebäudeleittechnik für Industrie und Gewerbe.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'NIBE Groß-Wärmepumpen Kaskaden', desc: 'Zusammenschaltung mehrerer Wärmepumpenmodule ermöglicht Leistungen von 100 kW bis über 1.000 kW – hocheffizient auch bei schwankendem Lastprofil.' },
                        { title: 'Brennwert-Kaskaden bis 1,5 MW', desc: 'Mehrere Gas- oder Öl-Brennwertkessel in Kaskade schalten sich bedarfsgerecht stufenlos zu – maximale Ausfallsicherheit durch Redundanz.' },
                        { title: 'Nahwärmenetze & Quartierskonzepte', desc: 'Zentrale Energiezentrale versorgt mehrere Gebäude über vorisolierte Nahwärmeleitungen mit Übergabestationen.' },
                        { title: 'Gebäudeleittechnik (GLT) & Fernüberwachung', desc: 'Anbindung an Modbus, BACnet oder KNX mit 24/7 Fernüberwachung und automatischer Störungsmeldung.' },
                        { title: 'BEG & Bundesförderung für effiziente Wärmenetze (BEW)', desc: 'Wir beraten Sie zu staatlichen Förderprogrammen für gewerbliche Großwärmepumpen und Netzausbau.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-3" />
                            <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
