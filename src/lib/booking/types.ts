import type { FrequencyKey, ServicePricingKey, HousingType, SqftBucket, LastCleaning, PetHair, FurnishingState } from '@/lib/pricing/pricing-config';
import type { SelectedExtra, ManualReviewReason } from '@/lib/pricing/engine';
import type { BookingStatus, PaymentStatus } from '@/lib/booking/status';

export type { BookingStatus, PaymentStatus } from '@/lib/booking/status';

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
  housingType: HousingType;
  /** 0 = studio, 1-5 = exact count, 6 = "6+". */
  bedrooms: number;
  fullBathrooms: number;
  halfBathrooms: number;
  sqftBucket: SqftBucket;
  /** Only meaningful for house/townhouse — see HOUSING_TYPES_WITH_FLOORS. Omitted otherwise. */
  floors?: number;
  /** Drives the Regular ↔ Deep recommendation only — never affects price. */
  lastCleaning: LastCleaning;
  petHair: PetHair;
  /** Move-In/Out only. */
  furnishingState?: FurnishingState;
  frequency: FrequencyKey;
  extras: SelectedExtra[];
  date: string; // ISO date, e.g. '2026-09-20'
  timeWindowId: string;
}

/**
 * Immutable pricing snapshot (Phase 2 / Supabase backend foundation) — a
 * copy of the server-recomputed PricingBreakdown taken at the moment the
 * booking was created. NEVER recalculated afterward: if pricing-config.ts
 * changes six months from now, an existing booking keeps quoting exactly
 * what the customer agreed to. See requirement 6 of the Phase 2 spec and
 * the matching columns in supabase/migrations/0001_init_schema.sql.
 */
export interface BookingPricingSnapshot {
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
}

/** One immutable snapshot row per selected extra — see booking_extras in the migration. */
export interface BookingExtraSnapshot {
  extraId: string;
  quantity: number;
  unitPriceSnapshot: number;
  totalPriceSnapshot: number;
  operationalPersonHoursSnapshot: number;
}

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
  /** The Supabase (or demo-store) customers.id this booking belongs to — see src/lib/db/repositories/customers.ts. */
  customerId?: string;
  locale?: 'fr' | 'en';
  selection: BookingSelection;
  customer: BookingCustomer;
  pricing: {
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
  };
  /** Full immutable snapshot — undefined only for records created before Phase 2. */
  pricingSnapshot?: BookingPricingSnapshot;
  extras?: BookingExtraSnapshot[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  manualReviewRequired?: boolean;
  manualReviewReason?: ManualReviewReason[];
  notes?: string;
  /** Reserved for future cleaner/team assignment — see src/lib/db/repositories/job-assignments.ts. */
  assignedTeamId?: string | null;
}
