import React from 'react';
import Link from 'next/link';
import { Users, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Gewerbliche Sanitäranlagen Wetzlar | ASR A4.1 Sanitär',
    description: 'Sanitärräume für Gewerbe, Schulen & Gastronomie in Wetzlar: Berührungslose Armaturen, vandalensichere Keramik, barrierefreie WCs & automatische Spülungen.',
    path: '/gewerbe/sanitaeranlagen'
});

export default function GewerbeSanitaeranlagenPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        ASR A4.1 &middot; Gewerbe-Sanitär
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Gewerbliche Sanitäranlagen &amp; Waschräume
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Hygienisch, robust und pflegeleicht: Sanitärkonzepte für Bürogebäude, Industrie, Gastronomie, Schulen und Arztpraxen im gesamten Lahn-Dill-Kreis.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Gewerbe-Beratung anfragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Sanitäre Standards für gewerbliche Waschräume
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600">
                        Maximale Trinkwasserhygiene, Berührungslosigkeit und normkonforme Barrierefreiheit nach ASR A4.1.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Berührungslose Infrarot-Armaturen & Spülungen', desc: 'Maximale Hygiene und bis zu 70 % Wasserersparnis durch automatische Sensor-Auslösung an Waschtischen und Urinalen.' },
                        { title: 'Vandalismusgeschützte Komponenten', desc: 'Schlagfeste Edelstahl-Waschtische, verdeckte Befestigungen und diebstahlsichere Spender für hochfrequentierte Bereiche.' },
                        { title: 'Barrierefreie WCs nach DIN 18040-1', desc: 'Rollstuhlgerechte Toilettenanlagen für öffentliche Gebäude mit Notruf-Tastern und normgerechten Bewegungsflächen.' },
                        { title: 'Automatische Stagnationsspülung', desc: 'Verhindert Keimbildung bei Betriebsferien oder langen Wochenenden durch programmierbare automatische Hygienespülungen.' },
                        { title: 'Konformität mit Arbeitsstättenrichtlinie (ASR A4.1)', desc: 'Rechtssichere Anzahl von WCs, Waschplätzen und Duschen abgestimmt auf Ihre Mitarbeiterzahl.' }
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
