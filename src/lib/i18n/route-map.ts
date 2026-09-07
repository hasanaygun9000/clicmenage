import type { Locale } from './config';
import { localizedSlugs } from './localized-slugs';

const staticSegmentMap: { fr: string; en: string }[] = [
  localizedSlugs.howItWorks,
  localizedSlugs.areas,
  localizedSlugs.booking,
  localizedSlugs.about,
  localizedSlugs.privacy,
  localizedSlugs.terms,
  localizedSlugs.cancellation,
];

const LOCATION_PREFIX = localizedSlugs.locationPrefix;

/**
 * Given a pathname (with or without a leading locale segment) and a target
 * locale, returns the equivalent path in that locale. Used by the language
 * switcher so switching language keeps you on the "same" page rather than
 * bouncing to the homepage.
 */
export function getAlternatePath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'fr' || segments[0] === 'en') {
    segments.shift();
  }

  if (segments.length === 0) {
    return `/${targetLocale}`;
  }

  const [first, ...rest] = segments;

  if (first?.startsWith(`${LOCATION_PREFIX.fr}-`)) {
    const city = first.slice(LOCATION_PREFIX.fr.length + 1);
    const prefix = targetLocale === 'fr' ? LOCATION_PREFIX.fr : LOCATION_PREFIX.en;
    return `/${targetLocale}/${prefix}-${city}`;
  }
  if (first?.startsWith(`${LOCATION_PREFIX.en}-`)) {
    const city = first.slice(LOCATION_PREFIX.en.length + 1);
    const prefix = targetLocale === 'fr' ? LOCATION_PREFIX.fr : LOCATION_PREFIX.en;
    return `/${targetLocale}/${prefix}-${city}`;
  }

  const mapping = staticSegmentMap.find((m) => m.fr === first || m.en === first);
  const translatedFirst = mapping ? mapping[targetLocale] : first;

  return `/${targetLocale}/${[translatedFirst, ...rest].join('/')}`;
}
