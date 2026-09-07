import type { FrequencyKey, ServicePricingKey } from '@/lib/pricing/pricing-config';

/**
 * Shared booking data model — used by the client-side wizard state, the
 * booking API route, and (in a future iteration) the database layer.
 *
 * This shape is intentionally flat and serializable (no class instances)
 * so it can travel as JSON between the client, the API route, and
 * whichever persistence layer is wired in later (see src/lib/db/bookings.ts).
 */
export interface BookingCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  unit?: string;
  postalCode: string;
  city: string;
  instructions?: string;
}

export interface BookingSelection {
  postalCode: string;
  areaSlug: string | null;
  service: ServicePricingKey;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  frequency: FrequencyKey;
  extraIds: string[];
  date: string; // ISO date, e.g. '2026-09-20'
  timeWindowId: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';

/**
 * A full booking record as stored server-side. Client-calculated pricing
 * fields (subtotal/taxes/total) are NEVER trusted directly — the API route
 * recomputes them from `selection` using the pricing engine before saving
 * or charging. See SECURITY note in src/app/api/bookings/route.ts.
 */
export interface Booking {
  id: string;
  confirmationNumber: string;
  createdAt: string;
  selection: BookingSelection;
  customer: BookingCustomer;
  pricing: {
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
  };
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  /** Reserved for future cleaner/team assignment — see src/lib/db/bookings.ts. */
  assignedTeamId?: string | null;
}
