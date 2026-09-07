import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { extras } from '@/lib/config/extras';
import { pricingConfig } from '@/lib/pricing/pricing-config';
import { formatCurrency } from '@/lib/pricing/engine';
import { bookingHref } from '@/lib/config/nav';
import { Container } from '@/components/ui/container';
import { CtaButton } from '@/components/ui/cta-button';
import { ResolvedIcon } from '@/components/ui/icon-map';

export function ExtrasPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-white py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{dict.extras.eyebrow}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">{dict.extras.title}</h2>
          <p className="mt-4 text-lg text-ink-muted">{dict.extras.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extras.map((extra) => (
            <div key={extra.id} className="flex items-start gap-4 rounded-lg border border-sand-200 bg-sand-50 p-5">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white text-primary-800 ring-1 ring-sand-200">
                <ResolvedIcon name={extra.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{extra.name[locale]}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{extra.description[locale]}</p>
                <p className="mt-2 text-sm font-semibold text-accent-600">
                  + {formatCurrency(pricingConfig.extrasPricing[extra.id] ?? 0, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <CtaButton href={bookingHref(locale)} variant="secondary">
            {dict.extras.cta}
          </CtaButton>
        </div>
      </Container>
    </section>
  );
}
