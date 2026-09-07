import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Users, Star } from 'lucide-react';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { services, getServiceBySlug } from '@/lib/config/services';
import { extras } from '@/lib/config/extras';
import { pricingConfig } from '@/lib/pricing/pricing-config';
import { formatCurrency } from '@/lib/pricing/engine';
import { routes } from '@/lib/config/routes';
import { bookingHref } from '@/lib/config/nav';
import { business } from '@/lib/config/business';
import { buildBreadcrumbSchema, buildFaqSchema, buildServiceSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Accordion } from '@/components/ui/accordion';
import { CtaButton } from '@/components/ui/cta-button';
import { ResolvedIcon } from '@/components/ui/icon-map';

export function generateStaticParams() {
  return locales.flatMap((locale) => services.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: `services/${params.slug}`,
    title: `${service.name[params.locale]} — ${dict.meta.siteName}`,
    description: service.shortDescription[params.locale],
  });
}

export default function ServiceDetailPage({ params }: { params: { locale: Locale; slug: string } }) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  const locale = params.locale;
  const dict = getDictionary(locale);
  const otherServices = services.filter((s) => s.slug !== service.slug);
  const bookingUrl = `${bookingHref(locale)}?service=${service.pricingKey}`;

  return (
    <>
      <JsonLd data={buildServiceSchema(service, locale)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: dict.meta.siteName, url: `${business.siteUrl}/${locale}` },
          { name: dict.nav.services, url: `${business.siteUrl}${routes.services(locale)}` },
          { name: service.name[locale], url: `${business.siteUrl}${routes.service(locale, service.slug)}` },
        ])}
      />
      <JsonLd
        data={buildFaqSchema(service.faq.map((f) => ({ question: f.question[locale], answer: f.answer[locale] })))}
      />

      <Breadcrumbs
        items={[
          { label: dict.nav.services, href: routes.services(locale) },
          { label: service.name[locale] },
        ]}
      />

      <PageHero eyebrow={dict.services.eyebrow} title={service.name[locale]}>
        <p className="mt-4 text-lg text-primary-100">{service.longDescription[locale]}</p>
        <div className="mt-8 flex justify-center">
          <CtaButton href={bookingUrl} size="lg">
            {dict.services.ctaBook}
          </CtaButton>
        </div>
      </PageHero>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-semibold">{dict.services.includedTitle}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.included[locale].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink-light">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">{dict.services.whoForTitle}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.whoFor[locale].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink-light">
                      <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">{dict.services.benefitsTitle}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.benefits[locale].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink-light">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">{dict.services.faqTitle}</h2>
                <div className="mt-5">
                  <Accordion
                    items={service.faq.map((f) => ({ id: f.question[locale], question: f.question[locale], answer: f.answer[locale] }))}
                  />
                </div>
              </div>
            </div>

            <aside className="space-y-8">
              <div className="card p-6">
                <p className="text-sm font-semibold text-ink">{dict.common.from}</p>
                <p className="mt-1 text-3xl font-bold text-primary-900">
                  {formatCurrency(pricingConfig.services[service.pricingKey].basePrice, locale)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{dict.common.demoPricingNotice}</p>
                <CtaButton href={bookingUrl} className="mt-5 w-full">
                  {dict.services.ctaBook}
                </CtaButton>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-ink">{dict.services.extrasTitle}</h3>
                <ul className="mt-4 space-y-3">
                  {extras.map((extra) => (
                    <li key={extra.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-ink-light">
                        <ResolvedIcon name={extra.icon} className="h-4 w-4 text-primary-700" />
                        {extra.name[locale]}
                      </span>
                      <span className="flex-shrink-0 font-medium text-ink">
                        +{formatCurrency(pricingConfig.extrasPricing[extra.id] ?? 0, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-base font-semibold text-ink">{dict.services.otherServicesTitle}</h3>
                <ul className="mt-4 space-y-3">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link href={routes.service(locale, s.slug)} className="text-sm font-medium text-primary-800 hover:text-primary-900">
                        {s.name[locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
