import React from 'react';
import Link from 'next/link';
import { Award, Zap, CheckCircle2, ShieldCheck, Phone } from 'lucide-react';
import { COMPANY_DATA } from '@/config/company';
import { createMetadata } from '@/lib/metadata';
import { buildBreadcrumbNode, buildGraph, buildWebPageNode } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import TouchConfigurator from '@/components/calculator/TouchConfigurator';
import QualityPromise from '@/components/sections/QualityPromise';

export const metadata = createMetadata({
  title: 'Wärmepumpen-Check Wetzlar | Eignung & Förderung online prüfen',
  description:
    'Prüfen Sie in wenigen Schritten die Eignung Ihres Hauses für eine moderne NIBE Wärmepumpe in Wetzlar & Lahn-Dill. Bis zu 70 % KfW-Zuschuss und Vor-Ort-Meisterberatung.',
  path: '/heizung/waermepumpe/check',
});

const canonicalUrl = 'https://bad-energie.de/heizung/waermepumpe/check';

const schema = buildGraph([
  buildWebPageNode({
    url: canonicalUrl,
    name: 'Wärmepumpen-Check Wetzlar | Eignung & Förderung online prüfen',
    description:
      'Prüfen Sie in wenigen Schritten die Eignung Ihres Hauses für eine moderne NIBE Wärmepumpe in Wetzlar & Lahn-Dill. Bis zu 70 % KfW-Zuschuss und Vor-Ort-Meisterberatung.',
  }),
  buildBreadcrumbNode(
    [
      { name: 'Startseite', path: '/' },
      { name: 'Heizung', path: '/heizung' },
      { name: 'Wärmepumpe', path: '/heizung/waermepumpe' },
      { name: 'Wärmepumpen-Check', path: '/heizung/waermepumpe/check' },
    ],
    canonicalUrl
  ),
]);

export default function WaermepumpeCheckPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden bg-slate-50">
      <JsonLd schema={schema} />

      {/* Ambient Glow */}
      <div className="ambient-glow-red -top-20 -right-20" />
      <div className="ambient-glow-blue top-96 -left-20" />

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase font-black tracking-wider text-red-300 bg-red-600/30 px-4 py-1.5 rounded-full border border-red-500/40 inline-block backdrop-blur-md">
              <Award className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              NIBE Effizienz Partner
            </span>
            <span className="text-xs uppercase font-black tracking-wider text-amber-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-block backdrop-blur-md">
              Bis zu 70 % KfW-Förderung (BEG 458)
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Wärmepumpen-Check Wetzlar: <br />
            <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">
              Ist Ihr Haus bereit für die Wärmewende?
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
            Beantworten Sie 5 kurze Fragen zu Ihrem Gebäude und Ihrer aktuellen Heizung. Wir ermitteln die Eignung,
            Ihren maximalen Fördersatz und die passende Systemlösung für Wetzlar &amp; Lahn-Dill.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Unverbindlich &amp; kostenfrei
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verfahren B &amp; DIN EN 12831
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Meisterbetrieb seit 2001
            </span>
          </div>
        </div>
      </div>

      {/* Configurator Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <TouchConfigurator modus="kunde" journey="waermepumpe" quelle="web_wp" />
      </div>

      <div className="mt-16">
        <QualityPromise />
      </div>
    </div>
  );
}
