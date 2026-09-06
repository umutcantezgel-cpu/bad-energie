import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Impressum & rechtliche Angaben',
  description: 'Impressum und gesetzliche Anbieterkennzeichnung der Bad & Energie GmbH Lahn-Dill, Siegmund-Hiepe-Str. 20, 35578 Wetzlar. Geschäftsführer Sabri Demir.',
  path: '/impressum',
});

const pageUrl = `${SITE_URL}/impressum`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Impressum', path: '/impressum' },
];

const impressumSchema = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Impressum & rechtliche Angaben | Bad & Energie GmbH',
    description: 'Gesetzliche Anbieterkennzeichnung der Bad & Energie GmbH in Wetzlar.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={impressumSchema} />
      {children}
    </>
  );
}
