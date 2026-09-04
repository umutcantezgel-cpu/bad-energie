import React from 'react';
import Link from 'next/link';
import { AlertCircle, Phone, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Notdienst für Bestandskunden | Heizungsausfall & Rohrbruch | Bad & Energie GmbH Wetzlar',
    description: 'Schnelle Hilfe im Notfall für Bestandskunden der Bad & Energie GmbH in Wetzlar & Lahn-Dill: Heizungsausfall, Rohrbruch & akute Störungen.',
    alternates: { canonical: 'https://bad-energie.de/notdienst' }
};

export default function NotdienstPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-r from-red-900 via-[#E4040E] to-red-800 text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        Schnelle Notfallhilfe
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Notdienst für unsere Bestandskunden
                    </h1>
                    <p className="text-base sm:text-lg text-red-100 max-w-2xl mx-auto leading-relaxed">
                        Heizungsausfall bei Minusgraden oder akuter Rohrbruch? Für unsere registrierten Kunden und Wartungsvertragspartner steht unser Bereitschaftsdienst zuverlässig zur Verfügung.
                    </p>

                    <div className="pt-4">
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#E4040E] hover:bg-red-50 font-black text-base shadow-xl transition-all"
                        >
                            <Phone className="w-5 h-5 text-[#E4040E]" />
                            <span>Notdienst anrufen: {COMPANY_DATA.contact.phone}</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Emergency Info Grid */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#0C3A87]" />
                            Wann greift der Notdienst?
                        </h2>
                        <ul className="space-y-2 text-xs text-slate-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>Vollständiger Heizungsausfall bei winterlichen Außentemperaturen</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>Akuter Rohrbruch oder unkontrollierter Wasseraustritt</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>Gasgeruch (sofort Haupthahn schließen, lüften und Feuerwehr rufen!)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#0C3A87]" />
                            Erstmaßnahmen bei Rohrbruch
                        </h2>
                        <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
                            <li>Hauptwasserhahn (direkt hinter dem Wasserzähler) sofort schließen</li>
                            <li>Elektrische Geräte im Gefahrenbereich stromlos schalten</li>
                            <li>Ausgetretenes Wasser schnellstmöglich aufnehmen</li>
                            <li>Unseren Notdienst unter {COMPANY_DATA.contact.phone} kontaktieren</li>
                        </ol>
                    </div>
                </div>

                <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-center space-y-3">
                    <h3 className="text-lg font-bold text-[#0C3A87]">Noch kein Wartungsvertrag?</h3>
                    <p className="text-xs text-slate-600 max-w-xl mx-auto">
                        Sichern Sie sich mit einem Wartungsvertrag für Ihre Heizung die priorisierte Notdienst-Bereitschaft und regelmäßige Inspektion.
                    </p>
                    <Link
                        href="/termin"
                        className="inline-block px-6 py-3 rounded-xl bg-[#0C3A87] hover:bg-[#0E1C76] text-white font-bold text-xs shadow-md"
                    >
                        Wartungsvertrag anfragen &rarr;
                    </Link>
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
