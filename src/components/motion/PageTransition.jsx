"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';


/**
 * Premium Tech Stack: Cinematic Page Transitions
 * GPU-accelerated animations for route changes
 * 
 * Features:
 * - Mask reveal effect
 * - Staggered content appearance
 * - Smooth exit animations
 * - Respects prefers-reduced-motion
 */

// Page transition variants
const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Reduced motion variants
const reducedMotionVariants = {
    initial: { opacity: 0 },
    enter: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.1 },
    },
};

const PageTransition = ({ children }) => {
    const location = { pathname: usePathname() };

    // Check for reduced motion preference
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const variants = prefersReducedMotion ? reducedMotionVariants : pageVariants;

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={variants}
                style={{
                    // GPU acceleration
                    willChange: 'opacity, transform',
                    transformStyle: 'preserve-3d',
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
