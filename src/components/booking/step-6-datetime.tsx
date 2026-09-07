'use client';

import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { bookingRules, isBookableDate } from '@/lib/config/booking-rules';
import { cn } from '@/lib/utils';
import type { StepProps } from './types';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function Step6DateTime({ state, update, locale, dict }: StepProps) {
  const t = dict.booking.step6;

  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    const min = new Date(now);
    min.setDate(min.getDate() + bookingRules.minLeadTimeDays);
    const max = new Date(now);
    max.setDate(max.getDate() + bookingRules.maxAdvanceBookingDays);
    return { minDate: toIsoDate(min), maxDate: toIsoDate(max) };
  }, []);

  const selectedDateValid = state.date ? isBookableDate(new Date(`${state.date}T00:00:00`)) : true;

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-date" className="label">
            {t.dateLabel}
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              id="booking-date"
              type="date"
              min={minDate}
              max={maxDate}
              value={state.date}
              onChange={(e) => update({ date: e.target.value })}
              className="input pl-10"
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">{t.leadTimeNote}</p>
          {state.date && !selectedDateValid && (
            <p role="alert" className="field-error">
              {t.noSlotsMessage}
            </p>
          )}
        </div>

        <div>
          <span className="label">{t.windowLabel}</span>
          <div role="radiogroup" aria-label={t.windowLabel} className="grid gap-2">
            {bookingRules.timeWindows.map((window) => {
              const selected = state.timeWindowId === window.id;
              return (
                <button
                  key={window.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update({ timeWindowId: window.id })}
                  className={cn(
                    'rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors',
                    selected ? 'border-primary-700 bg-primary-50 text-primary-900 ring-2 ring-primary-100' : 'border-sand-200 bg-white text-ink hover:border-primary-200'
                  )}
                >
                  {window.label[locale]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
