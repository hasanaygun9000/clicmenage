/**
 * ============================================================================
 *  PRICING ENGINE CONFIGURATION — ClicMénage
 * ============================================================================
 * ⚠️  DEMO / TO BE CONFIRMED BEFORE LAUNCH
 * Every dollar amount, hour figure, and economic assumption in this file is
 * a DEMO value used to make the booking flow fully functional for
 * development and review. None of it is ClicMénage's final, owner-confirmed
 * pricing. `isDemoPricing: true` below drives a visible "demo pricing"
 * notice throughout the booking flow so visitors are never shown an
 * unconfirmed price without context. Replace every value here with real
 * numbers before launch, then flip `isDemoPricing` to `false` — see
 * LAUNCH_CHECKLIST.md.
 *
 * This is the ONLY file that should contain price numbers, hour estimates,
 * or economic assumptions. Every price shown anywhere on the site is
 * computed from these values via src/lib/pricing/engine.ts. Do not
 * hardcode a dollar amount or an hour figure in a component.
 *
 * ============================================================================
 *  HOW THE PRICE IS COMPUTED (person-hours model)
 * ============================================================================
 * ClicMénage does not sell an hourly rate and never promises an exact
 * duration to the client — the booking flow only ever shows a fixed,
 * all-in price. Internally, though, the price is derived from an
 * *estimated person-hours* figure for the job, because that's what
 * actually drives cost (labour is the dominant cost of a cleaning visit).
 *
 * Step 1 — estimate person-hours for the job:
 *   1. Start from a reference figure for the service type and home size
 *      (`referenceHours`), based on two anchor configurations per service:
 *      a studio/1-full-bath and a 1-bedroom/1-full-bath home.
 *   2. Add hours for extra bedrooms / extra full bathrooms / half
 *      bathrooms beyond the 1-bed/1-bath anchor (`hourIncrements`).
 *   3. Add hours for approximate square footage above 999 sq ft
 *      (`sqftHourAdjustments`) — nothing is added below 1000 sq ft, and
 *      nothing is added when the client doesn't know their square
 *      footage (`unknown`). At 3000+ sq ft we still estimate using the
 *      2500-2999 adjustment as a floor, but flag `manualReviewRequired`
 *      instead of silently promising a final price — very large homes
 *      genuinely need a quick human look before we commit to a number.
 *   4. Add hours for each floor beyond the first, for houses and
 *      townhouses only (`floorsHourIncrement`).
 *   5. Add hours for heavy pet hair (`petHairHourAdjustments`) — "some"
 *      carries no surcharge today (documented for future tuning), "heavy"
 *      does.
 *   6. For Move-In/Out only, multiply the running total by a furnishing
 *      multiplier (`moveFurnishingMultiplier`) — an empty home is the
 *      baseline; partly-furnished and furnished homes take measurably
 *      longer because furniture has to be worked around.
 *
 * Step 2 — turn person-hours into a price:
 *   labourCost   = estimatedPersonHours × economics.loadedLaborBudgetPerHour
 *   directCost   = labourCost + economics.travelReserve
 *                  + economics.suppliesReserve[service] + cardFeeFixed
 *   price        = directCost / (1 - cardFeeRate - targetContributionMargin[service])
 *
 *   This solves directly for the price at which, after the estimated
 *   card-processing fee and labour/travel/supplies cost are covered, the
 *   remaining contribution margin matches the target for that service
 *   tier. The result is then rounded UP to the nearest $5 (a cleaning
 *   business should never quote itself short) — see `roundUpToNearestFive`
 *   in engine.ts.
 *
 * Step 3 — frequency discount, extras, minimum, taxes — same order as
 * before: discount applies to the cleaning subtotal only, extras are
 * added after, the minimum booking amount is enforced before tax, and
 * GST/QST are computed on top, kept separate in the breakdown.
 *
 * ============================================================================
 *  V1.1 — OPERATIONAL HOURS FOR EXTRAS (never priced twice)
 * ============================================================================
 * Each extra also carries its own `operationalPersonHours` (see
 * `extrasPricing` below) — internal scheduling time only, kept completely
 * separate from the extra's fixed price. engine.ts sums these into
 * `extrasPersonHours` and keeps them out of `computeCleaningPrice()`
 * entirely, so an extra's time is never double-charged through the
 * cleaning-price formula above. `baseCleaningPersonHours` (home-size-driven,
 * everything above) is the only figure that formula ever sees; the
 * frequency-based `reportedOperationalHoursFactor` below is likewise applied
 * to `baseCleaningPersonHours` only — an extra like the oven takes roughly
 * the same active work whether the client is a one-time or a weekly client,
 * so it is never discounted by frequency. See PricingBreakdown in
 * engine.ts for the full baseCleaningPersonHours/extrasPersonHours/
 * estimatedPersonHours breakdown — all internal, never client-visible.
 * ============================================================================
 */

