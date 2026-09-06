import React from 'react';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';
import { createMetadata } from '@/lib/metadata';
import { ShieldCheck } from 'lucide-react';

export const metadata = createMetadata({
    title: 'Badanfrage Wetzlar: Unverbindliches Angebot anfordern',
    description: 'Stellen Sie online in wenigen Schritten Ihre Anfrage zur Badsanierung in Wetzlar & Lahn-Dill. Meisterbetrieb mit Festpreis-Garantie & Vor-Ort-Prüfung.',
    path: '/bad/badanfrage'
});

export default function BadanfragePage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#0C3A87] text-xs font-black uppercase tracking-wider border border-blue-200/70">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Meisterbetrieb Wetzlar &middot; Kostenlose Vor-Ort-Beratung
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Badanfrage Wetzlar &amp; Lahn-Dill: <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-[#0C3A87] to-[#296BF5] bg-clip-text text-transparent">Ihr Angebot für die Badsanierung</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                        Planen Sie Ihr Traumbad ganz bequem digital. Beantworten Sie wenige Fragen zu Raumgröße, Ausstattung und Design – unsere Meister koordinieren alle Gewerke schlüsselfertig aus einer Hand.
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <TouchConfigurator modus="kunde" journey="bad" quelle="web_bad" />
            </div>
            <QualityPromise />
        </div>
    );
}
