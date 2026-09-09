import type { BookingStatus, PaymentStatus } from '@/lib/booking/status';
import type { ManualReviewReason } from '@/lib/pricing/engine';

/**
 * ============================================================================
 *  DEMO STORE — in-memory stand-in for the Supabase tables (Phase 2)
 * ============================================================================
 * Mirrors the shape of the 7 tables created in
 * supabase/migrations/0001_init_schema.sql, using plain arrays instead of
 * Postgres. Used automatically by every repository under
 * src/lib/db/repositories/ whenever `isSupabaseConfigured()` is false (see
 * src/lib/db/client.ts) — i.e. local development and this codebase's own
 * test suite, with zero Supabase credentials required.
 *
 * Lives for the lifetime of the server process only (reset on restart, not
 * shared across serverless instances) — identical trade-off to the old
 * src/lib/db/bookings.ts in-memory store this replaces.
 * ============================================================================
 */

export interface DemoCustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoBookingRow {
  id: string;
  confirmationNumber: string;
  customerId: string;
  locale: 'fr' | 'en';
  status: BookingStatus;
  paymentStatus: PaymentStatus;

  serviceType: string;
  frequency: string;
  requestedDate: string;
  requestedTimeWindowId: string;

  addressLine: string;
  unit?: string;
  city: string;
  province: string;
  postalCode: string;

  dwellingType: string;
  bedrooms: number;
  fullBathrooms: number;
  halfBathrooms: number;
  squareFootageBucket: string;
  floors?: number;
  lastCleaning: string;
  petHair: string;
  furnishingState?: string;

  instructions?: string;

  manualReviewRequired: boolean;
  manualReviewReasons: ManualReviewReason[];

  pricingVersion: string;
  baseCleaningPersonHours: number;
  extrasPersonHours: number;
  estimatedPersonHours: number;
  reportedOperationalHours: number;
  recommendedCrewSize: number;
  cleaningPrice: number;
  extrasTotal: number;
  discountAmount: number;
  subtotalBeforeTax: number;
  gstAmount: number;
  qstAmount: number;
  totalAmount: number;
  currency: string;

  createdAt: string;
  updatedAt: string;
}

export interface DemoBookingExtraRow {
  id: string;
  bookingId: string;
  extraId: string;
  quantity: number;
  unitPriceSnapshot: number;
  totalPriceSnapshot: number;
  operationalPersonHoursSnapshot: number;
  createdAt: string;
}

export interface DemoStatusHistoryRow {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedAt: string;
  changedByType: 'system' | 'admin' | 'customer';
  note?: string;
}

export interface DemoCleanerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  active: boolean;
  hourlyWage: number;
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoJobAssignmentRow {
  id: string;
  bookingId: string;
  cleanerId: string;
  assignedAt: string;
  scheduledStart?: string;
}

export interface DemoJobTimeLogRow {
  id: string;
  bookingId: string;
  cleanerId: string;
  startedAt: string;
  endedAt?: string;
  actualMinutes: number | null;
  note?: string;
  createdAt: string;
}

export const demoStore = {
  customers: [] as DemoCustomerRow[],
  bookings: [] as DemoBookingRow[],
  bookingExtras: [] as DemoBookingExtraRow[],
  statusHistory: [] as DemoStatusHistoryRow[],
  cleaners: [] as DemoCleanerRow[],
  jobAssignments: [] as DemoJobAssignmentRow[],
  jobTimeLogs: [] as DemoJobTimeLogRow[],
};

/** Test-only helper — clears every demo "table" so test files can start from a clean slate. */
export function resetDemoStore(): void {
  demoStore.customers.length = 0;
  demoStore.bookings.length = 0;
  demoStore.bookingExtras.length = 0;
  demoStore.statusHistory.length = 0;
  demoStore.cleaners.length = 0;
  demoStore.jobAssignments.length = 0;
  demoStore.jobTimeLogs.length = 0;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
