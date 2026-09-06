import { posts } from '@/config/posts';
import { buildGraph, buildArticleNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  return createMetadata({
    title: post.title,
    description: post.excerpt || 'Ratgeber der Bad & Energie GmbH',
    path: `/blog/${post.slug}`,
    image: post.image,
  });
}

export default async function Layout({ children, params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  let postSchemaGraph = null;
  if (post) {
    const pageUrl = `${SITE_URL}/blog/${post.slug}`;
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: pageUrl },
    ];

    postSchemaGraph = buildGraph([
      buildWebPageNode({
        url: pageUrl,
        name: `${post.title} | Bad & Energie GmbH`,
        description: post.excerpt || post.title,
        breadcrumbItems: breadcrumbs,
      }),
      buildBreadcrumbNode(breadcrumbs, pageUrl),
      buildArticleNode({
        headline: post.title,
        description: post.excerpt || post.title,
        url: pageUrl,
        datePublished: post.created_date || '2025-01-15T08:00:00+01:00',
        image: post.image,
        keywords: [post.category, 'Badsanierung', 'Wärmepumpe', 'Wetzlar', 'Bad & Energie GmbH'],
      }),
    ]);
  }

  return (
    <>
      <JsonLd schema={postSchemaGraph} />
      {children}
    </>
  );
}
