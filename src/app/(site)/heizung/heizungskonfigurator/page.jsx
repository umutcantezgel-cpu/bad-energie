import React from 'react';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';
import { createMetadata } from '@/lib/metadata';
import { Flame } from 'lucide-react';

export const metadata = createMetadata({
    title: 'Heizungskonfigurator & Förderrechner Wetzlar',
    description: 'Konfigurieren Sie online Ihre neue Heizung oder NIBE Wärmepumpe in Wetzlar & Lahn-Dill. Berechnen Sie staatliche BEG-Zuschüsse von bis zu 70 %.',
    path: '/heizung/heizungskonfigurator'
});

export default function HeizungskonfiguratorPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 text-[#E4040E] text-xs font-black uppercase tracking-wider border border-red-200/70">
                        <Flame className="w-3.5 h-3.5" />
                        Bis zu 70 % staatliche BEG-Förderung &middot; Wetzlar
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Heizungskonfigurator &amp; Förderrechner: <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-[#E4040E] to-[#B91C1C] bg-clip-text text-transparent">Wärmepumpe &amp; Heizung planen</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                        Finden Sie in 4 kurzen Schritten das ideale Heizsystem für Ihr Gebäude. Ob NIBE Wärmepumpe oder Hybridlösung – berechnen Sie Einsparpotenziale und maximale Fördergelder.
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <TouchConfigurator modus="kunde" journey="heizung" quelle="web_heizung" />
            </div>
            <QualityPromise />
        </div>
    );
}
