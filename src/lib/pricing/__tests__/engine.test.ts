import { describe, it, expect } from 'vitest';
import { calculatePricing, getDeepRecommendationLevel, type PricingInput } from '../engine';
import { pricingConfig } from '../pricing-config';
import { getExtrasForService } from '@/lib/config/extras';

/** A minimal, valid PricingInput — individual tests override only what they're testing. */
function baseInput(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    service: 'regular',
    housingType: 'condo_apartment',
    bedrooms: 1,
    fullBathrooms: 1,
    halfBathrooms: 0,
    sqftBucket: 'under750',
    petHair: 'none',
    frequency: 'once',
    extras: [],
    ...overrides,
  };
}

describe('calculatePricing — home size scenarios', () => {
  it('prices a studio Regular cleaning using the studio anchor hours', () => {
    const result = calculatePricing(baseInput({ bedrooms: 0 }));
    expect(result.estimatedPersonHours).toBeCloseTo(pricingConfig.referenceHours.regular.studioOneBath, 5);
    expect(result.cleaningSubtotal).toBe(145);
    expect(result.manualReviewRequired).toBe(false);
  });

  it('prices a 1 bedroom / 1 bathroom Regular cleaning using the 1-bed anchor', () => {
    const result = calculatePricing(baseInput({ bedrooms: 1, fullBathrooms: 1 }));
    expect(result.estimatedPersonHours).toBeCloseTo(pricingConfig.referenceHours.regular.oneBedOneBath, 5);
    expect(result.cleaningSubtotal).toBe(170);
  });

  it('prices a 2 bedroom / 1 bathroom Regular cleaning higher than 1bed/1bath', () => {
    const oneBed = calculatePricing(baseInput({ bedrooms: 1, fullBathrooms: 1 }));
    const twoBed = calculatePricing(baseInput({ bedrooms: 2, fullBathrooms: 1, sqftBucket: '1000_1499' }));
    expect(twoBed.cleaningSubtotal).toBeGreaterThan(oneBed.cleaningSubtotal);
    expect(twoBed.cleaningSubtotal).toBe(205);
  });

  it('prices a 2 bedroom / 2 bathroom Regular cleaning higher than 2bed/1bath', () => {
    const oneBath = calculatePricing(baseInput({ bedrooms: 2, fullBathrooms: 1, sqftBucket: '1000_1499' }));
    const twoBath = calculatePricing(baseInput({ bedrooms: 2, fullBathrooms: 2, sqftBucket: '1000_1499' }));
    expect(twoBath.cleaningSubtotal).toBeGreaterThan(oneBath.cleaningSubtotal);
    expect(twoBath.cleaningSubtotal).toBe(230);
  });

  it('adds hours (and price) for a half bathroom', () => {
    const withoutHalfBath = calculatePricing(baseInput({ bedrooms: 2, fullBathrooms: 1, halfBathrooms: 0 }));
    const withHalfBath = calculatePricing(baseInput({ bedrooms: 2, fullBathrooms: 1, halfBathrooms: 1 }));
    expect(withHalfBath.estimatedPersonHours).toBeGreaterThan(withoutHalfBath.estimatedPersonHours);
    expect(withHalfBath.estimatedPersonHours - withoutHalfBath.estimatedPersonHours).toBeCloseTo(
      pricingConfig.hourIncrements.regular.perHalfBathroom,
      5
    );
  });

  it('adds hours for larger square footage buckets, but nothing under 1000 sq ft or when unknown', () => {
    const under750 = calculatePricing(baseInput({ sqftBucket: 'under750' }));
    const from750to999 = calculatePricing(baseInput({ sqftBucket: '750_999' }));
    const unknown = calculatePricing(baseInput({ sqftBucket: 'unknown' }));
    const large = calculatePricing(baseInput({ sqftBucket: '2500_2999' }));

    expect(from750to999.estimatedPersonHours).toBe(under750.estimatedPersonHours);
    expect(unknown.estimatedPersonHours).toBe(under750.estimatedPersonHours);
    expect(large.estimatedPersonHours).toBeGreaterThan(under750.estimatedPersonHours);
  });

  it('flags 3000+ sq ft for manual review instead of silently promising a final price', () => {
    const result = calculatePricing(baseInput({ sqftBucket: '3000plus' }));
    expect(result.manualReviewRequired).toBe(true);
    expect(result.manualReviewReason).toEqual(['large_sqft']);
    // Still returns a usable (floor) estimate rather than throwing or zeroing out.
    expect(result.cleaningSubtotal).toBeGreaterThan(0);
  });

  it('adds hours for each floor beyond the first, for houses only', () => {
    const oneFloor = calculatePricing(baseInput({ housingType: 'house', floors: 1 }));
    const twoFloors = calculatePricing(baseInput({ housingType: 'house', floors: 2 }));
    expect(twoFloors.estimatedPersonHours - oneFloor.estimatedPersonHours).toBeCloseTo(pricingConfig.floorsHourIncrement.regular, 5);

    // Floors are never applied for a condo/apartment, even if a value is passed defensively.
    const condoWithFloorsIgnored = calculatePricing(baseInput({ housingType: 'condo_apartment', floors: 3 }));
    const condoBaseline = calculatePricing(baseInput({ housingType: 'condo_apartment' }));
    expect(condoWithFloorsIgnored.estimatedPersonHours).toBe(condoBaseline.estimatedPersonHours);
  });

  it('adds hours for heavy pet hair, but not for "some"', () => {
    const none = calculatePricing(baseInput({ petHair: 'none' }));
    const some = calculatePricing(baseInput({ petHair: 'some' }));
    const heavy = calculatePricing(baseInput({ petHair: 'heavy' }));
    expect(some.estimatedPersonHours).toBe(none.estimatedPersonHours);
    expect(heavy.estimatedPersonHours - none.estimatedPersonHours).toBeCloseTo(pricingConfig.petHairHourAdjustments.regular.heavy, 5);
  });
});

