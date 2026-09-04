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
import { abmelden } from './intern/actions';
import KundenansichtSchalter from '@/components/calculator/KundenansichtSchalter';
import BaustellenModusSchalter from '@/components/calculator/BaustellenModusSchalter';
import { SyncBadge } from '@/components/calculator/LiveCalcBar';

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

export default function InternLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 antialiased">
        <header className="glass-toolbar sticky top-0 z-40 border-b border-white/60 bg-white/86 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2">
            <Link href="/intern/konfigurator" className="fokus-ring text-base font-semibold text-[color:var(--modul-blau,#1B3A8C)]">
              Bad &amp; Energie · Intern
            </Link>
            <nav aria-label="Intern" className="flex items-center gap-1 overflow-x-auto py-1">
              <Link
                href="/intern/board"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Board
              </Link>
              <Link
                href="/intern/entwuerfe"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Entwürfe
              </Link>
              <Link
                href="/intern/konfigurator"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Konfigurator
              </Link>
              <Link
                href="/intern/dispatch"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Dispatch
              </Link>
              <Link
                href="/intern/matrix"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Matrix
              </Link>
              <Link
                href="/intern/termine"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Termine
              </Link>
              <Link
                href="/intern/einstellungen"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Einstellungen
              </Link>
              <Link
                href="/intern/benutzer"
                className="fokus-ring inline-flex min-h-[40px] items-center rounded-full px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Benutzer
              </Link>
            </nav>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <SyncBadge />
              <KundenansichtSchalter />
              <BaustellenModusSchalter />
              <form action={abmelden}>
                <button
                  type="submit"
                  className="fokus-ring inline-flex min-h-[44px] items-center rounded-full bg-white/80 px-4 text-sm font-semibold text-slate-700"
                >
                  Abmelden
                </button>
              </form>
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
