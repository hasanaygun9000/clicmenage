import {
  pricingConfig,
  HOUSING_TYPES_WITH_FLOORS,
  type FrequencyKey,
  type ServicePricingKey,
  type HousingType,
  type SqftBucket,
  type PetHair,
  type FurnishingState,
  type LastCleaning,
} from './pricing-config';

/** One extra selected in step 5, with the quantity the client entered (ignored — treated as 1 — for flat-priced extras). */
export interface SelectedExtra {
  id: string;
  quantity: number;
}

export interface PricingInput {
  service: ServicePricingKey;
  housingType: HousingType;
  /** 0 = studio, 1-5 = exact count, 6 = "6+". */
  bedrooms: number;
  /** Always >= 1 — every home is assumed to have at least one full bathroom. */
  fullBathrooms: number;
  halfBathrooms: number;
  sqftBucket: SqftBucket;
  /** Only meaningful (and only ever applied) for house/townhouse — see HOUSING_TYPES_WITH_FLOORS. */
  floors?: number;
  petHair: PetHair;
  /** Move-In/Out only. */
  furnishingState?: FurnishingState;
  frequency: FrequencyKey;
  extras: SelectedExtra[];
}

export interface PricingLineItem {
  id: string;
  label: string;
  amount: number;
}

/** Why a job was flagged for manual review before a final price is committed. */
export type ManualReviewReason = 'large_sqft';

