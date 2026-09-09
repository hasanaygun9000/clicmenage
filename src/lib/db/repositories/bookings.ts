import type {
  Booking,
  BookingCustomer,
  BookingSelection,
  BookingPricingSnapshot,
  BookingExtraSnapshot,
} from '@/lib/booking/types';
import type { BookingStatus, PaymentStatus } from '@/lib/booking/status';
import type { PricingBreakdown, SelectedExtra } from '@/lib/pricing/engine';
import {
  pricingConfig,
  type ServicePricingKey,
  type HousingType,
  type SqftBucket,
  type LastCleaning,
  type PetHair,
  type FurnishingState,
  type FrequencyKey,
} from '@/lib/pricing/pricing-config';
import { PRICING_VERSION } from '@/lib/pricing/version';
import { matchServiceAreaByPostalCode } from '@/lib/config/service-areas';
import { isSupabaseConfigured, getSupabaseAdminClient } from '@/lib/db/client';
import { demoStore, generateId, type DemoBookingRow } from '@/lib/db/demo-store';

/**
 * ============================================================================
 *  BOOKING REPOSITORY (Phase 2 backend foundation)
 * ============================================================================
 * The ONLY module that reads/writes booking records. The API route
 * (src/app/api/bookings/route.ts) calls createBooking()/getBookingById()/
 * etc. from here instead of touching Supabase or the demo store directly —
 * see src/lib/db/client.ts for how the Supabase-vs-demo choice is made
 * once per function rather than scattered across the app.
 *
 * Every booking gets an IMMUTABLE PRICING SNAPSHOT at creation time (see
 * BookingPricingSnapshot in src/lib/booking/types.ts and the matching
 * columns in supabase/migrations/0001_init_schema.sql) — this repository
 * never recalculates a stored booking's price. Recomputation only ever
 * happens once, server-side, in the API route BEFORE createBooking() is
 * called (see calculatePricing() in src/lib/pricing/engine.ts).
 * ============================================================================
 */

export interface CreateBookingInput {
  confirmationNumber: string;
  locale: 'fr' | 'en';
  customerId: string;
  customer: BookingCustomer;
  selection: BookingSelection;
  pricing: PricingBreakdown;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Builds the immutable per-extra snapshot rows from the SAME pricing
 * config the engine used (src/lib/pricing/pricing-config.ts) — never a
 * second, drifting source of truth. This reads existing exported config
 * only; it does not modify or reinterpret how the Pricing Engine computes
 * anything (see PricingEngine V1.1 comments in pricing-config.ts).
 */
function buildExtraSnapshots(extras: SelectedExtra[]): BookingExtraSnapshot[] {
  const snapshots: BookingExtraSnapshot[] = [];
  for (const extra of extras) {
    const extraPricing = pricingConfig.extrasPricing[extra.id];
    if (!extraPricing) continue;
    const quantity = extraPricing.unit === 'flat' ? 1 : Math.max(1, Math.round(extra.quantity || 1));
    snapshots.push({
      extraId: extra.id,
      quantity,
      unitPriceSnapshot: extraPricing.price,
      totalPriceSnapshot: round2(extraPricing.price * quantity),
      operationalPersonHoursSnapshot: round2(extraPricing.operationalPersonHours * quantity),
    });
  }
  return snapshots;
}

function buildPricingSnapshot(pricing: PricingBreakdown): BookingPricingSnapshot {
  return {
    pricingVersion: PRICING_VERSION,
    baseCleaningPersonHours: pricing.baseCleaningPersonHours,
    extrasPersonHours: pricing.extrasPersonHours,
    estimatedPersonHours: pricing.estimatedPersonHours,
    reportedOperationalHours: pricing.reportedOperationalHours,
    recommendedCrewSize: pricing.recommendedCrewSize,
    cleaningPrice: pricing.cleaningSubtotal,
    extrasTotal: pricing.extrasSubtotal,
    discountAmount: pricing.frequencyDiscountAmount,
    subtotalBeforeTax: pricing.subtotal,
    gstAmount: pricing.gstAmount,
    qstAmount: pricing.qstAmount,
    totalAmount: pricing.total,
    currency: pricing.currency,
  };
}

// ============================================================================
// createBooking
// ============================================================================

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  if (isSupabaseConfigured()) return createBookingSupabase(input);
  return createBookingDemo(input);
}

