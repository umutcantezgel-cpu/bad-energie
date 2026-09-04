"use client";
import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Building2, Award, Zap, Compass, Star, ShieldCheck } from 'lucide-react';
import { historyTimeline } from '@/config/company';

export default function CompanyHistory() {
    const containerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section className="py-24 relative overflow-hidden bg-slate-50" ref={containerRef}>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-50/50 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87] bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
                        Tradition seit 1926 &middot; Meisterbetrieb seit 2001
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Unsere fast 100-jährige Unternehmensgeschichte
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Handwerkliche Wurzeln seit 1926 in Wetzlar. Erfahren Sie, wie sich unser Betrieb über Generationen zum führenden Spezialisten für Badsanierung und Wärmepumpen entwickelt hat.
                    </p>
                </div>

                <div className="relative">
                    {/* Animated vertical line (Desktop) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[3px] bg-slate-200 hidden md:block">
                        <motion.div
                            className="w-full bg-[#0C3A87] origin-top h-full"
                            style={{ scaleY }}
                        />
                    </div>

                    {/* Timeline items */}
                    <div className="space-y-16 md:space-y-24 relative">
                        {historyTimeline.map((item, index) => {
                            return (
                                <div key={index} className="relative">
                                    {/* Mobile Dot */}
                                    <div className="md:hidden absolute left-0 top-6 w-4 h-4 rounded-full bg-[#0C3A87] z-10" />

                                    <div className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 pl-10 md:pl-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                        {/* Content Side */}
                                        <motion.div
                                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="w-full md:w-[42%]"
                                        >
                                            <div className="group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-[#0C3A87]">
                                                        {item.year}
                                                    </span>
                                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#0C3A87] transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Center Dot (Desktop) */}
                                        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center z-20">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                whileInView={{ scale: 1 }}
                                                viewport={{ once: true }}
                                                className="w-5 h-5 rounded-full bg-white border-4 border-[#0C3A87] shadow-md"
                                            />
                                        </div>

                                        {/* Empty Side (Desktop only) */}
                                        <div className="hidden md:block md:w-[42%]" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Final Vision Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-28 p-10 rounded-3xl bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white text-center shadow-xl relative overflow-hidden"
                >
                    <Star className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <h3 className="text-2xl md:text-3xl font-black mb-3 italic">
                        &ldquo;Handwerkliche Tradition aus Wetzlar – vereint mit der Energietechnik von morgen.&rdquo;
                    </h3>
                    <p className="text-xs text-blue-100 font-bold uppercase tracking-wider">
                        Sabri Demir &middot; Geschäftsführer Bad &amp; Energie GmbH
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
