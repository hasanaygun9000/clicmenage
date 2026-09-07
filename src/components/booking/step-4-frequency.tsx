'use client';

import { pricingConfig, type FrequencyKey } from '@/lib/pricing/pricing-config';
import { cn } from '@/lib/utils';
import type { StepProps } from './types';

const frequencyLabels: Record<FrequencyKey, { fr: string; en: string }> = {
  once: { fr: 'Une seule fois', en: 'One time' },
  weekly: { fr: 'Chaque semaine', en: 'Weekly' },
  biweekly: { fr: 'Aux deux semaines', en: 'Every 2 weeks' },
  every4weeks: { fr: 'Aux quatre semaines', en: 'Every 4 weeks' },
};

const order: FrequencyKey[] = ['once', 'weekly', 'biweekly', 'every4weeks'];

export function Step4Frequency({ state, update, locale, dict }: StepProps) {
  const t = dict.booking.step4;

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div role="radiogroup" aria-label={t.title} className="mt-6 grid gap-3 sm:grid-cols-2">
        {order.map((freq) => {
          const selected = state.frequency === freq;
          const discount = pricingConfig.frequencyDiscounts[freq];
          return (
            <button
              key={freq}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ frequency: freq })}
              className={cn(
                'flex items-center justify-between rounded-lg border-2 bg-white px-5 py-4 text-left transition-colors',
                selected ? 'border-primary-700 ring-2 ring-primary-100' : 'border-sand-200 hover:border-primary-200'
              )}
            >
              <span className="font-medium text-ink">{frequencyLabels[freq][locale]}</span>
              {discount > 0 && (
                <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
                  {t.savingsBadge} {Math.round(discount * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
