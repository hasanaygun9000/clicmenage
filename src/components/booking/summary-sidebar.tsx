import { services } from '@/lib/config/services';
import { calculatePricing, formatCurrency } from '@/lib/pricing/engine';
import type { BookingWizardState } from './types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';

export function SummarySidebar({
  state,
  locale,
  dict,
  step,
}: {
  state: BookingWizardState;
  locale: Locale;
  dict: Dictionary;
  /** Current wizard step (1-indexed) — the sidebar's placeholder copy must
   * match whichever step is actually active, not just "is a service picked
   * yet". Without this, step 1 (still checking the service area) incorrectly
   * showed step 2's "choose your service" copy. */
  step: number;
}) {
  // Step 1: the customer hasn't confirmed their service area yet, so there's
  // nothing service/pricing-related to summarize — show step-1-relevant
  // guidance instead, regardless of any service selected in a prior session.
  if (step === 1) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink">{dict.booking.summaryTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.booking.summaryStep1Note}</p>
      </div>
    );
  }

  if (!state.service) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink">{dict.booking.summaryTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.booking.step2.subtitle}</p>
      </div>
    );
  }

  const pricing = calculatePricing({
    service: state.service,
    bedrooms: state.bedrooms,
    bathrooms: state.bathrooms,
    sqft: state.sqft ? Number(state.sqft) : undefined,
    frequency: state.frequency,
    extraIds: state.extraIds,
  });

  const serviceLabel = services.find((s) => s.pricingKey === state.service)?.name[locale] ?? '';

  return (
    <div className="card sticky top-24 p-6">
      <h3 className="text-sm font-semibold text-ink">{dict.booking.summaryTitle}</h3>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{dict.booking.step8.serviceLabel}</dt>
          <dd className="text-right font-medium text-ink">{serviceLabel}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{dict.booking.step8.homeSizeLabel}</dt>
          <dd className="text-right font-medium text-ink">
            {state.bedrooms} ch. · {state.bathrooms} sdb.
          </dd>
        </div>
        {state.extraIds.length > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">{dict.booking.step8.extrasLabel}</dt>
            <dd className="text-right font-medium text-ink">
              {state.extraIds.length} {locale === 'fr' ? 'extra(s)' : 'extra(s)'}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 space-y-1.5 border-t border-sand-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">{dict.common.subtotal}</span>
          <span className="text-ink">{formatCurrency(pricing.subtotal, locale)}</span>
        </div>
        {pricing.frequencyDiscountAmount > 0 && (
          <div className="flex justify-between text-accent-700">
            <span>{dict.booking.step4.savingsBadge}</span>
            <span>-{formatCurrency(pricing.frequencyDiscountAmount, locale)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-ink-muted">{dict.common.taxes}</span>
          <span className="text-ink">{formatCurrency(pricing.taxAmount, locale)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-sand-200 pt-2 text-base font-semibold">
          <span>{dict.common.estimatedTotal}</span>
          <span className="text-primary-900">{formatCurrency(pricing.total, locale)}</span>
        </div>
      </div>

      {pricing.isDemoPricing && <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">{dict.common.demoPricingNotice}</p>}
    </div>
  );
}
