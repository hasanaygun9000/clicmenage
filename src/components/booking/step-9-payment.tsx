'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { calculatePricing, formatCurrency } from '@/lib/pricing/engine';
import { routes } from '@/lib/config/routes';
import { homeHref } from '@/lib/config/nav';
import { trackEvent } from '@/lib/analytics/events';
import type { StepProps } from './types';
import Link from 'next/link';

type SubmitStatus = 'idle' | 'processing' | 'success' | 'error';

export function Step9Payment({ state, locale, dict }: StepProps) {
  const t = dict.booking.step9;
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [reviewRequired, setReviewRequired] = useState(false);
  const [isRealEmail, setIsRealEmail] = useState(false);

  // Client-side pricing snapshot, purely to know up front whether this job
  // needs manual review (never trusted for the actual price — the server
  // always recomputes it in /api/bookings before anything is committed).
  const pricing =
    state.service && state.housingType && state.bedrooms !== null && state.fullBathrooms && state.sqftBucket && state.petHair
      ? calculatePricing({
          service: state.service,
          housingType: state.housingType,
          bedrooms: state.bedrooms,
          fullBathrooms: state.fullBathrooms,
          halfBathrooms: state.halfBathrooms,
          sqftBucket: state.sqftBucket,
          floors: state.floors ?? undefined,
          petHair: state.petHair,
          furnishingState: state.furnishingState ?? undefined,
          frequency: state.frequency,
          extras: state.extras,
        })
      : null;
  const manualReviewRequired = pricing?.manualReviewRequired ?? false;

  async function handleConfirm() {
    if (!state.service) return;
    setStatus('processing');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          selection: {
            postalCode: state.postalCode,
            areaSlug: state.areaSlug,
            service: state.service,
            housingType: state.housingType,
            bedrooms: state.bedrooms,
            fullBathrooms: state.fullBathrooms,
            halfBathrooms: state.halfBathrooms,
            sqftBucket: state.sqftBucket,
            floors: state.floors ?? undefined,
            lastCleaning: state.lastCleaning,
            petHair: state.petHair,
            furnishingState: state.furnishingState ?? undefined,
            frequency: state.frequency,
            extras: state.extras,
            date: state.date,
            timeWindowId: state.timeWindowId,
          },
          customer: state.customer,
        }),
      });

      if (!response.ok) throw new Error('Booking request failed');

      const data = await response.json();

      if (data.reviewRequired) {
        // Verification/estimate request only — no payment was taken and no
        // booking was confirmed. See the V1.1 manual-review gate in
        // src/app/api/bookings/route.ts.
        setReviewRequired(true);
        setConfirmationNumber(data.confirmationNumber ?? null);
      } else {
        setReviewRequired(false);
        setConfirmationNumber(data.booking.confirmationNumber);
        setTotal(data.booking.pricing.total);
        // Never claim a real confirmation email was sent while the email
        // provider is still in mock mode (see route.ts's `email.provider`).
        setIsRealEmail(data.email?.provider === 'configured');
        trackEvent('booking_completed', {
          confirmationNumber: data.booking.confirmationNumber,
          total: data.booking.pricing.total,
          service: state.service,
        });
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    if (reviewRequired) {
      return (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <ShieldCheck className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-2xl font-semibold">{t.reviewReceivedTitle}</h2>
          <p className="mt-2 max-w-md text-ink-muted">{t.reviewReceivedMessage}</p>

          {confirmationNumber && (
            <div className="mt-6 rounded-lg border border-sand-200 bg-sand-50 px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.confirmationNumberLabel}</p>
              <p className="mt-1 text-lg font-semibold text-primary-900">{confirmationNumber}</p>
            </div>
          )}

          <Link href={homeHref(locale)} className="btn-primary mt-8">
            {t.backHomeButton}
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-2xl font-semibold">{t.successTitle}</h2>
        <p className="mt-2 max-w-md text-ink-muted">{isRealEmail ? t.successMessage : t.demoSuccessMessage}</p>

        <div className="mt-6 rounded-lg border border-sand-200 bg-sand-50 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.confirmationNumberLabel}</p>
          <p className="mt-1 text-lg font-semibold text-primary-900">{confirmationNumber}</p>
          {total !== null && <p className="mt-1 text-sm text-ink-muted">{formatCurrency(total, locale)}</p>}
        </div>

        <Link href={homeHref(locale)} className="btn-primary mt-8">
          {t.backHomeButton}
        </Link>
      </div>
    );
  }

  if (manualReviewRequired) {
    return (
      <div>
        <h2 className="text-2xl font-semibold">{t.reviewRequiredTitle}</h2>
        <p className="mt-2 text-ink-muted">{t.reviewRequiredBody}</p>

        {status === 'error' && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-md bg-error-50 px-4 py-3 text-error">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{t.errorTitle}</p>
              <p className="text-sm">{t.errorMessage}</p>
            </div>
          </div>
        )}

        <button type="button" onClick={handleConfirm} disabled={status === 'processing'} className="btn-primary mt-6 w-full sm:w-auto">
          {status === 'processing' ? t.processingButton : t.sendReviewRequestButton}
        </button>

        <p className="mt-4 text-xs text-ink-muted">
          <Link href={routes.privacy(locale)} className="underline hover:text-primary-800">
            {locale === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" aria-hidden="true" />
        <p className="text-sm text-primary-800">{t.mockNotice}</p>
      </div>

      <div className="mt-6 rounded-lg border border-sand-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-medium text-ink">
            {locale === 'fr' ? 'Paiement sécurisé (démonstration)' : 'Secure payment (demo)'}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input disabled placeholder={locale === 'fr' ? 'Numéro de carte' : 'Card number'} className="input bg-sand-50" />
          <input disabled placeholder={locale === 'fr' ? 'Nom sur la carte' : 'Name on card'} className="input bg-sand-50" />
          <input disabled placeholder="MM / AA" className="input bg-sand-50" />
          <input disabled placeholder="CVC" className="input bg-sand-50" />
        </div>
      </div>

      {status === 'error' && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-md bg-error-50 px-4 py-3 text-error">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{t.errorTitle}</p>
            <p className="text-sm">{t.errorMessage}</p>
          </div>
        </div>
      )}

      <button type="button" onClick={handleConfirm} disabled={status === 'processing'} className="btn-primary mt-6 w-full sm:w-auto">
        {status === 'processing' ? t.processingButton : t.confirmButton}
      </button>

      <p className="mt-4 text-xs text-ink-muted">
        <Link href={routes.privacy(locale)} className="underline hover:text-primary-800">
          {locale === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}
        </Link>
      </p>
    </div>
  );
}
