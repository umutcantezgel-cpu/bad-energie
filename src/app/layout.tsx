import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';
import { ClientWidgets } from '@/components/layout/ClientWidgets';
import Footer from '@/components/common/Footer';
import TrackingScripts from '@/components/common/TrackingScripts';
import { ContentProvider } from '@/contexts/ContentContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { buildRootGraph } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bad-energie.de'),
  title: {
    default: 'Bad & Energie GmbH | Meisterbetrieb für Badsanierung & Heiztechnik Wetzlar',
    template: '%s | Bad & Energie GmbH'
  },
  description: 'Ihr Meisterbetrieb für schlüsselfertige Badsanierung, NIBE Wärmepumpen, Gas-Brennwert, Wohnraumlüftung & Trinkwasserhygiene in Wetzlar & Lahn-Dill. Bis zu 70% BEG-Förderung.',
  keywords: [
    'Bad & Energie GmbH',
    'Badsanierung Wetzlar',
    'Wärmepumpe Wetzlar',
    'NIBE Effizienz Partner',
    'Barrierefreies Bad',
    'Lüftungstechnik Wetzlar',
    'Trinkwasserhygiene Legionellen',
    'Heizungstausch Lahn-Dill'
  ],
  authors: [{ name: 'Bad & Energie GmbH' }],
  creator: 'Bad & Energie GmbH',
  publisher: 'Bad & Energie GmbH',
  alternates: {
    canonical: 'https://bad-energie.de/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://bad-energie.de/',
    title: 'Bad & Energie GmbH | Meisterbetrieb für Badsanierung & Heiztechnik Wetzlar',
    description: 'Ihr Meisterbetrieb für schlüsselfertige Badsanierung, NIBE Wärmepumpen, Gas-Brennwert, Wohnraumlüftung & Trinkwasserhygiene in Wetzlar & Lahn-Dill.',
    siteName: 'Bad & Energie GmbH',
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

export const viewport: Viewport = {
  themeColor: '#0C3A87',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootKnowledgeGraph = buildRootGraph();

  return (
    <html lang="de" className={`${inter.variable} ${outfit.variable} ${plexMono.variable}`}>
      <head>
        <meta name="geo.region" content="DE-HE" />
        <meta name="geo.placename" content="Wetzlar" />
        <meta name="geo.position" content="50.5567;8.5022" />
        <meta name="ICBM" content="50.5567, 8.5022" />
        <JsonLd schema={rootKnowledgeGraph} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ContentProvider>
            <TrackingScripts />
            <HeaderWrapper />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <ClientWidgets />
          </ContentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
