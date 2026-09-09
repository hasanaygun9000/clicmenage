import { isSupabaseConfigured, getSupabaseAdminClient } from '@/lib/db/client';
import { demoStore, generateId, type DemoCleanerRow } from '@/lib/db/demo-store';

/**
 * ============================================================================
 *  CLEANER REPOSITORY (Phase 2 backend foundation — prep only)
 * ============================================================================
 * Server-only. Nothing in this file is wired to a public API route yet —
 * per the Phase 2 scope, there is no admin UI in this phase, just the data
 * layer a future one will call. See requirement 15 of the spec.
 *
 * `hourlyWage` is STRICTLY administrative. `toPublicCleaner()` below is the
 * ONLY shape that should ever be sent toward a client-facing surface —
 * always strip through it, never spread a full CleanerRecord into a
 * response. See src/lib/db/__tests__/cleaners.test.ts for a regression
 * test on this.
 * ============================================================================
 */

export interface CleanerRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  active: boolean;
  hourlyWage: number;
  hireDate?: string;
}

/** Safe-to-expose projection of a cleaner — never carries hourlyWage. */
export interface PublicCleaner {
  id: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

export function toPublicCleaner(cleaner: CleanerRecord): PublicCleaner {
  return { id: cleaner.id, firstName: cleaner.firstName, lastName: cleaner.lastName, active: cleaner.active };
}

export interface CreateCleanerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  hourlyWage: number;
  hireDate?: string;
  active?: boolean;
}

export async function createCleaner(input: CreateCleanerInput): Promise<CleanerRecord> {
  if (isSupabaseConfigured()) return createCleanerSupabase(input);
  return createCleanerDemo(input);
}

async function createCleanerDemo(input: CreateCleanerInput): Promise<CleanerRecord> {
  const now = new Date().toISOString();
  const row: DemoCleanerRow = {
    id: generateId('clnr'),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    active: input.active ?? true,
    hourlyWage: input.hourlyWage,
    hireDate: input.hireDate,
    createdAt: now,
    updatedAt: now,
  };
  demoStore.cleaners.push(row);
  return fromDemoRow(row);
}

async function createCleanerSupabase(input: CreateCleanerInput): Promise<CleanerRecord> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cleaners')
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      hourly_wage: input.hourlyWage,
      hire_date: input.hireDate ?? null,
      active: input.active ?? true,
    })
    .select('id, first_name, last_name, email, phone, active, hourly_wage, hire_date')
    .single();
  if (error) throw new Error(`createCleaner failed — ${error.message}`);
  return fromSupabaseRow(data);
}

export async function listActiveCleaners(): Promise<CleanerRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cleaners')
      .select('id, first_name, last_name, email, phone, active, hourly_wage, hire_date')
      .eq('active', true);
    if (error) throw new Error(`listActiveCleaners failed — ${error.message}`);
    return (data ?? []).map(fromSupabaseRow);
  }
  return demoStore.cleaners.filter((c) => c.active).map(fromDemoRow);
}

export async function getCleanerById(id: string): Promise<CleanerRecord | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cleaners')
      .select('id, first_name, last_name, email, phone, active, hourly_wage, hire_date')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`getCleanerById failed — ${error.message}`);
    return data ? fromSupabaseRow(data) : null;
  }
  const row = demoStore.cleaners.find((c) => c.id === id);
  return row ? fromDemoRow(row) : null;
}

function fromDemoRow(row: DemoCleanerRow): CleanerRecord {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    active: row.active,
    hourlyWage: row.hourlyWage,
    hireDate: row.hireDate,
  };
}

function fromSupabaseRow(row: {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  active: boolean;
  hourly_wage: number;
  hire_date: string | null;
}): CleanerRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone ?? undefined,
    active: row.active,
    hourlyWage: Number(row.hourly_wage),
    hireDate: row.hire_date ?? undefined,
  };
}
