import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { business, isPhoneConfigured, isPublicEmailConfigured, isHoursConfigured } from '@/lib/config/business';
import { routes } from '@/lib/config/routes';
import { bookingHref } from '@/lib/config/nav';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { CtaButton } from '@/components/ui/cta-button';
import { ContactForm } from '@/components/contact/contact-form';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'contact',
    title: dict.contact.title,
    description: dict.contact.subtitle,
  });
}

export default function ContactPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDictionary(locale);
  const t = dict.contact;

  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.contact }]} />
      <PageHero eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <ContactForm locale={locale} dict={dict} />

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-base font-semibold text-ink">{t.infoTitle}</h2>
                <ul className="mt-5 space-y-4">
                  {isPhoneConfigured() && (
                    <li className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.phoneLabel}</p>
                        <a href={business.phoneHref} className="text-sm font-medium text-ink hover:text-primary-800">
                          {business.phone}
                        </a>
                      </div>
                    </li>
                  )}
                  {isPublicEmailConfigured() && (
                    <li className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.emailLabel}</p>
                        <a href={`mailto:${business.email}`} className="text-sm font-medium text-ink hover:text-primary-800">
                          {business.email}
                        </a>
                      </div>
                    </li>
                  )}
                  {isHoursConfigured() && (
                    <li className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.hoursLabel}</p>
                        <p className="text-sm font-medium text-ink">{business.hoursDisplay[locale]}</p>
                      </div>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.areaLabel}</p>
                      <p className="text-sm font-medium text-ink">{business.region[locale]}</p>
                    </div>
                  </li>
                  {!isPhoneConfigured() && !isPublicEmailConfigured() && (
                    <li className="rounded-md bg-sand-50 px-3 py-2.5 text-sm text-ink-muted">{t.contactInfoPending}</li>
                  )}
                </ul>
              </div>

              <div className="card p-6">
                <h2 className="text-base font-semibold text-ink">{t.faqShortcutTitle}</h2>
                <Link href={routes.faq(locale)} className="mt-3 inline-block text-sm font-semibold text-primary-800 hover:text-primary-900">
                  {t.faqShortcutCta} →
                </Link>
              </div>

              <div className="rounded-lg border border-primary-100 bg-primary-50 p-6 text-center">
                <h2 className="text-base font-semibold text-primary-900">{t.bookingCtaTitle}</h2>
                <p className="mt-1 text-sm text-primary-700">{t.bookingCtaSubtitle}</p>
                <CtaButton href={bookingHref(locale)} className="mt-4">
                  {t.bookingCtaButton}
                </CtaButton>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
