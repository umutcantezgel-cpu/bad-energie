"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, HelpCircle, ChevronDown, Mail, MapPin, ArrowRight, Calendar, X } from 'lucide-react';
import { navigationLinks } from '@/config/navigation';
import { COMPANY_DATA } from '@/config/company';

export default function MobileMenu({ isOpen, onClose, onOpenHelp }) {
    const pathname = usePathname();
    const [expandedMenu, setExpandedMenu] = useState(null);

    const toggleSubmenu = (menuName) => {
        setExpandedMenu(expandedMenu === menuName ? null : menuName);
    };

    if (!isOpen) return null;

    return (
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

                    <div className="space-y-1">
                        {navigationLinks.map((link) => {
                            const hasSubmenu = Boolean(link.submenu);
                            const isExpanded = expandedMenu === link.name;

                            return (
                                <div key={link.name} className="border-b border-slate-100/80 pb-1.5">
                                    {hasSubmenu ? (
                                        <>
                                            <button
                                                onClick={() => toggleSubmenu(link.name)}
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
                                                                    onClick={onClose}
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
                                            onClick={onClose}
                                            className="block py-2 text-xs font-black text-slate-800 hover:text-[#0C3A87]"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}

                        <div className="pt-2">
                            <button
                                onClick={onOpenHelp}
                                className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-black text-[#0C3A87] bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 transition-all"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Hilfe-Center &amp; Notfall-Ratgeber</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200 space-y-2.5">
                    <Link
                        href="/termin"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs shadow-md border border-white/20"
                    >
                        <Calendar className="w-4 h-4" />
                        Online-Termin vereinbaren
                    </Link>

                    <a
                        href={`tel:${COMPANY_DATA.headquarters.phoneLink}`}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white text-[#0C3A87] font-black text-xs border border-blue-200 shadow-xs"
                    >
                        <Phone className="w-4 h-4" />
                        {COMPANY_DATA.headquarters.phone} (Wetzlar)
                    </a>

                    <div className="text-center text-[10px] text-slate-400 pt-1 font-medium">
                        Hans-Sachs-Str. 12 &middot; 35576 Wetzlar
                    </div>
                </div>
            </div>
        </div>
    );
}