async function createBookingDemo(input: CreateBookingInput): Promise<Booking> {
  const now = new Date().toISOString();
  const id = generateId('bk');
  const extraSnapshots = buildExtraSnapshots(input.selection.extras);

  const row: DemoBookingRow = {
    id,
    confirmationNumber: input.confirmationNumber,
    customerId: input.customerId,
    locale: input.locale,
    status: input.status,
    paymentStatus: input.paymentStatus,
    serviceType: input.selection.service,
    frequency: input.selection.frequency,
    requestedDate: input.selection.date,
    requestedTimeWindowId: input.selection.timeWindowId,
    addressLine: input.customer.address,
    unit: input.customer.unit,
    city: input.customer.city,
    province: 'QC',
    postalCode: input.customer.postalCode,
    dwellingType: input.selection.housingType,
    bedrooms: input.selection.bedrooms,
    fullBathrooms: input.selection.fullBathrooms,
    halfBathrooms: input.selection.halfBathrooms,
    squareFootageBucket: input.selection.sqftBucket,
    floors: input.selection.floors,
    lastCleaning: input.selection.lastCleaning,
    petHair: input.selection.petHair,
    furnishingState: input.selection.furnishingState,
    instructions: input.customer.instructions,
    manualReviewRequired: input.pricing.manualReviewRequired,
    manualReviewReasons: input.pricing.manualReviewReason,
    pricingVersion: PRICING_VERSION,
    baseCleaningPersonHours: input.pricing.baseCleaningPersonHours,
    extrasPersonHours: input.pricing.extrasPersonHours,
    estimatedPersonHours: input.pricing.estimatedPersonHours,
    reportedOperationalHours: input.pricing.reportedOperationalHours,
    recommendedCrewSize: input.pricing.recommendedCrewSize,
    cleaningPrice: input.pricing.cleaningSubtotal,
    extrasTotal: input.pricing.extrasSubtotal,
    discountAmount: input.pricing.frequencyDiscountAmount,
    subtotalBeforeTax: input.pricing.subtotal,
    gstAmount: input.pricing.gstAmount,
    qstAmount: input.pricing.qstAmount,
    totalAmount: input.pricing.total,
    currency: input.pricing.currency,
    createdAt: now,
    updatedAt: now,
  };
  demoStore.bookings.push(row);

  demoStore.bookingExtras.push(
    ...extraSnapshots.map((snap) => ({
      id: generateId('bex'),
      bookingId: id,
      extraId: snap.extraId,
      quantity: snap.quantity,
      unitPriceSnapshot: snap.unitPriceSnapshot,
      totalPriceSnapshot: snap.totalPriceSnapshot,
      operationalPersonHoursSnapshot: snap.operationalPersonHoursSnapshot,
      createdAt: now,
    }))
  );

  demoStore.statusHistory.push({
    id: generateId('bsh'),
    bookingId: id,
    fromStatus: null,
    toStatus: input.status,
    changedAt: now,
    changedByType: 'system',
  });

  return demoRowToBooking(row, input.customer, extraSnapshots);
}

