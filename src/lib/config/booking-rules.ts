/**
 * ============================================================================
 *  BOOKING RULES CONFIGURATION — ClicMénage
 * ============================================================================
 * Scheduling logic kept out of UI components so opening hours, lead time,
 * and blackout dates can be changed without touching the booking wizard.
 * ============================================================================
 */

export const bookingRules = {
  /** 0 = Sunday … 6 = Saturday. Days the business accepts appointments. */
  businessDays: [1, 2, 3, 4, 5, 6] as number[], // Mon–Sat, closed Sunday by default

  /** Appointment time windows offered in step 6 of the booking flow. */
  timeWindows: [
    { id: 'morning', label: { fr: '8 h – 11 h', en: '8 AM – 11 AM' } },
    { id: 'midday', label: { fr: '11 h – 14 h', en: '11 AM – 2 PM' } },
    { id: 'afternoon', label: { fr: '14 h – 17 h', en: '2 PM – 5 PM' } },
  ],

  /** Minimum number of days between booking and the appointment date. */
  minLeadTimeDays: 2,

  /** Maximum number of days in advance a customer can book. */
  maxAdvanceBookingDays: 90,

  /**
   * Specific dates the business is closed (stat holidays, etc).
   * PLACEHOLDER — populate with real closures before launch.
   * Format: 'YYYY-MM-DD'.
   */
  blackoutDates: [] as string[],

  /** Estimated appointment duration, in minutes, per bedroom count — used only as a display estimate. */
  baseDurationMinutes: 90,
  durationPerBedroomMinutes: 30,
};

export function isBusinessDay(date: Date): boolean {
  return bookingRules.businessDays.includes(date.getDay());
}

export function isBlackoutDate(date: Date): boolean {
  const iso = date.toISOString().slice(0, 10);
  return bookingRules.blackoutDates.includes(iso);
}

export function isBookableDate(date: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < bookingRules.minLeadTimeDays) return false;
  if (diffDays > bookingRules.maxAdvanceBookingDays) return false;
  if (!isBusinessDay(target)) return false;
  if (isBlackoutDate(target)) return false;

  return true;
}

export function estimateDurationMinutes(bedrooms: number): number {
  return bookingRules.baseDurationMinutes + bedrooms * bookingRules.durationPerBedroomMinutes;
}