describe('calculatePricing — frequency discounts', () => {
  it('applies no discount for a one-time booking', () => {
    const result = calculatePricing(baseInput({ frequency: 'once' }));
    expect(result.frequencyDiscountRate).toBe(0);
    expect(result.frequencyDiscountAmount).toBe(0);
  });

  it('applies a 15% discount for weekly bookings', () => {
    const result = calculatePricing(baseInput({ frequency: 'weekly' }));
    expect(result.frequencyDiscountRate).toBe(0.15);
    expect(result.frequencyDiscountAmount).toBeCloseTo(result.cleaningSubtotal * 0.15, 2);
  });

  it('applies a 10% discount for biweekly bookings', () => {
    const result = calculatePricing(baseInput({ frequency: 'biweekly' }));
    expect(result.frequencyDiscountRate).toBe(0.1);
  });

  it('applies a 5% discount for every-4-weeks ("monthly") bookings', () => {
    const result = calculatePricing(baseInput({ frequency: 'every4weeks' }));
    expect(result.frequencyDiscountRate).toBe(0.05);
  });

  it('never uses reportedOperationalHours as the price driver — only estimatedPersonHours does', () => {
    const once = calculatePricing(baseInput({ frequency: 'once' }));
    const weekly = calculatePricing(baseInput({ frequency: 'weekly' }));
    // Same job size → same estimated hours and same pre-discount cleaning price, regardless of frequency.
    expect(weekly.estimatedPersonHours).toBe(once.estimatedPersonHours);
    expect(weekly.cleaningSubtotal).toBe(once.cleaningSubtotal);
    // But the reduced reporting figure does differ.
    expect(weekly.reportedOperationalHours).toBeLessThan(once.reportedOperationalHours);
  });
});

describe('getDeepRecommendationLevel', () => {
  it('recommends (but does not require) Deep between 3 and 6 months', () => {
    expect(getDeepRecommendationLevel('3to6months')).toBe('recommended');
  });

  it('requires Deep for a first booking after more than 6 months', () => {
    expect(getDeepRecommendationLevel('over6months')).toBe('required');
  });

  it('requires Deep for a first booking after more than a year', () => {
    expect(getDeepRecommendationLevel('over1year')).toBe('required');
  });

  it('never penalizes the client for not knowing', () => {
    expect(getDeepRecommendationLevel('unknown')).toBe('none');
  });

  it('has no recommendation for a recently-cleaned home', () => {
    expect(getDeepRecommendationLevel('under1month')).toBe('none');
    expect(getDeepRecommendationLevel('1to3months')).toBe('none');
  });
});