async function createBookingSupabase(input: CreateBookingInput): Promise<Booking> {
  const supabase = getSupabaseAdminClient();
  const extraSnapshots = buildExtraSnapshots(input.selection.extras);

  const { data: bookingRow, error: insertError } = await supabase
    .from('bookings')
    .insert({
      confirmation_number: input.confirmationNumber,
      customer_id: input.customerId,
      locale: input.locale,
      status: input.status,
      payment_status: input.paymentStatus,
      service_type: input.selection.service,
      frequency: input.selection.frequency,
      requested_date: input.selection.date,
      requested_time_window_id: input.selection.timeWindowId,
      address_line: input.customer.address,
      unit: input.customer.unit ?? null,
      city: input.customer.city,
      province: 'QC',
      postal_code: input.customer.postalCode,
      dwelling_type: input.selection.housingType,
      bedrooms: input.selection.bedrooms,
      full_bathrooms: input.selection.fullBathrooms,
      half_bathrooms: input.selection.halfBathrooms,
      square_footage_bucket: input.selection.sqftBucket,
      floors: input.selection.floors ?? null,
      last_cleaning: input.selection.lastCleaning,
      pet_hair: input.selection.petHair,
      furnishing_state: input.selection.furnishingState ?? null,
      instructions: input.customer.instructions ?? null,
      manual_review_required: input.pricing.manualReviewRequired,
      manual_review_reasons: input.pricing.manualReviewReason,
      pricing_version: PRICING_VERSION,
      base_cleaning_person_hours: input.pricing.baseCleaningPersonHours,
      extras_person_hours: input.pricing.extrasPersonHours,
      estimated_person_hours: input.pricing.estimatedPersonHours,
      reported_operational_hours: input.pricing.reportedOperationalHours,
      recommended_crew_size: input.pricing.recommendedCrewSize,
      cleaning_price: input.pricing.cleaningSubtotal,
      extras_total: input.pricing.extrasSubtotal,
      discount_amount: input.pricing.frequencyDiscountAmount,
      subtotal_before_tax: input.pricing.subtotal,
      gst_amount: input.pricing.gstAmount,
      qst_amount: input.pricing.qstAmount,
      total_amount: input.pricing.total,
      currency: input.pricing.currency,
      pricing_breakdown: { lineItems: input.pricing.lineItems },
    })
    .select('id, created_at')
    .single();
  if (insertError) throw new Error(`createBooking: insert failed — ${insertError.message}`);

  if (extraSnapshots.length > 0) {
    const { error: extrasError } = await supabase.from('booking_extras').insert(
      extraSnapshots.map((snap) => ({
        booking_id: bookingRow.id,
        extra_id: snap.extraId,
        quantity: snap.quantity,
        unit_price_snapshot: snap.unitPriceSnapshot,
        total_price_snapshot: snap.totalPriceSnapshot,
        operational_person_hours_snapshot: snap.operationalPersonHoursSnapshot,
      }))
    );
    if (extrasError) throw new Error(`createBooking: booking_extras insert failed — ${extrasError.message}`);
  }

  const { error: historyError } = await supabase.from('booking_status_history').insert({
    booking_id: bookingRow.id,
    from_status: null,
    to_status: input.status,
    changed_by_type: 'system',
  });
  if (historyError) throw new Error(`createBooking: status history insert failed — ${historyError.message}`);

  return {
    id: bookingRow.id,
    confirmationNumber: input.confirmationNumber,
    createdAt: bookingRow.created_at,
    customerId: input.customerId,
    locale: input.locale,
    selection: { ...input.selection, areaSlug: matchServiceAreaByPostalCode(input.customer.postalCode)?.slug ?? null },
    customer: input.customer,
    pricing: {
      subtotal: input.pricing.subtotal,
      taxAmount: round2(input.pricing.gstAmount + input.pricing.qstAmount),
      total: input.pricing.total,
      currency: input.pricing.currency,
    },
    pricingSnapshot: buildPricingSnapshot(input.pricing),
    extras: extraSnapshots,
    status: input.status,
    paymentStatus: input.paymentStatus,
    manualReviewRequired: input.pricing.manualReviewRequired,
    manualReviewReason: input.pricing.manualReviewReason,
    notes: input.customer.instructions,
    assignedTeamId: null,
  };
}

