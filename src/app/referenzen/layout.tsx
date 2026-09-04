import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, SITE_URL, ORG_ID } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Referenzen & Kundenprojekte | Bad & Energie GmbH',
  description: 'Abgeschlossene Meisterprojekte der Bad & Energie GmbH: Badsanierungen, NIBE Wärmepumpen, Wohnraumlüftung und Trinkwasserhygiene in Wetzlar & Lahn-Dill.',
  path: '/referenzen',
});

const pageUrl = `${SITE_URL}/referenzen`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Referenzen', path: '/referenzen' },
];

const referenzenSchema = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Referenzen & Meisterprojekte | Bad & Energie GmbH Wetzlar',
    description:
      'Erfolgreich umgesetzte Projekte für Badsanierung, Wärmepumpen, Lüftung und Haustechnik in Wetzlar und Region.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  {
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: 'Bad & Energie GmbH Projekt-Referenzen',
    description: 'Dokumentation von Meisterarbeiten im Lahn-Dill-Kreis und Landkreis Gießen.',
    publisher: { '@id': ORG_ID },
  },
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={referenzenSchema} />
      {children}
    </>
  );
}
