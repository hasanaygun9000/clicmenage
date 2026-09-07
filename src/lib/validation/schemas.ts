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

export const bookingSelectionSchema = z.object({
  postalCode: canadianPostalCode,
  areaSlug: z.string().nullable(),
  service: z.enum(['regular', 'deep', 'move']),
  bedrooms: z.number().int().min(0).max(10),
  bathrooms: z.number().int().min(0).max(10),
  sqft: z.number().int().min(0).max(20000).optional(),
  frequency: z.enum(['once', 'weekly', 'biweekly', 'every4weeks']),
  extraIds: z.array(z.string()),
  date: z.string().min(1, 'required'),
  timeWindowId: z.string().min(1, 'required'),
});

export const createBookingSchema = z.object({
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
