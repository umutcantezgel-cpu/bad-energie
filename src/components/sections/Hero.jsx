"use client";

import { Button } from '@/components/ui/button';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { cn } from '@/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Star, Clock } from 'lucide-react';
import Link from 'next/link';

const Hero = ({
    title,
    subtitle,
    primaryCtaText = "Angebot anfordern",
    secondaryCtaText = "Leistungen ansehen",
    primaryCtaLink = "/kontakt",
    secondaryCtaLink = "/leistungen",
    backgroundImage,
    className = ''
}) => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <section className={cn("relative w-full overflow-hidden min-h-[90vh] flex items-center pt-24", className)}>
            {/* Background Layer with Parallax */}
            <motion.div 
                className="absolute inset-0 z-0 bg-neutral-950"
                style={{ y: y1 }}
            >
                {/* Image with Ken-Burns Effect */}
                {backgroundImage && (
                    <ResponsiveImage
                        src={backgroundImage}
                        alt="Bad &amp; Energie GmbH Meisterbetrieb Wetzlar"
                        containerClassName="absolute inset-0 w-full h-full"
                        className="animate-[kenburns_20s_ease-out_forwards]"
                        priority={true}
                        sizes="100vw"
                    />
                )}

                {/* Scrim Overlay - Richer gradients for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none" />
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col justify-center h-full">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
                    style={{ opacity }}
                    className="max-w-4xl"
                >
                    {/* Floating Badges */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex flex-wrap gap-4 mb-8"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]">
                            <ShieldCheck className="w-4 h-4 text-[var(--color-primary-light)]" />
                            <span>Zertifizierter Meisterbetrieb</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]">
                            <Clock className="w-4 h-4 text-red-400" />
                            <span>24/7 Notdienst</span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] mb-8 tracking-tight text-white drop-shadow-2xl"
                    >
                        <span className="block text-white/90">Sanitär, Heizung &amp; Solar</span>
                        <span className="block bg-gradient-to-r from-blue-400 via-white to-blue-200 bg-clip-text text-transparent">
                            in Wetzlar &amp; Region
                        </span>
                    </motion.h1>

                    {/* Subtitle with Glassmorphism Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="relative mb-12 p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 max-w-2xl shadow-2xl"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        <p className="relative text-lg md:text-2xl leading-relaxed text-neutral-200 font-light">
                            {subtitle || "Wir verbinden handwerkliche Präzision mit modernster Technik für Sanitär, Heizung und Klima in Wetzlar und Umgebung."}
                        </p>
                    </motion.div>

                    {/* CTAs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6"
                    >
                        <Link href={primaryCtaLink} passHref>
                            <Button
                                size="lg"
                                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white border-none shadow-[0_8px_32px_-8px_rgba(37,99,235,0.6)] font-semibold text-lg px-10 py-7 h-auto rounded-xl transition-all hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center">
                                    {primaryCtaText}
                                    <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Button>
                        </Link>

                        <Link href={secondaryCtaLink} passHref>
                            <Button
                                variant="outline"
                                size="lg"
                                className="group bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 text-white font-semibold text-lg px-10 py-7 h-auto rounded-xl transition-all shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] hover:scale-105"
                            >
                                <span className="flex items-center">
                                    {secondaryCtaText}
                                </span>
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default Hero
