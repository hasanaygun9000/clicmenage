/**
 * i18n configuration — single source of truth for supported locales.
 *
 * French is the default/primary locale for ClicMénage (Quebec market).
 * To add a locale later: add it to `locales`, create a dictionary file
 * in `dictionaries/`, and add bilingual fields anywhere content is
 * typed as `Record<Locale, string>`.
 */
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Human-readable label for the language switcher. */
export const localeLabels: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
};

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

/** BCP-47 tags used in <html lang>, hreflang and Open Graph metadata. */
export const localeHtmlTag: Record<Locale, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
};
