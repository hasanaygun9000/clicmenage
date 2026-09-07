/**
 * ============================================================================
 *  CONVERSION EVENT HOOKS — ClicMénage
 * ============================================================================
 * A single, typed `trackEvent` call site used across the booking flow and
 * contact form. It pushes to `window.dataLayer` (the standard integration
 * point for Google Tag Manager / Google Analytics 4) when present, and is a
 * silent no-op otherwise — so none of this requires an analytics account to
 * be configured, and none of it blocks the UI.
 *
 * To wire up a real analytics tool: enable GTM/GA via the env vars in
 * .env.example (see src/components/analytics/analytics-scripts.tsx), then
 * map these event names to GA4 events / GTM triggers in your tag manager —
 * no code changes needed here.
 * ============================================================================
 */

export type AnalyticsEventName =
  | 'booking_started'
  | 'postal_code_validated'
  | 'service_selected'
  | 'booking_step_completed'
  | 'checkout_started'
  | 'booking_completed'
  | 'contact_form_submitted';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(name: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
}
