"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Phone, 
    Calendar, 
    AlertCircle, 
    ChevronDown, 
    Menu, 
    X, 
    ShieldCheck, 
    Sparkles, 
    ArrowRight,
    CheckCircle2,
    Clock,
    MapPin
} from 'lucide-react';
import { navigationLinks } from '@/config/navigation';
import { COMPANY_DATA } from '@/config/company';

const Header = ({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, setIsHelpSidebarOpen }) => {
    const pathname = usePathname();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileExpanded, setMobileExpanded] = useState({});
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMobileCategory = (name) => {
        setMobileExpanded(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Top Announcement Bar - Glass Deep Sapphire */}
            <div className="bg-[#0C3A87]/95 backdrop-blur-md text-white text-xs border-b border-white/10 py-1.5 px-4 hidden md:block">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5 font-semibold text-blue-100">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#35A7E9]" />
                            Meisterbetrieb seit 2001 &middot; Handwerkstradition seit 1926
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            NIBE Effizienz Partner &middot; Bis zu 70% KfW-Förderung
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/notdienst" className="flex items-center gap-1 text-red-200 hover:text-white transition-colors font-bold">
                            <AlertCircle className="w-3.5 h-3.5 text-[#FF1E16]" />
                            Notdienst für Bestandskunden
                        </Link>
                        <a 
                            href={`tel:${COMPANY_DATA.contact.phoneLink}`} 
                            className="flex items-center gap-1.5 text-white font-extrabold hover:text-[#35A7E9] transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5 text-[#35A7E9]" />
                            {COMPANY_DATA.contact.phone} (Wetzlar)
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Sticky Navbar - Ultra Glassmorphism */}
            <div className={`transition-all duration-500 ${isScrolled 
                ? 'bg-white/80 backdrop-blur-xl shadow-[0_12px_36px_rgba(12,58,135,0.08)] border-b border-white/70 py-2.5' 
                : 'bg-white/75 backdrop-blur-lg border-b border-white/50 py-3.5'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between" ref={dropdownRef}>
                        
                        {/* Brand Logo with Glass Pill Accent */}
                        <Link href="/" className="flex items-center gap-3 group">
                            {/* Offizielles Signet (Haus mit Flamme, Tropfen, Sonne und Luft) */}
                            <img
                                src="/images/logo-signet.jpg"
                                alt=""
                                width={44}
                                height={44}
                                className="w-11 h-11 rounded-xl bg-white object-contain shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col">
                                <span className="text-lg font-black tracking-tight text-[#0C3A87] leading-none group-hover:text-[#0E1C76] transition-colors">
                                    Bad &amp; Energie <span className="text-[#E4040E]">GmbH</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                                    Meisterbetrieb Wetzlar &middot; Lahn-Dill
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation with Frosted Mega Menus */}
                        <nav className="hidden lg:flex items-center gap-1.5">
                            {navigationLinks.map((link) => {
                                const hasSubmenu = Boolean(link.submenu);
                                const isItemActive = pathname === link.path || (link.submenu && link.submenu.some(cat => cat.items?.some(sub => pathname === sub.path)));
                                const isOpen = activeDropdown === link.name;

                                return (
                                    <div 
                                        key={link.name} 
                                        className="relative"
                                        onMouseEnter={() => hasSubmenu && setActiveDropdown(link.name)}
                                        onMouseLeave={() => hasSubmenu && setActiveDropdown(null)}
                                    >
                                        {hasSubmenu ? (
                                            <button
                                                onClick={() => setActiveDropdown(isOpen ? null : link.name)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs transition-all ${
                                                    isItemActive || isOpen
                                                        ? 'text-[#0C3A87] bg-white/90 shadow-sm border border-blue-200/60'
                                                        : 'text-slate-700 hover:text-[#0C3A87] hover:bg-white/60'
                                                }`}
                                            >
                                                {link.name}
                                                {link.badge && (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-50 text-[#E4040E] border border-red-200/50 leading-none">
                                                        {link.badge}
                                                    </span>
                                                )}
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0C3A87]' : 'text-slate-400'}`} />
                                            </button>
                                        ) : (
                                            <Link
                                                href={link.path}
                                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs transition-all ${
                                                    pathname === link.path
                                                        ? 'text-[#0C3A87] bg-white/90 shadow-sm border border-blue-200/60'
                                                        : 'text-slate-700 hover:text-[#0C3A87] hover:bg-white/60'
                                                }`}
                                            >
                                                {link.name}
                                            </Link>
                                        )}

                                        {/* Frosted Glass Mega-Menu Dropdown Panel */}
                                        {hasSubmenu && isOpen && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[740px] max-w-[92vw] animate-in fade-in-50 slide-in-from-top-2 duration-300">
                                                <div className="p-1 rounded-[2rem] bg-gradient-to-b from-white/90 via-white/70 to-white/40 border border-white/80 shadow-[0_25px_60px_rgba(12,58,135,0.15)] backdrop-blur-2xl">
                                                    <div className="bg-white/95 rounded-[calc(2rem-4px)] p-6 grid grid-cols-3 gap-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                                                        {link.submenu.map((cat, idx) => (
                                                            <div key={idx} className="space-y-3">
                                                                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#0C3A87] border-b border-blue-50 pb-1.5 flex items-center justify-between">
                                                                    {cat.category}
                                                                </h4>
                                                                <ul className="space-y-1.5">
                                                                    {cat.items?.map((item) => (
                                                                        <li key={item.name}>
                                                                            <Link
                                                                                href={item.path}
                                                                                className={`block p-2.5 rounded-2xl transition-all group ${
                                                                                    pathname === item.path
                                                                                        ? 'bg-blue-50/90 text-[#0C3A87] border border-blue-200/50'
                                                                                        : 'hover:bg-slate-50/80 hover:border hover:border-slate-200/40'
                                                                                }`}
                                                                            >
                                                                                <span className="text-xs font-bold text-slate-800 group-hover:text-[#0C3A87] flex items-center justify-between">
                                                                                    {item.name}
                                                                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0C3A87]" />
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
                                                    {/* Mega-menu footer strip */}
                                                    <div className="bg-gradient-to-r from-blue-50/80 to-slate-50/80 px-6 py-3 border-t border-white/60 flex items-center justify-between text-xs text-slate-600 rounded-b-[calc(2rem-4px)]">
                                                        <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            Kostenlose Vor-Ort-Beratung &middot; Wetzlar &amp; Lahn-Dill
                                                        </span>
                                                        <Link href="/termin" className="text-[#0C3A87] font-black hover:underline inline-flex items-center gap-1">
                                                            Wunschtermin buchen &rarr;
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        {/* Desktop Action Buttons - Button-in-Button Architecture */}
                        <div className="hidden lg:flex items-center gap-2.5">
                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0C3A87] bg-white/80 hover:bg-white rounded-full transition-all border border-blue-200/60 shadow-xs group"
                                title="Direkt anrufen"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{COMPANY_DATA.contact.phone}</span>
                            </a>

                            <Link
                                href="/termin"
                                className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-[#E4040E] to-[#B91C1C] rounded-full shadow-[0_8px_20px_rgba(228,4,14,0.3)] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] transition-all transform hover:-translate-y-0.5 group border border-white/20"
                            >
                                <span>Termin buchen</span>
                                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                    <Calendar className="w-3.5 h-3.5 text-white" />
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="p-2 rounded-full bg-blue-50 text-[#0C3A87] hover:bg-blue-100 border border-blue-200"
                                aria-label="Telefon Direktwahl"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs"
                                aria-label="Navigation öffnen"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Drawer Navigation - Frosted Luxury Glass */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[60px] bg-slate-950/60 backdrop-blur-md z-40 animate-in fade-in duration-300">
                    <div className="bg-white/95 backdrop-blur-2xl h-full max-w-sm w-full ml-auto shadow-2xl p-6 overflow-y-auto pb-28 flex flex-col justify-between border-l border-white/40">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87]">Menü-Navigation</span>
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Kundendienst aktiv
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {navigationLinks.map((link) => {
                                    const hasSubmenu = Boolean(link.submenu);
                                    const isExpanded = mobileExpanded[link.name];

                                    return (
                                        <div key={link.name} className="border-b border-slate-100/80 pb-1.5">
                                            {hasSubmenu ? (
                                                <>
                                                    <button
                                                        onClick={() => toggleMobileCategory(link.name)}
                                                        className="w-full flex items-center justify-between py-2 text-xs font-black text-slate-800"
                                                    >
                                                        <span>{link.name}</span>
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#0C3A87]' : ''}`} />
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="pl-3 pr-1 py-2 space-y-3 bg-blue-50/50 rounded-2xl my-1 border border-blue-100/40">
                                                            {link.submenu.map((cat, idx) => (
                                                                <div key={idx} className="space-y-1">
                                                                    <p className="text-[10px] font-black text-[#0C3A87] uppercase tracking-wider">{cat.category}</p>
                                                                    {cat.items?.map((sub) => (
                                                                        <Link
                                                                            key={sub.name}
                                                                            href={sub.path}
                                                                            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                                                                            className="block py-1 text-xs font-semibold text-slate-700 hover:text-[#0C3A87]"
                                                                        >
                                                                            {sub.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <Link
                                                    href={link.path}
                                                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                                                    className="block py-2 text-xs font-black text-slate-800 hover:text-[#0C3A87]"
                                                >
                                                    {link.name}
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Bottom Actions */}
                        <div className="mt-6 pt-4 border-t border-slate-200 space-y-2.5">
                            <Link
                                href="/termin"
                                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs shadow-md"
                            >
                                <Calendar className="w-4 h-4" />
                                Online-Termin vereinbaren
                            </Link>

                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-blue-50 text-[#0C3A87] font-black text-xs border border-blue-200"
                            >
                                <Phone className="w-4 h-4" />
                                {COMPANY_DATA.contact.phone} anrufen
                            </a>

                            <div className="text-center text-[10px] text-slate-400 pt-1 font-medium">
                                Hans-Sachs-Str. 12 &middot; 35576 Wetzlar
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
