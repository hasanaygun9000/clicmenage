'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { HOUSING_TYPES_WITH_FLOORS, type ServicePricingKey } from '@/lib/pricing/pricing-config';
import { getDeepRecommendationLevel } from '@/lib/pricing/engine';
import { isBookableDate } from '@/lib/config/booking-rules';
import { trackEvent } from '@/lib/analytics/events';
import { Container } from '@/components/ui/container';
import { StepIndicator, StepDots } from './step-indicator';
import { SummarySidebar } from './summary-sidebar';
import { initialBookingState, TOTAL_STEPS, type BookingWizardState } from './types';
import { Step1Area } from './step-1-area';
import { Step2Service } from './step-2-service';
import { Step3Size } from './step-3-size';
import { Step4Frequency } from './step-4-frequency';
import { Step5Extras } from './step-5-extras';
import { Step6DateTime } from './step-6-datetime';
import { Step7Contact } from './step-7-contact';
import { Step8Review } from './step-8-review';
import { Step9Payment } from './step-9-payment';

// Deliberately loose — this only gates whether the wizard can advance, it's
// not the source of truth for delivery validity (the server re-validates).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidStep(step: number, state: BookingWizardState): boolean {
  switch (step) {
    case 1:
      return state.areaCheckStatus === 'in-area';
    case 2:
      return Boolean(state.service);
    case 3: {
      if (
        !state.housingType ||
        state.bedrooms === null ||
        !state.fullBathrooms ||
        !state.sqftBucket ||
        !state.lastCleaning ||
        !state.petHair
      ) {
        return false;
      }
      if (HOUSING_TYPES_WITH_FLOORS.includes(state.housingType) && !state.floors) return false;
      if (state.service === 'move' && !state.furnishingState) return false;
      // A first-time Regular booking after a long gap must switch to Deep
      // before continuing — the step-3 banner offers that switch inline.
      if (state.service === 'regular' && getDeepRecommendationLevel(state.lastCleaning) === 'required') return false;
      return true;
    }
    case 4:
      return Boolean(state.frequency);
    case 5:
      return true;
    case 6:
      return (
        Boolean(state.date) &&
        Boolean(state.timeWindowId) &&
        isBookableDate(new Date(`${state.date}T00:00:00`))
      );
    case 7: {
      const c = state.customer;
      return Boolean(
        c.firstName && c.lastName && c.email && EMAIL_PATTERN.test(c.email) && c.phone && c.address && c.city && c.postalCode
      );
    }
    case 8:
      return state.termsAccepted;
    default:
      return true;
  }
}

export function BookingWizard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingWizardState>(initialBookingState);
  const searchParams = useSearchParams();
  const stepContentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Move focus to the new step's content on every step change (but not on
  // first mount) so screen-reader users get the new step announced and
  // keyboard focus lands where the page visually scrolls to, instead of
  // staying on a "Continue" button that scrolled out of view.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepContentRef.current?.focus({ preventScroll: true });
  }, [step]);

  // Prefill from query params (e.g. hero postal-code check, or a service
  // page's "book this service" link with ?service=regular).
  useEffect(() => {
    const postal = searchParams.get('postal');
    const service = searchParams.get('service') as ServicePricingKey | null;
    setState((prev) => ({
      ...prev,
      postalCode: postal ?? prev.postalCode,
      service: service && ['regular', 'deep', 'move'].includes(service) ? service : prev.service,
    }));
    trackEvent('booking_started');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(patch: Partial<BookingWizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function updateCustomer(patch: Partial<BookingWizardState['customer']>) {
    setState((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }));
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      trackEvent('booking_step_completed', { step });
      if (step + 1 === TOTAL_STEPS) {
        trackEvent('checkout_started');
      }
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToStep(target: number) {
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const stepProps = { state, update, updateCustomer, locale, dict, goToStep };
  const canContinue = isValidStep(step, state);
  const isLastInteractiveStep = step === TOTAL_STEPS - 1; // step 8, "Confirm" leads to payment
  const isPaymentStep = step === TOTAL_STEPS;

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{dict.booking.title}</h1>
          <p className="mt-2 text-ink-muted">{dict.booking.subtitle}</p>
        </div>

        <div className="mx-auto mb-8 max-w-3xl">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} dict={dict} />
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div ref={stepContentRef} tabIndex={-1} className="card p-6 sm:p-8">
            {step === 1 && <Step1Area {...stepProps} />}
            {step === 2 && <Step2Service {...stepProps} />}
            {step === 3 && <Step3Size {...stepProps} />}
            {step === 4 && <Step4Frequency {...stepProps} />}
            {step === 5 && <Step5Extras {...stepProps} />}
            {step === 6 && <Step6DateTime {...stepProps} />}
            {step === 7 && <Step7Contact {...stepProps} />}
            {step === 8 && <Step8Review {...stepProps} />}
            {step === 9 && <Step9Payment {...stepProps} />}

            {!isPaymentStep && (
              <div className="mt-8 flex items-center justify-between border-t border-sand-200 pt-6">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="btn-ghost disabled:invisible"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {dict.booking.backButton}
                </button>
                <StepDots currentStep={step} totalSteps={TOTAL_STEPS} />
                <div className="flex flex-col items-end gap-1.5">
                  <button type="button" onClick={goNext} disabled={!canContinue} className="btn-primary">
                    {isLastInteractiveStep ? dict.booking.step9.payLabel : dict.booking.continueButton}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {!canContinue && <p className="text-xs text-ink-muted">{dict.booking.continueHint}</p>}
                </div>
              </div>
            )}
            {isPaymentStep && step > 1 && (
              <div className="mt-8 flex items-center justify-start border-t border-sand-200 pt-6">
                <button type="button" onClick={goBack} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {dict.booking.backButton}
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <SummarySidebar state={state} locale={locale} dict={dict} step={step} />
          </div>
        </div>
      </Container>
    </section>
  );
}
