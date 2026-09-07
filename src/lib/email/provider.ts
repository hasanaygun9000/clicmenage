/**
 * ============================================================================
 *  TRANSACTIONAL EMAIL ABSTRACTION — ClicMénage
 * ============================================================================
 * A single `sendEmail` entry point used for every transactional message
 * (booking confirmation, reminders, reschedule/cancellation confirmations,
 * new-booking alerts to the business). Nothing else in the app should call
 * an email provider's SDK directly.
 *
 * TO ENABLE REAL EMAIL SENDING:
 *   1. Choose a provider (Resend and Postmark both have generous free tiers
 *      and work well with Next.js). Install its SDK.
 *   2. Set EMAIL_PROVIDER_API_KEY and EMAIL_FROM_ADDRESS in .env.local.
 *   3. Replace the mock branch below with a real API call.
 *
 * Until then, `isEmailConfigured()` is false and every call is logged and
 * resolved successfully in mock mode, so the booking flow and contact form
 * work end-to-end without an email account.
 * ============================================================================
 */

export type EmailTemplate =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_rescheduled'
  | 'booking_cancelled'
  | 'new_booking_business_alert'
  | 'contact_form_notification';

export interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export interface SendEmailResult {
  provider: 'mock' | 'configured';
  delivered: boolean;
  messageId: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.EMAIL_PROVIDER_API_KEY);
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    // Mock mode — log what would have been sent so booking/contact flows
    // are fully testable without a real email provider configured.
    // eslint-disable-next-line no-console
    console.info(`[email:mock] Would send "${params.template}" to ${params.to}`, params.data);
    return {
      provider: 'mock',
      delivered: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  // Real provider integration point — implement once EMAIL_PROVIDER_API_KEY
  // is set and an SDK (e.g. `resend`) is installed.
  throw new Error(
    'EMAIL_PROVIDER_API_KEY is set but no email provider integration has been implemented yet. ' +
      'Complete sendEmail() in src/lib/email/provider.ts.'
  );
}
