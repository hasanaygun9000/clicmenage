import { isSupabaseConfigured, getSupabaseAdminClient } from '@/lib/db/client';
import { demoStore, generateId, type DemoJobAssignmentRow } from '@/lib/db/demo-store';

/**
 * ============================================================================
 *  JOB ASSIGNMENT REPOSITORY (Phase 2 backend foundation — prep only)
 * ============================================================================
 * Server-only, not wired to any API route yet (see requirement 15). Lets a
 * booking have one or more cleaners assigned, while refusing to assign the
 * same cleaner to the same booking twice — both the demo store and the
 * `unique (booking_id, cleaner_id)` constraint in
 * supabase/migrations/0001_init_schema.sql enforce this.
 * ============================================================================
 */

export interface JobAssignmentRecord {
  id: string;
  bookingId: string;
  cleanerId: string;
  assignedAt: string;
  scheduledStart?: string;
}

export class DuplicateAssignmentError extends Error {
  constructor(bookingId: string, cleanerId: string) {
    super(`Cleaner ${cleanerId} is already assigned to booking ${bookingId}.`);
    this.name = 'DuplicateAssignmentError';
  }
}

export async function assignCleanerToBooking(
  bookingId: string,
  cleanerId: string,
  scheduledStart?: string
): Promise<JobAssignmentRecord> {
  if (isSupabaseConfigured()) return assignCleanerSupabase(bookingId, cleanerId, scheduledStart);
  return assignCleanerDemo(bookingId, cleanerId, scheduledStart);
}

async function assignCleanerDemo(bookingId: string, cleanerId: string, scheduledStart?: string): Promise<JobAssignmentRecord> {
  const existing = demoStore.jobAssignments.find((a) => a.bookingId === bookingId && a.cleanerId === cleanerId);
  if (existing) throw new DuplicateAssignmentError(bookingId, cleanerId);

  const row: DemoJobAssignmentRow = {
    id: generateId('asg'),
    bookingId,
    cleanerId,
    assignedAt: new Date().toISOString(),
    scheduledStart,
  };
  demoStore.jobAssignments.push(row);
  return { ...row };
}

async function assignCleanerSupabase(bookingId: string, cleanerId: string, scheduledStart?: string): Promise<JobAssignmentRecord> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('job_assignments')
    .insert({ booking_id: bookingId, cleaner_id: cleanerId, scheduled_start: scheduledStart ?? null })
    .select('id, booking_id, cleaner_id, assigned_at, scheduled_start')
    .single();
  if (error) {
    // Postgres unique_violation
    if (error.code === '23505') throw new DuplicateAssignmentError(bookingId, cleanerId);
    throw new Error(`assignCleanerToBooking failed — ${error.message}`);
  }
  return {
    id: data.id,
    bookingId: data.booking_id,
    cleanerId: data.cleaner_id,
    assignedAt: data.assigned_at,
    scheduledStart: data.scheduled_start ?? undefined,
  };
}

export async function listAssignmentsForBooking(bookingId: string): Promise<JobAssignmentRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_assignments')
      .select('id, booking_id, cleaner_id, assigned_at, scheduled_start')
      .eq('booking_id', bookingId);
    if (error) throw new Error(`listAssignmentsForBooking failed — ${error.message}`);
    return (data ?? []).map((row: { id: string; booking_id: string; cleaner_id: string; assigned_at: string; scheduled_start: string | null }) => ({
      id: row.id,
      bookingId: row.booking_id,
      cleanerId: row.cleaner_id,
      assignedAt: row.assigned_at,
      scheduledStart: row.scheduled_start ?? undefined,
    }));
  }
  return demoStore.jobAssignments.filter((a) => a.bookingId === bookingId).map((a) => ({ ...a }));
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('job_assignments').delete().eq('id', assignmentId);
    if (error) throw new Error(`removeAssignment failed — ${error.message}`);
    return;
  }
  const index = demoStore.jobAssignments.findIndex((a) => a.id === assignmentId);
  if (index !== -1) demoStore.jobAssignments.splice(index, 1);
}