describe('calculatePricing — Move-In/Out furnishing state', () => {
  const moveBase = { service: 'move' as const, furnishingState: undefined };

  it('prices an empty home as the baseline (multiplier of 1)', () => {
    const empty = calculatePricing(baseInput({ ...moveBase, furnishingState: 'empty' }));
    const noFurnishingState = calculatePricing(baseInput({ ...moveBase }));
    expect(empty.estimatedPersonHours).toBe(noFurnishingState.estimatedPersonHours);
  });

  it('prices a partly-furnished home higher than empty', () => {
    const empty = calculatePricing(baseInput({ ...moveBase, furnishingState: 'empty' }));
    const partly = calculatePricing(baseInput({ ...moveBase, furnishingState: 'partly_furnished' }));
    expect(partly.estimatedPersonHours).toBeGreaterThan(empty.estimatedPersonHours);
    // estimatedPersonHours is rounded to 2 decimals, so compare loosely rather than bit-exact.
    expect(partly.estimatedPersonHours).toBeCloseTo(empty.estimatedPersonHours * 1.15, 1);
  });

  it('prices a furnished home higher than partly-furnished', () => {
    const partly = calculatePricing(baseInput({ ...moveBase, furnishingState: 'partly_furnished' }));
    const furnished = calculatePricing(baseInput({ ...moveBase, furnishingState: 'furnished' }));
    expect(furnished.estimatedPersonHours).toBeGreaterThan(partly.estimatedPersonHours);
    const empty = calculatePricing(baseInput({ ...moveBase, furnishingState: 'empty' }));
    expect(furnished.estimatedPersonHours).toBeCloseTo(empty.estimatedPersonHours * 1.3, 1);
  });

  it('never offers inside-oven, inside-fridge, or inside-empty-cabinets as extras for Move (already included)', () => {
    const moveExtras = getExtrasForService('move').map((e) => e.id);
    expect(moveExtras).not.toContain('inside-oven');
    expect(moveExtras).not.toContain('inside-fridge');
    expect(moveExtras).not.toContain('inside-empty-cabinets');

    // But those same extras ARE offered for Regular and Deep.
    const regularExtras = getExtrasForService('regular').map((e) => e.id);
    const deepExtras = getExtrasForService('deep').map((e) => e.id);
    for (const id of ['inside-oven', 'inside-fridge', 'inside-empty-cabinets']) {
      expect(regularExtras).toContain(id);
      expect(deepExtras).toContain(id);
    }
  });
});

describe('calculatePricing — extras, quantities, and taxes', () => {
  it('prices a flat extra once regardless of a stray quantity value', () => {
    const result = calculatePricing(baseInput({ extras: [{ id: 'dishwasher', quantity: 5 }] }));
    expect(result.extrasSubtotal).toBe(pricingConfig.extrasPricing.dishwasher!.price);
  });

  it('scales a per-window extra by quantity', () => {
    const one = calculatePricing(baseInput({ extras: [{ id: 'interior-windows', quantity: 1 }] }));
    const four = calculatePricing(baseInput({ extras: [{ id: 'interior-windows', quantity: 4 }] }));
    expect(four.extrasSubtotal).toBe(one.extrasSubtotal * 4);
  });

  it('computes GST and QST separately at the standard Quebec rates, on the post-discount subtotal', () => {
    const result = calculatePricing(baseInput());
    expect(result.gstAmount).toBeCloseTo(result.subtotal * pricingConfig.taxes.gst.rate, 2);
    expect(result.qstAmount).toBeCloseTo(result.subtotal * pricingConfig.taxes.qst.rate, 2);
    expect(result.taxAmount).toBeCloseTo(result.gstAmount + result.qstAmount, 2);
    expect(result.total).toBeCloseTo(result.subtotal + result.taxAmount, 2);
  });

  it('is always demo pricing', () => {
    expect(pricingConfig.isDemoPricing).toBe(true);
    expect(calculatePricing(baseInput()).isDemoPricing).toBe(true);
  });
});

