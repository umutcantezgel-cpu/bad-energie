"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle2, Phone, Mail, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';

export default function TerminPage() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        topic: 'badsanierung',
        date: '',
        timeSlot: 'vormittags',
        name: '',
        phone: '',
        email: '',
        street: '',
        zipCity: '35576 Wetzlar',
        notes: '',
        privacyConsent: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.privacyConsent) {
            alert('Bitte stimmen Sie der Datenschutzerklärung zu.');
            return;
        }
        setSubmitted(true);
    };

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Direkte Meisterberatung
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Online-Termin vereinbaren
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
                        Wählen Sie Ihr Wunschthema und Ihren Wunschtermin für ein unverbindliches Beratungsgespräch bei Ihnen vor Ort in Wetzlar &amp; Umgebung oder in unserem Showroom.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {submitted ? (
                    <div className="glass-bezel-outer shadow-2xl animate-in zoom-in-95">
                        <div className="glass-bezel-inner p-8 md:p-12 text-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-[#0C3A87] mb-3">
                                Terminanfrage erfolgreich eingegangen!
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed text-xs sm:text-sm font-normal">
                                Vielen Dank, {formData.name}. Wir prüfen Ihren Wunschtermin ({formData.date || 'nach Absprache'} &middot; {formData.timeSlot}) und bestätigen diesen innerhalb von 24 Stunden telefonisch oder per E-Mail.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                    className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white font-black text-xs shadow-md border border-white/20"
                                >
                                    Bei Rückfragen: {COMPANY_DATA.contact.phone}
                                </a>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-6 py-3.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white"
                                >
                                    Weiteren Termin anfragen
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-bezel-outer shadow-2xl">
                        <form onSubmit={handleSubmit} className="glass-bezel-inner p-8 sm:p-10 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-2">
                                    1. Welches Thema möchten Sie besprechen? *
                                </label>
                                <select
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-[#0C3A87]"
                                >
                                    <option value="badsanierung">Badsanierung / Komplettbad aus einer Hand</option>
                                    <option value="barrierefrei">Barrierefreie Badmodernisierung (Pflegekassenzuschuss)</option>
                                    <option value="waermepumpe">Wärmepumpen-Beratung &amp; NIBE Partnersysteme</option>
                                    <option value="brennwert">Gas-Brennwerttechnik &amp; Heizungstausch</option>
                                    <option value="lueftung">Wohnraumlüftung &amp; Schimmelschutz</option>
                                    <option value="trinkwasser">Trinkwasserfilter, Entkalkung &amp; Legionellenprüfung</option>
                                    <option value="wartung">Heizungswartung &amp; Kundendienst</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-900 mb-1">
                                        2. Wunschdatum
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-[#0C3A87]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-900 mb-1">
                                        Bevorzugtes Zeitfenster
                                    </label>
                                    <select
                                        value={formData.timeSlot}
                                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-[#0C3A87]"
                                    >
                                        <option value="vormittags">Vormittags (08:00 – 12:00 Uhr)</option>
                                        <option value="nachmittags">Nachmittags (13:00 – 17:00 Uhr)</option>
                                        <option value="flexibel">Flexibel nach telefonischer Vereinbarung</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Name, Vorname *</label>
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
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefonnummer *</label>
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
                                        placeholder="email@beispiel.de"
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

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Ihre Notizen / Anliegen</label>
                                <textarea
                                    rows={2}
                                    placeholder="z. B. Bad-Grundriss vorhanden, Alter der aktuellen Heizung..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0C3A87]"
                                />
                            </div>

                            <div>
                                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={formData.privacyConsent}
                                        onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                                        className="mt-0.5 rounded text-[#0C3A87]"
                                    />
                                    <span>
                                        Ich stimme zu, dass meine Angaben zur Bearbeitung des Termins gemäß der <Link href="/datenschutz" target="_blank" className="text-[#0C3A87] underline font-semibold">Datenschutzerklärung</Link> verarbeitet werden.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all border border-white/20"
                            >
                                Termin jetzt unverbindlich buchen &rarr;
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
