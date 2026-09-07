import type { Locale } from '@/lib/i18n/config';

/** A value that must be provided in both French and English. */
export type Bilingual = Record<Locale, string>;

/** A list of bullet points, provided in both languages, same length/order. */
export type BilingualList = Record<Locale, string[]>;

export function t(value: Bilingual, locale: Locale): string {
  return value[locale];
}

export function tList(value: BilingualList, locale: Locale): string[] {
  return value[locale];
}
