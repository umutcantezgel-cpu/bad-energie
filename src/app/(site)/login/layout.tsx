import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mitarbeiter Login | Bad & Energie GmbH',
  description: 'Interner Verwaltungsbereich der Bad & Energie GmbH in Wetzlar.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
