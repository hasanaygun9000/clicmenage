/**
 * ============================================================================
 *  PRICING ENGINE CONFIGURATION — ClicMénage
 * ============================================================================
 * ⚠️  DEMO / TO BE CONFIRMED BEFORE LAUNCH
 * Every dollar amount in this file — base prices, per-bedroom/bathroom
 * add-ons, extras, the minimum booking amount, tax rates — is a DEMO value
 * used to make the booking flow fully functional for development and
 * review. None of it is ClicMénage's real, final pricing. `isDemoPricing:
 * true` below also drives a visible "demo pricing" notice throughout the
 * booking flow so site visitors are never shown an unconfirmed price
 * without context. Replace every value here with real, owner-confirmed
 * pricing before launch, then flip `isDemoPricing` to `false` — see
 * LAUNCH_CHECKLIST.md for the full pre-launch list.
 *
 * This is the ONLY file that should contain price numbers. Every price
 * shown anywhere on the site (service pages, booking flow, review step)
 * is computed from these values via src/lib/pricing/engine.ts. Do not
 * hardcode a dollar amount in a component.
 * ============================================================================
 */

export type ServicePricingKey = 'regular' | 'deep' | 'move';
export type FrequencyKey = 'once' | 'weekly' | 'biweekly' | 'every4weeks';

export const pricingConfig = {
  /** Flip to false once real pricing has been entered — removes the demo notice. */
  isDemoPricing: true,

  currency: 'CAD' as const,

  /** DEMO / TO BE CONFIRMED BEFORE LAUNCH — absolute floor for any booking, applied after discounts and before tax. */
  minimumBookingAmount: 89,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — base price per service type,
   * before home-size add-ons. `multiplier` is applied to (base + size
   * add-ons) to represent the extra effort of a deep clean or a
   * move-in/out clean.
   */
  services: {
    regular: { basePrice: 79, multiplier: 1 },
    deep: { basePrice: 99, multiplier: 1.5 },
    move: { basePrice: 129, multiplier: 1.7 },
  } satisfies Record<ServicePricingKey, { basePrice: number; multiplier: number }>,

  /** DEMO / TO BE CONFIRMED BEFORE LAUNCH — added per bedroom / bathroom selected in step 3, before the service multiplier. */
  perBedroomPrice: 15,
  perBathroomPrice: 20,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — optional per-square-foot
   * adjustment for larger homes. Only applied above `sqftThreshold`, per
   * 500 sq ft over that threshold.
   */
  sqft: {
    threshold: 1500,
    pricePerExtra500Sqft: 12,
  },

  /** DEMO / TO BE CONFIRMED BEFORE LAUNCH — discount applied to the cleaning portion of the price for recurring bookings. */
  frequencyDiscounts: {
    once: 0,
    weekly: 0.2,
    biweekly: 0.15,
    every4weeks: 0.1,
  } satisfies Record<FrequencyKey, number>,

  /** DEMO / TO BE CONFIRMED BEFORE LAUNCH — flat price per extra, keyed by extras.ts `id`. */
  extrasPricing: {
    'inside-fridge': 15,
    'inside-oven': 15,
    'interior-windows': 25,
    'inside-cabinets': 20,
    'laundry-folding': 20,
    'upholstery-refresh': 25,
  } as Record<string, number>,

  /**
   * Quebec sales tax configuration (GST/TPS + QST/TVQ). DEMO / TO BE
   * CONFIRMED BEFORE LAUNCH — rates below are the standard published
   * Quebec rates as of this build, but tax handling (e.g. whether
   * ClicMénage is required to register/collect at its actual revenue
   * level) must still be confirmed with an accountant before launch.
   * Both are disabled-safe: set `enabled: false` to show tax-exclusive
   * pricing while that confirmation is pending.
   */
  taxes: {
    enabled: true,
    gst: { label: 'TPS/GST', rate: 0.05 },
    qst: { label: 'TVQ/QST', rate: 0.09975 },
  },
};
