"use client";
import React from 'react';
import { Award, Users, Heart, Clock, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { values, team, certifications, COMPANY_DATA, historyTimeline } from '@/config/company';
import CompanyHistory from '@/components/sections/CompanyHistory';
import QualityPromise from '@/components/sections/QualityPromise';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
            Meisterbetrieb seit 2001 &middot; Wetzlar
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Über die Bad &amp; Energie GmbH
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Ihr Fachbetrieb für barrierefreie Badsanierung, NIBE Wärmepumpen, Wohnraumlüftung und Trinkwasserhygiene in Wetzlar, Gießen und dem gesamten Lahn-Dill-Kreis.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">
              Tradition trifft modernste Energietechnik
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Mit den historischen Wurzeln von 1926 und der Umfirmierung zur <strong>{COMPANY_DATA.legalName}</strong> im Jahr 2001 steht unser Betrieb für handwerkliche Exzellenz im Mittelhessischen Raum.
              </p>
              <p>
                Unter der Führung von Geschäftsführer <strong>{COMPANY_DATA.owner.fullName}</strong> haben wir den Schwerpunkt konsequent auf erneuerbare Energiesysteme (zertifizierter <strong>NIBE Effizienz Partner</strong>) und schlüsselfertige Komplettbadsanierungen aus einer Hand gelegt.
              </p>
              <p>
                An unserem Standort in der {COMPANY_DATA.headquarters.street} in {COMPANY_DATA.headquarters.postalCode} {COMPANY_DATA.headquarters.city} beraten wir Sie persönlich, transparent und mit verbindlicher Festpreisgarantie.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-[#0C3A87] mb-1">1926</div>
              <div className="text-xs text-slate-500 font-semibold">Handwerkswurzeln</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-[#0C3A87] mb-1">2001</div>
              <div className="text-xs text-slate-500 font-semibold">Bad &amp; Energie GmbH</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-[#0C3A87] mb-1">1.000+</div>
              <div className="text-xs text-slate-500 font-semibold">Erfolgreiche Projekte</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-[#E4040E] mb-1">5.0 / 5</div>
              <div className="text-xs text-slate-500 font-semibold">Kundenbewertung</div>
            </div>
          </div>
        </div>
      </div>

      <CompanyHistory />
      <QualityPromise />
    </div>
  );
}
