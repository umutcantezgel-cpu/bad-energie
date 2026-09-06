import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, CheckCircle2, Phone, Calendar, ArrowRight, Activity, Thermometer, Filter, AlertTriangle } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Legionellenprüfung Wetzlar | TrinkwV Prüfung & Sanierung',
    description: 'Gesetzliche Legionellenprüfung für Vermieter in Wetzlar & Lahn-Dill: Thermische Desinfektion, chemische Spülung, Ultrafiltration & Gefährdungsanalyse.',
    path: '/haustechnik/legionellen'
});

export default function LegionellenPage() {
    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-red-300 bg-red-600/30 px-4 py-1.5 rounded-full border border-red-500/40 inline-block backdrop-blur-md">
                        Trinkwasserverordnung (TrinkwV) &middot; Prüfpflicht
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Legionellenprüfung, Gefährdungsanalyse &amp; Sanierung
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Rechtssicherheit für Vermieter, Hausverwaltungen und Gewerbebetriebe in Wetzlar. Wir führen akkreditierte Probenahmen durch und beseitigen Kontaminationen nachhaltig durch thermische, chemische oder mechanische Verfahren.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                        <Link
                            href="/termin"
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20"
                        >
                            Legionellenprüfung beauftragen &rarr;
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

            {/* Legal Criteria Box - Double Bezel */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-8">
                        <div className="flex items-center gap-2 text-amber-700 font-black text-xs mb-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span>Gesetzliche Untersuchungspflicht nach Trinkwasserverordnung</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            Wer ist zur regelmäßigen Legionellenprüfung verpflichtet?
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
                            Die dreijährliche Untersuchungspflicht gilt für alle Großanlagen zur Trinkwassererwärmung in gewerblich oder öffentlich vermieteten Gebäuden (Mehrfamilienhäuser ab 3 Wohneinheiten mit Warmwasserspeicher &gt; 400 Liter oder mehr als 3 Liter Rohrvolumen zwischen Speicher und Entnahmestelle).
                        </p>
                        <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80 text-xs text-amber-900 font-semibold shadow-xs">
                            Technischer Maßnahmenwert: <strong>100 KBE (koloniebildende Einheiten) pro 100 ml Wasser</strong>. Bei Überschreitung muss unverzüglich das Gesundheitsamt informiert und eine Gefährdungsanalyse nach VDI 6023 erstellt werden.
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Disinfection & Remediation Methods */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Unsere 3 Verfahren zur Legionellen-Beseitigung
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Je nach Befallsgrad und Leitungsnetz setzen wir die technisch und wirtschaftlich beste Methode ein.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: '1. Thermische Desinfektion (> 60 °C / 70 °C)',
                            icon: Thermometer,
                            desc: 'Der Warmwasserspeicher wird auf mindestens 70 °C aufgeheizt und das Leitungsnetz für mindestens 3 Minuten an allen Zapfstellen mit >60 °C heißem Wasser durchgespült. Tötet Legionellen thermisch sicher ab.'
                        },
                        {
                            title: '2. Chemische Desinfektion & Spülung',
                            icon: Activity,
                            desc: 'Einsatz zugelassener Desinfektionsmittel (z. B. Chlordioxid oder Wasserstoffperoxid) bei stark verkalkten oder verzweigten Altleitungen mit Biofilm. Gründliche Spülung und Neutralisation nach DVGW W 557.'
                        },
                        {
                            title: '3. Mechanische Ultrafiltration (Sensor-Rückspülung)',
                            icon: Filter,
                            desc: 'Installation von Ultrafiltrationsmembranen mit einer Porengröße von 0,02 µm. Hält 99,9999 % aller Bakterien und Viren mechanisch zurück – vollautomatisch mit sensorüberwachter Selbstrückspülung.'
                        }
                    ].map((m, idx) => {
                        const Icon = m.icon;
                        return (
                            <div key={idx} className="glass-surface p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_45px_rgba(12,58,135,0.12)] hover:-translate-y-1 transition-all duration-500">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0C3A87] flex items-center justify-center font-bold shadow-xs border border-blue-200/60">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">{m.title}</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{m.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
