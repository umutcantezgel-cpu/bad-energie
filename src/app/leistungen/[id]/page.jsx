"use client";
import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ArrowRight, Phone, Mail, Users, Award, Clock, Shield, Sparkles, MapPin } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import SERVICES from '@/config/services';
import { IconWrapper } from '@/utils/iconMapper';
import { COMPANY_DATA } from '@/config/company';
import QualityPromise from '@/components/sections/QualityPromise';

const defaultProcessSteps = [
    { step: '01', title: 'Beratung', description: 'Wir besprechen Ihre Wünsche und Anforderungen in einem persönlichen Meistergespräch.' },
    { step: '02', title: 'Planung', description: 'Wir erstellen ein maßgeschneidertes Konzept mit transparenter Festpreiskalkulation.' },
    { step: '03', title: 'Umsetzung', description: 'Unsere SHK-Fachleute führen alle Arbeiten termingerecht, staubarm und sauber aus.' },
    { step: '04', title: 'Übergabe', description: 'Gemeinsame Endabnahme mit Funktionserklärung und langfristigem Service.' }
];

const defaultBenefits = [
    { icon: Award, title: 'Meisterbetrieb seit 2001', description: 'Höchste Ausführungsqualität durch zertifizierte Handwerksmeister.' },
    { icon: Clock, title: 'Garantierte Termintreue', description: 'Pünktliche Fertigstellung zum verbindlich vereinbarten Zeitpunkt.' },
    { icon: Shield, title: 'Gewährleistung & Garantie', description: 'Langfristige Markengarantie auf Material und meisterhafte Arbeit.' },
    { icon: Users, title: 'Fester Ansprechpartner', description: 'Ein fester Meister-Bauleiter von der ersten Skizze bis zur Übergabe.' }
];

