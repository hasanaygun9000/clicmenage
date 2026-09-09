import { z } from 'zod';
import { isValidCanadianPostalCode } from '@/lib/config/service-areas';

/**
 * Shared validation schemas — used both client-side (inline field
 * validation as the user types/advances steps) and server-side (the
 * booking and contact API routes re-validate everything, since client
 * validation can always be bypassed).
 */

const canadianPostalCode = z
  .string()
  .trim()
  .min(1)
  .refine(isValidCanadianPostalCode, { message: 'invalid_postal_code' });

// Loose but effective phone check: allows spaces, dashes, parens, +, 7-15 digits.
const phoneNumber = z
  .string()
  .trim()
  .min(1)
  .refine((val) => /^[\d\s()+\-.]{7,20}$/.test(val) && val.replace(/\D/g, '').length >= 10, {
    message: 'invalid_phone',
  });

export const bookingCustomerSchema = z.object({
  firstName: z.string().trim().min(1, 'required'),
  lastName: z.string().trim().min(1, 'required'),
  email: z.string().trim().min(1, 'required').email('invalid_email'),
  phone: phoneNumber,
  address: z.string().trim().min(1, 'required'),
  unit: z.string().trim().optional(),
  postalCode: canadianPostalCode,
  city: z.string().trim().min(1, 'required'),
  instructions: z.string().trim().max(2000).optional(),
});

const selectedExtraSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const bookingSelectionSchema = z
  .object({
    postalCode: canadianPostalCode,
    areaSlug: z.string().nullable(),
    service: z.enum(['regular', 'deep', 'move']),
    housingType: z.enum(['condo_apartment', 'house', 'townhouse', 'duplex_triplex']),
    /** 0 = studio, 1-5 = exact count, 6 = "6+". */
    bedrooms: z.number().int().min(0).max(6),
    fullBathrooms: z.number().int().min(1).max(8),
    halfBathrooms: z.number().int().min(0).max(5),
    sqftBucket: z.enum([
      'under750',
      '750_999',
      '1000_1499',
      '1500_1999',
      '2000_2499',
      '2500_2999',
      '3000plus',
      'unknown',
    ]),
    /** Only meaningful for house/townhouse — see superRefine below. */
    floors: z.number().int().min(1).max(4).optional(),
    lastCleaning: z.enum(['under1month', '1to3months', '3to6months', 'over6months', 'over1year', 'unknown']),
    petHair: z.enum(['none', 'some', 'heavy']),
    /** Move-In/Out only — see superRefine below. */
    furnishingState: z.enum(['empty', 'partly_furnished', 'furnished']).optional(),
    frequency: z.enum(['once', 'weekly', 'biweekly', 'every4weeks']),
    extras: z.array(selectedExtraSchema),
    date: z.string().min(1, 'required'),
    timeWindowId: z.string().min(1, 'required'),
  })
  .superRefine((selection, ctx) => {
    if (selection.service === 'move' && !selection.furnishingState) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['furnishingState'],
        message: 'required',
      });
    }
    if ((selection.housingType === 'house' || selection.housingType === 'townhouse') && !selection.floors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['floors'],
        message: 'required',
      });
    }
  });

export const createBookingSchema = z.object({
  // Phase 2 — needed so the booking row can record which language the
  // customer booked in (bookings.locale). Purely descriptive metadata, not
  // a pricing input — never affects calculatePricing().
  locale: z.enum(['fr', 'en']).default('fr'),
  selection: bookingSelectionSchema,
  customer: bookingCustomerSchema,
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'required'),
  email: z.string().trim().min(1, 'required').email('invalid_email'),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1, 'required'),
  message: z.string().trim().min(10, 'required').max(4000),
  /** Honeypot field — real users never fill this in. See contact API route. */
  company: z.string().max(0).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const areaNotifySchema = z.object({
  email: z.string().trim().min(1, 'required').email('invalid_email'),
  postalCode: canadianPostalCode.optional(),
});
