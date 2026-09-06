import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildContactPageNode, buildBreadcrumbNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = createMetadata({
  title: 'Beratungstermin vereinbaren',
  description: 'Buchen Sie Ihren unverbindlichen Beratungstermin für Badsanierung oder moderne Heiztechnik bei der Bad & Energie GmbH in Wetzlar & Lahn-Dill.',
  path: '/termin',
});

export default function TerminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageUrl = `${SITE_URL}/termin`;
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Termin', path: '/termin' },
  ];

  const schemaGraph = buildGraph([
    buildContactPageNode({
      url: pageUrl,
      name: 'Beratungstermin vereinbaren | Bad & Energie GmbH',
      description: 'Terminvereinbarung für Vor-Ort-Beratung oder Showroom-Besuch in Wetzlar.',
    }),
    buildBreadcrumbNode(breadcrumbs, pageUrl),
  ]);

  return (
    <>
      <JsonLd schema={schemaGraph} />
      {children}
    </>
  );
}