export interface PricingBreakdown {
  currency: string;
  isDemoPricing: boolean;
  lineItems: PricingLineItem[];
  cleaningSubtotal: number;
  extrasSubtotal: number;
  frequencyDiscountRate: number;
  frequencyDiscountAmount: number;
  subtotalBeforeMinimum: number;
  minimumApplied: boolean;
  subtotal: number;
  gstAmount: number;
  qstAmount: number;
  taxAmount: number;
  total: number;
  /** Internal scheduling/pricing input — never shown to the client as a promised duration. */
  estimatedPersonHours: number;
  /** Reduced hour figure for future internal reporting only — see reportedOperationalHoursFactor. */
  reportedOperationalHours: number;
  /** Internal scheduling suggestion — how many cleaners a job of this size likely needs. */
  recommendedCrewSize: number;
  /** True when the job is large enough (3000+ sq ft) that it needs a quick human look before a final price is committed. */
  manualReviewRequired: boolean;
  manualReviewReason: ManualReviewReason | null;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Cleaning prices always round UP to the nearest $5 — a demo business rule that avoids ever quoting a job short. */
function roundUpToNearestFive(value: number): number {
  return Math.ceil(value / 5) * 5;
}

const SQFT_BUCKETS_WITH_ADJUSTMENT = ['1000_1499', '1500_1999', '2000_2499', '2500_2999'] as const;
type SqftBucketWithAdjustment = (typeof SQFT_BUCKETS_WITH_ADJUSTMENT)[number];

function isSqftBucketWithAdjustment(bucket: SqftBucket): bucket is SqftBucketWithAdjustment {
  return (SQFT_BUCKETS_WITH_ADJUSTMENT as readonly string[]).includes(bucket);
}

interface HoursEstimate {
  hours: number;
  manualReviewRequired: boolean;
  manualReviewReason: ManualReviewReason | null;
}

/**
 * Estimates person-hours for a job. See the long comment at the top of
 * pricing-config.ts for the full explanation of each step. This number is
 * an internal pricing/scheduling input only — it is never shown to the
 * client as a promised duration, and a cleaner should never feel forced
 * to leave a job unfinished because this estimate was exceeded.
 */
function estimatePersonHours(input: PricingInput): HoursEstimate {
  const service = input.service;
  const reference = pricingConfig.referenceHours[service];
  const increments = pricingConfig.hourIncrements[service];

  const bedrooms = Math.max(0, Math.round(input.bedrooms));
  const fullBathrooms = Math.max(1, Math.round(input.fullBathrooms));
  const halfBathrooms = Math.max(0, Math.round(input.halfBathrooms));

  let hours =
    bedrooms === 0
      ? reference.studioOneBath
      : reference.oneBedOneBath + (bedrooms - 1) * increments.perExtraBedroom;
  hours += Math.max(0, fullBathrooms - 1) * increments.perExtraFullBathroom;
  hours += halfBathrooms * increments.perHalfBathroom;

  let manualReviewRequired = false;
  let manualReviewReason: ManualReviewReason | null = null;
  const sqftAdjustments = pricingConfig.sqftHourAdjustments[service];
  if (input.sqftBucket === '3000plus') {
    // No blind promise for very large homes — estimate with the largest
    // known bracket as a floor, but flag for a human look before the
    // price is treated as final.
    hours += sqftAdjustments['2500_2999'];
    manualReviewRequired = true;
    manualReviewReason = 'large_sqft';
  } else if (isSqftBucketWithAdjustment(input.sqftBucket)) {
    hours += sqftAdjustments[input.sqftBucket];
  }
  // 'under750', '750_999', and 'unknown' add nothing.

  if (HOUSING_TYPES_WITH_FLOORS.includes(input.housingType) && input.floors && input.floors > 1) {
    const extraFloors = input.floors - 1;
    hours += extraFloors * pricingConfig.floorsHourIncrement[service];
  }

  hours += pricingConfig.petHairHourAdjustments[service][input.petHair];

  if (service === 'move' && input.furnishingState) {
    hours *= pricingConfig.moveFurnishingMultiplier[input.furnishingState];
  }

  return { hours: round2(hours), manualReviewRequired, manualReviewReason };
}

/**
 * Turns estimated person-hours into the DEMO cleaning price for a single
 * (one-time) visit — see the pricing-config.ts comment for the formula.
 * Frequency discounts are applied afterward, separately, to this figure.
 */
function computeCleaningPrice(service: ServicePricingKey, hours: number): number {
  const econ = pricingConfig.economics;
  const laborCost = hours * econ.loadedLaborBudgetPerHour;
  const directCost = laborCost + econ.travelReserve + econ.suppliesReserve[service] + econ.cardProcessingReserve.fixed;
  const denominator = 1 - econ.cardProcessingReserve.rate - econ.targetContributionMargin[service];
  const rawPrice = directCost / denominator;
  return roundUpToNearestFive(rawPrice);
}

/** Internal scheduling suggestion only — not shown to the client. */
function recommendCrewSize(hours: number): number {
  return Math.max(1, Math.ceil(hours / 4.5));
}

function computeExtras(extras: SelectedExtra[]): { subtotal: number; lineItems: PricingLineItem[] } {
  let subtotal = 0;
  const lineItems: PricingLineItem[] = [];
  for (const extra of extras) {
    const pricing = pricingConfig.extrasPricing[extra.id];
    if (!pricing) continue;
    const quantity = pricing.unit === 'flat' ? 1 : Math.max(1, Math.round(extra.quantity || 1));
    const amount = round2(pricing.price * quantity);
    subtotal += amount;
    lineItems.push({ id: extra.id, label: extra.id, amount });
  }
  return { subtotal: round2(subtotal), lineItems };
}

/**
 * Computes the full price breakdown for a booking configuration.
 * This is the single function both the booking wizard (client-side, for
 * the live-updating estimate) and the booking API route (server-side, for
 * authoritative pricing before payment) call — see SECURITY note in
 * src/app/api/bookings/route.ts about never trusting a client-sent total.
 */
export function calculatePricing(input: PricingInput): PricingBreakdown {
  const { hours: estimatedPersonHours, manualReviewRequired, manualReviewReason } = estimatePersonHours(input);

  const cleaningSubtotal = computeCleaningPrice(input.service, estimatedPersonHours);
  const { subtotal: extrasSubtotal, lineItems: extraLineItems } = computeExtras(input.extras);

  const frequencyDiscountRate = pricingConfig.frequencyDiscounts[input.frequency] ?? 0;
  const frequencyDiscountAmount = round2(cleaningSubtotal * frequencyDiscountRate);

  const subtotalBeforeMinimum = round2(cleaningSubtotal - frequencyDiscountAmount + extrasSubtotal);
  const minimumApplied = subtotalBeforeMinimum < pricingConfig.minimumBookingAmount;
  const subtotal = minimumApplied ? pricingConfig.minimumBookingAmount : subtotalBeforeMinimum;

  let gstAmount = 0;
  let qstAmount = 0;
  if (pricingConfig.taxes.enabled) {
    gstAmount = round2(subtotal * pricingConfig.taxes.gst.rate);
    qstAmount = round2(subtotal * pricingConfig.taxes.qst.rate);
  }
  const taxAmount = round2(gstAmount + qstAmount);
  const total = round2(subtotal + taxAmount);

  const lineItems: PricingLineItem[] = [
    { id: 'cleaning', label: 'cleaning', amount: cleaningSubtotal },
    ...extraLineItems,
  ];

  const reportedOperationalHours = round2(
    estimatedPersonHours * (pricingConfig.reportedOperationalHoursFactor[input.frequency] ?? 1)
  );

  return {
    currency: pricingConfig.currency,
    isDemoPricing: pricingConfig.isDemoPricing,
    lineItems,
    cleaningSubtotal,
    extrasSubtotal,
    frequencyDiscountRate,
    frequencyDiscountAmount,
    subtotalBeforeMinimum,
    minimumApplied,
    subtotal,
    gstAmount,
    qstAmount,
    taxAmount,
    total,
    estimatedPersonHours,
    reportedOperationalHours,
    recommendedCrewSize: recommendCrewSize(estimatedPersonHours),
    manualReviewRequired,
    manualReviewReason,
  };
}

/**
 * The smallest possible job for a service tier (studio, 1 full bath, no
 * extras, one-time) — used only for a "from $X" teaser price on service
 * cards/pages. The actual price is always recomputed from the client's
 * real answers later in the booking flow; this is never a final price.
 */
export function getStartingPrice(service: ServicePricingKey): number {
  return calculatePricing({
    service,
    housingType: 'condo_apartment',
    bedrooms: 0,
    fullBathrooms: 1,
    halfBathrooms: 0,
    sqftBucket: 'under750',
    petHair: 'none',
    furnishingState: service === 'move' ? 'empty' : undefined,
    frequency: 'once',
    extras: [],
  }).cleaningSubtotal;
}

export function formatCurrency(amount: number, locale: 'fr' | 'en'): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: pricingConfig.currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Regular ↔ Deep recommendation/requirement logic, based on how long it's
 * been since the home's last thorough (deep-level) clean. This never
 * changes the computed price — it only drives step-3 UI messaging and,
 * for the "must be Deep" case, blocks continuing with Regular selected.
 * `unknown` never penalizes the client.
 */
export type DeepRecommendationLevel = 'none' | 'recommended' | 'required';

export function getDeepRecommendationLevel(lastCleaning: LastCleaning): DeepRecommendationLevel {
  if (lastCleaning === '3to6months') return 'recommended';
  if (lastCleaning === 'over6months' || lastCleaning === 'over1year') return 'required';
  return 'none';
}
