import React from 'react';
import Link from 'next/link';
import { RefreshCw, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Regen- & Grauwassernutzung Wetzlar | Zisterne & Wassereinsparung | Bad & Energie GmbH',
    description: 'Regenwassernutzungsanlagen & Grauwasserrecycling in Wetzlar & Lahn-Dill: Bis zu 50% Trinkwassereinsparung für WC-Spülung, Waschmaschine & Gartenbewässerung.',
    alternates: { canonical: 'https://bad-energie.de/haustechnik/regen-und-grauwassernutzung' }
};

export default function RegenGrauwasserPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Nachhaltiges Wassermanagement
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Regen- &amp; Grauwassernutzung
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Sparen Sie bis zu 50 % teures Trinkwasser im Haushalt. Nutzen Sie gefiltertes Regenwasser aus Zisternen für die Toilettenspülung, Waschmaschine und Gartenbewässerung.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Regenwasser-Beratung anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Bis zu 50 % Trinkwassereinsparung', desc: 'Rund die Hälfte unseres täglichen Wasserbedarfs erfordert keine Trinkwasserqualität. Regenwasser ist kalkfrei und optimal für Waschmaschinen.' },
                        { title: 'Zisternentechnik & Hauswasserwerke', desc: 'Erdspeicher aus Kunststoff oder Beton mit automatischer Trinkwassernachspeisung bei längeren Trockenperioden nach DIN 1989.' },
                        { title: 'Mehrstufige Wirbelfeinfilterung', desc: 'Spezielle Zisternenfilter und beruhigte Zuläufe sorgen für glasklares, geruchloses Wasser ohne Schwebstoffe.' },
                        { title: 'Grauwasserrecycling', desc: 'Aufbereitung von leicht verschmutztem Dusch- und Badewasser über Membranbioreaktoren zur direkten Wiederverwendung in der WC-Spülung.' },
                        { title: 'Entlastung der Abwassergebühren', desc: 'Viele Kommunen im Lahn-Dill-Kreis reduzieren die Niederschlagswassergebühr bei nachgewiesener Regenwassernutzung.' }
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
