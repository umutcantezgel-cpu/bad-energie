import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildAboutPageNode, buildBreadcrumbNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Über uns – Meisterbetrieb in Wetzlar',
  description: 'Lernen Sie die Bad & Energie GmbH kennen. Ihr Meisterbetrieb für Badsanierung und Heizung in Wetzlar – Tradition seit 1926, Meisterbetrieb seit 2001.',
  path: '/ueber-uns',
});

const pageUrl = `${SITE_URL}/ueber-uns`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Über uns', path: '/ueber-uns' },
];

const aboutSchema = buildGraph([
  buildAboutPageNode({
    url: pageUrl,
    name: 'Über die Bad & Energie GmbH – Ihr Meisterbetrieb in Wetzlar',
    description:
      'Lernen Sie die Bad & Energie GmbH und Geschäftsführer Sabri Demir kennen. Meisterbetrieb für Badsanierung, Heizung und Haustechnik in Wetzlar.',
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={aboutSchema} />
      {children}
    </>
  );
}
