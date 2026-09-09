import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import * as stripeModule from '@/lib/payments/stripe';
import { getBookingByConfirmationNumber } from '@/lib/db/repositories/bookings';
import { isSupabaseConfigured } from '@/lib/db/client';

/**
 * ============================================================================
 *  V1.1 — manual review is a hard gate, enforced server-side
 * ============================================================================
 * These tests exercise the actual POST handler (not just calculatePricing)
 * to prove items 16-18 of the V1.1 spec: a manual-review job never gets a
 * PaymentIntent, is never stored as `confirmed`, and the normal path still
 * recomputes price server-side from the validated selection alone.
 * ============================================================================
 */

/** A date far enough out to satisfy booking-rules' lead-time/business-day checks, whatever day this test runs. */
function bookableDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1); // booking-rules closes Sundays by default
  return d.toISOString().slice(0, 10);
}

function validPayload(selectionOverrides: Record<string, unknown> = {}) {
  return {
    locale: 'fr',
    selection: {
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
      extras: [],
      date: bookableDateIso(),
      timeWindowId: 'morning',
      ...selectionOverrides,
    },
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
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/bookings — normal (no manual review) path', () => {
  it('18. recomputes price server-side and returns an awaiting_payment booking with a PaymentIntent', async () => {
    // Phase 2 — real Stripe isn't connected yet, so a normal booking is
    // persisted as `awaiting_payment`, never `confirmed` (see
    // BOOKING_STATUSES in src/lib/booking/status.ts and the "BOOKING
    // STATUSES" requirement of the Phase 2 spec). `confirmed` is reserved
    // for once a real payment actually succeeds in a future phase.
    const createPaymentIntentSpy = vi.spyOn(stripeModule, 'createPaymentIntent');
    const response = await POST(makeRequest(validPayload()));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.booking.status).toBe('awaiting_payment');
    expect(data.booking.status).not.toBe('confirmed');
    expect(data.booking.pricing.total).toBeGreaterThan(0);
    expect(data.payment.provider).toBe('mock');
    expect(createPaymentIntentSpy).toHaveBeenCalledTimes(1);
  });

  it('20. tells the client the confirmation email is in mock mode, so the UI never claims a real email was sent', async () => {
    const response = await POST(makeRequest(validPayload()));
    const data = await response.json();
    // No EMAIL_PROVIDER_API_KEY is set in the test environment, so this must be 'mock'.
    expect(data.email.provider).toBe('mock');
  });

  it('a larger (but not "+"-bucket) home is priced higher than a smaller one — proves the server, not the client, drives the number', async () => {
    const small = await (await POST(makeRequest(validPayload({ bedrooms: 0, sqftBucket: 'under750' })))).json();
    const larger = await (
      await POST(makeRequest(validPayload({ bedrooms: 3, fullBathrooms: 2, sqftBucket: '2000_2499' })))
    ).json();
    expect(larger.booking.pricing.total).toBeGreaterThan(small.booking.pricing.total);
  });
});

describe('POST /api/bookings — V1.1 manual review gate', () => {
  it('11. 3000+ sq ft returns review_required (202) instead of a confirmed booking', async () => {
    const response = await POST(makeRequest(validPayload({ sqftBucket: '3000plus' })));
    const data = await response.json();
    expect(response.status).toBe(202);
    expect(data.reviewRequired).toBe(true);
    expect(data.status).toBe('pending_review');
    expect(data.manualReviewReasons).toContain('large_sqft');
  });

  it('12-15. any "+"-bucket answer (6+ bedrooms, 4+ full baths, 3+ half baths, 3+ floors) triggers review_required', async () => {
    const cases: Record<string, unknown>[] = [
      { bedrooms: 6 },
      { fullBathrooms: 4 },
      { halfBathrooms: 3 },
      { housingType: 'house', floors: 3 },
    ];
    for (const overrides of cases) {
      const response = await POST(makeRequest(validPayload(overrides)));
      const data = await response.json();
      expect(response.status).toBe(202);
      expect(data.reviewRequired).toBe(true);
    }
  });

  it('16. never creates a PaymentIntent for a manual-review job', async () => {
    const createPaymentIntentSpy = vi.spyOn(stripeModule, 'createPaymentIntent');
    await POST(makeRequest(validPayload({ sqftBucket: '3000plus' })));
    expect(createPaymentIntentSpy).not.toHaveBeenCalled();
  });

  it('17. never stores a manual-review job as "confirmed" — it is saved as pending_review, unpaid', async () => {
    const response = await POST(makeRequest(validPayload({ bedrooms: 6 })));
    const data = await response.json();
    expect(data.status).toBe('pending_review');

    const stored = await getBookingByConfirmationNumber(data.confirmationNumber);
    expect(stored).not.toBeNull();
    expect(stored?.status).toBe('pending_review');
    expect(stored?.status).not.toBe('confirmed');
    expect(stored?.paymentStatus).toBe('unpaid');
  });

  it('a review-required response never includes a payment or email field — no money moved, no email claimed', async () => {
    const response = await POST(makeRequest(validPayload({ sqftBucket: '3000plus' })));
    const data = await response.json();
    expect(data.payment).toBeUndefined();
    expect(data.email).toBeUndefined();
  });
});

