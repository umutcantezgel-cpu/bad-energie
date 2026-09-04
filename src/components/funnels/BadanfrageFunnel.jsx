"use client";
import React, { useState } from 'react';
import { 
    Home, 
    Layers, 
    Maximize2, 
    Sparkles, 
    Calendar, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    ShieldCheck, 
    Info 
} from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';

const OBJECT_TYPES = [
    { id: 'efh', title: 'Einfamilienhaus', desc: 'Freistehend oder Reihenhaus' },
    { id: 'etw', title: 'Eigentumswohnung', desc: 'Im Mehrparteienhaus' },
    { id: 'mfh', title: 'Mehrfamilienhaus', desc: 'Vermieter / Hausverwaltung' },
    { id: 'gewerbe', title: 'Gewerbeobjekt', desc: 'Büro, Praxis, Betrieb' }
];

const SCOPES = [
    { id: 'komplett', title: 'Komplettbadsanierung', desc: 'Alles neu inkl. Fliesen, Sanitär & Elektrik' },
    { id: 'barrierefrei', title: 'Barrierefreies Bad', desc: 'DIN 18040-2 mit bis zu 4.000 € Pflegekassen-Zuschuss' },
    { id: 'dusche', title: 'Wanne zu Dusche', desc: 'Schneller Umbau auf bodengleiche Walk-In Dusche' },
    { id: 'gaeste', title: 'Gäste-WC / Kleinbad', desc: 'Kompakte Modernisierung auf kleinem Raum' }
];

const TIERS = [
    { id: 'basic', title: 'Basic (ab ca. 6.900 €)', desc: 'Solide Markenqualität von VIGOUR & CONEL' },
    { id: 'premium', title: 'Premium (ab ca. 12.000 €)', desc: 'VIGOUR white, Duka Glas & drehbarer Designheizkörper' },
    { id: 'luxus', title: 'Luxus (ab ca. 20.000 €)', desc: 'Freistehende Wanne, Dusch-WC & maßgefertigtes Design' }
];

