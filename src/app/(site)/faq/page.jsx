"use client";
import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, ArrowRight, ChevronDown, ChevronUp, Thermometer, Droplets, Wind, Wrench, Euro, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import QualityPromise from '@/components/sections/QualityPromise';

const faqData = {
    heizung: {
        icon: Thermometer,
        title: 'Heizung & Wärmepumpen',
        questions: [
            { q: 'Wie oft sollte meine Heizung gewartet werden?', a: 'Wir empfehlen eine jährliche Wartung, idealerweise vor Beginn der Heizperiode (September/Oktober). Dies sichert maximale Energieeffizienz und verlängert die Lebensdauer Ihrer Anlage.' },
            { q: 'Wann lohnt sich der Umstieg auf eine Wärmepumpe?', a: 'Bei Öl- oder Gasheizungen älter als 15 Jahre oder hohen Betriebskosten ist der Wechsel auf eine NIBE Luft-Wasser- oder Sole-Wasser-Wärmepumpe mit bis zu 70% KfW 458 Förderung hochattraktiv.' },
            { q: 'Was kostet eine Wärmepumpe nach Förderung?', a: 'Durch die staatliche BEG-Förderung (Grundförderung 30% + Geschwindigkeitsbonus 20% + Einkommensbonus 30% + 5% Effizienzbonus für natürliches Kältemittel R290) reduziert sich der Eigenanteil auf einen Bruchteil der Bruttokosten.' },
            { q: 'Funktioniert eine Wärmepumpe auch mit vorhandenen Heizkörpern?', a: 'Ja. Moderne NIBE Hochtemperatur-Wärmepumpen mit Kältemittel R290 erreichen Vorlauftemperaturen von bis zu 70 °C und können problemlos in Bestandsgebäuden mit Radiatoren betrieben werden.' }
        ]
    },
    bad: {
        icon: Droplets,
        title: 'Bäder & Sanitär',
        questions: [
            { q: 'Was kostet eine Komplettbadsanierung aus einer Hand?', a: 'Die Kosten richten sich nach Raumgröße, Zustand der Leitungen und Ihren individuellen Ausstattungswünschen. Wir erstellen Ihnen nach einem kostenlosen Vor-Ort-Aufmaß gerne ein verbindliches Festpreisangebot auf Anfrage.' },
            { q: 'Wie lange dauert ein kompletter Badumbau?', a: 'Ein Komplettbad wird bei uns dank eingespielter Gewerke-Koordination in der Regel innerhalb von 10 bis 14 Werktagen schlüsselfertig übergeben.' },
            { q: 'Gibt es Zuschüsse für barrierefreie Bäder?', a: 'Ja! Bei Vorliegen eines Pflegegrads (Pflegegrad 1–5) bezuschusst die Pflegekasse den altersgerechten Badumbau mit bis zu 4.000 € pro Person.' },
            { q: 'Wie schütze ich mein Trinkwasser vor Legionellen?', a: 'Warmwasserspeicher müssen auf mindestens 60 °C gehalten werden. Bei selten genutzten Leitungen sollte alle 72 Stunden eine Spülung erfolgen.' }
        ]
    },
    klima: {
        icon: Wind,
        title: 'Klima & Wohnraumlüftung',
        questions: [
            { q: 'Wie oft muss eine Wohnraumlüftung gewartet werden?', a: 'Die Filter sollten halbjährlich kontrolliert und jährlich gewechselt werden. Eine meisterhafte Kanalinspektion empfehlen wir alle 2–3 Jahre.' },
            { q: 'Welche Vorteile bietet eine kontrollierte Wohnraumlüftung mit Wärmerückgewinnung?', a: 'Bis zu 92% der Wärmeenergie der Abluft wird auf die frische Zuluft übertragen. Das verhindert Schimmelbildung, filtert Pollen und senkt Ihre Heizkosten drastisch.' }
        ]
    },
    kosten: {
        icon: Euro,
        title: 'Preise & Förderung',
        questions: [
            { q: 'Unterstützen Sie bei der Beantragung der KfW-Zuschüsse?', a: 'Ja! Als zertifizierter Fachbetrieb und NIBE Effizienz Partner übernehmen wir die technische Bestätigung und begleiten Sie lückenlos durch das KfW-Zuschussportal.' },
            { q: 'Gibt es bei Ihnen eine Festpreisgarantie?', a: 'Ja! Nach der detaillierten 3D-Badplanung oder Heizlastberechnung erhalten Sie ein verbindliches Festpreisangebot ohne versteckte Zusatzkosten.' }
        ]
    }
};

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategory, setOpenCategory] = useState('heizung');
    const [openQuestions, setOpenQuestions] = useState({});

    const categories = Object.entries(faqData);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;

        return categories.map(([key, category]) => {
            const filteredQuestions = category.questions.filter(
                q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.a.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return [key, { ...category, questions: filteredQuestions }];
        }).filter(([, category]) => category.questions.length > 0);
    }, [searchQuery, categories]);

    const toggleQuestion = (categoryKey, questionIndex) => {
        const key = `${categoryKey}-${questionIndex}`;
        setOpenQuestions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 text-center space-y-5 relative overflow-hidden">
                    <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                        Schnelle Meister-Antworten
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                        Häufig gestellte Fragen zu Bad &amp; Energie
                    </h1>
                    <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
                        Hier beantwortet unser Meisterbetrieb die wichtigsten Fragen rund um Badsanierung, NIBE Wärmepumpen, KfW-Förderung, Trinkwasserhygiene und Wartungsintervalle.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto pt-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Frage oder Stichwort suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/95 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-bold shadow-lg focus:ring-2 focus:ring-[#0C3A87] border-0"
                        />
                    </div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {!searchQuery && (
                    <div className="flex flex-wrap gap-2.5 justify-center mb-10">
                        {categories.map(([key, category]) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setOpenCategory(key)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                                        openCategory === key
                                            ? 'bg-gradient-to-r from-[#0C3A87] to-[#0E1C76] text-white shadow-md border border-white/20'
                                            : 'glass-surface text-slate-700 hover:text-[#0C3A87]'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {category.title}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Questions Grid */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">
                        {searchQuery ? 'Suchergebnisse' : faqData[openCategory]?.title || 'Häufig gestellte Fragen'}
                    </h2>
                    {(searchQuery ? filteredCategories : categories.filter(([key]) => key === openCategory)).map(([key, category]) => {
                        const Icon = category.icon;
                        return (
                            <div key={key} className="space-y-3">
                                {searchQuery && (
                                    <div className="flex items-center gap-2.5 pt-4 pb-1">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0C3A87] flex items-center justify-center border border-blue-200/60 shadow-xs">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h2 className="text-base font-black text-slate-900">{category.title}</h2>
                                    </div>
                                )}
                                {category.questions.map((faq, idx) => {
                                    const isOpen = openQuestions[`${key}-${idx}`];
                                    return (
                                        <div
                                            key={idx}
                                            className="glass-surface rounded-2xl overflow-hidden transition-all duration-300"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(key, idx)}
                                                className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-white/40 transition-colors"
                                            >
                                                <span className="font-black text-xs sm:text-sm text-slate-900">{faq.q}</span>
                                                {isOpen ? (
                                                    <ChevronUp className="w-4 h-4 text-[#0C3A87] shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="px-5 pb-5 text-xs text-slate-600 border-t border-slate-200/60 pt-4 leading-relaxed font-medium">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* No Results */}
                {searchQuery && filteredCategories.length === 0 && (
                    <div className="glass-surface p-12 rounded-[2.5rem] text-center space-y-3">
                        <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
                        <h3 className="text-base font-black text-slate-900">Keine passenden Fragen gefunden</h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Für &bdquo;{searchQuery}&ldquo; konnten wir keinen Treffer finden. Kontaktieren Sie uns gerne direkt!
                        </p>
                    </div>
                )}

                {/* Question CTA Box */}
                <div className="mt-14 glass-bezel-outer shadow-2xl">
                    <div className="glass-bezel-inner p-8 text-center space-y-4">
                        <h3 className="text-xl font-black text-slate-900">Ihre Frage war nicht dabei?</h3>
                        <p className="text-xs text-slate-600 max-w-lg mx-auto font-medium">
                            Unser Meisterteam beantwortet Ihre individuellen Anliegen gerne persönlich am Telefon oder in unserem Showroom.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/kontakt"
                                className="inline-block px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs shadow-md hover:shadow-lg transition-all border border-white/20"
                            >
                                Jetzt Kontakt aufnehmen &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
