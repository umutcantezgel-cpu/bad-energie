import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Objekt- & Anlagenbau Wetzlar | TGA Generalunternehmer | Bad & Energie GmbH',
    description: 'TGA Objekt- und Anlagenbau in Wetzlar & Hessen: Planung, Bauleitung und Montage komplexer Sanitär-, Heizungs- und Lüftungsanlagen für Großprojekte.',
    alternates: { canonical: 'https://bad-energie.de/gewerbe/objekt-u-anlagenbau' }
};

export default function ObjektAnlagenbauPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        TGA Generalunternehmer-Kompetenz
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Objekt- &amp; Großanlagenbau
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Von der Ausschreibungsprüfung über die Ausführungsplanung bis zur schlüsselfertigen Montage und Revisionsdokumentation: Wir realisieren Großprojekte termingerecht und im Budget.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Projektanfrage stellen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Schnittstellenkoordination', desc: 'Lückenlose Verzahnung von Sanitär, Heizung, Lüftung und Regelungstechnik mit eigenem Bauleiter vor Ort.' },
                        { title: 'Wohnungsbau & Quartierskonzepte', desc: 'Effiziente Serieninstallationen für Mehrfamilienhäuser und Quartiere mit Nahwärmenetzen und Kaskaden-Wärmepumpen.' },
                        { title: 'Industrie & Gewerbehallen', desc: 'Dunkelstrahler, Deckenstrahlplatten, Hallenlüftung und Großkesselanlagen für Produktions- und Lagerstätten.' },
                        { title: 'Brandschutz nach DIN 4102', desc: 'Zertifizierte Brandschottungen und Brandschutzklappen für maximale Gebäudesicherheit.' },
                        { title: 'Revisionsunterlagen & Abnahmen', desc: 'Lückenlose Dokumentation, Strangschemata und Abnahmebegleitung mit Sachverständigen.' }
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
