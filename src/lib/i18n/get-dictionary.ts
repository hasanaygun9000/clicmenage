import type { Locale } from './config';
import type { Dictionary } from './dictionary-type';
import fr from './dictionaries/fr';
import en from './dictionaries/en';

const dictionaries: Record<Locale, Dictionary> = { fr, en };

/**
 * Synchronous dictionary lookup. Dictionaries are small, statically
 * imported TS modules (not fetched), so no async I/O is needed — this
 * keeps server components simple and fast.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
