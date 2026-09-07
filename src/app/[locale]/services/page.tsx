import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { services } from '@/lib/config/services';
import { routes } from '@/lib/config/routes';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ResolvedIcon } from '@/components/ui/icon-map';
import { CtaButton } from '@/components/ui/cta-button';
import { bookingHref } from '@/lib/config/nav';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'services',
    title: dict.services.title,
    description: dict.services.subtitle,
  });
}

export default function ServicesIndexPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.services }]} />
      <PageHero eyebrow={dict.services.eyebrow} title={dict.services.title} subtitle={dict.services.subtitle} />

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.slug} className="card flex flex-col p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-50 text-primary-800">
                  <ResolvedIcon name={service.icon} className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-2xl font-semibold">{service.name[locale]}</h2>
                <p className="mt-3 flex-1 text-base leading-relaxed text-ink-muted">{service.longDescription[locale]}</p>
                <ul className="mt-5 space-y-2">
                  {service.included[locale].slice(0, 3).map((item) => (
                    <li key={item} className="text-sm text-ink-light">
                      · {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href={routes.service(locale, service.slug)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:text-primary-900"
                  >
                    {dict.services.ctaViewDetails}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <CtaButton href={bookingHref(locale)} variant="secondary" className="ml-auto">
                    {dict.services.ctaBook}
                  </CtaButton>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
