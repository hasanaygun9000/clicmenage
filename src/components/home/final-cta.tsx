import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { bookingHref } from '@/lib/config/nav';
import { routes } from '@/lib/config/routes';
import { Container } from '@/components/ui/container';
import { CtaButton } from '@/components/ui/cta-button';

export function FinalCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-primary-950 py-14 sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-xl text-3xl text-white sm:text-4xl">{dict.finalCta.title}</h2>
        <p className="max-w-lg text-lg text-primary-100">{dict.finalCta.subtitle}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CtaButton href={bookingHref(locale)} size="lg">
            {dict.finalCta.primary}
          </CtaButton>
          <CtaButton href={routes.contact(locale)} variant="ghost" size="lg" className="text-white hover:bg-white/10">
            {dict.finalCta.secondary}
          </CtaButton>
        </div>
      </Container>
    </section>
  );
}
