"use client";
import React from 'react';
import { Quote } from 'lucide-react';

export default function FeaturedTestimonial() {
    return (
        <section className="py-[var(--spacing-16)] mb-[var(--spacing-20)]">
            <div className="bg-[var(--color-neutral-900)] rounded-[var(--radius-2xl)] p-[var(--spacing-12)] md:p-[var(--spacing-16)] relative overflow-hidden text-center">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-brand-primary)] opacity-10 blur-3xl rounded-full transform -translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--color-brand-secondary)] opacity-10 blur-3xl rounded-full transform translate-x-1/3 translate-y-1/3" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="w-16 h-16 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Quote className="w-8 h-8 text-[var(--color-brand-primary)]" />
                    </div>

                    <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-8 leading-normal font-heading">
                        &quot;Das Meisterteam der Bad &amp; Energie GmbH hat unser Badezimmer in eine Wellness-Oase verwandelt. Die Planung war kreativ, die Umsetzung absolut pünktlich und sauber. Wir sind begeistert!&quot;
                    </blockquote>

                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-neutral-700)] to-[var(--color-neutral-500)] mb-3 border-2 border-[var(--color-brand-primary)]" />
                        <div className="text-lg font-bold text-white">Familie Müller</div>
                        <div className="text-[var(--color-neutral-400)] text-sm">Komplettsanierung EFH in Wetzlar</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
