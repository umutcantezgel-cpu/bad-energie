"use client";
import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote, ArrowRight, User } from 'lucide-react';
import { TESTIMONIALS, TRUST_STATS } from '@/config/testimonials';

export default function ReviewsSection() {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredReviews = selectedCategory === 'all' 
        ? TESTIMONIALS 
        : TESTIMONIALS.filter(t => t.category === selectedCategory);

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#08164D] via-[#0A1556] to-[#060D38] text-white">
            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Stats Header - Translucent Glass Counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pb-16 border-b border-white/10">
                    {TRUST_STATS.map((stat, i) => (
                        <div key={i} className="text-center p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                            <div className="text-2xl sm:text-4xl font-black text-amber-300 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold text-white mb-0.5">{stat.label}</div>
                            <div className="text-[11px] text-blue-200">{stat.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Section Header */}
                <div className="mt-16 text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black mb-4 backdrop-blur-md">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                        </div>
                        <span>Durchschnittliche Kundenbewertung 5.0 / 5.0</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                        Was unsere Kunden in Wetzlar &amp; Umgebung sagen
                    </h2>
                    <p className="mt-3 text-sm text-blue-100 leading-relaxed font-normal">
                        Authentische Rückmeldungen zu unseren Badsanierungen, Wärmepumpeninstallationen und unserem Haustechnik-Kundendienst.
                    </p>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                        {[
                            { id: 'all', label: 'Alle Kundenstimmen' },
                            { id: 'bad', label: 'Badsanierung' },
                            { id: 'heizung', label: 'Wärmepumpe & Heizung' },
                            { id: 'haustechnik', label: 'Haustechnik' },
                            { id: 'lueftung', label: 'Wohnraumlüftung' }
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white shadow-[0_4px_15px_rgba(228,4,14,0.4)] border border-white/20'
                                        : 'bg-white/10 text-blue-100 hover:bg-white/15 border border-white/10 backdrop-blur-sm'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews Glass Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-6 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl flex flex-col justify-between hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 transition-all duration-500 shadow-xl group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex text-amber-400">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 font-black border border-blue-400/30">
                                        {review.service}
                                    </span>
                                </div>

                                <p className="text-xs text-blue-50 italic leading-relaxed font-normal">
                                    &ldquo;{review.quote}&rdquo;
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-white">{review.name}</h4>
                                    <p className="text-[11px] text-blue-200">{review.role}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verifiziert
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