describe('calculatePricing — reference price points (approximate, per spec)', () => {
  // These reproduce the 8 example home configurations from the spec, each
  // assumed at a realistic square-footage/floors profile for that size
  // (documented inline). Every service tier lands on or within one $5
  // rounding increment of its target — see pricing-config.ts for the
  // formula these numbers come from.
  const cases: { label: string; input: Omit<PricingInput, 'frequency' | 'extras'>; expected: { regular: number; deep: number; move: number } }[] = [
    {
      label: 'Studio',
      input: { service: 'regular', housingType: 'condo_apartment', bedrooms: 0, fullBathrooms: 1, halfBathrooms: 0, sqftBucket: 'under750', petHair: 'none' },
      expected: { regular: 145, deep: 260, move: 275 },
    },
    {
      label: '1 bed / 1 bath',
      input: { service: 'regular', housingType: 'condo_apartment', bedrooms: 1, fullBathrooms: 1, halfBathrooms: 0, sqftBucket: 'under750', petHair: 'none' },
      expected: { regular: 170, deep: 300, move: 315 },
    },
    {
      label: '2 bed / 1 bath',
      input: { service: 'regular', housingType: 'condo_apartment', bedrooms: 2, fullBathrooms: 1, halfBathrooms: 0, sqftBucket: '1000_1499', petHair: 'none' },
      expected: { regular: 205, deep: 360, move: 385 },
    },
    {
      label: '2 bed / 2 bath',
      input: { service: 'regular', housingType: 'condo_apartment', bedrooms: 2, fullBathrooms: 2, halfBathrooms: 0, sqftBucket: '1000_1499', petHair: 'none' },
      expected: { regular: 230, deep: 395, move: 430 },
    },
    {
      label: '3 bed / 1 bath',
      input: { service: 'regular', housingType: 'condo_apartment', bedrooms: 3, fullBathrooms: 1, halfBathrooms: 0, sqftBucket: '1000_1499', petHair: 'none' },
      expected: { regular: 220, deep: 385, move: 420 },
    },
    {
      label: '3 bed / 2 bath (larger, 2-floor house)',
      input: { service: 'regular', housingType: 'house', bedrooms: 3, fullBathrooms: 2, halfBathrooms: 0, sqftBucket: '1500_1999', floors: 2, petHair: 'none' },
      expected: { regular: 280, deep: 470, move: 515 },
    },
    {
      label: '4 bed / 2 bath (2-floor house)',
      input: { service: 'regular', housingType: 'house', bedrooms: 4, fullBathrooms: 2, halfBathrooms: 0, sqftBucket: '2000_2499', floors: 2, petHair: 'none' },
      expected: { regular: 320, deep: 530, move: 585 },
    },
    {
      label: '4 bed / 3 bath (2-floor house)',
      input: { service: 'regular', housingType: 'house', bedrooms: 4, fullBathrooms: 3, halfBathrooms: 0, sqftBucket: '2500_2999', floors: 2, petHair: 'none' },
      expected: { regular: 370, deep: 600, move: 665 },
    },
  ];

  it.each(cases)('$label lands within $5 of the reference price for each service tier', ({ input, expected }) => {
    for (const service of ['regular', 'deep', 'move'] as const) {
      const result = calculatePricing({
        ...input,
        service,
        furnishingState: service === 'move' ? 'empty' : undefined,
        frequency: 'once',
        extras: [],
      });
      expect(Math.abs(result.cleaningSubtotal - expected[service])).toBeLessThanOrEqual(5);
    }
  });
});