export default function BadanfrageFunnel() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        objectType: 'efh',
        scope: 'komplett',
        length: '3.0',
        width: '2.5',
        height: '2.5',
        persons: '2',
        tier: 'premium',
        features: ['walkin', 'led-spiegel'],
        budget: '15000-25000',
        timeframe: '1-3-monate',
        name: '',
        phone: '',
        email: '',
        street: '',
        zipCity: '35576 Wetzlar',
        notes: '',
        privacyConsent: false
    });

    const toggleFeature = (feat) => {
        setFormData(prev => {
            const exists = prev.features.includes(feat);
            return {
                ...prev,
                features: exists ? prev.features.filter(f => f !== feat) : [...prev.features, feat]
            };
        });
    };

    const calculatedSqm = (parseFloat(formData.length || 0) * parseFloat(formData.width || 0)).toFixed(1);

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
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-[#0C3A87] mb-3">
                        Vielen Dank für Ihre Badanfrage!
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed text-xs sm:text-sm font-normal">
                        Wir haben Ihre Daten ({calculatedSqm} m² Bad &middot; {formData.scope}) erfolgreich erhalten. Ein Meister oder Badplaner unseres Teams aus Wetzlar wird Ihre Anfrage prüfen und sich innerhalb von 24 Stunden persönlich bei Ihnen melden.
                    </p>

                    <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5 mb-8 shadow-xs">
                        <p className="font-black text-slate-800">Ihre Zusammenfassung:</p>
                        <p className="text-slate-600">Kontakt: {formData.name} &middot; {formData.phone}</p>
                        <p className="text-slate-600">Ort: {formData.street}, {formData.zipCity}</p>
                        <p className="text-slate-600">Gewählter Standard: {formData.tier.toUpperCase()} &middot; Zeitrahmen: {formData.timeframe}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white font-black text-xs shadow-md hover:shadow-lg border border-white/20"
                        >
                            <Phone className="w-4 h-4" />
                            Direkt nachfragen: {COMPANY_DATA.contact.phone}
                        </a>
                        <button
                            onClick={() => { setSubmitted(false); setStep(1); }}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-white shadow-xs"
                        >
                            Weitere Anfrage stellen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-bezel-outer max-w-3xl mx-auto overflow-hidden shadow-2xl">
            <div className="glass-bezel-inner overflow-hidden">
                {/* Header / Progress Bar */}
                <div className="bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white p-6 sm:p-8 border-b border-white/10 relative">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase font-black tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                            Interaktive Badanfrage &middot; Schritt {step} von 5
                        </span>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                            Kostenlos &amp; Unverbindlich
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                        Planen Sie Ihr Traumbad mit den Meistern aus Wetzlar
                    </h2>

                    {/* Progress Indicators */}
                    <div className="grid grid-cols-5 gap-2 mt-6">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    s <= step ? 'bg-[#FF1E16] shadow-xs' : 'bg-white/20'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 sm:p-10">
                    {/* Step 1: Objekttyp */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                1. Um welche Art von Immobilie handelt es sich?
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {OBJECT_TYPES.map((obj) => (
                                    <button
                                        key={obj.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, objectType: obj.id })}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                            formData.objectType === obj.id
                                                ? 'border-[#0C3A87] bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                                                : 'border-slate-200/80 bg-white/70 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="font-black text-slate-900 text-sm sm:text-base mb-1">{obj.title}</div>
                                        <div className="text-xs text-slate-500">{obj.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Sanierungsumfang */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                2. Welcher Sanierungsumfang ist geplant?
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SCOPES.map((sc) => (
                                    <button
                                        key={sc.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scope: sc.id })}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                            formData.scope === sc.id
                                                ? 'border-[#0C3A87] bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                                                : 'border-slate-200/80 bg-white/70 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="font-black text-slate-900 text-sm sm:text-base mb-1">{sc.title}</div>
                                        <div className="text-xs text-slate-500">{sc.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Raummaße */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                3. Ungefähre Raummaße Ihres Badezimmers
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-1.5">Länge (m)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="15"
                                        value={formData.length}
                                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-1.5">Breite (m)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="15"
                                        value={formData.width}
                                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-1.5">Personen im Haushalt</label>
                                    <select
                                        value={formData.persons}
                                        onChange={(e) => setFormData({ ...formData, persons: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-[#0C3A87]"
                                    >
                                        <option value="1">1 Person</option>
                                        <option value="2">2 Personen</option>
                                        <option value="3-4">3 - 4 Personen (Familie)</option>
                                        <option value="5+">5+ Personen</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Berechnete Grundfläche:</span>
                                <span className="text-lg font-black text-[#0C3A87]">{calculatedSqm} m²</span>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Ausstattung & Qualitätsstufe */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                4. Qualitätskategorie &amp; gewünschte Elemente
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {TIERS.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tier: t.id })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                            formData.tier === t.id
                                                ? 'border-[#0C3A87] bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                                                : 'border-slate-200/80 bg-white/70 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="font-black text-slate-900 text-xs sm:text-sm mb-1">{t.title}</div>
                                        <div className="text-[11px] text-slate-500">{t.desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-3">
                                <label className="block text-xs font-black text-slate-700 mb-2">Wunschausstattung auswählen:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'walkin', label: 'Bodengleiche Walk-In Dusche' },
                                        { id: 'wanne', label: 'Badewanne' },
                                        { id: 'doppel', label: 'Doppelwaschtisch' },
                                        { id: 'duschwc', label: 'Komfort Dusch-WC' },
                                        { id: 'fussboden', label: 'Fußbodenheizung' },
                                        { id: 'led-spiegel', label: 'LED-Lichtspiegel' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleFeature(item.id)}
                                            className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                                formData.features.includes(item.id)
                                                    ? 'bg-[#0C3A87] text-white border-[#0C3A87] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {formData.features.includes(item.id) ? '✓ ' : '+ '} {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Kontaktdaten & Absenden */}
                    {step === 5 && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                                5. Wohin dürfen wir das Angebot &amp; die Beratung übermitteln?
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Kostenlose Prüfung durch unsere Meister in Wetzlar. Keine Weitergabe an Dritte.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Vor- &amp; Nachname *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Max Mustermann"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefonnummer für Rückfragen *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="06441 123456"
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
                                        placeholder="ihre-email@beispiel.de"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Straße &amp; Hausnummer</label>
                                    <input
                                        type="text"
                                        placeholder="Musterstraße 12"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">PLZ &amp; Ort im Lahn-Dill-Kreis / Hessen</label>
                                <input
                                    type="text"
                                    placeholder="35576 Wetzlar"
                                    value={formData.zipCity}
                                    onChange={(e) => setFormData({ ...formData, zipCity: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Anmerkungen oder besondere Wünsche</label>
                                <textarea
                                    rows={2}
                                    placeholder="z. B. Pflegegrad vorhanden, Nischenlösung gewünscht, Altbau-Besonderheiten..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                />
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
                                        Ich stimme zu, dass meine Angaben gemäß der <a href="/datenschutz" target="_blank" className="text-[#0C3A87] underline font-semibold">Datenschutzerklärung</a> verarbeitet werden.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all mt-4 border border-white/20"
                            >
                                Kostenlose Badanfrage jetzt absenden &rarr;
                            </button>
                        </form>
                    )}

                    {/* Navigation Buttons for Steps 1-4 */}
                    {step < 5 && (
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
