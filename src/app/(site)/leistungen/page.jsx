"use client";
import React, { useState, useEffect } from 'react';
import { Droplets, Flame, Sun, Wrench, Clock, Wifi, ChevronDown, Check, ArrowRight } from 'lucide-react';
import ProcessSteps from '@/components/sections/ProcessSteps';
import ServiceFAQ from '@/components/sections/ServiceFAQ';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { IconWrapper } from '@/utils/iconMapper';
import { useContent } from '@/contexts/ContentContext';

import PageWrapper from '@/components/common/PageWrapper';

export default function ServicePage() {
  const { services, siteConfig } = useContent();
  const [expandedService, setExpandedService] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Services data imported from config

  return (
    <PageWrapper className="relative min-h-screen pt-[var(--spacing-32)] pb-[var(--spacing-20)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] bg-[var(--color-background-surface-secondary)]">
      {/* Background Decoration - Subtle */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--color-blue-50)] rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-neutral-100)] rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-[var(--spacing-16)]">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-neutral-900)] mb-[var(--spacing-4)] tracking-tight">
            Umfassende Haustechnik-Leistungen in Wetzlar &amp; Region
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto font-light leading-relaxed">
            Als eingetragener Meisterbetrieb bietet Ihnen Batherm Haustechnik in Wetzlar erstklassige Leistungen in Sanitärtechnik, moderner Heizungstechnik, Klimatechnik, Wärmepumpen und intelligenter Gebäudeautomation. Profitieren Sie von handwerklicher Präzision, transparenten Festpreisen und persönlicher Fachberatung.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-[var(--spacing-8)] mb-[var(--spacing-20)]">
          {services.map((service, index) => {
            const isExpanded = expandedService === service.id;

            return (
              <div
                key={service.id}
                id={`service-${index}`}
                data-animate
                className={`relative transition-all duration-700 ${isVisible[`service-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-[var(--color-neutral-0)] rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 h-full flex flex-col">
                  <div className="p-[var(--spacing-8)] flex-1 flex flex-col">
                    {/* Service Header */}
                    <div className="flex items-start gap-[var(--spacing-4)] mb-[var(--spacing-6)]">
                      <div className={`w-14 h-14 rounded-[var(--radius-base)] bg-[var(--color-blue-50)] flex items-center justify-center flex-shrink-0 border border-[var(--color-blue-100)]`}>
                        <IconWrapper name={service.icon} className="w-7 h-7 text-[var(--color-blue-700)]" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[var(--color-neutral-900)] mb-1">
                          {service.name}
                        </h2>
                        <p className="text-[var(--color-blue-700)] font-medium text-sm">{service.shortDescription}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[var(--color-text-secondary)] mb-[var(--spacing-6)] leading-relaxed flex-1">
                      {service.detailText}
                    </p>
                    {/* Features List */}
                    <div className={`space-y-[var(--spacing-3)] mb-[var(--spacing-6)] transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}>
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-[var(--spacing-2)]">
                          <Check className="w-5 h-5 text-[var(--color-brand-secondary)] flex-shrink-0 mt-0.5" />
                          <span className="text-[var(--color-neutral-700)] text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-[var(--spacing-3)] mt-auto pt-[var(--spacing-4)] border-t border-[var(--color-neutral-100)]">
                      <Link href={`/leistungen/${service.id}`}>
                        <Button
                          variant="ghost"
                          className="text-[var(--color-neutral-600)] hover:text-[var(--color-blue-700)] hover:bg-[var(--color-blue-50)]"
                        >
                          Mehr erfahren
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={createPageUrl('Contact')}>
                        <Button className="bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white shadow-sm">
                          Jetzt anfragen
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <ProcessSteps />

      <ServiceFAQ />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
          <div className="absolute inset-0 bg-[var(--color-brand-primary)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--color-brand-accent)] opacity-20 transform skew-x-12" />
          </div>

          <div className="relative p-[var(--spacing-12)] text-center text-white">
            <h2 className="text-3xl font-bold mb-[var(--spacing-4)] text-[var(--color-neutral-0)]">
              Nicht das Richtige gefunden?
            </h2>
            <p className="text-xl mb-[var(--spacing-6)] max-w-2xl mx-auto text-[var(--color-blue-100)] font-light">
              Wir beraten Sie gerne zu allen Fragen rund um Sanitär, Heizung und Energietechnik
            </p>
            <div className="flex flex-wrap justify-center gap-[var(--spacing-4)]">
              <Link href={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-[var(--color-brand-primary)] font-bold hover:bg-[var(--color-neutral-100)] border-0 shadow-md">
                  Kostenlose Beratung vereinbaren
                </Button>
              </Link>
              <Link href={createPageUrl('Blog')}>
                <Button size="lg" variant="outline" className="border-white/30 text-white font-bold hover:bg-white/10 hover:border-white/50 backdrop-blur-sm">
                  Blog & Ratgeber
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
