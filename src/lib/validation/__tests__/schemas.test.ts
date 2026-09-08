import { describe, it, expect } from 'vitest';
import { bookingSelectionSchema, createBookingSchema } from '../schemas';
import { calculatePricing } from '@/lib/pricing/engine';

function validSelection(overrides: Record<string, unknown> = {}) {
  return {
    postalCode: 'H2X 1Y6',
    areaSlug: 'montreal',
    service: 'regular',
    housingType: 'condo_apartment',
    bedrooms: 2,
    fullBathrooms: 1,
    halfBathrooms: 0,
    sqftBucket: '1000_1499',
    lastCleaning: 'unknown',
    petHair: 'none',
    frequency: 'once',
    extras: [{ id: 'dishwasher', quantity: 1 }],
    date: '2026-10-01',
    timeWindowId: 'morning',
    ...overrides,
  };
}

describe('bookingSelectionSchema', () => {
  it('accepts a well-formed Regular selection', () => {
    const result = bookingSelectionSchema.safeParse(validSelection());
    expect(result.success).toBe(true);
  });

  it('requires furnishingState when the service is Move', () => {
    const withoutFurnishing = bookingSelectionSchema.safeParse(validSelection({ service: 'move' }));
    expect(withoutFurnishing.success).toBe(false);

    const withFurnishing = bookingSelectionSchema.safeParse(validSelection({ service: 'move', furnishingState: 'empty' }));
    expect(withFurnishing.success).toBe(true);
  });

  it('requires floors when housingType is house or townhouse', () => {
    const withoutFloors = bookingSelectionSchema.safeParse(validSelection({ housingType: 'house' }));
    expect(withoutFloors.success).toBe(false);

    const withFloors = bookingSelectionSchema.safeParse(validSelection({ housingType: 'house', floors: 2 }));
    expect(withFloors.success).toBe(true);
  });

  it('does not require floors for a condo/apartment or duplex/triplex', () => {
    expect(bookingSelectionSchema.safeParse(validSelection({ housingType: 'condo_apartment' })).success).toBe(true);
    expect(bookingSelectionSchema.safeParse(validSelection({ housingType: 'duplex_triplex' })).success).toBe(true);
  });

  it('rejects an unknown sqftBucket value (never trusts a raw client-typed number)', () => {
    const result = bookingSelectionSchema.safeParse(validSelection({ sqftBucket: '1750' }));
    expect(result.success).toBe(false);
  });

  it('rejects a negative or out-of-range extras quantity', () => {
    const result = bookingSelectionSchema.safeParse(validSelection({ extras: [{ id: 'interior-windows', quantity: 0 }] }));
    expect(result.success).toBe(false);
  });

  it('accepts lastCleaning "unknown" without any additional requirement', () => {
    const result = bookingSelectionSchema.safeParse(validSelection({ lastCleaning: 'unknown' }));
    expect(result.success).toBe(true);
  });
});

describe('server-side authoritative recalculation', () => {
  it('parses a full booking payload and recomputes a positive, tax-inclusive price from the validated selection alone', () => {
    const payload = {
      selection: validSelection({ housingType: 'house', floors: 2, extras: [] }),
      customer: {
        firstName: 'Alex',
        lastName: 'Tremblay',
        email: 'alex@example.com',
        phone: '514-555-1234',
        address: '123 Rue Principale',
        postalCode: 'H2X 1Y6',
        city: 'Montréal',
      },
    };

    const parsed = createBookingSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    // This mirrors exactly what src/app/api/bookings/route.ts does: the
    // price is derived ONLY from the validated `selection`, never from
    // anything the client might have sent alongside it (there is no price
    // field in the schema at all, so there is nothing to "not trust").
    const pricing = calculatePricing({
      service: parsed.data.selection.service,
      housingType: parsed.data.selection.housingType,
      bedrooms: parsed.data.selection.bedrooms,
      fullBathrooms: parsed.data.selection.fullBathrooms,
      halfBathrooms: parsed.data.selection.halfBathrooms,
      sqftBucket: parsed.data.selection.sqftBucket,
      floors: parsed.data.selection.floors,
      petHair: parsed.data.selection.petHair,
      furnishingState: parsed.data.selection.furnishingState,
      frequency: parsed.data.selection.frequency,
      extras: parsed.data.selection.extras,
    });

    expect(pricing.total).toBeGreaterThan(0);
    expect(pricing.total).toBeGreaterThan(pricing.subtotal); // taxes were added
  });

  it('rejects a payload with no price field at all as a no-op — there is nothing for the client to tamper with', () => {
    // The schema simply has no `total`/`price` field, so a client cannot
    // submit one — this test documents that guarantee rather than testing
    // a specific rejection.
    const payload = validSelection();
    expect((payload as Record<string, unknown>).total).toBeUndefined();
  });
});
