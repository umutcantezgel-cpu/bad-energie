import React from 'react';
import Link from 'next/link';
import { Droplets, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Entkalkungsanlagen Wetzlar | Wasserenthärtung für weiches Wasser | Bad & Energie GmbH',
    description: 'Moderne Wasserenthärtungsanlagen (Ionenaustausch) in Wetzlar & Lahn-Dill. Schützt Rohrleitungen, Armaturen & Haushaltsgeräte vor teuren Kalkschäden.',
    alternates: { canonical: 'https://bad-energie.de/haustechnik/entkalkung' }
};

export default function EntkalkungPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        Ionenaustausch-Technologie &middot; DVGW-zertifiziert
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Entkalkungsanlagen &amp; Wasserenthärtung
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Schluss mit lästigen Kalkflecken auf Duschglas und Armaturen. Eine moderne Wasserenthärtungsanlage schützt Ihre Rohrleitungen, senkt den Waschmittelverbrauch und verlängert die Lebensdauer von Waschmaschine und Kaffeemaschine.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Wasserhärte testen &amp; beraten lassen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Klassisches Ionenaustauschverfahren', desc: 'Calcium- und Magnesium-Ionen (Kalkbildner) werden zuverlässig gegen unschädliche Natrium-Ionen getauscht. Vollautomatische Regeneration mit Salztabletten.' },
                        { title: 'Schutz für Heizung & Wärmetauscher', desc: 'Kalkablagerungen in Warmwasserspeichern und Heizkesseln erhöhen den Energieverbrauch um bis zu 20 %. Enthärtetes Wasser sichert maximale Effizienz.' },
                        { title: 'Glänzende Bäder mit weniger Putzaufwand', desc: 'Keine matten Duschwände oder verstopften Duschbrausen mehr. Spart bis zu 50 % Reinigungs- und Entkalkungsmittel.' },
                        { title: 'Seidiges Haut- & Haargefühl', desc: 'Spürbar weicheres Wasser beim Duschen und Baden ist besonders schonend für empfindliche Haut und beugt Irritationen vor.' },
                        { title: 'DVGW-geprüfte Markengeräte', desc: 'Wir installieren ausschließlich zertifizierte Enthärtungsanlagen mit integrierter automatischer Desinfektion bei jeder Regeneration.' }
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
