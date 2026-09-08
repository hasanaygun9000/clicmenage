'use client';

import { services } from '@/lib/config/services';
import { getStartingPrice, formatCurrency } from '@/lib/pricing/engine';
import { ResolvedIcon } from '@/components/ui/icon-map';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics/events';
import type { StepProps } from './types';

export function Step2Service({ state, update, locale, dict }: StepProps) {
  const t = dict.booking.step2;

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div role="radiogroup" aria-label={t.title} className="mt-6 grid gap-4 sm:grid-cols-3">
        {services.map((service) => {
          const selected = state.service === service.pricingKey;
          return (
            <button
              key={service.slug}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                trackEvent('service_selected', { service: service.pricingKey });
                update({ service: service.pricingKey });
              }}
              className={cn(
                'flex flex-col items-start rounded-lg border-2 bg-white p-5 text-left transition-colors',
                selected ? 'border-primary-700 ring-2 ring-primary-100' : 'border-sand-200 hover:border-primary-200'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-md',
                  selected ? 'bg-primary-800 text-white' : 'bg-primary-50 text-primary-800'
                )}
              >
                <ResolvedIcon name={service.icon} className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-ink">{service.name[locale]}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{service.shortDescription[locale]}</p>
              <p className="mt-3 text-sm font-semibold text-primary-800">
                {dict.common.from} {formatCurrency(getStartingPrice(service.pricingKey), locale)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