export type ServicePricingKey = 'regular' | 'deep' | 'move';
export type FrequencyKey = 'once' | 'weekly' | 'biweekly' | 'every4weeks';

/** Housing type selected in booking step 3 — drives whether "floors" is asked at all. */
export type HousingType = 'condo_apartment' | 'house' | 'townhouse' | 'duplex_triplex';

/** Housing types for which the "number of floors" question applies. */
export const HOUSING_TYPES_WITH_FLOORS: HousingType[] = ['house', 'townhouse'];

/** Approximate square footage, chosen by the client as a bucket — never a required exact number. */
export type SqftBucket =
  | 'under750'
  | '750_999'
  | '1000_1499'
  | '1500_1999'
  | '2000_2499'
  | '2500_2999'
  | '3000plus'
  | 'unknown';

/** Time since the home's last thorough (deep-level) cleaning — drives the Regular ↔ Deep recommendation, not price. */
export type LastCleaning = 'under1month' | '1to3months' | '3to6months' | 'over6months' | 'over1year' | 'unknown';

/** Amount of pet hair/shedding in the home. */
export type PetHair = 'none' | 'some' | 'heavy';

/** Move-In/Out only: how furnished the home is at the time of the clean. */
export type FurnishingState = 'empty' | 'partly_furnished' | 'furnished';

/** How an extra's price scales — most extras are a flat add-on, a few scale with a quantity the client enters. */
export type ExtraUnit = 'flat' | 'perWindow' | 'perLoad' | 'perBed';

export interface ExtraPricing {
  unit: ExtraUnit;
  price: number;
  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — internal operational person-hours
   * this extra adds to the job. Scales with quantity exactly like `price`
   * (flat extras always count once; perWindow/perLoad/perBed extras scale
   * with the quantity the client entered). NEVER shown to the client and
   * NEVER fed back into computeCleaningPrice() — the extra's price stays a
   * separate, fixed line item so a job is never double-charged for the same
   * time. See PricingBreakdown.extrasPersonHours in engine.ts.
   */
  operationalPersonHours: number;
}

