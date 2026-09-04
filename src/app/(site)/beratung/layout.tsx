import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildServiceNode, buildFaqNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Kostenlose Fachberatung buchen',
  description: 'Buchen Sie einen kostenlosen Beratungstermin bei Batherm Haustechnik Wetzlar. Persönlich, kompetent und unverbindlich vor Ort oder online.',
  path: '/beratung',
});

const pageUrl = `${SITE_URL}/beratung`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Kostenlose Fachberatung', path: '/beratung' },
];

const beratungFaqs = [
  {
    question: 'Ist das Erstgespräch wirklich 100% kostenfrei?',
    answer:
      'Ja, unser telefonisches Vorgespräch und die Erstberatung vor Ort in Wetzlar und Umgebung sind für Sie vollständig kostenfrei und unverbindlich.',
  },
  {
    question: 'Welche Unterlagen sollte ich zum Termin bereithalten?',
    answer:
      'Hilfreich sind letzte Heizkostenabrechnungen bzw. der bisherige Brennstoffverbrauch, der Bauplan oder Grundriss Ihres Hauses und ggf. Fotos Ihrer aktuellen Heizungs- oder Sanitäranlage.',
  },
  {
    question: 'Wie schnell erhalte ich nach dem Termin mein Angebot?',
    answer:
      'In der Regel erstellen wir Ihnen innerhalb von 48 bis 72 Stunden nach der Vor-Ort-Besichtigung ein detailliertes Festpreisangebot inklusive Fördermittelaufstellung.',
  },
];

const beratungGraph = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Kostenlose Fachberatung Haustechnik Wetzlar | Batherm Haustechnik',
    description:
      'Buchen Sie Ihre unverbindliche Beratung vor Ort für Badsanierung, Heizungswechsel und Wärmepumpen in Wetzlar.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  buildServiceNode({
    name: 'Kostenlose SHK-Fachberatung vor Ort',
    serviceType: 'Handwerksberatung Sanitär, Heizung & Klima',
    description:
      'Individuelle Vor-Ort-Beratung, Bedarfsanalyse, Konzeptentwicklung und transparente Angebotserstellung für Ihr Vorhaben.',
    url: pageUrl,
    offers: [
      { name: 'Vor-Ort-Check', description: 'Besichtigung Ihrer Räumlichkeiten in Mittelhessen' },
      { name: 'Heizungs- & Badkonzept', description: 'Maßgeschneiderte Auslegung nach Ihren Wünschen' },
      { name: 'Fördermittel-Kalkulation', description: 'Ermittlung maximaler Zuschüsse' },
    ],
  }),
  buildFaqNode(beratungFaqs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={beratungGraph} />
      {children}
    </>
  );
}

