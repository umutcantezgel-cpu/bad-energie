import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, SITE_URL, ORG_ID } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Ratgeber zu Badsanierung, Heizung & Wärmepumpen | Bad & Energie GmbH',
  description: 'Expertenwissen rund um Badsanierung, NIBE Wärmepumpen, Wohnraumlüftung und Trinkwasserhygiene in Wetzlar & Lahn-Dill.',
  path: '/blog',
});

const pageUrl = `${SITE_URL}/blog`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Ratgeber & Blog', path: '/blog' },
];

const blogSchema = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Haustechnik Ratgeber & Blog | Bad & Energie GmbH',
    description:
      'Fundierte Fachartikel zu Wärmepumpen, Badsanierung, Heizungswartung und Fördermitteln vom Meisterbetrieb in Wetzlar.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  {
    '@type': 'Blog',
    '@id': `${pageUrl}#blog`,
    name: 'Bad & Energie GmbH Ratgeber & Insights',
    description: 'Fachwissen, Anleitungen und Ratgeber rund um Badsanierung, Heizung und Haustechnik.',
    publisher: { '@id': ORG_ID },
    url: pageUrl,
  },
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={blogSchema} />
      {children}
    </>
  );
}
