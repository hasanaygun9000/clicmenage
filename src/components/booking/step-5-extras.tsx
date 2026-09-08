'use client';

import { Check, Minus, Plus } from 'lucide-react';
import { getExtrasForService } from '@/lib/config/extras';
import { pricingConfig } from '@/lib/pricing/pricing-config';
import { formatCurrency } from '@/lib/pricing/engine';
import { ResolvedIcon } from '@/components/ui/icon-map';
import { cn } from '@/lib/utils';
import type { StepProps } from './types';

const UNIT_LABEL_KEY = {
  perWindow: 'perWindowUnit',
  perLoad: 'perLoadUnit',
  perBed: 'perBedUnit',
} as const;

export function Step5Extras({ state, update, locale, dict }: StepProps) {
  const t = dict.booking.step5;
  const availableExtras = state.service ? getExtrasForService(state.service) : [];

  function toggle(id: string) {
    const isSelected = state.extras.some((e) => e.id === id);
    update({
      extras: isSelected ? state.extras.filter((e) => e.id !== id) : [...state.extras, { id, quantity: 1 }],
    });
  }

  function setQuantity(id: string, quantity: number) {
    update({
      extras: state.extras.map((e) => (e.id === id ? { ...e, quantity: Math.max(1, quantity) } : e)),
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {availableExtras.map((extra) => {
          const selectedExtra = state.extras.find((e) => e.id === extra.id);
          const selected = Boolean(selectedExtra);
          const pricing = pricingConfig.extrasPricing[extra.id];
          if (!pricing) return null;
          const unitLabel = pricing.unit === 'flat' ? '' : ` ${t[UNIT_LABEL_KEY[pricing.unit]]}`;

          return (
            <div
              key={extra.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border-2 bg-white p-4 text-left transition-colors',
                selected ? 'border-primary-700 ring-2 ring-primary-100' : 'border-sand-200 hover:border-primary-200'
              )}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => toggle(extra.id)}
                className="flex flex-1 items-start gap-3 text-left"
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
                    +{formatCurrency(pricing.price, locale)}
                    {unitLabel}
                  </span>
                </span>
              </button>

              {selected && pricing.unit !== 'flat' && (
                <div className="flex flex-shrink-0 flex-col items-center gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{t.quantityLabel}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(extra.id, (selectedExtra?.quantity ?? 1) - 1)}
                      disabled={(selectedExtra?.quantity ?? 1) <= 1}
                      aria-label={`${extra.name[locale]} -1`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">{selectedExtra?.quantity ?? 1}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(extra.id, (selectedExtra?.quantity ?? 1) + 1)}
                      aria-label={`${extra.name[locale]} +1`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 text-ink hover:bg-sand-100"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.extras.length === 0 && <p className="mt-4 text-sm text-ink-muted">{t.noneSelected}</p>}
    </div>
  );
}
