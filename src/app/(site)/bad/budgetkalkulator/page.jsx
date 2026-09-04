import React from 'react';
import BudgetKalkulator from '@/components/funnels/BudgetKalkulator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = {
    title: 'Budgetkalkulator Bad | Sofortige Kostenkalkulation | Bad & Energie GmbH',
    description: 'Kalkulieren Sie online in 2 Minuten die Sanierungskosten für Ihr Badezimmer in Wetzlar & Lahn-Dill. Transparente Festpreis-Orientierung.',
    alternates: { canonical: 'https://bad-energie.de/bad/budgetkalkulator' }
};

export default function BudgetkalkulatorPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BudgetKalkulator />
            </div>
            <QualityPromise />
        </div>
    );
}
