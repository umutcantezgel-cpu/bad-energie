import type { Metadata } from 'next';
import Link from 'next/link';
import { CITIES } from '@/config/cities';
import { SERVICES } from '@/config/services';
import { COMPANY_DATA } from '@/config/company';
import { notFound } from 'next/navigation';
import { buildGraph, buildServiceNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import { MapPin, Phone, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Award } from 'lucide-react';
import QualityPromise from '@/components/sections/QualityPromise';

export const dynamicParams = false;

// ---------------------------------------------------------------------------
// Static Params – generates a page for every service × city combination
// ---------------------------------------------------------------------------
export function generateStaticParams() {
  const params: { id: string; stadt: string }[] = [];
  for (const service of SERVICES) {
    for (const city of CITIES) {
      params.push({ id: service.id, stadt: city.slug });
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// Dynamic Metadata – unique title, description & OG tags per combination
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; stadt: string }>;
}): Promise<Metadata> {
  const { id, stadt } = await params;
  const service = SERVICES.find((s: { id: string }) => s.id === id);
  const city = CITIES.find((c) => c.slug === stadt);
  if (!service || !city) return {};

  const title = `${service.name} in ${city.name} – Meisterbetrieb | Bad & Energie GmbH`;
  const description = `${service.name} in ${city.name}: Fachgerechte Montage & Wartung vom Meisterbetrieb. ${
    city.distanceKm === 0 ? 'Direkt vor Ort in Wetzlar.' : `Nur ${city.distanceKm} km entfernt.`
  } Bis zu 70% Förderung & Festpreisgarantie.`;

  const url = `https://bad-energie.de/leistungen/${service.id}/${city.slug}`;

  return {
    title,
    description,
    alternates: { 
      canonical: url,
      languages: {
        'de': url,
        'x-default': url,
      },
    },
    openGraph: {
      title,
      description,
      url,
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

// ---------------------------------------------------------------------------
// Process steps constant
// ---------------------------------------------------------------------------
const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Meister-Beratung vor Ort',
    description: 'Wir besprechen Ihre Wünsche und baulichen Anforderungen direkt bei Ihnen vor Ort in '
  },
  {
    step: '02',
    title: '3D-Planung & Festpreis',
    description: 'Exakte Grundriss- und Heizlastberechnung mit transparenter Gesamtkalkulation ohne Überraschungen.'
  },
  {
    step: '03',
    title: 'Fachgerechte Umsetzung',
    description: 'Unsere festangestellten SHK-Monteure führen alle Arbeiten sauber, staubarm und termingerecht aus.'
  },
  {
    step: '04',
    title: 'Übergabe & Werksgarantie',
    description: 'Gemeinsame Endabnahme, Einweisung in alle Funktionen und langfristiger Kundendienst-Support.'
  },
];

export default async function ServiceCityPage({
  params,
}: {
  params: Promise<{ id: string; stadt: string }>;
}) {
  const { id, stadt } = await params;
  const service = SERVICES.find((s: { id: string }) => s.id === id);
  const city = CITIES.find((c) => c.slug === stadt);
  if (!service || !city) notFound();

  const pageUrl = `https://bad-energie.de/leistungen/${service.id}/${city.slug}`;

  // Build feature & subcategory strings for rich content
  const featureList = (service.features ?? []).join(', ');
  const subcategoryNames = (service.subcategories ?? [])
    .map((s: { name: string }) => s.name)
    .join(', ');
  const distanceInfo =
    city.distanceKm === 0
      ? 'direkt vor Ort in Wetzlar'
      : `nur ${city.distanceKm} km von unserem Standort in Wetzlar entfernt`;

  // ── JSON-LD: Service + Breadcrumbs @graph ─────────────────────────────
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Leistungen', path: '/leistungen' },
    { name: service.name, path: `/leistungen/${service.id}` },
    { name: city.name, path: pageUrl },
  ];

  const serviceCityGraph = buildGraph([
    buildWebPageNode({
      url: pageUrl,
      name: `${service.name} in ${city.name} | Bad & Energie GmbH`,
      description: `${service.shortDescription} – professionell ausgeführt in ${city.name} und Umgebung.`,
      breadcrumbItems: breadcrumbs,
    }),
    buildBreadcrumbNode(breadcrumbs, pageUrl),
    buildServiceNode({
      name: `${service.name} in ${city.name}`,
      serviceType: service.name,
      description: `${service.shortDescription} – professionell ausgeführt in ${city.name} und Umgebung.`,
      url: pageUrl,
      areaServedCity: city.name,
      offers: (service.features || []).map((feat: string) => ({ name: feat })),
      image: service.heroImage,
    }),
  ]);

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <JsonLd schema={serviceCityGraph} />

      {/* Ambient Glow */}
      <div className="ambient-glow-blue -top-20 -left-20" />
      <div className="ambient-glow-cyan top-96 -right-20" />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="glass-surface-dark rounded-[3rem] p-8 sm:p-14 text-center space-y-5 relative overflow-hidden">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-2 text-xs text-blue-200/80 flex flex-wrap items-center justify-center gap-1.5 font-medium"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/leistungen"
              className="hover:text-white transition-colors"
            >
              Leistungen
            </Link>
            <span>/</span>
            <Link
              href={`/leistungen/${service.id}`}
              className="hover:text-white transition-colors"
            >
              {service.name}
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{city.name}</span>
          </nav>

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
            {service.name} in{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">{city.name}</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
            Bad &amp; Energie GmbH ist Ihr Meisterbetrieb für {service.name} in{' '}
            {city.name} und {city.region}. {service.shortDescription}.{' '}
            {city.distanceKm > 0
              ? `Mit unserem Standort in Wetzlar trennen uns nur ${city.distanceKm} km von ${city.name} – für rasche Anfahrt und persönliche Betreuung.`
              : 'Direkt vor Ort in Wetzlar für kürzeste Anfahrtswege und persönliche Betreuung.'}
          </p>

          <div className="flex flex-wrap gap-3.5 justify-center pt-2">
            <Link
              href="/termin"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-[#E4040E] to-[#B91C1C] hover:shadow-[0_12px_28px_rgba(228,4,14,0.4)] text-white font-black rounded-full transition-all text-xs shadow-md border border-white/20 transform hover:-translate-y-0.5"
            >
              Kostenlose Meisterberatung für {city.name} &rarr;
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

      {/* ── Rich Intro - Double Bezel Console ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="glass-bezel-outer shadow-2xl max-w-5xl mx-auto">
          <div className="glass-bezel-inner p-8 sm:p-12 space-y-6">
            <div>
              <span className="text-xs uppercase font-black tracking-wider text-[#0C3A87] bg-blue-50 px-3.5 py-1 rounded-full inline-block border border-blue-200/60 shadow-xs mb-2">
                Meisterbetrieb seit 2001
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Fachkompetenz &amp; Meisterqualität für {city.name}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Egal ob Neubau, Altbausanierung oder laufende Instandhaltung: Als konzessionierter Handwerks-Meisterbetrieb realisieren wir anspruchsvolle Projekte im Bereich {service.name} für Privat- und Gewerbekunden in {city.name} sowie der gesamten Region {city.region}. {city.description}
            </p>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Im Mittelpunkt unserer Arbeit stehen Energieeffizienz, Langlebigkeit und höchste Ausführungsqualität nach aktuellen DIN- und VDI-Standards. Unser Portfolio umfasst {featureList}. {subcategoryNames ? `Wir decken alle Kernbereiche wie ${subcategoryNames} lückenlos ab.` : ''} Durch die Nähe zu {city.name} ({distanceInfo}) garantieren wir termingerechte Ausführung und faire Festpreise.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="glass-surface p-6 rounded-[2rem] text-center border border-white/80">
                <div className="text-2xl font-black text-[#0C3A87] mb-1">
                  {city.distanceKm === 0 ? 'Vor Ort' : `${city.distanceKm} km`}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {city.distanceKm === 0 ? 'Standort Wetzlar' : 'Kurze Anfahrt'}
                </div>
              </div>
              <div className="glass-surface p-6 rounded-[2rem] text-center border border-white/80">
                <div className="text-2xl font-black text-[#0C3A87] mb-1">
                  {(service.features ?? []).length}+
                </div>
                <div className="text-xs text-slate-500 font-medium">Spezialisierungen</div>
              </div>
              <div className="glass-surface p-6 rounded-[2rem] text-center border border-white/80">
                <div className="text-2xl font-black text-[#0C3A87] mb-1">100%</div>
                <div className="text-xs text-slate-500 font-medium">Meisterbetrieb</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Service Features Grid ────────────────────────────────────────── */}
      {service.features && service.features.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Detailliertes Leistungsspektrum in {city.name}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-medium">
              Maßgeschneiderte Handwerkslösungen für maximale Zuverlässigkeit und Energieeffizienz.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.features.map((feature: string, idx: number) => (
              <div
                key={idx}
                className="glass-surface p-5 rounded-2xl flex items-center gap-3.5 hover:shadow-[0_15px_30px_rgba(12,58,135,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0C3A87] flex items-center justify-center shrink-0 font-bold border border-blue-200/60 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-black text-slate-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Process Steps ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Schritt für Schritt zu Ihrem Projekterfolg
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-medium">
            Von der ersten Kontaktaufnahme bis zur Endabnahme transparent und strukturiert.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={idx} className="glass-surface p-6 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(12,58,135,0.1)] hover:-translate-y-1 transition-all duration-500">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#0C3A87] mb-2 block">{step.step}</span>
                <h3 className="text-base font-black text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {step.description}{step.step === '01' ? city.name + '.' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <QualityPromise />
    </div>
  );
}
