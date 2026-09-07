import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/lib/i18n/dictionary-type';

export function StepIndicator({
  currentStep,
  totalSteps,
  dict,
}: {
  currentStep: number;
  totalSteps: number;
  dict: Dictionary;
}) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>
          {dict.booking.stepLabel} {currentStep} {dict.booking.stepOf} {totalSteps}
        </span>
        <span>{dict.booking.stepNames[currentStep - 1]}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sand-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-accent-500 transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function StepDots({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isCurrent = step === currentStep;
        return (
          <span
            key={step}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
              isDone && 'bg-accent-500 text-white',
              isCurrent && 'bg-primary-800 text-white',
              !isDone && !isCurrent && 'bg-sand-200 text-ink-muted'
            )}
          >
            {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : step}
          </span>
        );
      })}
    </div>
  );
}
