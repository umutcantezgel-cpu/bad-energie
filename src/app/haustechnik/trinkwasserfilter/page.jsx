import React from 'react';
import Link from 'next/link';
import { Filter, CheckCircle2, ShieldCheck, Phone, Calendar, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Trinkwasserfilter Wetzlar | Rückspülfilter nach DIN EN 13443 | Bad & Energie GmbH',
    description: 'Trinkwasserfilter & Druckminderer nach DIN 1988 in Wetzlar & Lahn-Dill: Schutz vor Rostpartikeln, Sand, Rohrbruch und Lochfraß-Korrosion.',
    alternates: { canonical: 'https://bad-energie.de/haustechnik/trinkwasserfilter' }
};

export default function TrinkwasserfilterPage() {
    return (
        <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#35A7E9] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
                        DIN 1988 &middot; DIN EN 13443-1
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        Trinkwasserfilter &amp; Druckminderer
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Schützen Sie Ihre Hausinstallation vor eingespülten Rostpartikeln, Sand und Schmutz aus dem öffentlichen Netz. Ein normgerechter Trinkwasserfilter verhindert punktuellen Lochfraß und tropfende Armaturen.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/termin"
                            className="px-6 py-3.5 rounded-2xl bg-[#E4040E] hover:bg-[#b91c1c] text-white font-extrabold text-xs shadow-lg transition-all"
                        >
                            Filterprüfung beauftragen &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Rückspülbare Feinfilter (manuell & automatisiert)', desc: 'Kein teurer Filterkerzentausch nötig: Mit einem einfachen Dreh wird der Filter gründlich mit gefiltertem Wasser rückgespült – ohne Unterbrechung der Wasserversorgung.' },
                        { title: 'Integrierter Druckminderer', desc: 'Reguliert den schwankenden Wasserdruck aus dem Straßennetz auf konstante 4 bar – schont Rohre, spart Wasser und verhindert lästige Druckschläge.' },
                        { title: 'Pflicht nach DIN 1988', desc: 'Nach der technischen Norm muss direkt hinter dem Wasserzähler ein Trinkwasserfilter installiert sein, um Gewährleistungsansprüche bei Rohrschäden zu sichern.' },
                        { title: 'Automatischer Leckageschutz', desc: 'Intelligente Filtersysteme mit Leckagestopp sperren bei unkontrolliertem Wasseraustritt oder Rohrbruch die Hauptleitung sofort ab.' },
                        { title: 'Halbjährliche Filterinspektion', desc: 'Wir kontrollieren bei der jährlichen Haustechnikwartung die Filterfunktion und führen die normgerechte Rückspülung durch.' }
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