function demoRowToBooking(row: DemoBookingRow, customer: BookingCustomer, extras: BookingExtraSnapshot[]): Booking {
  const matchedArea = matchServiceAreaByPostalCode(row.postalCode);
  return {
    id: row.id,
    confirmationNumber: row.confirmationNumber,
    createdAt: row.createdAt,
    customerId: row.customerId,
    locale: row.locale,
    selection: {
      postalCode: row.postalCode,
      areaSlug: matchedArea?.slug ?? null,
      service: row.serviceType as ServicePricingKey,
      housingType: row.dwellingType as HousingType,
      bedrooms: row.bedrooms,
      fullBathrooms: row.fullBathrooms,
      halfBathrooms: row.halfBathrooms,
      sqftBucket: row.squareFootageBucket as SqftBucket,
      floors: row.floors,
      lastCleaning: row.lastCleaning as LastCleaning,
      petHair: row.petHair as PetHair,
      furnishingState: row.furnishingState as FurnishingState | undefined,
      frequency: row.frequency as FrequencyKey,
      extras: extras.map((e) => ({ id: e.extraId, quantity: e.quantity })),
      date: row.requestedDate,
      timeWindowId: row.requestedTimeWindowId,
    },
    customer: { ...customer, unit: row.unit, instructions: row.instructions },
    pricing: {
      subtotal: row.subtotalBeforeTax,
      taxAmount: round2(row.gstAmount + row.qstAmount),
      total: row.totalAmount,
      currency: row.currency,
    },
    pricingSnapshot: {
      pricingVersion: row.pricingVersion,
      baseCleaningPersonHours: row.baseCleaningPersonHours,
      extrasPersonHours: row.extrasPersonHours,
      estimatedPersonHours: row.estimatedPersonHours,
      reportedOperationalHours: row.reportedOperationalHours,
      recommendedCrewSize: row.recommendedCrewSize,
      cleaningPrice: row.cleaningPrice,
      extrasTotal: row.extrasTotal,
      discountAmount: row.discountAmount,
      subtotalBeforeTax: row.subtotalBeforeTax,
      gstAmount: row.gstAmount,
      qstAmount: row.qstAmount,
      totalAmount: row.totalAmount,
      currency: row.currency,
    },
    extras,
    status: row.status,
    paymentStatus: row.paymentStatus,
    manualReviewRequired: row.manualReviewRequired,
    manualReviewReason: row.manualReviewReasons,
    notes: row.instructions,
    assignedTeamId: null,
  };
}

// ============================================================================
// Reads
// ============================================================================

export async function getBookingById(id: string): Promise<Booking | null> {
  if (isSupabaseConfigured()) return getBookingByColumnSupabase('id', id);
  const row = demoStore.bookings.find((b) => b.id === id);
  return row ? demoRowToBookingWithCustomer(row) : null;
}

export async function getBookingByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
  if (isSupabaseConfigured()) return getBookingByColumnSupabase('confirmation_number', confirmationNumber);
  const row = demoStore.bookings.find((b) => b.confirmationNumber === confirmationNumber);
  return row ? demoRowToBookingWithCustomer(row) : null;
}

export async function listBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('bookings').select('id').order('created_at', { ascending: false });
    if (error) throw new Error(`listBookings failed — ${error.message}`);
    const results = await Promise.all((data ?? []).map((row: { id: string }) => getBookingByColumnSupabase('id', row.id)));
    return results.filter((b): b is Booking => b !== null);
  }
  const rows = [...demoStore.bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return rows.map((row) => demoRowToBookingWithCustomerSync(row));
}

function demoRowToBookingWithCustomerSync(row: DemoBookingRow): Booking {
  const customerRow = demoStore.customers.find((c) => c.id === row.customerId);
  const customer: BookingCustomer = {
    firstName: customerRow?.firstName ?? '',
    lastName: customerRow?.lastName ?? '',
    email: customerRow?.email ?? '',
    phone: customerRow?.phone ?? '',
    address: row.addressLine,
    unit: row.unit,
    postalCode: row.postalCode,
    city: row.city,
    instructions: row.instructions,
  };
  const extras = demoStore.bookingExtras
    .filter((e) => e.bookingId === row.id)
    .map((e) => ({
      extraId: e.extraId,
      quantity: e.quantity,
      unitPriceSnapshot: e.unitPriceSnapshot,
      totalPriceSnapshot: e.totalPriceSnapshot,
      operationalPersonHoursSnapshot: e.operationalPersonHoursSnapshot,
    }));
  return demoRowToBooking(row, customer, extras);
}

