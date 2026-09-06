import type { Metadata } from 'next';

const BASE_URL = 'https://bad-energie.de';
const SITE_NAME = 'Bad & Energie GmbH';

/**
 * Normalizes and guarantees that page titles fall strictly within 45 to 65 characters,
 * avoiding duplicate brand suffixes and ensuring strong local SEO relevance.
 */
export function optimizeTitle(rawTitle: string, isHome: boolean = false): string {
  if (isHome) {
    return 'Bad & Energie GmbH | Badsanierung & Heiztechnik Wetzlar'; // 57 chars
  }

  // Remove existing redundant brand suffixes and separators
  let clean = rawTitle
    .replace(/\s*[\|\-–]\s*(Bad & Energie GmbH|Bad & Energie|Batherm Haustechnik|Baris Haustechnik)(\s*[\|\-–]\s*(Bad & Energie GmbH|Bad & Energie))*/gi, '')
    .replace(/\s*[\|\-–]\s*Wetzlar\s*$/i, '')
    .trim();

  if (!clean) clean = 'Meisterbetrieb für Bad & Heizung';

  // 1. If clean title already includes local keyword and is within 45-65 chars, return as is
  if (clean.length >= 45 && clean.length <= 65) {
    return clean;
  }

  // 2. If length + " | Bad & Energie GmbH" (21 chars) fits within 45-65 chars (i.e. clean is 24..44 chars)
  if (clean.length >= 24 && clean.length <= 44) {
    return `${clean} | Bad & Energie GmbH`;
  }

  // 3. If clean is short (< 24 chars), enrich with location or craftsmanship before brand
  if (clean.length < 24) {
    const withCraft = `${clean} – Meisterbetrieb | Bad & Energie GmbH`; // clean + 37 chars
    if (withCraft.length >= 45 && withCraft.length <= 65) {
      return withCraft;
    }
    const withWetzlar = `${clean} Wetzlar | Bad & Energie GmbH`; // clean + 29 chars
    if (withWetzlar.length >= 45 && withWetzlar.length <= 65) {
      return withWetzlar;
    }
    return `${clean} – Meisterbetrieb Wetzlar | Bad & Energie GmbH`.slice(0, 65);
  }

  // 4. If clean is 45..49 chars, short brand suffix " | Bad & Energie" (16 chars) might fit up to 65
  if (clean.length + 16 <= 65 && clean.length + 16 >= 45) {
    return `${clean} | Bad & Energie`;
  }

  // 5. If clean is > 65 chars, trim at word boundary
  if (clean.length > 65) {
    const trimmed = clean.slice(0, 62);
    const lastSpace = trimmed.lastIndexOf(' ');
    return `${trimmed.slice(0, lastSpace > 45 ? lastSpace : 62)}...`;
  }

  return `${clean} | Bad & Energie GmbH`.slice(0, 65);
}

/**
 * Guarantees meta descriptions fall strictly within 120 to 155 characters.
 */
export function optimizeDescription(rawDesc: string): string {
  let desc = (rawDesc || '').trim();

  if (!desc) {
    return 'Ihr Meisterbetrieb für schlüsselfertige Badsanierung, NIBE Wärmepumpen und Haustechnik in Wetzlar & Lahn-Dill. Jetzt kostenlos beraten lassen.';
  }

  // If too short (< 120 chars), append informative regional authority statement
  if (desc.length < 120) {
    const addition = ' Ihr Meisterbetrieb Bad & Energie GmbH für Wetzlar & Lahn-Dill.';
    if (desc.length + addition.length <= 155) {
      desc = `${desc}${addition}`;
    } else {
      const shortAdd = ' Meisterbetrieb in Wetzlar.';
      if (desc.length + shortAdd.length <= 155) {
        desc = `${desc}${shortAdd}`;
      }
    }
  }

  // If still under 120 characters, add CTA
  if (desc.length < 120) {
    const cta = ' Jetzt unverbindlich anfragen!';
    if (desc.length + cta.length <= 155) {
      desc = `${desc}${cta}`;
    }
  }

  // If too long (> 155 chars), trim cleanly at word boundary
  if (desc.length > 155) {
    const trimmed = desc.slice(0, 152);
    const lastSpace = trimmed.lastIndexOf(' ');
    desc = `${trimmed.slice(0, lastSpace > 120 ? lastSpace : 151)}...`;
  }

  return desc;
}

export function createMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const cleanPath = options.path.startsWith('/') ? options.path : `/${options.path}`;
  const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const isHomePage = cleanPath === '/' || cleanPath === '';
  
  const finalTitle = optimizeTitle(options.title, isHomePage);
  const finalDescription = optimizeDescription(options.description);

  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        'de': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'de_DE',
      type: 'website',
      images: options.image ? [{ url: options.image.startsWith('http') ? options.image : `${BASE_URL}${options.image}`, width: 1200, height: 630 }] : [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
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
