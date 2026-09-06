"use client";
import React from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

export default function CareerCTA() {
    return (
        <section className="py-[var(--spacing-20)]">
            <div className="max-w-7xl mx-auto px-[var(--spacing-4)] sm:px-[var(--spacing-6)] lg:px-[var(--spacing-8)]">
                <div className="bg-[var(--color-neutral-900)] rounded-[var(--radius-2xl)] p-[var(--spacing-12)] md:p-[var(--spacing-16)] relative overflow-hidden text-center md:text-left">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-primary)] opacity-10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-[var(--spacing-8)]">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-6">
                                <Briefcase className="w-4 h-4" />
                                Karriere bei Bad &amp; Energie
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Werde Teil unseres Meisterteams!
                            </h2>
                            <p className="text-lg text-[var(--color-neutral-300)] leading-relaxed mb-8">
                                Wir suchen motivierte Talente. Ob erfahrener Anlagenmechaniker SHK, Meister oder Auszubildender – wenn du Lust auf solides Handwerk und ein starkes Team hast, bist du bei der Bad &amp; Energie GmbH in Wetzlar genau richtig.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link href={createPageUrl('Karriere')}>
                                    <Button size="lg" className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white border-0">
                                        Karriere-Seite ansehen
                                    </Button>
                                </Link>
                                <Link href={createPageUrl('Karriere')}>
                                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                                        Offene Stellen ansehen
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Image / Illustration Side */}
                        <div className="hidden lg:block relative">
                            <div className="w-64 h-64 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] rounded-2xl rotate-3 opacity-20 absolute inset-0" />
                            <div className="w-64 h-64 bg-[var(--color-neutral-800)] rounded-2xl relative flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                <Briefcase className="w-24 h-24 text-[var(--color-brand-primary)] opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