async function demoRowToBookingWithCustomer(row: DemoBookingRow): Promise<Booking> {
  return demoRowToBookingWithCustomerSync(row);
}

async function getBookingByColumnSupabase(column: 'id' | 'confirmation_number', value: string): Promise<Booking | null> {
  const supabase = getSupabaseAdminClient();
  const { data: bookingRow, error } = await supabase.from('bookings').select('*').eq(column, value).maybeSingle();
  if (error) throw new Error(`getBooking failed — ${error.message}`);
  if (!bookingRow) return null;

  const { data: customerRow, error: customerError } = await supabase
    .from('customers')
    .select('first_name, last_name, email, phone')
    .eq('id', bookingRow.customer_id)
    .maybeSingle();
  if (customerError) throw new Error(`getBooking: customer lookup failed — ${customerError.message}`);

  const { data: extraRows, error: extrasError } = await supabase
    .from('booking_extras')
    .select('extra_id, quantity, unit_price_snapshot, total_price_snapshot, operational_person_hours_snapshot')
    .eq('booking_id', bookingRow.id);
  if (extrasError) throw new Error(`getBooking: extras lookup failed — ${extrasError.message}`);

  const customer: BookingCustomer = {
    firstName: customerRow?.first_name ?? '',
    lastName: customerRow?.last_name ?? '',
    email: customerRow?.email ?? '',
    phone: customerRow?.phone ?? '',
    address: bookingRow.address_line,
    unit: bookingRow.unit ?? undefined,
    postalCode: bookingRow.postal_code,
    city: bookingRow.city,
    instructions: bookingRow.instructions ?? undefined,
  };

  const extras: BookingExtraSnapshot[] = (extraRows ?? []).map(
    (e: {
      extra_id: string;
      quantity: number;
      unit_price_snapshot: number;
      total_price_snapshot: number;
      operational_person_hours_snapshot: number;
    }) => ({
      extraId: e.extra_id,
      quantity: e.quantity,
      unitPriceSnapshot: e.unit_price_snapshot,
      totalPriceSnapshot: e.total_price_snapshot,
      operationalPersonHoursSnapshot: e.operational_person_hours_snapshot,
    })
  );

  const matchedArea = matchServiceAreaByPostalCode(bookingRow.postal_code);

  return {
    id: bookingRow.id,
    confirmationNumber: bookingRow.confirmation_number,
    createdAt: bookingRow.created_at,
    customerId: bookingRow.customer_id,
    locale: bookingRow.locale,
    selection: {
      postalCode: bookingRow.postal_code,
      areaSlug: matchedArea?.slug ?? null,
      service: bookingRow.service_type,
      housingType: bookingRow.dwelling_type,
      bedrooms: bookingRow.bedrooms,
      fullBathrooms: bookingRow.full_bathrooms,
      halfBathrooms: bookingRow.half_bathrooms,
      sqftBucket: bookingRow.square_footage_bucket,
      floors: bookingRow.floors ?? undefined,
      lastCleaning: bookingRow.last_cleaning,
      petHair: bookingRow.pet_hair,
      furnishingState: bookingRow.furnishing_state ?? undefined,
      frequency: bookingRow.frequency,
      extras: extras.map((e) => ({ id: e.extraId, quantity: e.quantity })),
      date: bookingRow.requested_date,
      timeWindowId: bookingRow.requested_time_window_id,
    },
    customer,
    pricing: {
      subtotal: Number(bookingRow.subtotal_before_tax),
      taxAmount: round2(Number(bookingRow.gst_amount) + Number(bookingRow.qst_amount)),
      total: Number(bookingRow.total_amount),
      currency: bookingRow.currency,
    },
    pricingSnapshot: {
      pricingVersion: bookingRow.pricing_version,
      baseCleaningPersonHours: Number(bookingRow.base_cleaning_person_hours),
      extrasPersonHours: Number(bookingRow.extras_person_hours),
      estimatedPersonHours: Number(bookingRow.estimated_person_hours),
      reportedOperationalHours: Number(bookingRow.reported_operational_hours),
      recommendedCrewSize: bookingRow.recommended_crew_size,
      cleaningPrice: Number(bookingRow.cleaning_price),
      extrasTotal: Number(bookingRow.extras_total),
      discountAmount: Number(bookingRow.discount_amount),
      subtotalBeforeTax: Number(bookingRow.subtotal_before_tax),
      gstAmount: Number(bookingRow.gst_amount),
      qstAmount: Number(bookingRow.qst_amount),
      totalAmount: Number(bookingRow.total_amount),
      currency: bookingRow.currency,
    },
    extras,
    status: bookingRow.status,
    paymentStatus: bookingRow.payment_status,
    manualReviewRequired: bookingRow.manual_review_required,
    manualReviewReason: bookingRow.manual_review_reasons ?? [],
    notes: bookingRow.instructions ?? undefined,
    assignedTeamId: null,
  };
}

