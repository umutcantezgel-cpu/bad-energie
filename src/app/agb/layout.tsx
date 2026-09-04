import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'AGB – Geschäftsbedingungen',
  description: 'Allgemeine Geschäftsbedingungen der Bad & Energie GmbH für handwerkliche Leistungen in Badsanierung, Heizung und Haustechnik.',
  path: '/agb',
});

const pageUrl = `${SITE_URL}/agb`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'AGB', path: '/agb' },
];

const agbSchema = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Allgemeine Geschäftsbedingungen (AGB) | Bad & Energie GmbH',
    description: 'Geschäftsbedingungen für handwerkliche Dienstleistungen und Werkverträge der Bad & Energie GmbH.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={agbSchema} />
      {children}
    </>
  );
}
