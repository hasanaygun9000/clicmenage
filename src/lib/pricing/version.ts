/**
 * Pricing Engine version tag, stamped onto every booking's immutable
 * pricing snapshot (see BookingPricingSnapshot in src/lib/booking/types.ts
 * and requirement 6 of the Phase 2 backend spec). Purely additive — does
 * not change any Pricing Engine V1.1 calculation. Bump this only when
 * pricing-config.ts's formula changes in a way that would produce
 * different numbers for the same inputs, so old bookings stay
 * distinguishable from new ones even though their stored numbers never
 * change either way.
 */
export const PRICING_VERSION = 'v1.1';
