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

  const booking: Booking = {
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

  await Promise.all([
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

  return NextResponse.json({ booking, payment: { provider: paymentIntent.provider } }, { status: 201 });
}
