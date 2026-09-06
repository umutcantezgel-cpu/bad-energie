import { SERVICES } from '@/config/services';
import { buildGraph, buildServiceNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

import { createMetadata } from '@/lib/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((service) => ({
    id: service.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const service = SERVICES.find((s) => s.id === id);
  if (!service) return {};

  return createMetadata({
    title: `${service.name} in Wetzlar & Lahn-Dill`,
    description: `${service.shortDescription}. Meisterbetrieb für ${service.name} in Wetzlar & Lahn-Dill. Kostenlose Beratung & faire Festpreise.`,
    path: `/leistungen/${service.id}`,
    image: service.image,
  });
}

export default async function Layout({ children, params }) {
  const { id } = await params;
  const service = SERVICES.find((s) => s.id === id);

  let serviceSchemaGraph = null;
  if (service) {
    const pageUrl = `${SITE_URL}/leistungen/${service.id}`;
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Leistungen', path: '/leistungen' },
      { name: service.name, path: `/leistungen/${service.id}` },
    ];

    serviceSchemaGraph = buildGraph([
      buildWebPageNode({
        url: pageUrl,
        name: `${service.name} Wetzlar | Bad & Energie GmbH`,
        description: service.shortDescription,
        breadcrumbItems: breadcrumbs,
      }),
      buildBreadcrumbNode(breadcrumbs, pageUrl),
      buildServiceNode({
        name: `${service.name} in Wetzlar & Mittelhessen`,
        serviceType: service.name,
        description: service.shortDescription,
        url: pageUrl,
        image: service.heroImage,
        offers: (service.features || []).map((feat) => ({ name: feat })),
      }),
    ]);
  }

  return (
    <>
      <JsonLd schema={serviceSchemaGraph} />
      {children}
    </>
  );
}