export default function ServiceDetailPage() {
    const { id } = useParams();
    const content = useContent();

    const servicesData = content?.services || SERVICES;
    const serviceList = Array.isArray(servicesData) ? servicesData : (servicesData?.services || []);
    const service = useMemo(() => serviceList.find(s => s.id === id), [serviceList, id]);

    const relatedServices = useMemo(() =>
        serviceList.filter(s => s.id !== id).slice(0, 3),
        [serviceList, id]
    );

    if (!service) {
        return (
            <div className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-black text-slate-900 mb-4">Leistung nicht gefunden</h1>
                <Link href="/leistungen" className="px-6 py-3 rounded-full bg-[#0C3A87] text-white font-bold text-xs shadow-md">
                    Zurück zur Leistungsübersicht
                </Link>
            </div>
        );
    }

    const processSteps = service.processSteps || defaultProcessSteps;
    const benefits = service.benefits || defaultBenefits;

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="ambient-glow-blue -top-20 -left-20" />
            <div className="ambient-glow-cyan top-96 -right-20" />

            {/* Hero Section with Glassmorphic Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
                <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 space-y-6 relative overflow-hidden">
                    <Link href="/leistungen" className="inline-flex items-center text-xs font-bold text-blue-200/80 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                        Zurück zu allen Leistungen
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex-1 space-y-4">
                            <span className="text-xs uppercase font-black tracking-wider text-cyan-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
                                Bad &amp; Energie GmbH Meisterleistung
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                                {service.id === 'sanitaer' ? 'Sanitärtechnik & Badsanierung in Wetzlar' :
                                 service.id === 'heizung' ? 'Heizungstechnik, Wärmepumpen & Heizungstausch' :
                                 service.id === 'klima' ? 'Klimatechnik & Klimalösungen in Wetzlar' :
                                 service.id === 'wartung' ? 'Fachgerechte Wartung & Service für Haustechnik' :
                                 service.id === 'smart-home' ? 'Intelligente Smart Home Heizungssteuerung' :
                                 service.id === 'wasseraufbereitung' ? 'Professionelle Wasseraufbereitung & Kalkschutz' :
                                 `${service.name} vom Meisterbetrieb`}
                            </h1>
                            <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal">
                                {service.shortDescription}
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col gap-3">
                            <Link
                                href="/termin"
                                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-white/20 text-center"
                            >
                                Jetzt Beratung anfragen &rarr;
                            </Link>
                            <a
                                href={`tel:${COMPANY_DATA.contact.phoneLink}`}
                                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 text-center backdrop-blur-md"
                            >
                                📞 {COMPANY_DATA.contact.phone}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subcategories Section */}
            {service.subcategories && service.subcategories.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                            Unsere {service.name} Bereiche
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {service.subcategories.map((sub, idx) => (
                            <div key={idx} className="glass-surface p-6 rounded-[2rem] text-center hover:shadow-[0_15px_30px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-50 text-[#0C3A87] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-blue-200/60">
                                    <IconWrapper name={sub.icon} className="w-6 h-6 text-[#0C3A87]" />
                                </div>
                                <h3 className="font-black text-xs sm:text-sm text-slate-900">{sub.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content & Features */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-surface p-8 sm:p-10 rounded-[2.5rem] space-y-6">
                            <h2 className="text-2xl font-black text-slate-900">Leistungsbeschreibung &amp; Fachkompetenz</h2>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                {service.detailText}
                            </p>

                            {service.features && service.features.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <span className="text-xs sm:text-sm text-slate-800 font-bold">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200/60 text-xs text-blue-900 leading-relaxed font-medium">
                                <h3 className="font-black text-[#0C3A87] text-sm mb-1">Warum Meisterqualität entscheidend ist</h3>
                                Moderne Haustechnik verlangt höchste Präzision nach aktuellen DIN-Normen und Trinkwasser- bzw. Energiesparverordnungen. Als eingetragener Meisterbetrieb gewährleisten wir rechtssichere Planung, fachgerechte Montage und langfristige Garantien.
                            </div>
                        </div>
                    </div>

                    {/* Double-Bezel Sidebar */}
                    <div className="glass-bezel-outer shadow-2xl sticky top-28">
                        <div className="glass-bezel-inner p-8 space-y-6">
                            <h3 className="text-xl font-black text-slate-900">
                                Interesse an {service.name}?
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Unsere Meister beraten Sie gerne persönlich, unverbindlich und direkt vor Ort in Wetzlar &amp; Umgebung.
                            </p>

                            <div className="space-y-3 pt-2 text-xs">
                                <a href={`tel:${COMPANY_DATA.contact.phoneLink}`} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-900 font-bold hover:bg-white transition-all">
                                    <Phone className="w-4 h-4 text-[#0C3A87]" />
                                    <span>{COMPANY_DATA.contact.phone}</span>
                                </a>
                                <a href={`mailto:${COMPANY_DATA.contact.email}`} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-900 font-bold hover:bg-white transition-all">
                                    <Mail className="w-4 h-4 text-[#0C3A87]" />
                                    <span>{COMPANY_DATA.contact.email}</span>
                                </a>
                            </div>

                            <Link
                                href="/termin"
                                className="block w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#E4040E] to-[#B91C1C] text-white font-black text-xs text-center shadow-md hover:shadow-lg transition-all border border-white/20"
                            >
                                Jetzt Wunschtermin anfragen &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Process Steps */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Unser Ablauf bei {service.name}
                    </h2>
                </div>
                <div className="grid md:grid-cols-4 gap-6">
                    {processSteps.map((step, idx) => (
                        <div key={idx} className="glass-surface p-6 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                            <div>
                                <span className="text-2xl sm:text-3xl font-black text-[#0C3A87] mb-2 block">{step.step}</span>
                                <h3 className="text-base font-black text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Ihre Vorteile mit Bad &amp; Energie GmbH
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, idx) => {
                        const Icon = benefit.icon;
                        return (
                            <div key={idx} className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
                                <div className="w-12 h-12 bg-blue-50 text-[#0C3A87] rounded-2xl flex items-center justify-center mb-4 shadow-xs border border-blue-200/60">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-base text-slate-900 mb-2">{benefit.title}</h3>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{benefit.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <QualityPromise />
        </div>
    );
}
