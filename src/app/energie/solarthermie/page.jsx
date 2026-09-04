import React from 'react';
import Link from 'next/link';
import { Sun, Droplets, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Solarthermie Wetzlar | Solare Warmwasserbereitung & Heizungsunterstützung | Bad & Energie GmbH',
    description: 'Solarthermie-Anlagen in Wetzlar & Lahn-Dill: Bis zu 60% Energieersparnis bei der Warmwasserbereitung mit Flach- & Röhrenkollektoren.',
    alternates: { canonical: 'https://bad-energie.de/energie/solarthermie' }
};

export default function SolarthermiePage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Thermische Solarenergie
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Solarthermie: <br />
                        <span className="text-[#35A7E9]">Kostenloses Warmwasser durch die Kraft der Sonne</span>
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Nutzen Sie hocheffiziente Flach- oder Vakuum-Röhrenkollektoren zur Trinkwassererwärmung und Heizungsunterstützung. Von Mai bis September bleibt Ihr Heizkessel meist komplett ausgeschaltet.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Solarthermie anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Bis zu 60 % Warmwasser-Ersparnis', desc: 'Solarkollektoren decken über das Jahr gemittelt mehr als die Hälfte des gesamten Warmwasserbedarfs eines Einfamilienhauses ab.' },
                        { title: 'Solare Heizungsunterstützung', desc: 'Größere Kollektorfelder mit Schichtenspeicher speisen solare Wärme direkt in den Heizkreislauf ein und senken den Brennstoffverbrauch in der Übergangszeit.' },
                        { title: 'Flachkollektoren vs. Vakuumröhren', desc: 'Wir beraten Sie bei der Auswahl der passenden Kollektortechnologie abgestimmt auf Ihre Dachausrichtung und Dachneigung.' },
                        { title: 'Kombinierbar mit jedem Heizsystem', desc: 'Solarthermie lässt sich nahtlos mit Gas-Brennwertgeräten, Holz-/Pelletkesseln sowie Wärmepumpen kombinieren.' },
                        { title: 'Langlebig & wartungsarm', desc: 'Hochwertige Solargläser und korrosionsfeste Absorber garantieren eine Lebensdauer von 25 Jahren und mehr.' }
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
