import type { Booking } from '@/lib/booking/types';

/**
 * ============================================================================
 *  BOOKING PERSISTENCE LAYER — ClicMénage
 * ============================================================================
 * This module is the ONLY place that reads/writes booking records. The API
 * routes call these functions instead of touching storage directly, so the
 * storage backend can be swapped later without touching route handlers.
 *
 * CURRENT BACKEND: in-memory array (development/demo only). Bookings are
 * lost on server restart and are NOT shared across serverless instances —
 * this is intentional so the full booking flow can be built, tested, and
 * demoed with zero database credentials.
 *
 * TO ENABLE A REAL DATABASE (Supabase recommended — generous free tier,
 * hosted Postgres, easy to maintain):
 *   1. `npm install @supabase/supabase-js`
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 *      .env.local (see .env.example).
 *   3. Create a `bookings` table matching the `Booking` shape in
 *      src/lib/booking/types.ts (id, confirmation_number, created_at,
 *      selection jsonb, customer jsonb, pricing jsonb, status,
 *      payment_status, notes, assigned_team_id).
 *   4. Replace the function bodies below with Supabase client calls.
 *
 * FUTURE: `assignedTeamId` on the Booking type is already reserved so a
 * cleaner/team-assignment feature can be added later without a schema
 * rewrite — see section on cleaner/team support in the README.
 * ============================================================================
 */

// Module-level store: persists for the lifetime of the server process.
const bookingsStore: Booking[] = [];

export async function createBookingRecord(booking: Booking): Promise<Booking> {
  bookingsStore.push(booking);
  return booking;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  return bookingsStore.find((b) => b.id === id) ?? null;
}

export async function getBookingByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
  return bookingsStore.find((b) => b.confirmationNumber === confirmationNumber) ?? null;
}

export async function listBookings(): Promise<Booking[]> {
  return [...bookingsStore].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateBookingStatus(
  id: string,
  updates: Partial<Pick<Booking, 'status' | 'paymentStatus' | 'notes' | 'assignedTeamId'>>
): Promise<Booking | null> {
  const booking = bookingsStore.find((b) => b.id === id);
  if (!booking) return null;
  Object.assign(booking, updates);
  return booking;
}
