/**
 * ============================================================================
 *  CENTRAL BUSINESS CONFIGURATION — ClicMénage
 * ============================================================================
 * Every real-world business fact used across the site (contact info, hours,
 * legal name, social links) is defined here ONCE. Nothing else in the
 * codebase should hardcode a phone number, email, or address.
 *
 * ⚠️  UNCONFIRMED FIELDS: several fields below are empty by default rather
 * than filled with a placeholder value. That is intentional — a fake phone
 * number or made-up hours would look real to a visitor. Once the business
 * owner supplies a real value (via the env vars named in each comment, see
 * .env.example), the corresponding UI element starts rendering automatically;
 * until then, components must check the matching `isXConfigured()` helper
 * and render nothing rather than show empty/fake-looking content. See
 * LAUNCH_CHECKLIST.md for the full list of what still needs to be supplied.
 * ============================================================================
 */

export const business = {
  legalName: 'ClicMénage',
  displayName: 'ClicMénage',

  /**
   * Public-facing phone number. Empty until a real number is supplied via
   * NEXT_PUBLIC_BUSINESS_PHONE / NEXT_PUBLIC_BUSINESS_PHONE_HREF — components
   * must check `isPhoneConfigured()` before rendering it.
   */
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
  phoneHref: process.env.NEXT_PUBLIC_BUSINESS_PHONE_HREF || '',

  /**
   * Public-facing email. Empty until a real address is supplied via
   * NEXT_PUBLIC_BUSINESS_EMAIL — components must check `isPublicEmailConfigured()`
   * before rendering it.
   */
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || '',

  /**
   * Internal-only inbox used as the mock "to" address for booking/contact
   * notification emails (see src/lib/email/provider.ts). This is never
   * rendered anywhere in the UI — it only appears in server logs while email
   * sending is in mock mode — so a fallback here is safe even before a real
   * public email is configured.
   */
  internalNotificationEmail:
    process.env.BUSINESS_NOTIFICATION_EMAIL || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'unconfigured@clicmenage.local',

  /** PLACEHOLDER — replace once a domain is registered. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clicmenage.ca',

  /**
   * ClicMénage's registered/service address, if the business wants one
   * published. Many home-service businesses only publish a service area, not
   * a street address — street/postal code stay blank unless supplied via
   * NEXT_PUBLIC_BUSINESS_STREET / NEXT_PUBLIC_BUSINESS_POSTAL_CODE, and the
   * LocalBusiness structured data omits those fields when blank rather than
   * publishing empty values.
   */
  address: {
    streetAddress: process.env.NEXT_PUBLIC_BUSINESS_STREET || '', // leave blank if not publishing a street address
    addressLocality: 'Montréal',
    addressRegion: 'QC',
    postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE || '',
    addressCountry: 'CA',
  },

  /**
   * Business hours — used on the Contact page and in LocalBusiness schema.
   * Empty by default so the site never publishes unconfirmed hours. Once
   * real hours are confirmed: set NEXT_PUBLIC_BUSINESS_HOURS_FR / _EN for the
   * display strings, and add matching entries to `hours` below (schema.org
   * opening-hours day abbreviations) for the structured data.
   */
  hours: [] as { days: string[]; opens: string; closes: string }[],
  hoursDisplay: {
    fr: process.env.NEXT_PUBLIC_BUSINESS_HOURS_FR || '',
    en: process.env.NEXT_PUBLIC_BUSINESS_HOURS_EN || '',
  },

  /**
   * Social links — all empty by default so the footer never displays a
   * fake/unclaimed social account. Fill in only real, live profile URLs.
   */
  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '',
    google: process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL || '',
  },

  region: {
    fr: 'le Grand Montréal',
    en: 'Greater Montreal',
  },
} as const;

/** True once a real phone number has been supplied via env vars. */
export function isPhoneConfigured(): boolean {
  return Boolean(business.phone && business.phoneHref);
}

/** True once a real public email address has been supplied via env vars. */
export function isPublicEmailConfigured(): boolean {
  return Boolean(business.email);
}

/** True once real operating hours have been supplied via env vars. */
export function isHoursConfigured(): boolean {
  return Boolean(business.hoursDisplay.fr && business.hoursDisplay.en);
}

/** True once a street address has been supplied via env vars. */
export function isStreetAddressConfigured(): boolean {
  return Boolean(business.address.streetAddress);
}

/** True once at least one real social/Google Business link is configured. */
export function hasAnySocialConfigured(): boolean {
  return Object.values(business.social).some(Boolean);
}
