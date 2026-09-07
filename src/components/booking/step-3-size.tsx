'use client';

import { Minus, Plus } from 'lucide-react';
import type { StepProps } from './types';

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 8,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-sand-200 bg-white px-5 py-4">
      <span className="font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${label} -1`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="w-6 text-center text-base font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${label} +1`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function Step3Size({ state, update, dict }: StepProps) {
  const t = dict.booking.step3;

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 space-y-4">
        <Stepper label={t.bedrooms} value={state.bedrooms} onChange={(v) => update({ bedrooms: v })} />
        <Stepper label={t.bathrooms} value={state.bathrooms} onChange={(v) => update({ bathrooms: v })} min={1} />

        <div>
          <label htmlFor="sqft" className="label">
            {t.sqftLabel}
          </label>
          <input
            id="sqft"
            type="number"
            inputMode="numeric"
            min={0}
            className="input"
            placeholder={t.sqftPlaceholder}
            value={state.sqft}
            onChange={(e) => update({ sqft: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-ink-muted">{t.sqftHelp}</p>
        </div>
      </div>
    </div>
  );
}
