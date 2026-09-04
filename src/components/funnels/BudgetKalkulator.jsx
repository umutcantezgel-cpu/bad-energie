"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Calculator, 
    Sparkles, 
    Check, 
    HelpCircle, 
    ArrowRight, 
    Phone, 
    ShieldCheck, 
    Calendar,
    BadgePercent
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';

export default function BudgetKalkulator() {
    const [sqm, setSqm] = useState(8.2);
    const [tier, setTier] = useState('premium');
    const [sanitaryScope, setSanitaryScope] = useState('komplett');
    const [selectedOptions, setSelectedOptions] = useState([
        'walkin',
        'led-spiegel',
        'design-heizkoerper',
        'fliesen'
    ]);
    const [contactOpen, setContactOpen] = useState(false);
    const [leadData, setLeadData] = useState({ name: '', phone: '', email: '' });
    const [leadSuccess, setLeadSuccess] = useState(false);

    const toggleOption = (id) => {
        setSelectedOptions(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const baseRates = {
        basic: 1200,
        premium: 1900,
        luxus: 2800
    };

    const optionCosts = {
        'walkin': { basic: 1500, premium: 2500, luxus: 3800 },
        'badewanne': { basic: 1200, premium: 2200, luxus: 4500 },
        'dusch-wc': { basic: 1800, premium: 2800, luxus: 4200 },
        'doppelwaschtisch': { basic: 900, premium: 1800, luxus: 3200 },
        'fussbodenheizung': { basic: 800, premium: 1400, luxus: 2200 },
        'design-heizkoerper': { basic: 350, premium: 850, luxus: 1500 },
        'led-spiegel': { basic: 300, premium: 700, luxus: 1400 },
        'fliesen': { basic: 1800, premium: 3200, luxus: 5500 }
    };

    let calculatedBase = sqm * baseRates[tier];
    if (sanitaryScope === 'teil') calculatedBase *= 0.6;
    if (sanitaryScope === 'dusche-nur') calculatedBase *= 0.35;

    let optionsTotal = 0;
    selectedOptions.forEach(opt => {
        if (optionCosts[opt]) {
            optionsTotal += optionCosts[opt][tier] || 0;
        }
    });

    const minEstimate = Math.round((calculatedBase + optionsTotal) * 0.9 / 100) * 100;
    const maxEstimate = Math.round((calculatedBase + optionsTotal) * 1.15 / 100) * 100;

    const handleLeadSubmit = (e) => {
        e.preventDefault();
        setLeadSuccess(true);
    };

    return (
        <div className="glass-bezel-outer max-w-4xl mx-auto overflow-hidden shadow-2xl">
            <div className="glass-bezel-inner overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white p-6 sm:p-10 border-b border-white/10 relative">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-black tracking-wider text-cyan-300 flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                            <Calculator className="w-3.5 h-3.5" />
                            Online-Budgetrechner &middot; Bad &amp; Energie GmbH
                        </span>
                        <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full font-bold hidden sm:inline-block border border-white/10">
                            Transparente Festpreiskalkulation
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                        Badsanierungs-Kosten sofort online kalkulieren
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                        Ermitteln Sie die realistische Kostenspanne für Ihr Badezimmer in Wetzlar und Mittelhessen – inklusive Markenkomponenten von VIGOUR, Duka, CONEL und COSMO.
                    </p>
                </div>

                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls (Left 7 Cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Room Size Slider */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs sm:text-sm font-black text-slate-900">
                                    1. Badezimmer-Größe in Quadratmetern:
                                </label>
                                <span className="text-base sm:text-lg font-black text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-xl border border-blue-200/60 shadow-xs">
                                    {sqm} m²
                                </span>
                            </div>
                            <input
                                type="range"
                                min="3.5"
                                max="25"
                                step="0.5"
                                value={sqm}
                                onChange={(e) => setSqm(parseFloat(e.target.value))}
                                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0C3A87]"
                            />
                            <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-1">
                                <span>3.5 m² (Gäste-WC)</span>
                                <span>8.2 m² (Standard)</span>
                                <span>15.9 m² (Komfort)</span>
                                <span>25 m² (Spa)</span>
                            </div>
                        </div>

                        {/* 2. Sanierungsumfang */}
                        <div>
                            <label className="block text-xs sm:text-sm font-black text-slate-900 mb-2">
                                2. Sanierungsumfang:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'komplett', label: 'Komplettbad', desc: 'Schlüsselfertig' },
                                    { id: 'teil', label: 'Teilsanierung', desc: 'Sanitär & Keramik' },
                                    { id: 'dusche-nur', label: 'Wanne zu Dusche', desc: 'Nur Duschbereich' }
                                ].map((scope) => (
                                    <button
                                        key={scope.id}
                                        type="button"
                                        onClick={() => setSanitaryScope(scope.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            sanitaryScope === scope.id
                                                ? 'border-[#0C3A87] bg-blue-50/90 shadow-xs font-black text-[#0C3A87]'
                                                : 'border-slate-200/80 bg-white/70 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <p className="text-xs font-bold">{scope.label}</p>
                                        <p className="text-[10px] text-slate-500">{scope.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Qualitätskategorie */}
                        <div>
                            <label className="block text-xs sm:text-sm font-black text-slate-900 mb-2">
                                3. Qualitätsstufe:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'basic', label: 'Basic', tag: 'ab ~6.900 €', desc: 'VIGOUR derby' },
                                    { id: 'premium', label: 'Premium', tag: 'ab ~17.200 €', desc: 'VIGOUR white, Duka' },
                                    { id: 'luxus', label: 'Luxus', tag: 'ab ~24.000 €', desc: 'Spa, Dusch-WC' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTier(t.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            tier === t.id
                                                ? 'border-[#E4040E] bg-red-50/70 shadow-xs ring-2 ring-red-500/20'
                                                : 'border-slate-200/80 bg-white/70 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-xs font-black text-slate-900">{t.label}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-[#E4040E]">{t.tag}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Sonderausstattungen */}
                        <div>
                            <label className="block text-xs sm:text-sm font-black text-slate-900 mb-2">
                                4. Wunschausstattung &amp; Extras:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'walkin', label: 'Bodengleiche Walk-In Dusche' },
                                    { id: 'badewanne', label: 'Badewanne / Komfortwanne' },
                                    { id: 'dusch-wc', label: 'Dusch-WC mit Hygiene-Spülung' },
                                    { id: 'doppelwaschtisch', label: 'Möbel-Doppelwaschtisch' },
                                    { id: 'fussbodenheizung', label: 'Fußbodenheizung' },
                                    { id: 'design-heizkoerper', label: 'COSMO Design-Heizkörper' },
                                    { id: 'led-spiegel', label: 'LED-Lichtspiegel' },
                                    { id: 'fliesen', label: 'Großformat-Fliesenverlegung' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => toggleOption(opt.id)}
                                        className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                                            selectedOptions.includes(opt.id)
                                                ? 'bg-blue-50 border-[#0C3A87] text-[#0C3A87] shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {selectedOptions.includes(opt.id) && (
                                            <Check className="w-3.5 h-3.5 text-[#0C3A87] shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Display & Actions (Right 5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-50/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-inner">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Geprüfte Handwerkerpreise Wetzlar
                            </div>

                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Geschätzter Richtpreis:
                                </span>
                                <div className="text-2xl sm:text-3xl font-black text-[#0C3A87] mt-1">
                                    {minEstimate.toLocaleString('de-DE')} € – {maxEstimate.toLocaleString('de-DE')} €
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Richtwert inkl. Material, Markenarmaturen, Vorwandinstallation und Fachmontage.
                                </p>
                            </div>

                            {/* Reference to exact Musterbad */}
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 text-xs shadow-xs">
                                <p className="font-bold text-slate-800 flex items-center justify-between">
                                    <span>Musterbad-Vergleich:</span>
                                    <Link href="/bad/musterbaeder" className="text-[#0C3A87] hover:underline font-bold">
                                        Katalog &rarr;
                                    </Link>
                                </p>
                                <p className="text-slate-600 text-[11px]">
                                    Passend: <strong>{sqm <= 9 ? 'Basic-Bad 8,2 ㎡ (~6.942 €)' : 'Komfort-Bad 15,9 ㎡ (~17.231 €)'}</strong> mit VIGOUR &amp; COSMO.
                                </p>
                            </div>

                            {/* Subsidies banner */}
                            <div className="p-3.5 rounded-2xl bg-blue-100/70 border border-blue-200 text-xs space-y-1 text-[#0C3A87]">
                                <p className="font-bold flex items-center gap-1.5">
                                    <BadgePercent className="w-4 h-4 text-[#FF1E16]" />
                                    Bis zu 4.000 € Pflegekassen-Zuschuss
                                </p>
                                <p className="text-slate-600 text-[11px]">
                                    Bei Pflegegrad für barrierefreie Bäder nach DIN 18040-2.
                                </p>
                            </div>
                        </div>

                        {/* Action Block */}
                        <div className="pt-4 border-t border-slate-200/80 space-y-3">
                            {!contactOpen ? (
                                <button
                                    type="button"
                                    onClick={() => setContactOpen(true)}
                                    className="w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_8px_20px_rgba(228,4,14,0.35)] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-white/20"
                                >
                                    <span>Angebot mit Festpreis anfordern</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : leadSuccess ? (
                                <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 text-center text-xs font-bold animate-in fade-in">
                                    ✓ Anfrage erhalten! Unser Meister meldet sich zeitnah bei Ihnen.
                                </div>
                            ) : (
                                <form onSubmit={handleLeadSubmit} className="space-y-2.5 animate-in fade-in">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ihr Name *"
                                        value={leadData.name}
                                        onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Ihre Telefonnummer *"
                                        value={leadData.phone}
                                        onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Ihre E-Mail-Adresse *"
                                        value={leadData.email}
                                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs shadow-md"
                                    >
                                        Kalkulation absenden &rarr;
                                    </button>
                                </form>
                            )}

                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-white text-xs font-bold transition-all shadow-xs"
                            >
                                <Phone className="w-3.5 h-3.5 text-[#0C3A87]" />
                                Sofort anrufen: {COMPANY_DATA.contact.phone}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
