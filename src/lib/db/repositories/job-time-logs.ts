import { isSupabaseConfigured, getSupabaseAdminClient } from '@/lib/db/client';
import { demoStore, generateId, type DemoJobTimeLogRow } from '@/lib/db/demo-store';

/**
 * ============================================================================
 *  JOB TIME LOG REPOSITORY (Phase 2 backend foundation — prep only)
 * ============================================================================
 * Server-only, not wired to any API route yet (see requirement 15). Lets
 * ClicMénage later compare estimated person-hours (from the Pricing Engine
 * — see PricingBreakdown.estimatedPersonHours in src/lib/pricing/engine.ts)
 * against ACTUAL person-hours worked, summed across every cleaner on a job
 * — e.g. two cleaners at 180 minutes each = 360 minutes = 6 person-hours
 * (see requirement 10 of the spec).
 *
 * Deliberately does NOT track GPS, screenshots, or any other invasive
 * monitoring — just a start time, an optional end time, and a note.
 * `actualMinutes` is always derived from started_at/ended_at (a DB trigger
 * does this in Supabase mode — see compute_actual_minutes() in
 * supabase/migrations/0001_init_schema.sql — and the same formula runs in
 * TypeScript for demo mode) so it can never drift out of sync.
 * ============================================================================
 */

export interface JobTimeLogRecord {
  id: string;
  bookingId: string;
  cleanerId: string;
  startedAt: string;
  endedAt?: string;
  actualMinutes: number | null;
  note?: string;
}

function computeActualMinutes(startedAt: string, endedAt?: string): number | null {
  if (!endedAt) return null;
  const minutes = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  return Math.max(0, minutes);
}

export interface RecordTimeLogInput {
  bookingId: string;
  cleanerId: string;
  startedAt: string;
  endedAt?: string;
  note?: string;
}

/** Starts (or fully records, if endedAt is supplied) one cleaner's time log for a job. */
export async function recordTimeLog(input: RecordTimeLogInput): Promise<JobTimeLogRecord> {
  if (input.endedAt && new Date(input.endedAt).getTime() <= new Date(input.startedAt).getTime()) {
    throw new Error('recordTimeLog: endedAt must be after startedAt.');
  }
  if (isSupabaseConfigured()) return recordTimeLogSupabase(input);
  return recordTimeLogDemo(input);
}

async function recordTimeLogDemo(input: RecordTimeLogInput): Promise<JobTimeLogRecord> {
  const row: DemoJobTimeLogRow = {
    id: generateId('log'),
    bookingId: input.bookingId,
    cleanerId: input.cleanerId,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    actualMinutes: computeActualMinutes(input.startedAt, input.endedAt),
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  demoStore.jobTimeLogs.push(row);
  return { ...row };
}

async function recordTimeLogSupabase(input: RecordTimeLogInput): Promise<JobTimeLogRecord> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('job_time_logs')
    .insert({
      booking_id: input.bookingId,
      cleaner_id: input.cleanerId,
      started_at: input.startedAt,
      ended_at: input.endedAt ?? null,
      note: input.note ?? null,
    })
    // actual_minutes is computed by the compute_actual_minutes() trigger — never sent from here.
    .select('id, booking_id, cleaner_id, started_at, ended_at, actual_minutes, note')
    .single();
  if (error) throw new Error(`recordTimeLog failed — ${error.message}`);
  return {
    id: data.id,
    bookingId: data.booking_id,
    cleanerId: data.cleaner_id,
    startedAt: data.started_at,
    endedAt: data.ended_at ?? undefined,
    actualMinutes: data.actual_minutes,
    note: data.note ?? undefined,
  };
}

export async function listTimeLogsForBooking(bookingId: string): Promise<JobTimeLogRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_time_logs')
      .select('id, booking_id, cleaner_id, started_at, ended_at, actual_minutes, note')
      .eq('booking_id', bookingId);
    if (error) throw new Error(`listTimeLogsForBooking failed — ${error.message}`);
    return (data ?? []).map(
      (row: {
        id: string;
        booking_id: string;
        cleaner_id: string;
        started_at: string;
        ended_at: string | null;
        actual_minutes: number | null;
        note: string | null;
      }) => ({
        id: row.id,
        bookingId: row.booking_id,
        cleanerId: row.cleaner_id,
        startedAt: row.started_at,
        endedAt: row.ended_at ?? undefined,
        actualMinutes: row.actual_minutes,
        note: row.note ?? undefined,
      })
    );
  }
  return demoStore.jobTimeLogs.filter((l) => l.bookingId === bookingId).map((l) => ({ ...l }));
}

/**
 * Total ACTUAL person-hours for a job, summed across every cleaner's
 * completed time log (logs still missing an endedAt are not counted yet).
 * E.g. cleaner A = 180 min, cleaner B = 180 min → 360 min → 6 person-hours.
 */
export async function getTotalActualPersonHours(bookingId: string): Promise<number> {
  const logs = await listTimeLogsForBooking(bookingId);
  const totalMinutes = logs.reduce((sum, log) => sum + (log.actualMinutes ?? 0), 0);
  return Math.round((totalMinutes / 60) * 100) / 100;
}
