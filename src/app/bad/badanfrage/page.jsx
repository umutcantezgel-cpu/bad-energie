import React from 'react';
import BadanfrageFunnel from '@/components/funnels/BadanfrageFunnel';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Badanfrage Wetzlar | Unverbindliches Angebot für Badsanierung anfordern',
    description: 'Stellen Sie in wenigen Schritten Ihre detaillierte Anfrage für eine Badsanierung in Wetzlar & Lahn-Dill. Kostenlose Prüfung & Vor-Ort-Beratung.',
    alternates: { canonical: 'https://bad-energie.de/bad/badanfrage' }
};

export default function BadanfragePage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BadanfrageFunnel />
            </div>
            <QualityPromise />
        </div>
    );
}
