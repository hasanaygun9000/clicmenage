/**
 * ============================================================================
 *  BOOKING STATUS — centralized (Phase 2 / Supabase backend foundation)
 * ============================================================================
 * The single source of truth for every booking status string used anywhere
 * in the app (API routes, the repository layer, tests). Nothing should
 * write a status literal like `'awaiting_payment'` by hand elsewhere —
 * import BOOKING_STATUSES / BookingStatus from here instead, so a typo or
 * a forgotten status never silently creates a ninth, uncatalogued state.
 *
 * V1 statuses (this phase only prepares the data model — no admin UI moves
 * a booking through most of these yet; they exist so the schema doesn't
 * need another migration when that UI is built):
 *   - pending_review    a manual-review job (V1.1) awaiting a human look —
 *                        never paid, never treated as confirmed.
 *   - awaiting_payment   a normal (non-manual-review) booking, recomputed
 *                        and persisted server-side. Real Stripe isn't
 *                        connected yet (Phase 2 scope), so a normal booking
 *                        stops here rather than becoming `confirmed`.
 *   - confirmed          reserved for once a real payment actually succeeds
 *                        (future phase).
 *   - assigned            a cleaner/team has been assigned to the job.
 *   - in_progress         the cleaning visit is underway.
 *   - completed           the visit is done.
 *   - cancelled           the booking was cancelled (by customer or ClicMénage).
 *   - issue                something went wrong and needs human attention.
 * ============================================================================
 */
export const BOOKING_STATUSES = [
  'pending_review',
  'awaiting_payment',
  'confirmed',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'issue',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export type PaymentStatus = 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';

export const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'authorized', 'paid', 'refunded', 'failed'];
