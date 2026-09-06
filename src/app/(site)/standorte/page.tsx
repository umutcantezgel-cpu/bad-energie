import React from 'react';
import Link from 'next/link';
import { MapPin, PhoneCall, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { CITIES } from '@/config/cities';
import { COMPANY_DATA } from '@/config/company';
import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, SITE_URL, ORG_ID } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Standorte & Einsatzgebiete Wetzlar & Mittelhessen | Bad & Energie GmbH',
  description: 'Ihr Meisterbetrieb für Badsanierung, Wärmepumpen & Haustechnik in Wetzlar, Gießen, Marburg, Limburg und im gesamten Lahn-Dill-Kreis.',
  path: '/standorte',
});

const pageUrl = `${SITE_URL}/standorte`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Standorte', path: '/standorte' },
];

const standorteGraph = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Einsatzgebiete & Standorte in Mittelhessen | Bad & Energie GmbH',
    description: 'Übersicht aller Städte und Gemeinden im Einzugsgebiet der Bad & Energie GmbH in Hessen.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  {
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: 'Bad & Energie GmbH Standorte & Einsatzgebiete',
    description: 'Regionaler Meisterbetrieb für Badsanierung, Heizung und Haustechnik in Hessen.',
    publisher: { '@id': ORG_ID },
  },
]);

export default function StandorteOverviewPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd schema={standorteGraph} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-r from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm mb-6">
            <MapPin className="w-4 h-4 text-[#35A7E9]" />
            <span>Mittelhessen &amp; Lahn-Dill-Kreis</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            Standorte &amp; Einsatzgebiete in <span className="text-[#35A7E9]">Mittelhessen</span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Als Meisterbetrieb mit Hauptsitz in der Siegmund-Hiepe-Str. 20 in Wetzlar betreuen wir private und gewerbliche Kunden
            in Wetzlar, Gießen und einem Umkreis von bis zu 50 Kilometern. Schnelle Anfahrtswege, persönliche Beratung vor Ort
            und handwerkliche Meisterqualität.
          </p>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Wählen Sie Ihre Stadt oder Gemeinde
          </h2>
          <p className="text-slate-600">
            Klicken Sie auf Ihren Wohnort, um detaillierte Informationen zu unseren Leistungen,
            Anfahrtszeiten und regionalen Referenzen zu erhalten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CITIES.map((city) => (
            <div
              key={city.slug}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-[#0C3A87] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87]">
                    {city.region}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {city.distanceKm === 0 ? 'Hauptstandort Wetzlar' : `${city.distanceKm} km`}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {city.name}
                </h3>

                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  {city.description}
                </p>
              </div>

              <Link
                href={`/standorte/${city.slug}`}
                className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 hover:bg-[#0C3A87] text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-colors group"
              >
                <span>Details &amp; Leistungen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="pb-24 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#0C3A87] to-[#0A1556] rounded-3xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            Ihre Stadt ist nicht aufgeführt?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
            Wir sind im gesamten Lahn-Dill-Kreis, Landkreis Gießen, Marburg-Biedenkopf, Wetteraukreis und Limburg-Weilburg
            unterwegs. Rufen Sie uns einfach an – wir prüfen sofort die Verfügbarkeit für Ihren Wohnort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${COMPANY_DATA.contact.phoneLink}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E4040E] hover:bg-[#b91c1c] text-white rounded-xl font-extrabold text-xs shadow-lg transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{COMPANY_DATA.contact.phone}</span>
            </a>
            <Link
              href="/termin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border border-white/20 transition-colors"
            >
              Kostenlose Beratung anfragen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
