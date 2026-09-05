/**
 * Eigenes Root-Layout des Intern-Bereichs (Route Group `(intern)`).
 *
 * Kein Marketing-Header, kein Footer, kein Tracking. Die Seiten sind ausdruecklich
 * nicht indexierbar; die Toolbar traegt Wortmarke, die beiden Arbeitswege,
 * die Schalter Kundenansicht und Baustellen-Modus, das Sync-Badge und Abmelden.
 */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import '../globals.css';
import AbmeldenButton from './AbmeldenButton';
import KundenansichtSchalter from '@/components/calculator/KundenansichtSchalter';
import BaustellenModusSchalter from '@/components/calculator/BaustellenModusSchalter';
import { SyncBadge } from '@/components/calculator/LiveCalcBar';
import { aktuelleSession } from '@/lib/services/auth';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Bad & Energie · Intern',
    template: '%s · Bad & Energie Intern',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: '#1B3A8C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/** Ein Navigationseintrag der Toolbar. */
const NAV_KLASSE =
  'fokus-ring inline-flex min-h-[44px] items-center rounded-full px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100';

export default async function InternLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Die Rolle steuert nur die Sichtbarkeit; die Seiten selbst prüfen erneut (page.tsx, route.ts).
  const session = await aktuelleSession();
  const istChef = session?.rolle === 'chef';

  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 antialiased">
        <header className="glass-toolbar sticky top-0 z-40 border-b border-white/60 bg-white/86 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2">
            <Link href="/intern/konfigurator" className="fokus-ring text-base font-semibold text-[color:var(--modul-blau,#1B3A8C)]">
              Bad &amp; Energie · Intern
            </Link>
            <nav aria-label="Intern" className="flex items-center gap-1 overflow-x-auto py-1">
              <Link href="/intern/board" className={NAV_KLASSE}>
                Board
              </Link>
              <Link href="/intern/board#anfragen" className={NAV_KLASSE}>
                Anfragen
              </Link>
              <Link href="/intern/entwuerfe" className={NAV_KLASSE}>
                Entwürfe
              </Link>
              <Link href="/intern/konfigurator" className={NAV_KLASSE}>
                Konfigurator
              </Link>
              <Link href="/intern/dispatch" className={NAV_KLASSE}>
                Dispatch
              </Link>
              <Link href="/intern/matrix" className={NAV_KLASSE}>
                Matrix
              </Link>
              <Link href="/intern/termine" className={NAV_KLASSE}>
                Termine
              </Link>
              <Link href="/intern/einstellungen" className={NAV_KLASSE}>
                Einstellungen
              </Link>
              {istChef ? (
                <Link href="/intern/benutzer" className={NAV_KLASSE}>
                  Benutzer
                </Link>
              ) : null}
            </nav>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <SyncBadge />
              <KundenansichtSchalter />
              <BaustellenModusSchalter />
              <AbmeldenButton />
            </div>
          </div>
        </header>
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
