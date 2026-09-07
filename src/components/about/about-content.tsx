import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { bookingHref } from '@/lib/config/nav';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { CtaButton } from '@/components/ui/cta-button';

export function AboutContent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.about;

  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.about }]} />
      <PageHero eyebrow={t.eyebrow} title={t.title} subtitle={t.intro} />

      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-semibold">{t.missionTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{t.missionBody}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{t.approachTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{t.approachBody}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{t.localTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{t.localBody}</p>
            </div>
          </div>

          <div className="mt-14 rounded-lg border border-primary-100 bg-primary-50 px-8 py-10 text-center">
            <h2 className="text-xl font-semibold text-primary-900">{t.ctaTitle}</h2>
            <div className="mt-5">
              <CtaButton href={bookingHref(locale)} size="lg">
                {t.ctaButton}
              </CtaButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
