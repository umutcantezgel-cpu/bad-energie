import { PORTFOLIO_PROJECTS } from '@/config/projects';
import { buildGraph, buildProjectNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((project) => ({
    id: project.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.id.toString() === id);
  if (!project) return {};

  const pageUrl = `${SITE_URL}/referenzen/${project.id}`;
  const title = `${project.title} in ${project.location}`;
  const fullTitle = `${title} | Batherm Haustechnik`;
  const description = project.description ? (project.description.length > 155 ? `${project.description.slice(0, 152)}...` : project.description) : 'Projekt von Batherm Haustechnik';

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        'de': pageUrl,
        'x-default': pageUrl,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName: 'Batherm Haustechnik',
      locale: 'de_DE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
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
        name: `${project.title} | Batherm Haustechnik Referenz`,
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