// ============================================================================
// updateBookingStatus — also records booking_status_history
// ============================================================================

export async function updateBookingStatus(
  id: string,
  updates: Partial<Pick<Booking, 'paymentStatus' | 'notes' | 'assignedTeamId'>> & { status?: BookingStatus },
  options?: { changedByType?: 'system' | 'admin' | 'customer'; note?: string }
): Promise<Booking | null> {
  if (isSupabaseConfigured()) return updateBookingStatusSupabase(id, updates, options);
  return updateBookingStatusDemo(id, updates, options);
}

async function updateBookingStatusDemo(
  id: string,
  updates: Partial<Pick<Booking, 'paymentStatus' | 'notes' | 'assignedTeamId'>> & { status?: BookingStatus },
  options?: { changedByType?: 'system' | 'admin' | 'customer'; note?: string }
): Promise<Booking | null> {
  const row = demoStore.bookings.find((b) => b.id === id);
  if (!row) return null;

  const previousStatus = row.status;
  if (updates.status && updates.status !== previousStatus) {
    row.status = updates.status;
    demoStore.statusHistory.push({
      id: generateId('bsh'),
      bookingId: id,
      fromStatus: previousStatus,
      toStatus: updates.status,
      changedAt: new Date().toISOString(),
      changedByType: options?.changedByType ?? 'system',
      note: options?.note,
    });
  }
  if (updates.paymentStatus) row.paymentStatus = updates.paymentStatus;
  if (updates.notes !== undefined) row.instructions = updates.notes;
  row.updatedAt = new Date().toISOString();

  return demoRowToBookingWithCustomerSync(row);
}

async function updateBookingStatusSupabase(
  id: string,
  updates: Partial<Pick<Booking, 'paymentStatus' | 'notes' | 'assignedTeamId'>> & { status?: BookingStatus },
  options?: { changedByType?: 'system' | 'admin' | 'customer'; note?: string }
): Promise<Booking | null> {
  const supabase = getSupabaseAdminClient();
  const { data: current, error: fetchError } = await supabase.from('bookings').select('status').eq('id', id).maybeSingle();
  if (fetchError) throw new Error(`updateBookingStatus: fetch failed — ${fetchError.message}`);
  if (!current) return null;

  const patch: Record<string, unknown> = {};
  if (updates.status) patch.status = updates.status;
  if (updates.paymentStatus) patch.payment_status = updates.paymentStatus;
  if (updates.notes !== undefined) patch.instructions = updates.notes;

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase.from('bookings').update(patch).eq('id', id);
    if (updateError) throw new Error(`updateBookingStatus: update failed — ${updateError.message}`);
  }

  if (updates.status && updates.status !== current.status) {
    const { error: historyError } = await supabase.from('booking_status_history').insert({
      booking_id: id,
      from_status: current.status,
      to_status: updates.status,
      changed_by_type: options?.changedByType ?? 'system',
      note: options?.note ?? null,
    });
    if (historyError) throw new Error(`updateBookingStatus: history insert failed — ${historyError.message}`);
  }

  return getBookingByColumnSupabase('id', id);
}
