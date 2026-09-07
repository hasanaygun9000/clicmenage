import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { routes } from './routes';

export interface NavLink {
  href: (locale: Locale) => string;
  label: (dict: Dictionary) => string;
}

/**
 * Primary header navigation. Centralized so the header and footer stay in
 * sync, and so adding/removing a nav item is a one-line change.
 */
export const primaryNavLinks: NavLink[] = [
  { href: routes.services, label: (d) => d.nav.services },
  { href: routes.howItWorks, label: (d) => d.nav.howItWorks },
  { href: routes.areas, label: (d) => d.nav.areas },
  { href: routes.faq, label: (d) => d.nav.faq },
  { href: routes.contact, label: (d) => d.nav.contact },
];

export function bookingHref(locale: Locale): string {
  return routes.booking(locale);
}

export function homeHref(locale: Locale): string {
  return routes.home(locale);
}
