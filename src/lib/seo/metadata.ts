import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { localeHtmlTag } from '@/lib/i18n/config';
import { business } from '@/lib/config/business';

interface BuildMetadataParams {
  locale: Locale;
  /** Path segment WITHOUT locale prefix and WITHOUT leading slash, e.g. 'services' or '' for home. */
  path: string;
  title: string;
  description: string;
  /** Equivalent path in the other locale, if different from `path` (e.g. localized slugs). */
  alternatePath?: { fr: string; en: string };
  noIndex?: boolean;
}

/**
 * Builds consistent Next.js Metadata (title, description, canonical,
 * hreflang alternates, Open Graph) for a page. Centralizing this avoids
 * repeating boilerplate on every page and keeps SEO tags consistent.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  alternatePath,
  noIndex,
}: BuildMetadataParams): Metadata {
  const frPath = alternatePath?.fr ?? path;
  const enPath = alternatePath?.en ?? path;

  const currentPath = locale === 'fr' ? frPath : enPath;
  const url = `${business.siteUrl}/${locale}${currentPath ? `/${currentPath}` : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'fr-CA': `${business.siteUrl}/fr${frPath ? `/${frPath}` : ''}`,
        'en-CA': `${business.siteUrl}/en${enPath ? `/${enPath}` : ''}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: business.displayName,
      locale: localeHtmlTag[locale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
