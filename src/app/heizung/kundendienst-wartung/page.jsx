import React from 'react';
import Link from 'next/link';
import { Wrench, Clock, AlertCircle, Phone, Calendar, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Kundendienst & Heizungswartung Wetzlar | Notdienst für Bestandskunden | Bad & Energie GmbH',
    description: 'Regelmäßige Heizungswartung, Störungsbeseitigung & Kundendienst in Wetzlar & Lahn-Dill. Wartungsverträge für Wärmepumpen, Gas & Öl.',
    alternates: { canonical: 'https://bad-energie.de/heizung/kundendienst-wartung' }
};

export default function KundendienstWartungPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#FF1E16] bg-red-600/20 px-3.5 py-1.5 rounded-full border border-red-500/40 inline-block">
                        Meister-Kundendienst Wetzlar
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Kundendienst &amp; Heizungswartung
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Sichern Sie die Langlebigkeit, Effizienz und Betriebssicherheit Ihrer Heizungsanlage. Mit unseren transparenten Wartungsverträgen schützen Sie sich vor unerwarteten Ausfällen und hohen Reparaturkosten.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Wartungstermin online anfragen &rarr;
                        </Link>
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            {COMPANY_DATA.contact.phone}
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Jährliche Brenner- & Kesselreinigung', desc: 'Entfernung von Verbrennungsrückständen stellt optimale Wärmeübertragung sicher und verhindert unnötigen Mehrverbrauch.' },
                        { title: 'Wärmepumpen-Inspektion', desc: 'Prüfung von Kältekreislauf, Druck, Sole-Frostschutzmittel, Filter und elektrischen Anschlüssen nach Herstellervorgaben.' },
                        { title: 'Prüfung der Sicherheitseinrichtungen', desc: 'Überprüfung von Membran-Druckausdehnungsgefäß (MAG), Sicherheitsventilen, Not-Aus-Schaltern und Gasleitungen.' },
                        { title: 'Elektronische Abgasmessung', desc: 'Präzise Messung der Abgasverluste, CO-Werte und des Wirkungsgrads für die Einhaltung aller gesetzlichen Grenzwerte.' },
                        { title: 'Notdienst für Bestandskunden', desc: 'Bei Heizungsausfall oder Rohrbruch im Winter sind unsere Meister und Servicetechniker schnell vor Ort.' }
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
