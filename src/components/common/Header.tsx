"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
    Phone, 
    Calendar, 
    AlertCircle, 
    ChevronDown, 
    Menu, 
    X, 
    ShieldCheck, 
    ArrowRight,
    CheckCircle2,
    MapPin,
    HelpCircle
} from 'lucide-react';
import { navigationLinks, NavigationLink } from '@/config/navigation';
import { COMPANY_DATA } from '@/config/company';

interface HeaderProps {
    isScrolled: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void);
    setIsHelpSidebarOpen?: (open: boolean) => void;
}

export default function Header({
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsHelpSidebarOpen,
}: HeaderProps) {
    const pathname = usePathname();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Klick außerhalb schließt offene Dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Escape-Taste schließt aktive Dropdowns
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Sanfte Schließverzögerung für Hover-Bridge (verhindert versehentliches Zuklappen bei diagonalen Mausbewegungen)
    const handleMouseEnter = (name: string) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveDropdown(name);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 120);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* 1. Top Utility Bar - Meister Navy, 36px Höhe */}
            <div className="bg-[#0B2559] text-white text-xs border-b border-white/10 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
                    {/* Linke Seite: Vertrauensanker & Ausstellungs-Hinweis */}
                    <div className="flex items-center gap-5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-200 tracking-tight">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#35A7E9] shrink-0" />
                            <span>Meisterbetrieb seit 2001 &middot; Region Wetzlar &amp; Lahn-Dill</span>
                        </span>
                        <span className="text-white/20">&middot;</span>
                        <Link 
                            href="/ausstellung/wetzlar" 
                            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                        >
                            <MapPin className="w-3 h-3 text-[#35A7E9] shrink-0" />
                            <span>Ausstellungen Wetzlar &amp; Gießen</span>
                        </Link>
                    </div>

                    {/* Rechte Seite: 24/7 Notdienst, Hilfe-Center & Direktanruf */}
                    <div className="flex items-center gap-5">
                        <Link 
                            href="/notdienst" 
                            className="flex items-center gap-1.5 font-bold text-red-300 hover:text-white transition-colors bg-red-950/40 hover:bg-red-900/60 px-2 py-0.5 rounded border border-red-500/30"
                            title="24/7 Notdienst für unsere Bestandskunden"
                        >
                            <AlertCircle className="w-3.5 h-3.5 text-[#FF1E16] shrink-0" />
                            <span>24/7 Notdienst</span>
                        </Link>

                        {setIsHelpSidebarOpen && (
                            <button
                                type="button"
                                onClick={() => setIsHelpSidebarOpen(true)}
                                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium cursor-pointer"
                                title="Schnelle Hilfe & Rückruf anfordern"
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-[#35A7E9] shrink-0" />
                                <span>Hilfe-Center</span>
                            </button>
                        )}

                        <span className="text-white/20">&middot;</span>

                        <a 
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`} 
                            className="flex items-center gap-1.5 text-white font-extrabold hover:text-[#35A7E9] transition-colors"
                            title="Rufen Sie uns direkt an"
                        >
                            <Phone className="w-3.5 h-3.5 text-[#35A7E9] shrink-0" />
                            <span>{COMPANY_DATA.contact.phone}</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* 2. Main Sticky Navbar */}
            <div 
                ref={navRef}
                className={`transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-white/98 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(12,58,135,0.08)] border-b border-slate-200 py-2.5' 
                        : 'bg-white/95 backdrop-blur-sm border-b border-slate-200/80 py-3.5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        
                        {/* Logo & Markenauftritt */}
                        <Link 
                            href="/" 
                            className="flex items-center gap-3 group shrink-0 focus-visible:outline-2 focus-visible:outline-[#0C3A87] rounded-xl"
                        >
                            <Image
                                src="/images/logo-signet.jpg"
                                alt="Bad & Energie GmbH Logo"
                                width={44}
                                height={44}
                                priority
                                className="w-11 h-11 rounded-xl bg-white object-contain shadow-xs border border-slate-100 group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="flex flex-col">
                                <span className="text-base sm:text-lg font-black tracking-tight text-[#0C3A87] leading-none group-hover:text-[#0E1C76] transition-colors">
                                    Bad &amp; Energie <span className="text-[#E4040E]">GmbH</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                                    Meisterbetrieb Wetzlar &middot; Lahn-Dill
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation: 5 Konsolidierte Kernsäulen (100% Einzeilig auf Desktop) */}
                        <nav aria-label="Hauptnavigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
                            {navigationLinks.map((link: NavigationLink) => {
                                const hasSubmenu = Boolean(link.submenu && link.submenu.length > 0);
                                const isItemActive = pathname === link.path || 
                                    Boolean(link.submenu?.some(cat => cat.items?.some(sub => pathname === sub.path)));
                                const isOpen = activeDropdown === link.name;
                                const hasHighlight = Boolean(link.highlight);

                                return (
                                    <div 
                                        key={link.name} 
                                        className="relative"
                                        onMouseEnter={() => hasSubmenu && handleMouseEnter(link.name)}
                                        onMouseLeave={() => hasSubmenu && handleMouseLeave()}
                                    >
                                        {hasSubmenu ? (
                                            <button
                                                type="button"
                                                onClick={() => setActiveDropdown(isOpen ? null : link.name)}
                                                aria-haspopup="true"
                                                aria-expanded={isOpen}
                                                aria-controls={`flyout-${link.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#0C3A87] cursor-pointer ${
                                                    isItemActive || isOpen
                                                        ? 'text-[#0C3A87] bg-blue-50/90'
                                                        : 'text-slate-700 hover:text-[#0C3A87] hover:bg-slate-50'
                                                }`}
                                            >
                                                <span>{link.name}</span>
                                                {link.badge && (
                                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-50 text-[#E4040E] border border-red-200/60 leading-none">
                                                        {link.badge}
                                                    </span>
                                                )}
                                                <ChevronDown 
                                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                        isOpen ? 'rotate-180 text-[#0C3A87]' : 'text-slate-400'
                                                    }`} 
                                                />
                                            </button>
                                        ) : (
                                            <Link
                                                href={link.path}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#0C3A87] ${
                                                    pathname === link.path
                                                        ? 'text-[#0C3A87] bg-blue-50/90'
                                                        : 'text-slate-700 hover:text-[#0C3A87] hover:bg-slate-50'
                                                }`}
                                            >
                                                {link.name}
                                            </Link>
                                        )}

                                        {/* Mega-Flyout Dropdown Panel mit Safe-Hover-Bridge */}
                                        {hasSubmenu && isOpen && link.submenu && (
                                            <div 
                                                id={`flyout-${link.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                                role="menu"
                                                aria-label={link.name}
                                                className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 ${
                                                    hasHighlight 
                                                        ? 'w-[780px] xl:w-[820px] max-w-[94vw]' 
                                                        : 'w-[580px] xl:w-[620px] max-w-[90vw]'
                                                }`}
                                                onMouseEnter={() => handleMouseEnter(link.name)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_20px_45px_-10px_rgba(12,58,135,0.12)] p-5 xl:p-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className={`grid gap-6 ${hasHighlight ? 'grid-cols-12' : 'grid-cols-2'}`}>
                                                        {/* Leistungsspalten */}
                                                        <div className={`grid grid-cols-2 gap-5 ${hasHighlight ? 'col-span-8' : 'col-span-2'}`}>
                                                            {link.submenu.map((cat, idx) => (
                                                                <div key={idx} className="space-y-2.5">
                                                                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#0C3A87] border-b border-slate-100 pb-1.5 flex items-center justify-between">
                                                                        <span>{cat.category}</span>
                                                                    </h4>
                                                                    <ul className="space-y-1" role="none">
                                                                        {cat.items?.map((item) => (
                                                                            <li key={item.name} role="none">
                                                                                <Link
                                                                                    href={item.path}
                                                                                    role="menuitem"
                                                                                    onClick={() => setActiveDropdown(null)}
                                                                                    className={`block p-2 rounded-xl transition-all group focus-visible:outline-2 focus-visible:outline-[#0C3A87] ${
                                                                                        pathname === item.path
                                                                                            ? 'bg-blue-50 text-[#0C3A87]'
                                                                                            : 'hover:bg-slate-50'
                                                                                    }`}
                                                                                >
                                                                                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#0C3A87] flex items-center justify-between">
                                                                                        <span>{item.name}</span>
                                                                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0C3A87] shrink-0 ml-1" />
                                                                                    </span>
                                                                                    {item.desc && (
                                                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                                                                                            {item.desc}
                                                                                        </p>
                                                                                    )}
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Highlight-Kachel (z. B. BEG-Förderung oder Musterbäder) */}
                                                        {hasHighlight && link.highlight && (
                                                            <div className="col-span-4 bg-gradient-to-br from-blue-50/80 via-slate-50 to-white rounded-xl p-4 border border-blue-100/80 flex flex-col justify-between">
                                                                <div>
                                                                    {link.highlight.badge && (
                                                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0C3A87] bg-white px-2 py-0.5 rounded border border-blue-200/60 inline-block mb-2.5">
                                                                            {link.highlight.badge}
                                                                        </span>
                                                                    )}
                                                                    <h5 className="text-xs font-black text-slate-900 mb-1.5 leading-snug">
                                                                        {link.highlight.title}
                                                                    </h5>
                                                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                                                        {link.highlight.description}
                                                                    </p>
                                                                </div>
                                                                <Link
                                                                    href={link.highlight.path}
                                                                    onClick={() => setActiveDropdown(null)}
                                                                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0C3A87] hover:text-[#0E1C76] group/cta"
                                                                >
                                                                    <span>{link.highlight.ctaText}</span>
                                                                    <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Mega-Menu Footer-Streifen */}
                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                                        <span className="font-medium flex items-center gap-1.5 text-slate-700">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span>Kostenlose Vor-Ort-Beratung &middot; Wetzlar &amp; Lahn-Dill</span>
                                                        </span>
                                                        <Link 
                                                            href="/termin" 
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="text-[#0C3A87] font-bold hover:underline inline-flex items-center gap-1"
                                                        >
                                                            <span>Wunschtermin anfragen &rarr;</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        {/* Rechte Aktions-Spalte: Primär-CTA „Termin vereinbaren“ */}
                        <div className="hidden lg:flex items-center gap-3 shrink-0">
                            <Link
                                href="/termin"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs xl:text-sm font-extrabold text-white bg-[#E4040E] hover:bg-[#B91C1C] rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#E4040E]"
                            >
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span>Termin vereinbaren</span>
                            </Link>
                        </div>

                        {/* Mobile Auslöser (nur auf Bildschirmen < 1024px sichtbar) */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="p-2.5 rounded-xl bg-blue-50 text-[#0C3A87] hover:bg-blue-100 border border-blue-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                aria-label="Meisterbetrieb direkt anrufen"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                                aria-label={isMobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
}
