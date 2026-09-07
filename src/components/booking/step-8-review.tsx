'use client';

import Link from 'next/link';
import { services } from '@/lib/config/services';
import { extras as extrasCatalog } from '@/lib/config/extras';
import { bookingRules } from '@/lib/config/booking-rules';
import { calculatePricing, formatCurrency } from '@/lib/pricing/engine';
import { routes } from '@/lib/config/routes';
import type { StepProps } from './types';

const frequencyLabels: Record<string, { fr: string; en: string }> = {
  once: { fr: 'Une seule fois', en: 'One time' },
  weekly: { fr: 'Chaque semaine', en: 'Weekly' },
  biweekly: { fr: 'Aux deux semaines', en: 'Every 2 weeks' },
  every4weeks: { fr: 'Aux quatre semaines', en: 'Every 4 weeks' },
};

function ReviewRow({ label, value, onEdit, editLabel }: { label: string; value: string; onEdit?: () => void; editLabel: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-sand-100 py-3 last:border-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="flex-shrink-0 text-xs font-semibold text-primary-700 hover:text-primary-900">
          {editLabel}
        </button>
      )}
    </div>
  );
}

export function Step8Review({ state, update, locale, dict, goToStep }: StepProps) {
  const t = dict.booking.step8;
  if (!state.service) return null;

  const pricing = calculatePricing({
    service: state.service,
    bedrooms: state.bedrooms,
    bathrooms: state.bathrooms,
    sqft: state.sqft ? Number(state.sqft) : undefined,
    frequency: state.frequency,
    extraIds: state.extraIds,
  });

  const serviceLabel = services.find((s) => s.pricingKey === state.service)?.name[locale] ?? '';
  const selectedExtras = extrasCatalog.filter((e) => state.extraIds.includes(e.id));
  const timeWindow = bookingRules.timeWindows.find((w) => w.id === state.timeWindowId);

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 rounded-lg border border-sand-200 bg-white p-6">
        <ReviewRow label={t.serviceLabel} value={serviceLabel} onEdit={() => goToStep?.(2)} editLabel={dict.booking.editStep} />
        <ReviewRow
          label={t.homeSizeLabel}
          value={`${state.bedrooms} ch. · ${state.bathrooms} sdb.${state.sqft ? ` · ${state.sqft} pi²` : ''}`}
          onEdit={() => goToStep?.(3)}
          editLabel={dict.booking.editStep}
        />
        <ReviewRow
          label={t.frequencyLabel}
          value={frequencyLabels[state.frequency]?.[locale] ?? state.frequency}
          onEdit={() => goToStep?.(4)}
          editLabel={dict.booking.editStep}
        />
        <ReviewRow
          label={t.extrasLabel}
          value={selectedExtras.length ? selectedExtras.map((e) => e.name[locale]).join(', ') : dict.booking.step5.noneSelected}
          onEdit={() => goToStep?.(5)}
          editLabel={dict.booking.editStep}
        />
        <ReviewRow
          label={t.dateLabel}
          value={`${state.date}${timeWindow ? ` · ${timeWindow.label[locale]}` : ''}`}
          onEdit={() => goToStep?.(6)}
          editLabel={dict.booking.editStep}
        />
        <ReviewRow
          label={t.addressLabel}
          value={`${state.customer.address}${state.customer.unit ? `, ${state.customer.unit}` : ''}, ${state.customer.city} ${state.customer.postalCode}`}
          onEdit={() => goToStep?.(7)}
          editLabel={dict.booking.editStep}
        />
        <ReviewRow
          label={t.contactLabel}
          value={`${state.customer.firstName} ${state.customer.lastName} · ${state.customer.email} · ${state.customer.phone}`}
          onEdit={() => goToStep?.(7)}
          editLabel={dict.booking.editStep}
        />
      </div>

      <div className="mt-6 rounded-lg border border-sand-200 bg-sand-50 p-6">
        <h3 className="text-sm font-semibold text-ink">{t.priceBreakdownTitle}</h3>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">{dict.common.subtotal}</dt>
            <dd>{formatCurrency(pricing.subtotal, locale)}</dd>
          </div>
          {pricing.frequencyDiscountAmount > 0 && (
            <div className="flex justify-between text-accent-700">
              <dt>{dict.booking.step4.savingsBadge}</dt>
              <dd>-{formatCurrency(pricing.frequencyDiscountAmount, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-muted">{dict.common.taxes}</dt>
            <dd>{formatCurrency(pricing.taxAmount, locale)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-sand-200 pt-2 text-base font-semibold">
            <dt>{dict.common.estimatedTotal}</dt>
            <dd className="text-primary-900">{formatCurrency(pricing.total, locale)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t.promoNote}</p>
        {pricing.isDemoPricing && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{dict.common.demoPricingNotice}</p>}
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={state.termsAccepted}
          onChange={(e) => update({ termsAccepted: e.target.checked })}
          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-sand-300 text-accent-600 focus:ring-accent-500"
        />
        <span>
          {t.termsAgree}{' '}
          <Link href={routes.terms(locale)} target="_blank" className="font-medium text-primary-700 underline hover:text-primary-900">
            {t.termsLinkText}
          </Link>
        </span>
      </label>
    </div>
  );
}
