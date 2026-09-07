import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from '@/lib/i18n/config';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const PUBLIC_FILE = /\.(.*)$/;

/**
 * Locale routing middleware.
 *
 * - Skips static files, API routes and Next internals.
 * - If the path already starts with /fr or /en, remembers that choice
 *   in a cookie so the language switcher's preference persists.
 * - Otherwise picks a locale from the saved cookie, then the browser's
 *   Accept-Language header, then falls back to French, and redirects.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/');
  const firstSegment = segments[1];

  // The `firstSegment &&` guard is what lets TypeScript narrow firstSegment
  // from `string | undefined` to `string` for the rest of this block — the
  // `.some()` locale check alone doesn't narrow it, since TS can't tell a
  // boolean produced by Array.some() implies a specific string's shape.
  if (firstSegment && locales.some((locale) => locale === firstSegment)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, firstSegment, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const browserPrefersEnglish = acceptLanguage.toLowerCase().startsWith('en');

  const resolvedLocale =
    (cookieLocale && locales.some((l) => l === cookieLocale) ? cookieLocale : undefined) ??
    (browserPrefersEnglish ? 'en' : defaultLocale);

  const url = request.nextUrl.clone();
  url.pathname = `/${resolvedLocale}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
};