export const pricingConfig = {
  /** Flip to false once real pricing has been entered — removes the demo notice. */
  isDemoPricing: true,

  currency: 'CAD' as const,

  /** DEMO / TO BE CONFIRMED BEFORE LAUNCH — absolute floor for any booking, applied after discounts and before tax. */
  minimumBookingAmount: 89,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — reference person-hours for the
   * two anchor configurations of each service: a studio (0 bedrooms) with
   * 1 full bathroom, and a 1-bedroom home with 1 full bathroom. All other
   * home sizes are derived from the 1-bed/1-bath anchor via
   * `hourIncrements` below.
   */
  referenceHours: {
    regular: { studioOneBath: 2.0, oneBedOneBath: 2.5 },
    deep: { studioOneBath: 3.75, oneBedOneBath: 4.5 },
    move: { studioOneBath: 4.0, oneBedOneBath: 4.75 },
  } satisfies Record<ServicePricingKey, { studioOneBath: number; oneBedOneBath: number }>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — hours added per extra bedroom,
   * extra full bathroom, and half bathroom, beyond the 1-bed/1-bath
   * anchor above. Also applied on top of the studio anchor for extra
   * bathrooms (a studio with 2 full baths is uncommon but supported).
   */
  hourIncrements: {
    regular: { perExtraBedroom: 0.35, perExtraFullBathroom: 0.55, perHalfBathroom: 0.3 },
    deep: { perExtraBedroom: 0.55, perExtraFullBathroom: 0.75, perHalfBathroom: 0.4 },
    move: { perExtraBedroom: 0.65, perExtraFullBathroom: 0.85, perHalfBathroom: 0.45 },
  } satisfies Record<ServicePricingKey, { perExtraBedroom: number; perExtraFullBathroom: number; perHalfBathroom: number }>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — hours added for approximate
   * square footage. Nothing is added at `under750` or `750_999` (up to
   * 999 sq ft is treated as already reflected in the bedroom/bathroom
   * figures above), and nothing is added for `unknown`. `3000plus` reuses
   * the `2500_2999` figure as a floor estimate — see `manualReviewRequired`
   * in engine.ts, which flags these jobs for a human look rather than
   * silently promising a final number.
   */
  sqftHourAdjustments: {
    regular: { '1000_1499': 0.4, '1500_1999': 0.9, '2000_2499': 1.4, '2500_2999': 1.9 },
    deep: { '1000_1499': 0.6, '1500_1999': 1.2, '2000_2499': 1.8, '2500_2999': 2.4 },
    move: { '1000_1499': 0.7, '1500_1999': 1.4, '2000_2499': 2.1, '2500_2999': 2.8 },
  } satisfies Record<ServicePricingKey, Record<'1000_1499' | '1500_1999' | '2000_2499' | '2500_2999', number>>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — hours added per floor beyond
   * the first. Only asked (and only ever applied) for houses and
   * townhouses — see `HOUSING_TYPES_WITH_FLOORS`.
   */
  floorsHourIncrement: {
    regular: 0.15,
    deep: 0.25,
    move: 0.25,
  } satisfies Record<ServicePricingKey, number>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — hours added for heavy pet
   * hair/shedding. "some" carries no surcharge yet (documented here for
   * future tuning once we have real data); "heavy" does.
   */
  petHairHourAdjustments: {
    regular: { none: 0, some: 0, heavy: 0.5 },
    deep: { none: 0, some: 0, heavy: 0.75 },
    move: { none: 0, some: 0, heavy: 0.75 },
  } satisfies Record<ServicePricingKey, Record<PetHair, number>>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — Move-In/Out only. Multiplies
   * the fully-adjusted hour estimate (bedrooms/bathrooms/sqft/floors/pet
   * hair all included) to account for furniture that has to be worked
   * around. An empty home is the baseline the `move` reference hours and
   * increments above already assume.
   */
  moveFurnishingMultiplier: {
    empty: 1,
    partly_furnished: 1.15,
    furnished: 1.3,
  } satisfies Record<FurnishingState, number>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — internal economic assumptions
   * used only to derive the DEMO price from estimated person-hours. NEVER
   * shown to the client — no hourly rate, wage, or margin appears
   * anywhere in client-facing copy or the price breakdown.
   */
  economics: {
    /** Informational only — the going hourly wage a cleaner is paid. Not used directly in the price formula. */
    employeeWageInformational: 22,
    /** What the business budgets per person-hour once payroll burden is loaded in (source of the labour cost line). */
    loadedLaborBudgetPerHour: 27,
    /** Flat travel/vehicle reserve per job, regardless of size. */
    travelReserve: 20,
    /** Flat supplies reserve per job, varies by service intensity. */
    suppliesReserve: { regular: 8, deep: 12, move: 15 } satisfies Record<ServicePricingKey, number>,
    /** Domestic card-processing reserve, modeled the standard way: a rate plus a fixed cents-on-the-dollar amount. */
    cardProcessingReserve: { rate: 0.029, fixed: 0.3 },
    /** Target contribution margin baked into the price for each service tier. */
    targetContributionMargin: { regular: 0.4, deep: 0.45, move: 0.45 } satisfies Record<ServicePricingKey, number>,
  },

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — reduced "reported operational
   * hours" factors used only for future internal reporting, NEVER for
   * pricing and NEVER communicated to the cleaner as a deadline. A
   * recurring visit to an already-maintained home genuinely tends to run
   * shorter than a first/one-time visit — these factors approximate that
   * for planning purposes only.
   */
  reportedOperationalHoursFactor: {
    once: 1,
    weekly: 0.8,
    biweekly: 0.9,
    every4weeks: 0.97,
  } satisfies Record<FrequencyKey, number>,

  /** DEMO / TO BE CONFIRMED BEFORE LAUNCH — discount applied to the cleaning portion of the price for recurring bookings. */
  frequencyDiscounts: {
    once: 0,
    weekly: 0.15,
    biweekly: 0.1,
    every4weeks: 0.05,
  } satisfies Record<FrequencyKey, number>,

  /**
   * DEMO / TO BE CONFIRMED BEFORE LAUNCH — extras catalog pricing, keyed
   * by extras.ts `id`. Most extras are a flat add-on; a few scale with a
   * quantity the client enters in step 5 (number of windows, laundry
   * loads, or beds). `operationalPersonHours` is the internal scheduling
   * time each extra adds — centralized here alongside price so both stay
   * in sync — see the ExtraPricing interface comment above for the
   * no-double-charging rule.
   */
  extrasPricing: {
    'inside-oven': { unit: 'flat', price: 40, operationalPersonHours: 0.75 },
    'inside-fridge': { unit: 'flat', price: 40, operationalPersonHours: 0.5 },
    'inside-empty-cabinets': { unit: 'flat', price: 40, operationalPersonHours: 0.75 },
    'interior-windows': { unit: 'perWindow', price: 10, operationalPersonHours: 0.15 },
    'laundry-wash-fold': { unit: 'perLoad', price: 25, operationalPersonHours: 0.25 },
    'change-bedsheets': { unit: 'perBed', price: 15, operationalPersonHours: 0.15 },
    dishwasher: { unit: 'flat', price: 20, operationalPersonHours: 0.2 },
    'second-kitchen': { unit: 'flat', price: 40, operationalPersonHours: 0.75 },
    'balcony-patio': { unit: 'flat', price: 15, operationalPersonHours: 0.25 },
  } as Record<string, ExtraPricing>,

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

/**
 * ============================================================================
 *  ROTATION SCOPE — recurring clients (documentation only, not yet scheduled)
 * ============================================================================
 * ClicMénage's recurring plans (weekly/biweekly/every-4-weeks) are meant to
 * "rotate" a set of more detailed tasks across visits rather than repeat a
 * full Deep-level scope every time (which the discounted recurring rate
 * doesn't cover the hours for). This is documented here as the intended
 * operational model for when scheduling/rotation tracking is built; there
 * is NO rotation scheduling system implemented yet — every recurring visit
 * today simply runs the selected service's standard scope (see
 * `serviceScopes` in services.ts). Do not present rotation tasks to
 * clients as guaranteed-every-visit.
 *
 * Rotation detail buckets, to be spread across successive recurring
 * visits once implemented:
 *   - Detailed kitchen: inside microwave edges/seals, small-appliance
 *     fronts, backsplash detail, cabinet fronts at reachable height.
 *   - Detailed bathrooms: grout touch-up, fixture detail, cabinet fronts.
 *   - Detailed bedrooms: baseboards, reachable window sills, furniture
 *     fronts.
 *   - Detailed common areas: baseboards, reachable ledges, door/door
 *     frame detail, furniture fronts, reachable undersides where safe.
 * ============================================================================
 */
export const rotationScopeNote =
  'Rotation-based detailed tasks (baseboards, reachable ledges, door/door frames, furniture fronts, reachable undersides) are documented for future recurring-visit scheduling. Not yet implemented as an automated rotation — recurring visits currently run the selected service tier\'s standard scope every time.';
