import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildBreadcrumbNode, buildWebPageNode, ORG_ID, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Leistungen für Sanitär, Heizung & Klima',
  description: 'Unser Leistungsspektrum: Badsanierung, Wärmepumpen, Klimaanlagen, Smart Home und mehr. Ihr zertifizierter Meisterbetrieb in Wetzlar.',
  path: '/leistungen',
});

const pageUrl = `${SITE_URL}/leistungen`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Leistungen', path: '/leistungen' },
];

const leistungenSchema = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Haustechnik Leistungen in Wetzlar | Batherm Haustechnik',
    description:
      'Komplettes Leistungsportfolio: Sanitärtechnik, moderne Heizungstechnik, Wärmepumpen, Klimatechnik und Smart Home.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  {
    '@type': 'OfferCatalog',
    '@id': `${pageUrl}#catalog`,
    name: 'Leistungen von Batherm Haustechnik',
    provider: { '@id': ORG_ID },
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sanitärtechnik',
          url: `${SITE_URL}/leistungen/sanitaer`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Heizungstechnik',
          url: `${SITE_URL}/leistungen/heizung`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Klimatechnik',
          url: `${SITE_URL}/leistungen/klima`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Wartung & Service',
          url: `${SITE_URL}/leistungen/wartung`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Smart Home',
          url: `${SITE_URL}/leistungen/smart-home`,
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Wasseraufbereitung',
          url: `${SITE_URL}/leistungen/wasseraufbereitung`,
        },
      },
    ],
  },
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={leistungenSchema} />
      {children}
    </>
  );
}

