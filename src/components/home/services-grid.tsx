import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { services } from '@/lib/config/services';
import { routes } from '@/lib/config/routes';
import { bookingHref } from '@/lib/config/nav';
import { Container } from '@/components/ui/container';
import { CtaButton } from '@/components/ui/cta-button';
import { ResolvedIcon } from '@/components/ui/icon-map';
import { servicePhotos } from '@/lib/config/homepage-media';
import Link from 'next/link';

export function ServicesGrid({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-white py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{dict.services.eyebrow}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">{dict.services.title}</h2>
          <p className="mt-4 text-lg text-ink-muted">{dict.services.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {services.map((service) => {
            const photo = servicePhotos[service.pricingKey];
            return (
              <div
                key={service.slug}
                className="card flex flex-col overflow-hidden border-t-4 border-t-accent-500 p-0 transition-shadow hover:shadow-card"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-50">
                  <Image
                    src={photo.src}
                    alt={photo.alt[locale]}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, 90vw"
                    className="object-cover"
                    style={{ objectPosition: photo.objectPosition }}
                  />
                  {/* Gradient wash so the icon badge always reads clearly
                      against whatever the photo looks like underneath. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/0 to-transparent" />
                  {/* Solid brand-green badge instead of white — the accent
                      color that reads as "cleanliness" in the logo shows up
                      on every card, not just in the CTA button. */}
                  <span className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent-600 text-white shadow-soft">
                    <ResolvedIcon name={service.icon} className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-xl font-semibold">{service.name[locale]}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{service.shortDescription[locale]}</p>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <Link
                      href={routes.service(locale, service.slug)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:text-primary-900"
                    >
                      {dict.services.ctaViewDetails}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-lg border border-primary-100 bg-primary-50 px-8 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-semibold text-primary-900">{dict.services.sectionCtaTitle}</h3>
            <p className="mt-1 text-sm text-primary-700">{dict.services.sectionCtaSubtitle}</p>
          </div>
          <CtaButton href={bookingHref(locale)} size="lg" className="flex-shrink-0">
            {dict.services.sectionCtaButton}
          </CtaButton>
        </div>
      </Container>
    </section>
  );
}
