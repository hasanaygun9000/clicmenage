import { isSupabaseConfigured, getSupabaseAdminClient } from '@/lib/db/client';
import { demoStore, generateId } from '@/lib/db/demo-store';
import type { BookingCustomer } from '@/lib/booking/types';

/**
 * ============================================================================
 *  CUSTOMER REPOSITORY (Phase 2 backend foundation)
 * ============================================================================
 * The rest of the app (the booking API route, and later an admin surface)
 * never talks to Supabase or the demo store directly for customer data —
 * it calls findOrCreateCustomer() from here. See src/lib/db/client.ts for
 * the Supabase/demo mode switch (`isSupabaseConfigured()`), centralized
 * once per function rather than scattered across components.
 *
 * DEDUP STRATEGY: a customer is looked up by email (case-insensitive)
 * first — the same person booking twice with the same address but a
 * different-cased email, or updating their phone number, should map to one
 * customer row rather than creating a new one every time. This is
 * intentionally simple (no fuzzy name matching, no CRM-grade merge
 * logic) — see requirement 2 of the Phase 2 spec.
 * ============================================================================
 */

export interface CustomerRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Finds an existing customer by email (case-insensitive) and returns it —
 * updating name/phone if they've changed — or creates a new one. Always
 * returns the same id for the same email across repeated bookings.
 */
export async function findOrCreateCustomer(customer: BookingCustomer): Promise<CustomerRecord> {
  if (isSupabaseConfigured()) return findOrCreateCustomerSupabase(customer);
  return findOrCreateCustomerDemo(customer);
}

async function findOrCreateCustomerDemo(customer: BookingCustomer): Promise<CustomerRecord> {
  const emailLower = customer.email.trim().toLowerCase();
  const existing = demoStore.customers.find((c) => c.email.toLowerCase() === emailLower);

  if (existing) {
    existing.firstName = customer.firstName;
    existing.lastName = customer.lastName;
    existing.phone = customer.phone;
    existing.updatedAt = new Date().toISOString();
    return toRecord(existing);
  }

  const now = new Date().toISOString();
  const created = {
    id: generateId('cust'),
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    createdAt: now,
    updatedAt: now,
  };
  demoStore.customers.push(created);
  return toRecord(created);
}

async function findOrCreateCustomerSupabase(customer: BookingCustomer): Promise<CustomerRecord> {
  const supabase = getSupabaseAdminClient();

  const { data: existing, error: findError } = await supabase
    .from('customers')
    .select('id, first_name, last_name, email, phone')
    .ilike('email', customer.email.trim())
    .maybeSingle();

  if (findError) throw new Error(`findOrCreateCustomer: lookup failed — ${findError.message}`);

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from('customers')
      .update({ first_name: customer.firstName, last_name: customer.lastName, phone: customer.phone })
      .eq('id', existing.id)
      .select('id, first_name, last_name, email, phone')
      .single();
    if (updateError) throw new Error(`findOrCreateCustomer: update failed — ${updateError.message}`);
    return fromSupabaseRow(updated);
  }

  const { data: created, error: insertError } = await supabase
    .from('customers')
    .insert({
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    })
    .select('id, first_name, last_name, email, phone')
    .single();
  if (insertError) throw new Error(`findOrCreateCustomer: insert failed — ${insertError.message}`);
  return fromSupabaseRow(created);
}

function toRecord(row: { id: string; firstName: string; lastName: string; email: string; phone: string }): CustomerRecord {
  return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone };
}

function fromSupabaseRow(row: { id: string; first_name: string; last_name: string; email: string; phone: string }): CustomerRecord {
  return { id: row.id, firstName: row.first_name, lastName: row.last_name, email: row.email, phone: row.phone };
}
