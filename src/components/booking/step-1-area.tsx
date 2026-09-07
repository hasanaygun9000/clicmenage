'use client';

import { useState } from 'react';
import { CheckCircle2, MapPinOff, Search } from 'lucide-react';
import { matchServiceAreaByPostalCode, isValidCanadianPostalCode } from '@/lib/config/service-areas';
import { trackEvent } from '@/lib/analytics/events';
import type { StepProps } from './types';

export function Step1Area({ state, update, locale, dict }: StepProps) {
  const [touched, setTouched] = useState(false);
  const t = dict.booking.step1;

  function handleCheck() {
    setTouched(true);
    const trimmed = state.postalCode.trim();

    if (!isValidCanadianPostalCode(trimmed)) {
      update({ areaCheckStatus: 'invalid', areaSlug: null, areaName: null });
      return;
    }

    const match = matchServiceAreaByPostalCode(trimmed);
    trackEvent('postal_code_validated', { inArea: Boolean(match), areaSlug: match?.slug ?? null });
    if (match) {
      update({
        areaCheckStatus: 'in-area',
        areaSlug: match.slug,
        areaName: match.name[locale],
        customer: { ...state.customer, postalCode: trimmed, city: state.customer.city || match.name[locale] },
      });
    } else {
      update({ areaCheckStatus: 'out-of-area', areaSlug: null, areaName: null });
    }
  }

  async function handleNotifySubmit() {
    try {
      await fetch('/api/area-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.notifyEmail, postalCode: state.postalCode }),
      });
    } catch {
      // Non-blocking — still confirm to the user.
    }
    update({ notifySubmitted: true });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="postal-code" className="label">
            {t.postalLabel}
          </label>
          <input
            id="postal-code"
            className="input"
            placeholder={t.postalPlaceholder}
            value={state.postalCode}
            autoComplete="postal-code"
            onChange={(e) => update({ postalCode: e.target.value, areaCheckStatus: 'idle' })}
          />
        </div>
        <button type="button" onClick={handleCheck} className="btn-primary mt-0 self-end">
          <Search className="h-4 w-4" aria-hidden="true" />
          {t.checkButton}
        </button>
      </div>

      {touched && state.areaCheckStatus === 'invalid' && (
        <p role="alert" className="field-error mt-3">
          {t.invalidPostal}
        </p>
      )}

      {state.areaCheckStatus === 'in-area' && (
        <div role="status" className="mt-5 flex items-center gap-3 rounded-md bg-accent-50 px-4 py-3 text-accent-800">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">
            {t.inAreaMessage} ({state.areaName})
          </p>
        </div>
      )}

      {state.areaCheckStatus === 'out-of-area' && (
        <div role="status" className="mt-5 rounded-lg border border-sand-200 bg-sand-50 p-6">
          <div className="flex items-start gap-3">
            <MapPinOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-ink-muted" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-ink">{t.outOfAreaTitle}</h3>
              <p className="mt-1 text-sm text-ink-muted">{t.outOfAreaMessage}</p>
            </div>
          </div>

          {state.notifySubmitted ? (
            <p className="mt-4 text-sm font-medium text-accent-700">✓ {t.notifySuccess}</p>
          ) : (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="notify-email" className="sr-only">
                {t.notifyEmailPlaceholder}
              </label>
              <input
                id="notify-email"
                type="email"
                className="input flex-1"
                placeholder={t.notifyEmailPlaceholder}
                value={state.notifyEmail}
                onChange={(e) => update({ notifyEmail: e.target.value })}
              />
              <button type="button" onClick={handleNotifySubmit} className="btn-secondary flex-shrink-0">
                {t.notifySubmit}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
