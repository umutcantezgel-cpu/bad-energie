"use client";
import React from 'react';
import { Lightbulb, TrendingDown, FileText, ArrowRight, CheckCircle2, Zap, Home, Thermometer, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageWrapper from '@/components/common/PageWrapper';

const processSteps = [
    {
        step: 1,
        icon: Home,
        title: 'Vor-Ort-Bestandsaufnahme',
        description: 'Detaillierte Erfassung Ihres Gebäudes, Baujahrs, der Heizkörper, Vorlauftemperaturen und der bisherigen Dämmung in Wetzlar und Umgebung.'
    },
    {
        step: 2,
        icon: FileText,
        title: 'Heizlast & Energieanalyse',
        description: 'Präzise raumweise Heizlastberechnung nach DIN EN 12831 und Identifikation konkreter energetischer Schwachstellen.'
    },
    {
        step: 3,
        icon: Lightbulb,
        title: 'Maßnahmen- & Sanierungsplan',
        description: 'Vorstellung wirtschaftlicher Sanierungsvarianten mit transparenter Kosten-Nutzen-Rechnung und Amortisationszeit.'
    },
    {
        step: 4,
        icon: Zap,
        title: 'Fachgerechte Umsetzung',
        description: 'Als Meisterbetrieb realisieren wir den Umstieg auf Wärmepumpe, Solar oder Hydraulischen Abgleich aus einer Hand.'
    }
];

const consultingTopics = [
    {
        icon: Thermometer,
        title: 'Heizungs- & Wärmepumpen-Check',
        items: [
            'Vorlauftemperatur-Prüfung für Wärmepumpen-Tauglichkeit',
            'Hydraulischer Abgleich nach Verfahren B',
            'Dimensionierung des Heizungs- und Pufferspeichers',
            'Austausch veralteter Umwälzpumpen gegen Hocheffizienzpumpen'
        ]
    },
    {
        icon: Zap,
        title: 'Erneuerbare Energien & Solar',
        items: [
            'Solarthermie für Trinkwasser- und Heizungsunterstützung',
            'PV-Eigenverbrauchsoptimierung mit Wärmepumpe',
            'Intelligente Smart-Home Heizungssteuerungen',
            'Schnittstellen für dynamische Stromtarife'
        ]
    },
    {
        icon: Home,
        title: 'Gebäude & Fördermittel (iSFP)',
        items: [
            'Individueller Sanierungsfahrplan (iSFP-Bonus)',
            'Ermittlung maximaler KfW- & BAFA-Zuschüsse',
            'Nachweiserstellung für das Gebäudeenergiegesetz (GEG)',
            'Erstellung von Fachunternehmererklärungen'
        ]
    }
];

const energieFaqs = [
    {
        q: 'Ist eine Wärmepumpe auch im Altbau ohne Fußbodenheizung wirtschaftlich?',
        a: 'Ja, moderne Luft-Wasser-Wärmepumpen (insbesondere mit natürlichen Kältemitteln wie R290) erreichen auch bei Vorlauftemperaturen von bis zu 55 °C sehr gute Effizienzwerte (JAZ > 3,5). Durch den gezielten Austausch einzelner Heizkörper gegen Niedertemperatur-Heizkörper lässt sich der Wirkungsgrad weiter deutlich steigern.'
    },
    {
        q: 'Was bringt ein hydraulischer Abgleich konkret?',
        a: 'Durch einen hydraulischen Abgleich wird jeder Heizkörper genau mit der Wassermenge versorgt, die er für die gewünschte Raumtemperatur benötigt. Das verhindert überhitzte oder unterversorgte Räume, senkt den Brennstoffverbrauch um bis zu 15% und ist Voraussetzung für die staatliche KfW-Förderung.'
    },
    {
        q: 'Wie schnell amortisiert sich eine Heizungsmodernisierung?',
        a: 'Dank staatlicher Zuschüsse von bis zu 70% und Brennstoffeinsparungen von 40 bis 60% im Vergleich zu alten Öl- oder Konstanttemperatur-Gaskesseln amortisiert sich eine moderne Wärmepumpenanlage meist schon nach 7 bis 10 Jahren.'
    },
    {
        q: 'Kommen Sie für die Energieberatung direkt zu mir nach Hause?',
        a: 'Ja. Wir führen die technische Bestandsaufnahme direkt bei Ihnen in Wetzlar, Gießen, Marburg, Limburg und dem gesamten Umland durch, um alle baulichen Gegebenheiten exakt zu erfassen.'
    }
];

export default function Energieberatung() {
    return (
        <PageWrapper>

            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-amber-600 via-[#8a4f15] to-[var(--color-neutral-900)] pt-32 pb-20 px-4 text-white">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-amber-200 text-sm mb-6 font-semibold">
                        <Lightbulb className="w-4 h-4 text-amber-300" />
                        Energie sparen &amp; Heizkosten dauerhaft senken
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-tight">
                        Energieberatung für Sanierung &amp; Effizienz in Wetzlar
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-200 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Finden Sie heraus, wie Sie mit modernen Wärmepumpen, Solartechnik und Systemoptimierung bis zu 50% Heizenergie sparen und staatliche Zuschüsse voll ausschöpfen.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/beratung">
                            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-6 rounded-full shadow-lg">
                                Vor-Ort-Energiecheck buchen
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/kontakt">
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-full">
                                Kontakt aufnehmen
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Savings Highlight ────────────────────────────────────── */}
            <section className="py-12 bg-neutral-900 border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                        <div className="flex items-center gap-4">
                            <TrendingDown className="w-10 h-10 text-emerald-400" />
                            <div className="text-left">
                                <p className="text-3xl font-bold text-white">Bis zu 50%</p>
                                <p className="text-neutral-400 text-sm">Heizkosten-Einsparung</p>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-12 bg-neutral-800" />
                        <div className="flex items-center gap-4">
                            <Zap className="w-10 h-10 text-amber-400" />
                            <div className="text-left">
                                <p className="text-3xl font-bold text-white">Bis zu 70%</p>
                                <p className="text-neutral-400 text-sm">KfW-Heizungsförderung</p>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-12 bg-neutral-800" />
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-10 h-10 text-blue-400" />
                            <div className="text-left">
                                <p className="text-3xl font-bold text-white">100%</p>
                                <p className="text-neutral-400 text-sm">Meisterliche Planung &amp; Ausführung</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Process Steps ────────────────────────────────────────── */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 font-display">
                            Schritt für Schritt zu Ihrem energieeffizienten Gebäude
                        </h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Unser strukturierter Ablauf garantiert Ihnen eine verlässliche und wirtschaftliche Modernisierung.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {processSteps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.step} className="relative bg-neutral-50 p-8 rounded-2xl border border-neutral-200 shadow-xs text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
                                        <Icon className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <div className="absolute top-4 right-4 w-7 h-7 bg-neutral-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {step.step}
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Consulting Topics ────────────────────────────────────── */}
            <section className="py-20 bg-neutral-50 px-4 border-t border-neutral-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 font-display">
                            Unsere Beratungsschwerpunkte im Überblick
                        </h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Ganzheitliche Betrachtung Ihrer Haustechnik für maximalen Wohnkomfort und niedrigste Betriebskosten.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {consultingTopics.map((topic, index) => {
                            const Icon = topic.icon;
                            return (
                                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 flex flex-col justify-between">
                                    <div>
                                        <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                            <Icon className="w-7 h-7 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 mb-4">{topic.title}</h3>
                                        <ul className="space-y-3 mb-6">
                                            {topic.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── FAQ Section ──────────────────────────────────────────── */}
            <section className="py-20 bg-white border-t border-neutral-200">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-neutral-900 mb-4 font-display">
                            Häufige Fragen zur Energieberatung
                        </h2>
                        <p className="text-neutral-600">
                            Wichtige Antworten zu Einsparpotenzialen, Kosten und Fördermöglichkeiten.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {energieFaqs.map((faq, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
                                <h3 className="font-bold text-lg text-neutral-900 mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    {faq.q}
                                </h3>
                                <p className="text-neutral-700 text-sm leading-relaxed pl-7">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ──────────────────────────────────────────── */}
            <section className="py-20 bg-neutral-900 text-white px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                        Lassen Sie sich jetzt unverbindlich beraten
                    </h2>
                    <p className="text-neutral-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                        Vereinbaren Sie Ihren individuellen Beratungstermin bei Batherm Haustechnik und erfahren Sie, wie viel Energie Sie in Ihrem Gebäude einsparen können.
                    </p>
                    <Link href="/beratung">
                        <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-6 rounded-full shadow-xl">
                            Jetzt kostenlose Erstberatung vereinbaren
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </PageWrapper>
    );
}
