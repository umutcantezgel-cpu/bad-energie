"use client";
import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion.jsx";

const faqs = [
    {
        question: "Was kostet eine Badrenovierung?",
        answer: "Die Kosten variieren je nach Raumgröße, Ausstattung und baulichen Gegebenheiten. Wir erstellen Ihnen gerne ein transparentes und individuelles Festpreisangebot auf Anfrage nach einer kostenlosen Vor-Ort-Besichtigung."
    },
    {
        question: "Wie lange dauert der Austausch einer Heizungsanlage?",
        answer: "Dank guter Vorbereitung schaffen wir den reinen Kesseltausch oft in 1-2 Tagen, sodass Sie nicht lange im Kalten sitzen. Umfangreichere Modernisierungen können 3-5 Tage dauern."
    },
    {
        question: "Ist eine Vor-Ort-Besichtigung notwendig?",
        answer: "Für ein genaues Angebot schauen wir uns die Gegebenheiten bei Ihnen vor Ort an. Dieser Termin ist für Sie unverbindlich."
    },
    {
        question: "Helfen Sie bei der Beantragung von Fördermitteln?",
        answer: "Selbstverständlich. Wir beraten Sie zu aktuellen Förderprogrammen (BAFA, KfW) für Wärmepumpen und Badsanierungen und unterstützen Sie bei der Antragstellung."
    },
    {
        question: "Arbeiten Sie auch im Umkreis von Wetzlar?",
        answer: "Ja, wir sind in Wetzlar und im gesamten Lahn-Dill-Kreis sowie Richtung Gießen für Sie tätig."
    }
];

export default function ServiceFAQ() {
    return (
        <section className="py-[var(--spacing-20)] bg-[var(--color-background-surface-secondary)]">
            <div className="max-w-3xl mx-auto px-[var(--spacing-4)] sm:px-[var(--spacing-6)] lg:px-[var(--spacing-8)]">
                <div className="text-center mb-[var(--spacing-12)]">
                    <h2 className="text-3xl font-bold text-[var(--color-neutral-900)] mb-[var(--spacing-4)]">
                        Häufig gestellte Fragen
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Antworten auf die wichtigsten Fragen unserer Kunden.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="bg-[var(--color-neutral-0)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] px-6 shadow-sm">
                            <AccordionTrigger className="text-base font-semibold text-[var(--color-neutral-900)] hover:text-[var(--color-brand-primary)] hover:no-underline py-4 text-left">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[var(--color-text-secondary)] pb-4 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
