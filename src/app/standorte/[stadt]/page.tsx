import type { Metadata } from 'next';
import Link from 'next/link';
import { CITIES } from '@/config/cities';
import { SERVICES } from '@/config/services';
import { COMPANY_DATA } from '@/config/company';
import { notFound } from 'next/navigation';
import { buildGraph, buildCityLocalBusinessNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import { MapPin, Phone, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Award } from 'lucide-react';
import QualityPromise from '@/components/sections/QualityPromise';

export function generateStaticParams() {
  return CITIES.map((city) => ({ stadt: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stadt: string }>;
}): Promise<Metadata> {
  const { stadt } = await params;
  const city = CITIES.find((c) => c.slug === stadt);
  if (!city) return {};

  const pageUrl = `https://bad-energie.de/standorte/${city.slug}`;
  const title = `${city.name}: Badsanierung & Heiztechnik | Bad & Energie GmbH`;
  const description = `Ihr Meisterbetrieb für Badsanierung, Wärmepumpen & Haustechnik in ${city.name}. ${
    city.distanceKm === 0
      ? 'Direkt vor Ort in Wetzlar.'
      : `Nur ${city.distanceKm} km entfernt.`
  } Kostenlose Beratung & bis zu 70% Förderung.`;

  return {
    title,
    description,
    alternates: { 
      canonical: pageUrl,
      languages: {
        'de': pageUrl,
        'x-default': pageUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Bad & Energie GmbH',
      locale: 'de_DE',
      type: 'website',
    },
    robots: { 
      index: true, 
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

function getNearbyCities(currentSlug: string, count: number = 5) {
  const current = CITIES.find((c) => c.slug === currentSlug);
  if (!current) return [];

  return CITIES
    .filter((c) => c.slug !== currentSlug)
    .sort((a, b) => {
      const distA = Math.abs(a.distanceKm - current.distanceKm);
      const distB = Math.abs(b.distanceKm - current.distanceKm);
      if (distA === distB) return a.distanceKm - b.distanceKm;
      return distA - distB;
    })
    .slice(0, count);
}

export default async function StandortPage({
  params,
}: {
  params: Promise<{ stadt: string }>;
}) {
  const { stadt } = await params;
  const city = CITIES.find((c) => c.slug === stadt);
  if (!city) notFound();

  const nearbyCities = getNearbyCities(city.slug, 6);

  const pageUrl = `${SITE_URL}/standorte/${city.slug}`;
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Standorte', path: '/standorte' },
    { name: city.name, path: pageUrl },
  ];

  const cityGraph = buildGraph([
    buildWebPageNode({
      url: pageUrl,
      name: `Badsanierung, Heizung & Wärmepumpen in ${city.name} | Bad & Energie GmbH`,
      description: `Ihr Meisterbetrieb für Badsanierung, Heizung & Wärmepumpen in ${city.name}. Kostenlose Beratung & Festpreisgarantie.`,
      breadcrumbItems: breadcrumbs,
    }),
    buildBreadcrumbNode(breadcrumbs, pageUrl),
    buildCityLocalBusinessNode({
      cityName: city.name,
      citySlug: city.slug,
      distanceKm: city.distanceKm,
      description: `Ihr Meisterbetrieb für Badsanierung und regenerative Heizsysteme in ${city.name}. Meisterbetrieb seit 2001.`,
    }),
  ]);

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <JsonLd schema={cityGraph} />

      {/* Ambient Glow */}
      <div className="ambient-glow-blue -top-20 -left-20" />
      <div className="ambient-glow-cyan top-96 -right-20" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 text-center space-y-5 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-black uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {city.region} &middot;{' '}
              {city.distanceKm === 0
                ? 'Hauptsitz Wetzlar'
                : `${city.distanceKm} km von Wetzlar`}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Badsanierung &amp; Heiztechnik in{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">{city.name}</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
            Bad &amp; Energie GmbH – Ihr Meisterbetrieb für schlüsselfertige Komplettbäder,
            NIBE Wärmepumpen, Gas-Brennwert und Haustechnik in {city.name} und Umgebung.
            {city.distanceKm > 0 &&
              ` Nur ${city.distanceKm} km von unserem Standort in Wetzlar entfernt.`}
          </p>

          <div className="flex flex-wrap gap-3.5 justify-center pt-2">
            <Link
              href="/termin"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black rounded-full transition-all text-xs shadow-md border border-white/20 transform hover:-translate-y-0.5"
            >
              Beratungstermin in {city.name} anfragen &rarr;
            </Link>
            <a
              href={`tel:${COMPANY_DATA.contact.phoneLink}`}
              className="inline-flex items-center justify-center px-6 py-3.5 border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all text-xs backdrop-blur-md"
            >
              📞 {COMPANY_DATA.contact.phone}
            </a>
          </div>
        </div>
      </div>

      {/* ── About this city - Double Bezel Console ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="glass-bezel-outer shadow-2xl max-w-5xl mx-auto">
          <div className="glass-bezel-inner p-8 sm:p-12 space-y-8">
            <div>
              <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-full inline-block border border-blue-200/60 shadow-xs mb-2">
                Regionaler Meister-Service
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Ihr Fachhandwerksbetrieb für {city.name}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {city.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="glass-surface p-6 rounded-[2rem] text-center border border-white/80">
                <div className="text-2xl font-black text-[#0C3A87] mb-1">
                  {city.distanceKm === 0 ? '✓ Vor Ort' : `${city.distanceKm} km`}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {city.distanceKm === 0 ? 'Hauptstandort Wetzlar' : 'Entfernung zu Ihnen'}
                </div>
              </div>
              <div className="glass-surface p-6 rounded-[2rem] text-center border border-white/80">
                <div className="text-2xl font-black text-[#0C3A87] mb-1">Bis 70 %</div>
                <div className="text-xs text-slate-500 font-medium">BEG / KfW 458 Förderung</div>
              </div>
              <div className="glass-surface p-6 rounded-[2rem] text-center border border-white/80">
                <div className="text-2xl font-black text-[#0C3A87] mb-1">100 %</div>
                <div className="text-xs text-slate-500 font-medium">Meisterqualität seit 2001</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nearby Cities ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Weitere Einsatzgebiete in der Region
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-medium">
            Wir sind in allen Städten und Gemeinden im Lahn-Dill-Kreis und Landkreis Gießen für Sie aktiv.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyCities.map((nearbyCity) => (
            <Link
              key={nearbyCity.slug}
              href={`/standorte/${nearbyCity.slug}`}
              className="glass-surface p-6 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500 group block"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0C3A87] transition-colors">
                  {nearbyCity.name}
                </h3>
                <span className="text-[11px] text-slate-600 bg-white/90 px-3 py-1 rounded-full font-black border border-slate-200/60 shadow-xs">
                  {nearbyCity.distanceKm === 0
                    ? 'Vor Ort'
                    : `${nearbyCity.distanceKm} km`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-medium">{nearbyCity.region}</p>
              <span className="text-xs text-[#0C3A87] font-black flex items-center gap-1">
                <span>Details ansehen</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <QualityPromise />
    </div>
  );
}
