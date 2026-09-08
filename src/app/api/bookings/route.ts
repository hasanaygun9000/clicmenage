import { NextRequest, NextResponse } from 'next/server';
import { createBookingSchema } from '@/lib/validation/schemas';
import { matchServiceAreaByPostalCode } from '@/lib/config/service-areas';
import { isBookableDate } from '@/lib/config/booking-rules';
import { calculatePricing } from '@/lib/pricing/engine';
import { createPaymentIntent } from '@/lib/payments/stripe';
import { sendEmail } from '@/lib/email/provider';
import { createBookingRecord } from '@/lib/db/bookings';
import { generateConfirmationNumber } from '@/lib/utils';
import { business } from '@/lib/config/business';
import type { Booking } from '@/lib/booking/types';

/**
 * ============================================================================
 *  POST /api/bookings — create a booking
 * ============================================================================
 * SECURITY: the client NEVER sends a price. Only the booking configuration
 * (selection + customer) is sent; the authoritative price is always
 * recomputed here from src/lib/pricing/engine.ts using the SAME server-side
 * pricing config the client used to render its live estimate. This route
 * is the only place a booking's price is trusted.
 *
 * V1.1: the client also never gets to decide whether a job needs manual
 * review — `pricing.manualReviewRequired` is recomputed here from the same
 * trusted inputs, and it is a hard gate: see the block below. A flagged
 * job never gets a PaymentIntent and is never stored as `confirmed`.
 * ============================================================================
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', issues: parsed.error.flatten() }, { status: 422 });
  }

  const { selection, customer } = parsed.data;

  // Re-derive the service area from the postal code server-side — never
  // trust a client-supplied areaSlug.
  const matchedArea = matchServiceAreaByPostalCode(selection.postalCode);
  if (!matchedArea) {
    return NextResponse.json({ error: 'out_of_service_area' }, { status: 422 });
  }

  const appointmentDate = new Date(`${selection.date}T00:00:00`);
  if (Number.isNaN(appointmentDate.getTime()) || !isBookableDate(appointmentDate)) {
    return NextResponse.json({ error: 'invalid_appointment_date' }, { status: 422 });
  }

  const pricing = calculatePricing({
    service: selection.service,
    housingType: selection.housingType,
    bedrooms: selection.bedrooms,
    fullBathrooms: selection.fullBathrooms,
    halfBathrooms: selection.halfBathrooms,
    sqftBucket: selection.sqftBucket,
    floors: selection.floors,
    petHair: selection.petHair,
    furnishingState: selection.furnishingState,
    frequency: selection.frequency,
    extras: selection.extras,
  });

  const bookingBase = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    confirmationNumber: generateConfirmationNumber(),
    createdAt: new Date().toISOString(),
    selection: { ...selection, areaSlug: matchedArea.slug },
    customer,
    pricing: {
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      total: pricing.total,
      currency: pricing.currency,
    },
  };

  // ============================================================================
  // V1.1 — MANUAL REVIEW GATE
  // ============================================================================
  // A home flagged for manual review (very large sq ft, or any of the "+"
  // bucket answers in step 3 — 6+ bedrooms, 4+ full bathrooms, 3+ half
  // bathrooms, 3+ floors) never reaches payment or a "confirmed" status
  // here. This is enforced server-side, not just hidden in the UI: no
  // PaymentIntent is created and no money moves. The booking is stored as
  // a minimal `pending_review` record (existing in-memory store — no new
  // persistence layer) so it isn't lost, and the API tells the client
  // plainly that this is a verification request, not a confirmed booking.
  // ============================================================================
  if (pricing.manualReviewRequired) {
    const reviewBooking: Booking = {
      ...bookingBase,
      status: 'pending_review',
      paymentStatus: 'unpaid',
    };
    await createBookingRecord(reviewBooking);

    return NextResponse.json(
      {
        reviewRequired: true,
        confirmationNumber: reviewBooking.confirmationNumber,
        status: reviewBooking.status,
        manualReviewReasons: pricing.manualReviewReason,
      },
      { status: 202 }
    );
  }

  const booking: Booking = {
    ...bookingBase,
    status: 'confirmed',
    paymentStatus: 'unpaid',
  };

  const paymentIntent = await createPaymentIntent({
    amount: Math.round(pricing.total * 100),
    currency: pricing.currency,
    bookingId: booking.id,
    customerEmail: customer.email,
  });

  booking.paymentStatus = paymentIntent.status === 'succeeded' || paymentIntent.status === 'mock_succeeded' ? 'paid' : 'authorized';

  await createBookingRecord(booking);

  const [confirmationEmailResult] = await Promise.all([
    sendEmail({
      to: customer.email,
      template: 'booking_confirmation',
      data: { booking },
    }),
    sendEmail({
      to: business.internalNotificationEmail,
      template: 'new_booking_business_alert',
      data: { booking },
    }),
  ]);

  return NextResponse.json(
    {
      booking,
      payment: { provider: paymentIntent.provider },
      // Lets the client show an honest confirmation message — never claim a
      // real email was sent while the email provider is still in mock mode.
      email: { provider: confirmationEmailResult.provider },
    },
    { status: 201 }
  );
}
