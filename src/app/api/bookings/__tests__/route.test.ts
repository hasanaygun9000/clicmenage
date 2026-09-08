import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import * as stripeModule from '@/lib/payments/stripe';
import { getBookingByConfirmationNumber } from '@/lib/db/bookings';

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
  it('18. recomputes price server-side and returns a confirmed, paid booking with a PaymentIntent', async () => {
    const createPaymentIntentSpy = vi.spyOn(stripeModule, 'createPaymentIntent');
    const response = await POST(makeRequest(validPayload()));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.booking.status).toBe('confirmed');
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
