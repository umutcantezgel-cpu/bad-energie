"use client";
import React, { useState } from 'react';
import { 
    Flame, 
    Zap, 
    Home, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    ShieldCheck, 
    Award, 
    Phone, 
    Percent, 
    TrendingDown,
    Sliders,
    Building
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';

export default function HeizungKonfigurator() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        buildingType: 'efh',
        constructionYear: '1980-2000',
        livingArea: 140,
        currentFuel: 'gas',
        distribution: 'radiators',
        targetTech: 'heatpump-air',
        annualConsumption: '20000',
        ownerStatus: 'owner_occupier',
        householdIncomeUnder40k: false,
        name: '',
        phone: '',
        email: '',
        zipCity: '35576 Wetzlar',
        notes: '',
        privacyConsent: false
    });

    const calculateSubsidyRate = () => {
        let rate = 30;
        if (formData.targetTech.includes('heatpump')) {
            rate += 5;
            if (formData.ownerStatus === 'owner_occupier') {
                rate += 20;
            }
            if (formData.householdIncomeUnder40k) {
                rate += 30;
            }
        }
        return Math.min(rate, 70);
    };

    const subsidyRate = calculateSubsidyRate();
    const estimatedMaxGrant = (30000 * (subsidyRate / 100)).toFixed(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.privacyConsent) {
            alert('Bitte stimmen Sie der Datenschutzerklärung zu.');
            return;
        }
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="glass-bezel-outer max-w-2xl mx-auto animate-in zoom-in-95 duration-300 shadow-2xl">
                <div className="glass-bezel-inner p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 text-[#E4040E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-[#0C3A87] mb-3">
                        Ihre Heizungsanalyse &amp; Förderberechnung liegt vor!
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed text-xs sm:text-sm font-normal">
                        Vielen Dank, {formData.name}. Für Ihr Gebäude ({formData.livingArea} m² &middot; bisher {formData.currentFuel.toUpperCase()}) berechnen wir eine staatliche Förderquote von bis zu <strong className="text-[#E4040E] font-black">{subsidyRate} %</strong> (bis zu ca. {estimatedMaxGrant} € Zuschuss über KfW 458).
                    </p>

                    <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 mb-8 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="font-black text-slate-800">Technologie: NIBE Effizienz Partner System</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black">{subsidyRate} % Förderung</span>
                        </div>
                        <p className="text-slate-600">Kontakt: {formData.name} &middot; {formData.phone} &middot; {formData.email}</p>
                        <p className="text-slate-600">Standort: {formData.zipCity}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs shadow-md hover:shadow-lg border border-white/20"
                        >
                            <Phone className="w-4 h-4" />
                            Jetzt Termin sichern: {COMPANY_DATA.contact.phone}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-bezel-outer max-w-3xl mx-auto overflow-hidden shadow-2xl">
            <div className="glass-bezel-inner overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white p-6 sm:p-8 border-b border-white/10 relative">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-black tracking-wider text-red-300 flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                            <Award className="w-3.5 h-3.5 text-[#FF1E16]" />
                            NIBE Effizienz Partner Konfigurator
                        </span>
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-bold text-slate-200">
                            Schritt {step} von 4
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                        Heizungstausch &amp; Wärmepumpen-Förderung berechnen
                    </h2>

                    {/* Live Subsidy Preview */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between shadow-inner">
                        <span className="text-xs font-bold text-blue-100">Berechneter Fördersatz (BEG/KfW 458):</span>
                        <span className="text-lg font-black text-amber-300">bis zu {subsidyRate} %</span>
                    </div>

                    {/* Progress Indicators */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    s <= step ? 'bg-[#FF1E16] shadow-xs' : 'bg-white/20'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Form Steps */}
                <div className="p-6 sm:p-10">
                    {/* Step 1: Gebäudeart & Baujahr */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                1. Gebäudetyp &amp; Baujahr Ihrer Immobilie
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { id: 'efh', label: 'Einfamilienhaus', sub: 'Freistehend oder Doppelhaushälfte' },
                                    { id: 'rh', label: 'Reihenhaus', sub: 'Mittel- oder Endhaus' },
                                    { id: 'mfh', label: 'Mehrfamilienhaus', sub: '3+ Wohneinheiten' },
                                    { id: 'gewerbe', label: 'Gewerbeimmobilie', sub: 'Büro, Halle, Praxis' }
                                ].map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, buildingType: b.id })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                            formData.buildingType === b.id
                                                ? 'border-[#0C3A87] bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                                                : 'border-slate-200/80 bg-white/70 hover:bg-slate-50'
                                        }`}
                                    >
                                        <p className="font-black text-slate-900 text-xs sm:text-sm">{b.label}</p>
                                        <p className="text-[11px] text-slate-500">{b.sub}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-black text-slate-700 mb-2">Ungefähres Baujahr:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'vor-1978', label: 'Vor 1978 (Altbau)' },
                                        { id: '1978-1995', label: '1978 – 1995' },
                                        { id: '1996-2015', label: '1996 – 2015' },
                                        { id: 'ab-2016', label: 'Ab 2016 / Neubau' }
                                    ].map((yr) => (
                                        <button
                                            key={yr.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, constructionYear: yr.id })}
                                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                                formData.constructionYear === yr.id
                                                    ? 'bg-[#0C3A87] text-white border-[#0C3A87] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {yr.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Wohnfläche & aktueller Brennstoff */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                2. Beheizte Wohnfläche &amp; bisherige Heiztechnik
                            </h3>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-black text-slate-700">Wohnfläche (m²):</label>
                                    <span className="text-base font-black text-[#0C3A87] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200/60 shadow-xs">
                                        {formData.livingArea} m²
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="60"
                                    max="450"
                                    step="10"
                                    value={formData.livingArea}
                                    onChange={(e) => setFormData({ ...formData, livingArea: Number(e.target.value) })}
                                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0C3A87]"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                                    <span>60 m²</span>
                                    <span>250 m²</span>
                                    <span>450 m²</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">Aktueller Energieträger:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'gas', label: 'Erdgas' },
                                        { id: 'oel', label: 'Heizöl' },
                                        { id: 'strom', label: 'Nachtspeicher' },
                                        { id: 'holz', label: 'Holz / Pellets' }
                                    ].map((fuel) => (
                                        <button
                                            key={fuel.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, currentFuel: fuel.id })}
                                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                                formData.currentFuel === fuel.id
                                                    ? 'bg-[#0C3A87] text-white border-[#0C3A87] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {fuel.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">Wärmeverteilung im Haus:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'radiators', label: 'Heizkörper' },
                                        { id: 'underfloor', label: 'Fußbodenheizung' },
                                        { id: 'mixed', label: 'Kombiniert' }
                                    ].map((dist) => (
                                        <button
                                            key={dist.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, distribution: dist.id })}
                                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                                formData.distribution === dist.id
                                                    ? 'bg-[#0C3A87] text-white border-[#0C3A87] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {dist.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Wunschtechnik & Förderbonus-Kriterien */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                3. Zukünftige Wunsch-Technologie
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'heatpump-air', title: 'NIBE Luft/Wasser', desc: 'Propan R290, schnell installiert' },
                                    { id: 'heatpump-ground', title: 'NIBE Erdwärme', desc: 'Höchste Effizienz mit Erdsonde' },
                                    { id: 'hybrid', title: 'Gas-Hybrid', desc: 'Wärmepumpe mit Gas-Kessel' }
                                ].map((tech) => (
                                    <button
                                        key={tech.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, targetTech: tech.id })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                            formData.targetTech === tech.id
                                                ? 'border-[#0C3A87] bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                                                : 'border-slate-200/80 bg-white/70 hover:bg-slate-50'
                                        }`}
                                    >
                                        <p className="font-black text-slate-900 text-xs mb-1">{tech.title}</p>
                                        <p className="text-[11px] text-slate-500">{tech.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-3 shadow-xs">
                                <h4 className="font-black text-xs text-amber-900 uppercase tracking-wide">
                                    Staatliche Förder-Boni aktivieren (BEG / KfW 458):
                                </h4>
                                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.ownerStatus === 'owner_occupier'}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            ownerStatus: e.target.checked ? 'owner_occupier' : 'landlord'
                                        })}
                                        className="mt-0.5 rounded text-[#0C3A87]"
                                    />
                                    <span>
                                        <strong>+20 % Geschwindigkeits-Bonus:</strong> Ich bewohne die Immobilie selbst und tausche eine alte fossile Heizung.
                                    </span>
                                </label>

                                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.householdIncomeUnder40k}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            householdIncomeUnder40k: e.target.checked
                                        })}
                                        className="mt-0.5 rounded text-[#0C3A87]"
                                    />
                                    <span>
                                        <strong>+30 % Einkommens-Bonus:</strong> Zu versteuerndes Haushaltsjahreseinkommen unter 40.000 €.
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Kontaktdaten & Ergebnis absenden */}
                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                                4. Kostenfreie Vor-Ort-Heizlastanalyse anfordern
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Ihr NIBE Effizienz Partner in Wetzlar berechnet die genaue Auslegung und begleitet den Förderantrag.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Name, Vorname *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Sabine Becker"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefonnummer *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="06441 987654"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">E-Mail-Adresse *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="becker@beispiel.de"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">PLZ &amp; Ort</label>
                                    <input
                                        type="text"
                                        placeholder="35576 Wetzlar"
                                        value={formData.zipCity}
                                        onChange={(e) => setFormData({ ...formData, zipCity: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={formData.privacyConsent}
                                        onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                                        className="mt-0.5 rounded text-[#0C3A87]"
                                    />
                                    <span>
                                        Ich stimme zu, dass meine Daten gemäß der <a href="/datenschutz" target="_blank" className="text-[#0C3A87] underline font-semibold">Datenschutzerklärung</a> verarbeitet werden.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all mt-4 border border-white/20"
                            >
                                Heizungsangebot &amp; {subsidyRate} % Förderanalyse anfordern &rarr;
                            </button>
                        </form>
                    )}

                    {/* Step Navigation */}
                    {step < 4 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Zurück
                                </button>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0C3A87] hover:bg-[#0E1C76] text-white font-black text-xs shadow-md transition-all"
                            >
                                <span>Weiter zu Schritt {step + 1}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
