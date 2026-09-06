"use client";
import React from 'react'
import Link from 'next/link';
import { cn } from '@/utils';
import { motion } from 'framer-motion';

const ServiceCard = ({ title, description, icon: Icon, href, className }) => {
    return (
        <motion.div 
            whileHover={{ y: -8 }}
            className={cn(
                "group relative flex flex-col p-8 rounded-3xl",
                "bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-neutral-100",
                "transition-all duration-500 ease-out overflow-hidden z-10",
                className
            )}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            {Icon && (
                <div className="mb-6 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <Icon size={28} strokeWidth={1.5} />
                </div>
            )}

            <h3 className="text-xl font-bold text-neutral-900 mb-3 font-sans tracking-tight">
                {title}
            </h3>

            <p className="text-base text-neutral-600 leading-relaxed mb-6 flex-grow font-light">
                {description}
            </p>

            {href && (
                <Link 
                    href={href} 
                    className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 mt-auto"
                    aria-label={`${title} im Detail ansehen`}
                >
                    <span>{title ? `${title} ansehen` : 'Leistung ansehen'}</span>
                    <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )}
        </motion.div>
    )
}

export default ServiceCard
