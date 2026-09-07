import Link from 'next/link';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import type { ServiceArea } from '@/lib/config/service-areas';
import { serviceAreas } from '@/lib/config/service-areas';
import { services } from '@/lib/config/services';
import { getFeaturedFaqItems } from '@/lib/config/faq';
import { routes } from '@/lib/config/routes';
import { bookingHref } from '@/lib/config/nav';
import { business } from '@/lib/config/business';
import { buildBreadcrumbSchema, buildLocationServiceSchema, buildFaqSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Accordion } from '@/components/ui/accordion';
import { CtaButton } from '@/components/ui/cta-button';
import { HowItWorks } from '@/components/home/how-it-works';
import { ResolvedIcon } from '@/components/ui/icon-map';

export function LocationPage({ area, locale, dict }: { area: ServiceArea; locale: Locale; dict: Dictionary }) {
  const content = area.landingContent;
  if (!content) return null;

  const parent = area.parentSlug ? serviceAreas.find((a) => a.slug === area.parentSlug) : undefined;
  const relatedAreas = area.isHub ? serviceAreas.filter((a) => a.parentSlug === area.slug) : [];
  const faqItems = getFeaturedFaqItems().slice(0, 5);

  const cleaningLabel = locale === 'fr' ? 'Ménage résidentiel à' : 'Residential cleaning in';

  return (
    <>
      <JsonLd data={buildLocationServiceSchema(area, locale)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: dict.meta.siteName, url: `${business.siteUrl}/${locale}` },
          { name: dict.nav.areas, url: `${business.siteUrl}${routes.areas(locale)}` },
          { name: area.name[locale], url: `${business.siteUrl}${routes.area(locale, area.slug)}` },
        ])}
      />
      <JsonLd data={buildFaqSchema(faqItems.map((f) => ({ question: f.question[locale], answer: f.answer[locale] })))} />

      <Breadcrumbs
        items={[
          { label: dict.nav.areas, href: routes.areas(locale) },
          ...(parent ? [{ label: parent.name[locale], href: routes.area(locale, parent.slug) }] : []),
          { label: area.name[locale] },
        ]}
      />

      <PageHero eyebrow={`${cleaningLabel} ${area.name[locale]}`} title={area.name[locale]} subtitle={content.heroNote[locale]}>
        <div className="mt-8 flex justify-center">
          <CtaButton href={bookingHref(locale)} size="lg">
            {dict.common.bookNow}
          </CtaButton>
        </div>
      </PageHero>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-semibold">{locale === 'fr' ? `Le ménage résidentiel à ${area.name.fr}` : `Residential cleaning in ${area.name.en}`}</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">{content.housingNote[locale]}</p>

              <h3 className="mt-8 text-lg font-semibold">{locale === 'fr' ? 'Secteurs et quartiers' : 'Neighbourhoods we cover'}</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {content.neighborhoods[locale].map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm text-ink-light">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
                    {n}
                  </li>
                ))}
              </ul>

              {relatedAreas.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold">
                    {locale === 'fr' ? "Municipalités de l'Ouest-de-l'Île" : 'West Island municipalities'}
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {relatedAreas.map((a) => (
                      <Link
                        key={a.slug}
                        href={routes.area(locale, a.slug)}
                        className="flex items-center justify-between rounded-md border border-sand-200 bg-white px-4 py-3 text-sm font-medium text-ink hover:border-primary-200 hover:bg-primary-50"
                      >
                        {a.name[locale]}
                        <ArrowRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="card p-6">
                <h3 className="text-base font-semibold text-ink">{dict.services.title}</h3>
                <ul className="mt-4 space-y-3">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={routes.service(locale, s.slug)}
                        className="flex items-center gap-2.5 text-sm font-medium text-ink hover:text-primary-800"
                      >
                        <ResolvedIcon name={s.icon} className="h-4 w-4 text-primary-700" />
                        {s.name[locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
                <CtaButton href={bookingHref(locale)} className="mt-5 w-full">
                  {dict.common.bookNow}
                </CtaButton>
              </div>

              {parent && (
                <div className="card p-6">
                  <p className="text-sm text-ink-muted">
                    {locale === 'fr' ? 'Ce secteur fait partie de' : 'This area is part of'}{' '}
                    <Link href={routes.area(locale, parent.slug)} className="font-semibold text-primary-800 hover:text-primary-900">
                      {parent.name[locale]}
                    </Link>
                    .
                  </p>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <HowItWorks locale={locale} dict={dict} />

      <section className="bg-white py-16 sm:py-24">
        <Container className="max-w-3xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">{dict.faqHome.title}</h2>
          <div className="mt-8">
            <Accordion items={faqItems.map((f) => ({ id: f.id, question: f.question[locale], answer: f.answer[locale] }))} />
          </div>
        </Container>
      </section>

      <section className="bg-primary-50 py-14 text-center sm:py-16">
        <Container>
          <h2 className="text-3xl text-primary-900">
            {locale === 'fr' ? `Réservez votre ménage à ${area.name.fr}` : `Book your cleaning in ${area.name.en}`}
          </h2>
          <div className="mt-8 flex justify-center">
            <CtaButton href={bookingHref(locale)} size="lg">
              {dict.common.bookNow}
            </CtaButton>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {content.heroNote[locale]}
          </p>
        </Container>
      </section>
    </>
  );
}
