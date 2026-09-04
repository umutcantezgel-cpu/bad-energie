import React from 'react';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Heizungskonfigurator & Förderrechner | Bis 70% BEG | Bad & Energie GmbH',
    description: 'Konfigurieren Sie in 4 Schritten Ihre neue Heizung oder Wärmepumpe in Wetzlar & Lahn-Dill und berechnen Sie die staatlichen Zuschüsse (bis zu 70%).',
    alternates: { canonical: 'https://bad-energie.de/heizung/heizungskonfigurator' }
};

export default function HeizungskonfiguratorPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <TouchConfigurator modus="kunde" journey="heizung" quelle="web_heizung" />
            </div>
            <QualityPromise />
        </div>
    );
}