describe('calculatePricing — minimum booking amount and crew size', () => {
  it('never returns a subtotal below the minimum booking amount', () => {
    const result = calculatePricing(baseInput({ bedrooms: 0, frequency: 'weekly' }));
    expect(result.subtotal).toBeGreaterThanOrEqual(pricingConfig.minimumBookingAmount);
  });

  it('recommends a single cleaner for a small job and more for a large one', () => {
    const small = calculatePricing(baseInput({ bedrooms: 0 }));
    const large = calculatePricing(
      baseInput({ service: 'move', housingType: 'house', bedrooms: 6, fullBathrooms: 4, halfBathrooms: 2, sqftBucket: '3000plus', floors: 3, furnishingState: 'furnished' })
    );
    expect(small.recommendedCrewSize).toBe(1);
    expect(large.recommendedCrewSize).toBeGreaterThan(1);
  });
});

/**
 * ============================================================================
 *  V1.1 — extras operational hours, manual-review triggers
 * ============================================================================
 * The 20 required scenarios from the V1.1 spec. A few (Move never offering
 * oven/fridge/cabinets as extras; GST/QST computed correctly) are already
 * covered by the describe blocks above and are not duplicated here.
 * ============================================================================
 */
describe('calculatePricing — V1.1 extras operational hours', () => {
  it('1. Regular without extras: baseCleaningPersonHours, extrasPersonHours, and estimatedPersonHours all agree, no hours change', () => {
    const result = calculatePricing(baseInput());
    expect(result.extrasPersonHours).toBe(0);
    expect(result.estimatedPersonHours).toBe(result.baseCleaningPersonHours);
  });

  it('2. Regular + inside-oven: extrasPersonHours increases by exactly 0.75h, base and price unaffected', () => {
    const without = calculatePricing(baseInput());
    const withOven = calculatePricing(baseInput({ extras: [{ id: 'inside-oven', quantity: 1 }] }));
    expect(withOven.extrasPersonHours).toBeCloseTo(0.75, 5);
    expect(withOven.baseCleaningPersonHours).toBe(without.baseCleaningPersonHours);
    // No double-charging: the cleaning price itself never moves because of an extra's hours.
    expect(withOven.cleaningSubtotal).toBe(without.cleaningSubtotal);
  });

  it('3. Regular + inside-fridge: extrasPersonHours increases by exactly 0.50h', () => {
    const result = calculatePricing(baseInput({ extras: [{ id: 'inside-fridge', quantity: 1 }] }));
    expect(result.extrasPersonHours).toBeCloseTo(0.5, 5);
  });

  it('4. 10 interior windows: extrasPersonHours increases by exactly 1.50h (0.15h × 10)', () => {
    const result = calculatePricing(baseInput({ extras: [{ id: 'interior-windows', quantity: 10 }] }));
    expect(result.extrasPersonHours).toBeCloseTo(1.5, 5);
  });

  it('5. 2 loads of laundry: extrasPersonHours increases by exactly 0.50h active (0.25h × 2)', () => {
    const result = calculatePricing(baseInput({ extras: [{ id: 'laundry-wash-fold', quantity: 2 }] }));
    expect(result.extrasPersonHours).toBeCloseTo(0.5, 5);
  });

  it('6. 3 beds (change-bedsheets ×3): extrasPersonHours increases by exactly 0.45h (0.15h × 3)', () => {
    const result = calculatePricing(baseInput({ extras: [{ id: 'change-bedsheets', quantity: 3 }] }));
    expect(result.extrasPersonHours).toBeCloseTo(0.45, 5);
  });

  it('7. Multiple extras sum correctly (oven 0.75 + fridge 0.50 + dishwasher 0.20 = 1.45h)', () => {
    const result = calculatePricing(
      baseInput({
        extras: [
          { id: 'inside-oven', quantity: 1 },
          { id: 'inside-fridge', quantity: 1 },
          { id: 'dishwasher', quantity: 1 },
        ],
      })
    );
    expect(result.extrasPersonHours).toBeCloseTo(1.45, 5);
  });

  it('8. Weekly frequency reduces only the base cleaning time in reportedOperationalHours, never the extras time', () => {
    const withExtras = { extras: [{ id: 'inside-oven', quantity: 1 }] as const };
    const once = calculatePricing(baseInput({ frequency: 'once', extras: [...withExtras.extras] }));
    const weekly = calculatePricing(baseInput({ frequency: 'weekly', extras: [...withExtras.extras] }));

    // Same job, same extras → identical extrasPersonHours and estimatedPersonHours regardless of frequency.
    expect(weekly.extrasPersonHours).toBe(once.extrasPersonHours);
    expect(weekly.estimatedPersonHours).toBe(once.estimatedPersonHours);

    // The reduced reporting figure differs, and by exactly the base-hours reduction — extras pass through unreduced.
    const factor = pricingConfig.reportedOperationalHoursFactor.weekly;
    expect(weekly.reportedOperationalHours).toBeLessThan(once.reportedOperationalHours);
    expect(weekly.reportedOperationalHours).toBeCloseTo(weekly.baseCleaningPersonHours * factor + weekly.extrasPersonHours, 5);
    expect(once.reportedOperationalHours).toBeCloseTo(once.baseCleaningPersonHours * 1 + once.extrasPersonHours, 5);
  });

  it('9. Extras can push the recommended crew size from 1 to 2', () => {
    const withoutExtras = calculatePricing(baseInput({ bedrooms: 2, fullBathrooms: 1, sqftBucket: '1000_1499' }));
    const withExtras = calculatePricing(
      baseInput({
        bedrooms: 2,
        fullBathrooms: 1,
        sqftBucket: '1000_1499',
        extras: [
          { id: 'inside-oven', quantity: 1 },
          { id: 'inside-fridge', quantity: 1 },
          { id: 'inside-empty-cabinets', quantity: 1 },
          { id: 'second-kitchen', quantity: 1 },
        ],
      })
    );
    expect(withoutExtras.recommendedCrewSize).toBe(1);
    expect(withExtras.recommendedCrewSize).toBe(2);
  });
});

