import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildContactPageNode, buildBreadcrumbNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Kontakt & Standorte Wetzlar | Bad & Energie GmbH',
  description: 'Kontaktieren Sie die Bad & Energie GmbH in Wetzlar. Badsanierung, Heizung & Haustechnik – persönliche Beratung und schnelle Terminvergabe.',
  path: '/kontakt',
});

const pageUrl = `${SITE_URL}/kontakt`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Kontakt', path: '/kontakt' },
];

const contactSchema = buildGraph([
  buildContactPageNode({
    url: pageUrl,
    name: 'Kontakt aufnehmen | Bad & Energie GmbH Wetzlar',
    description:
      'Kontaktieren Sie Ihren Meisterbetrieb Bad & Energie GmbH für Badsanierung, Heizung und Haustechnik in Wetzlar und im Lahn-Dill-Kreis.',
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={contactSchema} />
      {children}
    </>
  );
}
