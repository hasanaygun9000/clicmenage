'use client';

import { Check } from 'lucide-react';
import { extras } from '@/lib/config/extras';
import { pricingConfig } from '@/lib/pricing/pricing-config';
import { formatCurrency } from '@/lib/pricing/engine';
import { ResolvedIcon } from '@/components/ui/icon-map';
import { cn } from '@/lib/utils';
import type { StepProps } from './types';

export function Step5Extras({ state, update, locale, dict }: StepProps) {
  const t = dict.booking.step5;

  function toggle(id: string) {
    const isSelected = state.extraIds.includes(id);
    update({
      extraIds: isSelected ? state.extraIds.filter((x) => x !== id) : [...state.extraIds, id],
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {extras.map((extra) => {
          const selected = state.extraIds.includes(extra.id);
          return (
            <button
              key={extra.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(extra.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border-2 bg-white p-4 text-left transition-colors',
                selected ? 'border-primary-700 ring-2 ring-primary-100' : 'border-sand-200 hover:border-primary-200'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md',
                  selected ? 'bg-primary-800 text-white' : 'bg-primary-50 text-primary-800'
                )}
              >
                <ResolvedIcon name={extra.icon} className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{extra.name[locale]}</span>
                  {selected && <Check className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{extra.description[locale]}</span>
                <span className="mt-1.5 block text-sm font-semibold text-accent-700">
                  +{formatCurrency(pricingConfig.extrasPricing[extra.id] ?? 0, locale)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {state.extraIds.length === 0 && <p className="mt-4 text-sm text-ink-muted">{t.noneSelected}</p>}
    </div>
  );
}
