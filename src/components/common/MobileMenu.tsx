"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
    Phone, 
    HelpCircle, 
    ChevronDown, 
    Calendar, 
    X, 
    AlertCircle, 
    MapPin, 
    ArrowRight 
} from 'lucide-react';
import { navigationLinks, NavigationLink } from '@/config/navigation';
import { COMPANY_DATA } from '@/config/company';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenHelp: () => void;
}

export default function MobileMenu({ isOpen, onClose, onOpenHelp }: MobileMenuProps) {
    const pathname = usePathname();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    // Body-Scroll sperren wenn das Mobil-Menü geöffnet ist
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Escape-Taste schließt das Mobil-Menü
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const toggleSubmenu = (menuName: string) => {
        setExpandedMenu(expandedMenu === menuName ? null : menuName);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="lg:hidden fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
        >
            {/* Abgedunkelter Hintergrund mit Klick-zum-Schließen */}
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-250">
                
                {/* 1. Header-Bereich im Drawer */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                        <Image
                            src="/images/logo-signet.jpg"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg bg-white object-contain border border-slate-200 shadow-xs"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-[#0C3A87] leading-tight">
                                Bad &amp; Energie <span className="text-[#E4040E]">GmbH</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Meisterbetrieb Wetzlar
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Navigation schließen"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. Scrollbarer Menü-Inhalt */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    
                    {/* Schnell-Aktionsleiste: Notdienst & Direktanruf */}
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href="/notdienst"
                            onClick={onClose}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-50 text-[#E4040E] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors min-h-[44px]"
                        >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>24/7 Notdienst</span>
                        </Link>
                        <a
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 text-[#0C3A87] border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors min-h-[44px]"
                        >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>Anrufen</span>
                        </a>
                    </div>

                    {/* Navigations-Kategorien (Akkordeon) */}
                    <div className="space-y-1 pt-2">
                        {navigationLinks.map((link: NavigationLink) => {
                            const hasSubmenu = Boolean(link.submenu && link.submenu.length > 0);
                            const isExpanded = expandedMenu === link.name;
                            const isItemActive = pathname === link.path || 
                                Boolean(link.submenu?.some(cat => cat.items?.some(sub => pathname === sub.path)));

                            return (
                                <div key={link.name} className="border-b border-slate-100/80 pb-1">
                                    {hasSubmenu ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => toggleSubmenu(link.name)}
                                                className={`w-full flex items-center justify-between py-3 px-2 rounded-xl text-sm font-extrabold transition-colors min-h-[44px] cursor-pointer ${
                                                    isItemActive ? 'text-[#0C3A87]' : 'text-slate-800 hover:text-[#0C3A87]'
                                                }`}
                                                aria-expanded={isExpanded}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {link.name}
                                                    {link.badge && (
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-50 text-[#E4040E] border border-red-200/50">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </span>
                                                <ChevronDown 
                                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                                        isExpanded ? 'rotate-180 text-[#0C3A87]' : ''
                                                    }`} 
                                                />
                                            </button>

                                            {isExpanded && link.submenu && (
                                                <div className="pl-3 pr-2 py-2 space-y-3 bg-slate-50 rounded-xl my-1 border border-slate-100">
                                                    {link.submenu.map((cat, idx) => (
                                                        <div key={idx} className="space-y-1">
                                                            <p className="text-[10px] font-black text-[#0C3A87] uppercase tracking-wider px-2 pt-1">
                                                                {cat.category}
                                                            </p>
                                                            <ul className="space-y-0.5">
                                                                {cat.items?.map((sub) => (
                                                                    <li key={sub.name}>
                                                                        <Link
                                                                            href={sub.path}
                                                                            onClick={onClose}
                                                                            className={`block py-2 px-2 rounded-lg text-xs font-bold transition-colors min-h-[40px] flex items-center justify-between ${
                                                                                pathname === sub.path
                                                                                    ? 'text-[#0C3A87] bg-white shadow-xs font-black'
                                                                                    : 'text-slate-700 hover:text-[#0C3A87] hover:bg-white/60'
                                                                            }`}
                                                                        >
                                                                            <span>{sub.name}</span>
                                                                            <ArrowRight className="w-3 h-3 text-slate-400" />
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}

                                                    {/* Highlight Teaser im Mobile-Menü */}
                                                    {link.highlight && (
                                                        <Link
                                                            href={link.highlight.path}
                                                            onClick={onClose}
                                                            className="block p-3 rounded-lg bg-blue-50/80 border border-blue-100 text-xs text-[#0C3A87] font-bold"
                                                        >
                                                            <div className="font-black text-slate-900 mb-0.5">{link.highlight.title}</div>
                                                            <div className="text-[11px] text-slate-600 font-normal leading-snug">{link.highlight.description}</div>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={link.path}
                                            onClick={onClose}
                                            className={`block py-3 px-2 rounded-xl text-sm font-extrabold transition-colors min-h-[44px] flex items-center ${
                                                pathname === link.path
                                                    ? 'text-[#0C3A87] bg-blue-50/80 font-black'
                                                    : 'text-slate-800 hover:text-[#0C3A87]'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Hilfe-Center & Notfall-Ratgeber */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenHelp();
                            }}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold text-[#0C3A87] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/50 transition-all min-h-[44px] cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-[#35A7E9] shrink-0" />
                                <span>Hilfe-Center &amp; Notfall-Ratgeber</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#0C3A87]" />
                        </button>
                    </div>

                    {/* Showroom & Standorte Info */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-[#35A7E9]" />
                            <span>Showroom &amp; Meisterbetrieb</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Hans-Sachs-Str. 12 &middot; 35576 Wetzlar
                        </p>
                    </div>

                </div>

                {/* 3. Footer-Bereich im Drawer: Primär-CTA */}
                <div className="p-5 border-t border-slate-200 bg-white space-y-2">
                    <Link
                        href="/termin"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E4040E] hover:bg-[#B91C1C] text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all min-h-[48px]"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Termin online vereinbaren</span>
                    </Link>
                    <div className="text-center text-[10px] text-slate-400 pt-1 font-medium">
                        Bad &amp; Energie GmbH &middot; Tradition seit 1926
                    </div>
                </div>

            </div>
        </div>
    );
}
