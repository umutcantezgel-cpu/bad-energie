import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (Next.js 16) für den Schutz des Intern-Bereichs.
 * Optimistische Cookie-Prüfung vor dem Rendern; die echte Verifikation
 * und Rollenprüfung erfolgt in den Server Components und Server Actions via verifySession().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Der Einstiegspunkt /intern ist die Anmeldeseite selbst
  if (pathname === '/intern') {
    return NextResponse.next();
  }

  // Für alle geschützten Unterseiten unter /intern/:path*
  const hatSitzung =
    request.cookies.has('sitzung') || request.cookies.has('__Host-sitzung');

  if (!hatSitzung) {
    const loginUrl = new URL('/intern', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/intern/:path*'],
};
