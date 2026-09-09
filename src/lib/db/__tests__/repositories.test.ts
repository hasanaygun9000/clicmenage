import { describe, it, expect, beforeEach } from 'vitest';
import { resetDemoStore } from '@/lib/db/demo-store';
import { createCleaner, toPublicCleaner, type CleanerRecord } from '@/lib/db/repositories/cleaners';
import { assignCleanerToBooking, DuplicateAssignmentError, listAssignmentsForBooking } from '@/lib/db/repositories/job-assignments';
import { recordTimeLog, getTotalActualPersonHours } from '@/lib/db/repositories/job-time-logs';
import { findOrCreateCustomer } from '@/lib/db/repositories/customers';

/**
 * Phase 2 backend foundation — repository-level tests for the
 * cleaner/assignment/time-log data layer described in requirements 8, 9,
 * 10 and 17 of the spec. None of these repositories are wired to a public
 * API route yet (see requirement 15) — these tests call them directly.
 */

beforeEach(() => {
  resetDemoStore();
});

describe('cleaner repository', () => {
  it('creates a cleaner and never exposes hourlyWage through toPublicCleaner()', async () => {
    const cleaner = await createCleaner({
      firstName: 'Sam',
      lastName: 'Roy',
      email: 'sam.roy@example.com',
      hourlyWage: 22,
    });
    expect(cleaner.hourlyWage).toBe(22);

    const publicCleaner = toPublicCleaner(cleaner);
    expect(publicCleaner).not.toHaveProperty('hourlyWage');
    expect(JSON.stringify(publicCleaner)).not.toContain('22');
    expect(publicCleaner.id).toBe(cleaner.id);
  });
});

describe('job assignment repository', () => {
  async function makeCleaner(email: string): Promise<CleanerRecord> {
    return createCleaner({ firstName: 'A', lastName: 'B', email, hourlyWage: 22 });
  }

  it('allows two different cleaners to be assigned to the same booking (a big job)', async () => {
    const bookingId = 'bk_test_1';
    const cleanerA = await makeCleaner('a@example.com');
    const cleanerB = await makeCleaner('b@example.com');

    await assignCleanerToBooking(bookingId, cleanerA.id);
    await assignCleanerToBooking(bookingId, cleanerB.id);

    const assignments = await listAssignmentsForBooking(bookingId);
    expect(assignments).toHaveLength(2);
  });

  it('refuses to assign the same cleaner to the same booking twice', async () => {
    const bookingId = 'bk_test_2';
    const cleaner = await makeCleaner('c@example.com');

    await assignCleanerToBooking(bookingId, cleaner.id);
    await expect(assignCleanerToBooking(bookingId, cleaner.id)).rejects.toThrow(DuplicateAssignmentError);

    const assignments = await listAssignmentsForBooking(bookingId);
    expect(assignments).toHaveLength(1);
  });
});

describe('job time log repository', () => {
  it('computes actual_minutes from started_at/ended_at', async () => {
    const log = await recordTimeLog({
      bookingId: 'bk_test_3',
      cleanerId: 'clnr_1',
      startedAt: '2026-01-01T09:00:00.000Z',
      endedAt: '2026-01-01T12:00:00.000Z',
    });
    expect(log.actualMinutes).toBe(180);
  });

  it('two cleaners at 180 minutes each sum to 6 actual person-hours for the job', async () => {
    const bookingId = 'bk_test_4';
    await recordTimeLog({
      bookingId,
      cleanerId: 'clnr_a',
      startedAt: '2026-01-01T09:00:00.000Z',
      endedAt: '2026-01-01T12:00:00.000Z', // 180 min
    });
    await recordTimeLog({
      bookingId,
      cleanerId: 'clnr_b',
      startedAt: '2026-01-01T09:00:00.000Z',
      endedAt: '2026-01-01T12:00:00.000Z', // 180 min
    });

    const totalPersonHours = await getTotalActualPersonHours(bookingId);
    expect(totalPersonHours).toBe(6);
  });

  it('rejects an end time before the start time', async () => {
    await expect(
      recordTimeLog({
        bookingId: 'bk_test_5',
        cleanerId: 'clnr_1',
        startedAt: '2026-01-01T12:00:00.000Z',
        endedAt: '2026-01-01T09:00:00.000Z',
      })
    ).rejects.toThrow();
  });

  it('a log still in progress (no endedAt) does not count toward actual person-hours yet', async () => {
    const bookingId = 'bk_test_6';
    await recordTimeLog({ bookingId, cleanerId: 'clnr_1', startedAt: '2026-01-01T09:00:00.000Z' });
    const totalPersonHours = await getTotalActualPersonHours(bookingId);
    expect(totalPersonHours).toBe(0);
  });
});

describe('customer repository dedup', () => {
  it('finding the same email twice (different casing) returns the same customer id and does not create a duplicate', async () => {
    const first = await findOrCreateCustomer({
      firstName: 'Alex',
      lastName: 'Tremblay',
      email: 'Alex@Example.com',
      phone: '514-555-1234',
      address: '123 Rue Principale',
      postalCode: 'H2X 1Y6',
      city: 'Montréal',
    });
    const second = await findOrCreateCustomer({
      firstName: 'Alex',
      lastName: 'Tremblay',
      email: 'alex@example.com',
      phone: '514-555-1234',
      address: '123 Rue Principale',
      postalCode: 'H2X 1Y6',
      city: 'Montréal',
    });
    expect(second.id).toBe(first.id);
  });
});
