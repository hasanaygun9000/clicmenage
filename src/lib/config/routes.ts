import type { Locale } from '@/lib/i18n/config';
import { localizedSlugs } from '@/lib/i18n/localized-slugs';

/**
 * Forward URL builders — the single place that knows how to construct a
 * link to any page, for a given locale. Components should always use
 * these helpers instead of hand-writing a path string.
 */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  services: (locale: Locale) => `/${locale}/services`,
  service: (locale: Locale, slug: string) => `/${locale}/services/${slug}`,
  howItWorks: (locale: Locale) => `/${locale}/${localizedSlugs.howItWorks[locale]}`,
  areas: (locale: Locale) => `/${locale}/${localizedSlugs.areas[locale]}`,
  area: (locale: Locale, slug: string) => `/${locale}/${localizedSlugs.locationPrefix[locale]}-${slug}`,
  faq: (locale: Locale) => `/${locale}/faq`,
  contact: (locale: Locale) => `/${locale}/contact`,
  about: (locale: Locale) => `/${locale}/${localizedSlugs.about[locale]}`,
  booking: (locale: Locale) => `/${locale}/${localizedSlugs.booking[locale]}`,
  privacy: (locale: Locale) => `/${locale}/${localizedSlugs.privacy[locale]}`,
  terms: (locale: Locale) => `/${locale}/${localizedSlugs.terms[locale]}`,
  cancellation: (locale: Locale) => `/${locale}/${localizedSlugs.cancellation[locale]}`,
};