describe('POST /api/bookings — Phase 2: server-side data integrity', () => {
  it('a price sent by the browser is ignored — the response total matches an unmodified request', async () => {
    const withBogusPrice = makeRequest({
      ...validPayload(),
      selection: { ...validPayload().selection, total: 1, price: 1, totalPrice: 1 },
    });
    const clean = await (await POST(makeRequest(validPayload()))).json();
    const tampered = await (await POST(withBogusPrice)).json();
    expect(tampered.booking.pricing.total).toBe(clean.booking.pricing.total);
    expect(tampered.booking.pricing.total).not.toBe(1);
  });

  it('taxes sent by the browser are ignored — gst/qst always come from the server recomputation', async () => {
    const withBogusTax = makeRequest({
      ...validPayload(),
      selection: { ...validPayload().selection, taxAmount: 0, gstAmount: 0, qstAmount: 0 },
    });
    const response = await POST(withBogusTax);
    const data = await response.json();
    expect(data.booking.pricing.taxAmount).toBeGreaterThan(0);
  });

  it('person-hours sent by the browser are ignored — the stored snapshot always comes from calculatePricing()', async () => {
    const withBogusHours = makeRequest({
      ...validPayload(),
      selection: { ...validPayload().selection, estimatedPersonHours: 999, baseCleaningPersonHours: 999 },
    });
    const response = await POST(withBogusHours);
    const data = await response.json();
    const stored = await getBookingByConfirmationNumber(data.booking.confirmationNumber);
    expect(stored?.pricingSnapshot?.estimatedPersonHours).toBeLessThan(999);
  });

  it('persists an immutable pricing snapshot (pricing_version + hours + crew size) alongside the customer-facing total', async () => {
    const response = await POST(makeRequest(validPayload()));
    const data = await response.json();
    const stored = await getBookingByConfirmationNumber(data.booking.confirmationNumber);
    expect(stored?.pricingSnapshot).toBeDefined();
    expect(stored?.pricingSnapshot?.pricingVersion).toBe('v1.1');
    expect(stored?.pricingSnapshot?.estimatedPersonHours).toBeGreaterThan(0);
    expect(stored?.pricingSnapshot?.recommendedCrewSize).toBeGreaterThanOrEqual(1);
  });

  it('persists a snapshot row per selected extra, with unit price and hours matching the pricing config', async () => {
    const response = await POST(
      makeRequest(validPayload({ extras: [{ id: 'inside-oven', quantity: 1 }, { id: 'interior-windows', quantity: 3 }] }))
    );
    const data = await response.json();
    const stored = await getBookingByConfirmationNumber(data.booking.confirmationNumber);
    expect(stored?.extras).toHaveLength(2);
    const oven = stored?.extras?.find((e) => e.extraId === 'inside-oven');
    expect(oven?.unitPriceSnapshot).toBe(40);
    expect(oven?.totalPriceSnapshot).toBe(40);
    const windows = stored?.extras?.find((e) => e.extraId === 'interior-windows');
    expect(windows?.quantity).toBe(3);
    expect(windows?.totalPriceSnapshot).toBe(30); // 3 windows x $10
  });

  it('the same customer email booking twice is stored under a single customer id (dedup)', async () => {
    const first = await (await POST(makeRequest(validPayload()))).json();
    const second = await (
      await POST(makeRequest(validPayload({ bedrooms: 3 })))
    ).json();
    const firstStored = await getBookingByConfirmationNumber(first.booking.confirmationNumber);
    const secondStored = await getBookingByConfirmationNumber(second.booking.confirmationNumber);
    expect(firstStored?.customerId).toBeDefined();
    expect(firstStored?.customerId).toBe(secondStored?.customerId);
  });

  it('runs entirely in demo mode without any Supabase environment variables configured', async () => {
    expect(isSupabaseConfigured()).toBe(false);
    const response = await POST(makeRequest(validPayload()));
    expect(response.status).toBe(201);
  });
});
