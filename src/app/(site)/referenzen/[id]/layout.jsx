import { PORTFOLIO_PROJECTS } from '@/config/projects';
import { buildGraph, buildProjectNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

import { createMetadata } from '@/lib/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((project) => ({
    id: project.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.id.toString() === id);
  if (!project) return {};

  return createMetadata({
    title: `${project.title} in ${project.location}`,
    description: project.description || `Referenzprojekt ${project.title} in ${project.location} von Meisterbetrieb Bad & Energie GmbH.`,
    path: `/referenzen/${project.id}`,
    image: project.image,
  });
}

export default async function Layout({ children, params }) {
  const { id } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.id.toString() === id);

  let projectSchemaGraph = null;
  if (project) {
    const pageUrl = `${SITE_URL}/referenzen/${project.id}`;
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Referenzen', path: '/referenzen' },
      { name: project.title, path: pageUrl },
    ];

    projectSchemaGraph = buildGraph([
      buildWebPageNode({
        url: pageUrl,
        name: `${project.title} | Bad & Energie GmbH Referenz`,
        description: project.description,
        breadcrumbItems: breadcrumbs,
      }),
      buildBreadcrumbNode(breadcrumbs, pageUrl),
      buildProjectNode({
        name: project.title,
        description: project.description,
        url: pageUrl,
        locationCreated: project.location,
        image: project.image,
      }),
    ]);
  }

  return (
    <>
      <JsonLd schema={projectSchemaGraph} />
      {children}
    </>
  );
}

