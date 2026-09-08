'use client';

import type { ReactNode } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { HOUSING_TYPES_WITH_FLOORS, type HousingType, type SqftBucket, type LastCleaning, type PetHair, type FurnishingState } from '@/lib/pricing/pricing-config';
import { getDeepRecommendationLevel } from '@/lib/pricing/engine';
import { cn } from '@/lib/utils';
import type { StepProps } from './types';

/** Big, easy-to-tap card used for every choice in this step — no dropdowns, no free-typed numbers. */
function OptionCard({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-3 py-3 text-center transition-colors',
        selected ? 'border-primary-700 bg-primary-50 ring-2 ring-primary-100' : 'border-sand-200 bg-white hover:border-primary-200'
      )}
    >
      <span className={cn('text-sm font-semibold', selected ? 'text-primary-900' : 'text-ink')}>{label}</span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </button>
  );
}

function FieldSection({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <p className="label mb-0">{label}</p>
      {hint && <p className="mb-2 text-xs text-ink-muted">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  );
}

export function Step3Size({ state, update, dict }: StepProps) {
  const t = dict.booking.step3;

  const housingTypeOptions: { value: HousingType; label: string }[] = [
    { value: 'condo_apartment', label: t.housingTypeOptions.condoApartment },
    { value: 'house', label: t.housingTypeOptions.house },
    { value: 'townhouse', label: t.housingTypeOptions.townhouse },
    { value: 'duplex_triplex', label: t.housingTypeOptions.duplexTriplex },
  ];

  const bedroomOptions: { value: number; label: string }[] = [
    { value: 0, label: t.studio },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: t.sixPlus },
  ];

  const fullBathroomOptions = [1, 2, 3, 4].map((n) => ({ value: n, label: n === 4 ? '4+' : String(n) }));
  const halfBathroomOptions = [0, 1, 2, 3].map((n) => ({ value: n, label: n === 3 ? '3+' : String(n) }));

  const sqftOptions: { value: SqftBucket; label: string }[] = [
    { value: 'under750', label: t.sqftOptions.under750 },
    { value: '750_999', label: t.sqftOptions.from750to999 },
    { value: '1000_1499', label: t.sqftOptions.from1000to1499 },
    { value: '1500_1999', label: t.sqftOptions.from1500to1999 },
    { value: '2000_2499', label: t.sqftOptions.from2000to2499 },
    { value: '2500_2999', label: t.sqftOptions.from2500to2999 },
    { value: '3000plus', label: t.sqftOptions.over3000 },
    { value: 'unknown', label: t.sqftOptions.unknown },
  ];

  const floorsOptions = [
    { value: 1, label: t.floorsOptions.one },
    { value: 2, label: t.floorsOptions.two },
    { value: 3, label: t.floorsOptions.threePlus },
  ];

  const lastCleaningOptions: { value: LastCleaning; label: string }[] = [
    { value: 'under1month', label: t.lastCleaningOptions.under1month },
    { value: '1to3months', label: t.lastCleaningOptions.oneToThreeMonths },
    { value: '3to6months', label: t.lastCleaningOptions.threeToSixMonths },
    { value: 'over6months', label: t.lastCleaningOptions.over6months },
    { value: 'over1year', label: t.lastCleaningOptions.over1year },
    { value: 'unknown', label: t.lastCleaningOptions.unknown },
  ];

  const petHairOptions: { value: PetHair; label: string }[] = [
    { value: 'none', label: t.petHairOptions.none },
    { value: 'some', label: t.petHairOptions.some },
    { value: 'heavy', label: t.petHairOptions.heavy },
  ];

  const furnishingStateOptions: { value: FurnishingState; label: string }[] = [
    { value: 'empty', label: t.furnishingStateOptions.empty },
    { value: 'partly_furnished', label: t.furnishingStateOptions.partlyFurnished },
    { value: 'furnished', label: t.furnishingStateOptions.furnished },
  ];

  const showFloors = state.housingType != null && HOUSING_TYPES_WITH_FLOORS.includes(state.housingType);
  const showFurnishingState = state.service === 'move';
  const showManualReviewNotice = state.sqftBucket === '3000plus';

  const recommendationLevel = state.lastCleaning ? getDeepRecommendationLevel(state.lastCleaning) : 'none';
  const showRecommendedBanner =
    state.service === 'regular' && recommendationLevel === 'recommended' && !state.deepRecommendationAcknowledged;
  const showRequiredBanner = state.service === 'regular' && recommendationLevel === 'required';

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 space-y-6">
        <FieldSection label={t.housingTypeLabel}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label={t.housingTypeLabel}>
            {housingTypeOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={state.housingType === opt.value}
                onClick={() => update({ housingType: opt.value, floors: HOUSING_TYPES_WITH_FLOORS.includes(opt.value) ? state.floors ?? 1 : null })}
              />
            ))}
          </div>
        </FieldSection>

        <FieldSection label={t.bedroomsLabel}>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7" role="radiogroup" aria-label={t.bedroomsLabel}>
            {bedroomOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} selected={state.bedrooms === opt.value} onClick={() => update({ bedrooms: opt.value })} />
            ))}
          </div>
        </FieldSection>

        <FieldSection label={t.fullBathroomsLabel} hint={t.fullBathroomsHint}>
          <div className="grid grid-cols-4 gap-2.5" role="radiogroup" aria-label={t.fullBathroomsLabel}>
            {fullBathroomOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={state.fullBathrooms === opt.value}
                onClick={() => update({ fullBathrooms: opt.value })}
              />
            ))}
          </div>
        </FieldSection>

        <FieldSection label={t.halfBathroomsLabel} hint={t.halfBathroomsHint}>
          <div className="grid grid-cols-4 gap-2.5" role="radiogroup" aria-label={t.halfBathroomsLabel}>
            {halfBathroomOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={state.halfBathrooms === opt.value}
                onClick={() => update({ halfBathrooms: opt.value })}
              />
            ))}
          </div>
        </FieldSection>

        <FieldSection label={t.sqftLabel} hint={t.sqftHint}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label={t.sqftLabel}>
            {sqftOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} selected={state.sqftBucket === opt.value} onClick={() => update({ sqftBucket: opt.value })} />
            ))}
          </div>
          {showManualReviewNotice && (
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-700" aria-hidden="true" />
              {t.manualReviewNotice}
            </p>
          )}
        </FieldSection>

        {showFloors && (
          <FieldSection label={t.floorsLabel} hint={t.floorsHint}>
            <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label={t.floorsLabel}>
              {floorsOptions.map((opt) => (
                <OptionCard key={opt.value} label={opt.label} selected={state.floors === opt.value} onClick={() => update({ floors: opt.value })} />
              ))}
            </div>
          </FieldSection>
        )}

        {showFurnishingState && (
          <FieldSection label={t.furnishingStateLabel}>
            <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label={t.furnishingStateLabel}>
              {furnishingStateOptions.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={state.furnishingState === opt.value}
                  onClick={() => update({ furnishingState: opt.value })}
                />
              ))}
            </div>
          </FieldSection>
        )}

        <FieldSection label={t.lastCleaningLabel} hint={t.lastCleaningHint}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label={t.lastCleaningLabel}>
            {lastCleaningOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={state.lastCleaning === opt.value}
                onClick={() => update({ lastCleaning: opt.value, deepRecommendationAcknowledged: false })}
              />
            ))}
          </div>
        </FieldSection>

        <FieldSection label={t.petHairLabel}>
          <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label={t.petHairLabel}>
            {petHairOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} selected={state.petHair === opt.value} onClick={() => update({ petHair: opt.value })} />
            ))}
          </div>
        </FieldSection>

        {showRequiredBanner && (
          <div className="rounded-lg border-2 border-accent-600 bg-accent-50 p-4">
            <p className="text-sm font-semibold text-accent-900">{t.deepRequiredTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-accent-800">{t.deepRequiredMessage}</p>
            <button type="button" onClick={() => update({ service: 'deep' })} className="btn-primary mt-3">
              <Check className="h-4 w-4" aria-hidden="true" />
              {t.switchToDeepButton}
            </button>
          </div>
        )}

        {showRecommendedBanner && (
          <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
            <p className="text-sm font-semibold text-primary-900">{t.deepRecommendedTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-primary-800">{t.deepRecommendedMessage}</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => update({ service: 'deep' })} className="btn-primary">
                {t.switchToDeepButton}
              </button>
              <button type="button" onClick={() => update({ deepRecommendationAcknowledged: true })} className="btn-secondary">
                {t.keepRegularButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
