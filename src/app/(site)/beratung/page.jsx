"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ShieldCheck, FileText, Calendar, Phone, Mail, HelpCircle } from 'lucide-react';
import CalendlySection from '@/components/common/CalendlySection';
import { COMPANY_DATA } from '@/config/company';

const consultationFaqs = [
  {
    q: 'Ist das Erstgespräch wirklich 100% kostenlos und unverbindlich?',
    a: 'Ja. Sowohl die telefonische als auch die persönliche Erstberatung bei uns oder bei Ihnen vor Ort in Wetzlar und Umgebung sind für Sie vollkommen kostenfrei und ohne jede Verpflichtung.'
  },
  {
    q: 'Wie lange dauert ein typischer Beratungstermin?',
    a: 'Für eine fundierte Ersteinschätzung planen wir in der Regel 30 bis 45 Minuten ein. Bei komplexen Sanierungsprojekten oder Wärmepumpen-Umrüstungen nehmen wir uns gerne auch 60 Minuten Zeit.'
  },
  {
    q: 'Welche Unterlagen sollte ich für den Termin bereitlegen?',
    a: 'Hilfreich sind letzte Heizkostenabrechnungen, Informationen zum Baujahr des Gebäudes, vorhandene Grundrisse oder Skizzen sowie Fotos der aktuellen Heizungsanlage bzw. des Badezimmers.'
  },
  {
    q: 'Beraten Sie auch zu staatlichen Fördermitteln (KfW / BAFA)?',
    a: 'Ja, die Fördermittelberatung ist ein Kernbestandteil unseres Services. Wir prüfen die maximalen Zuschüsse (bis zu 70% bei Heizungserneuerung) und unterstützen Sie bei der Antragsstellung.'
  }
];

const beratungSteps = [
  {
    step: '01',
    title: 'Bedarfsanalyse',
    desc: 'Wir erfassen Ihre Wünsche, Raumgegebenheiten, energetischen Ziele und Ihr Budget.'
  },
  {
    step: '02',
    title: 'Technische Prüfung',
    desc: 'Prüfung von Vorlauftemperaturen, Gebäudeisolierung, Leitungsführung und Einbaumöglichkeiten.'
  },
  {
    step: '03',
    title: 'Fördermittel-Check',
    desc: 'Ermittlung aller aktuellen staatlichen Zuschüsse und Förderprogramme (KfW, BAFA, Landesprogramme).'
  },
  {
    step: '04',
    title: 'Transparenter Kostenvoranschlag',
    desc: 'Detailliertes Festpreis-Angebot ohne versteckte Kosten mit verlässlichem Zeitplan.'
  }
];

const Beratung = () => {
    return (
        <main className="bg-neutral-50 min-h-screen">
            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-[var(--color-neutral-900)] via-[#1a2d3d] to-[var(--color-brand-primary)] text-white overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                            <ShieldCheck className="w-4 h-4 text-[#c69c6d]" />
                            Kostenlose Erstberatung vom Handwerksmeister
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-tight">
                            Kostenlose Fachberatung buchen
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto leading-relaxed">
                            Jetzt Ihre kostenlose Fachberatung buchen: Ob moderne Wärmepumpe, Badsanierung oder Heizungsmodernisierung in Wetzlar – wir nehmen uns Zeit für Ihre Fragen und finden die perfekte Lösung.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Process & Value ──────────────────────────────────────── */}
            <section className="py-16 bg-white border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                            Unser 4-Stufen-Beratungsablauf
                        </h2>
                        <p className="text-neutral-600">
                            Vom ersten Gespräch bis zum transparenten Angebot – strukturiert, kompetent und partnerschaftlich.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {beratungSteps.map((step) => (
                            <div key={step.step} className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 relative">
                                <div className="text-3xl font-black text-blue-600/20 mb-3">{step.step}</div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Checklist Preparation ────────────────────────────────── */}
            <section className="py-16 bg-neutral-50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900">Checkliste: So bereiten Sie Ihren Termin optimal vor</h2>
                                <p className="text-sm text-neutral-500">Bringen Sie gerne folgende Unterlagen mit (falls zur Hand)</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-neutral-700 text-sm">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Heizkostenabrechnung:</strong> Die letzten 1–2 Jahre zur Ermittlung des genauen Jahresenergiebedarfs.</span>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Gebäudedaten:</strong> Ungefähres Baujahr, Wohnfläche und Informationen zu bisherigen Dämmmaßnahmen.</span>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Grundriss oder Fotos:</strong> Skizzen vom Badezimmer oder Heizraum erleichtern die Vorplanung enorm.</span>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Wunschtermin &amp; Budget:</strong> Ein grober Zeitrahmen für die geplante Umsetzung Ihrer Maßnahme.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Calendly Booking Widget ──────────────────────────────── */}
            <section className="py-8 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 text-center mb-8">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                        Wunschtermin im Kalender reservieren
                    </h2>
                    <p className="text-neutral-600">
                        Wählen Sie einen passenden Zeitpunkt. Wir bestätigen Ihren Termin sofort.
                    </p>
                </div>
                <CalendlySection />
            </section>

            {/* ── Consultation FAQs ────────────────────────────────────── */}
            <section className="py-16 bg-white border-t border-neutral-200">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                            Häufige Fragen zur Beratung
                        </h2>
                        <p className="text-neutral-600">
                            Alles Wichtige rund um Ablauf, Kosten und Fördermittel.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {consultationFaqs.map((faq, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
                                <h3 className="font-bold text-lg text-neutral-900 mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
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

            {/* ── Direct Contact Section ───────────────────────────────── */}
            <section className="py-16 bg-neutral-900 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Sie möchten lieber direkt mit uns sprechen?
                    </h2>
                    <p className="text-neutral-400 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                        Rufen Sie uns während unserer Geschäftszeiten an oder schreiben Sie uns eine kurze Nachricht.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`tel:${COMPANY_DATA.contact.phone.replace(/\s/g, '')}`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg hover:scale-105"
                        >
                            <Phone className="w-5 h-5" />
                            <span>{COMPANY_DATA.contact.phone}</span>
                        </a>
                        <a
                            href={`mailto:${COMPANY_DATA.contact.email}`}
                            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            <span>{COMPANY_DATA.contact.email}</span>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Beratung;
