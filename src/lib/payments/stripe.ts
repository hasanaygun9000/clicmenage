/**
 * ============================================================================
 *  PAYMENT PROVIDER ABSTRACTION — ClicMénage
 * ============================================================================
 * The booking flow (src/app/api/bookings/route.ts) calls `createPaymentIntent`
 * without knowing whether Stripe is actually configured. This keeps the rest
 * of the app decoupled from the payment provider and lets development
 * continue with zero Stripe credentials.
 *
 * TO ENABLE REAL STRIPE PAYMENTS:
 *   1. `npm install stripe`
 *   2. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in
 *      .env.local (see .env.example).
 *   3. Replace the mock branch below with a real
 *      `new Stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.create(...)`
 *      call, and wire the returned client secret into a real Stripe
 *      Elements / Payment Element form in the booking step 9 component.
 *
 * Until then, `isStripeConfigured()` is false, and the booking flow runs in
 * a clearly-labeled mock mode: bookings are created and confirmed, but no
 * money moves. Never commit real secret keys — they belong in .env.local
 * only, which is gitignored.
 * ============================================================================
 */

export interface CreatePaymentIntentParams {
  amount: number; // in the smallest currency unit (cents)
  currency: string;
  bookingId: string;
  customerEmail: string;
}

export interface PaymentIntentResult {
  provider: 'stripe' | 'mock';
  clientSecret: string | null;
  paymentIntentId: string;
  status: 'requires_payment_method' | 'succeeded' | 'mock_succeeded';
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Creates a payment intent (or a mock stand-in) for a booking total.
 * Server-side only — never call with a client-supplied amount; the caller
 * (the bookings API route) must compute `amount` from the pricing engine.
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
  if (!isStripeConfigured()) {
    // Mock mode: no external call, no real charge. Safe default for local
    // development and for demoing the booking flow before Stripe is set up.
    return {
      provider: 'mock',
      clientSecret: null,
      paymentIntentId: `mock_pi_${params.bookingId}`,
      status: 'mock_succeeded',
    };
  }

  // Real Stripe integration point. Left unimplemented until Stripe
  // credentials are supplied and the `stripe` package is installed, so the
  // rest of the app never has to guess whether Stripe is wired up.
  throw new Error(
    'STRIPE_SECRET_KEY is set but the Stripe SDK integration has not been implemented yet. ' +
      'Install the `stripe` package and complete createPaymentIntent() in src/lib/payments/stripe.ts.'
  );
}
