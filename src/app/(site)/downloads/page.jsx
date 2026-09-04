import React from 'react';
import Link from 'next/link';
import { FileText, Download, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Downloads & Broschüren | Checklisten & Förderleitfaden | Bad & Energie GmbH',
    description: 'Nützliche Downloads der Bad & Energie GmbH Wetzlar: Bad-Planungscheckliste, Förderleitfaden KfW/BEG, Trinkwasserhygiene-Leitfaden & Musterbad-Katalog.',
    alternates: { canonical: 'https://bad-energie.de/downloads' }
};

export default function DownloadsPage() {
    const downloads = [
        { title: 'Checkliste: 10 Schritte zur perfekten Badsanierung', size: 'PDF &middot; 1,2 MB', desc: 'Vorbereitungsleitfaden für Raummaße, Wünsche, Fliesen und Zeitplanung.' },
        { title: 'BEG & KfW Förder-Leitfaden 2025/2026', size: 'PDF &middot; 2,4 MB', desc: 'Übersicht über Grundförderung, Klimageschwindigkeits-Bonus und Einkommensbonus bis 70%.' },
        { title: 'Trinkwasserhygiene & Legionellenschutz nach TrinkwV', size: 'PDF &middot; 1,8 MB', desc: 'Wichtige Informationen und Prüfpflichten für Eigentümer, Vermieter und Hausverwaltungen.' },
        { title: 'NIBE Wärmepumpen Produktkatalog', size: 'PDF &middot; 4,5 MB', desc: 'Technische Daten, JAZ-Werte und Schallpegel der schwedischen Premium-Wärmepumpen.' }
    ];

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Wissenscenter &amp; Dokumente
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Downloads &amp; Infomaterial
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Kostenlose Leitfäden, Checklisten und Fachbroschüren rund um Badsanierung, Heizungsmodernisierung und Trinkwasserhygiene.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="space-y-4">
                    {downloads.map((doc, idx) => (
                        <div key={idx} className="glass-surface p-6 sm:p-8 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-0.5 transition-all duration-500">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0C3A87] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-xs">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-slate-900 mb-1">{doc.title}</h3>
                                    <p className="text-xs text-slate-600 mb-1 font-medium">{doc.desc}</p>
                                    <span className="text-[11px] font-bold text-slate-400" dangerouslySetInnerHTML={{ __html: doc.size }} />
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Link
                                    href="/kontakt"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-[#0C3A87] font-black text-xs transition-all border border-blue-200/80 shadow-xs"
                                >
                                    <Download className="w-4 h-4 text-[#0C3A87]" />
                                    <span>Download anfordern</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
