import type { Metadata } from 'next';

const BASE_URL = 'https://bad-energie.de';
const SITE_NAME = 'Bad & Energie GmbH';

export function createMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const canonicalUrl = `${BASE_URL}${options.path === '/' ? '' : options.path}`;
  const isHomePage = options.path === '/' || options.path === '';
  const fullTitle = isHomePage 
    ? `${options.title} | ${SITE_NAME}`
    : `${options.title} | ${SITE_NAME}`;

  return {
    title: isHomePage ? { absolute: fullTitle } : options.title,
    description: options.description,
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        'de': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title: fullTitle,
      description: options.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'de_DE',
      type: 'website',
      images: options.image ? [{ url: options.image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: options.description,
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
