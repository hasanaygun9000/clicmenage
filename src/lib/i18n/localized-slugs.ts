/**
 * Single source of truth for URL segments that are translated between
 * locales (e.g. /fr/reserver ↔ /en/booking). Both routes.ts (forward:
 * locale + page → URL) and route-map.ts (reverse: current URL + target
 * locale → equivalent URL, for the language switcher) read from this list
 * so the two never drift out of sync.
 */
export const localizedSlugs = {
  howItWorks: { fr: 'comment-ca-marche', en: 'how-it-works' },
  areas: { fr: 'secteurs', en: 'areas' },
  booking: { fr: 'reserver', en: 'booking' },
  about: { fr: 'a-propos', en: 'about' },
  privacy: { fr: 'politique-de-confidentialite', en: 'privacy-policy' },
  terms: { fr: 'conditions-utilisation', en: 'terms-of-service' },
  cancellation: { fr: 'politique-annulation', en: 'cancellation-policy' },
  locationPrefix: { fr: 'menage', en: 'cleaning' },
} as const;