describe('calculatePricing — V1.1 "+"-bucket manual review triggers', () => {
  it('12. 6+ bedrooms triggers manual review with reason six_plus_bedrooms', () => {
    const result = calculatePricing(baseInput({ bedrooms: 6 }));
    expect(result.manualReviewRequired).toBe(true);
    expect(result.manualReviewReason).toContain('six_plus_bedrooms');
  });

  it('13. 4+ full bathrooms triggers manual review with reason four_plus_full_bathrooms', () => {
    const result = calculatePricing(baseInput({ fullBathrooms: 4 }));
    expect(result.manualReviewRequired).toBe(true);
    expect(result.manualReviewReason).toContain('four_plus_full_bathrooms');
  });

  it('14. 3+ half bathrooms triggers manual review with reason three_plus_half_bathrooms', () => {
    const result = calculatePricing(baseInput({ halfBathrooms: 3 }));
    expect(result.manualReviewRequired).toBe(true);
    expect(result.manualReviewReason).toContain('three_plus_half_bathrooms');
  });

  it('15. 3+ floors (house/townhouse only) triggers manual review with reason three_plus_floors', () => {
    const result = calculatePricing(baseInput({ housingType: 'house', floors: 3 }));
    expect(result.manualReviewRequired).toBe(true);
    expect(result.manualReviewReason).toContain('three_plus_floors');

    // Never triggered for a condo/apartment, which never asks about floors.
    const condo = calculatePricing(baseInput({ housingType: 'condo_apartment' }));
    expect(condo.manualReviewReason).not.toContain('three_plus_floors');
  });

  it('multiple "+" triggers can apply at once, and each still uses its bucket minimum for the estimate', () => {
    const result = calculatePricing(baseInput({ bedrooms: 6, fullBathrooms: 4, halfBathrooms: 3 }));
    expect(result.manualReviewReason).toEqual(
      expect.arrayContaining(['six_plus_bedrooms', 'four_plus_full_bathrooms', 'three_plus_half_bathrooms'])
    );
    // Still returns a usable (floor) estimate rather than throwing or zeroing out.
    expect(result.cleaningSubtotal).toBeGreaterThan(0);
  });

  it('does not require manual review for a normal-sized home', () => {
    const result = calculatePricing(baseInput());
    expect(result.manualReviewRequired).toBe(false);
    expect(result.manualReviewReason).toEqual([]);
  });
});
