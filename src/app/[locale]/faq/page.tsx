import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqItems, type FaqCategory } from '@/lib/config/faq';
import { buildFaqSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Accordion } from '@/components/ui/accordion';
import { CtaButton } from '@/components/ui/cta-button';
import { routes } from '@/lib/config/routes';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'faq',
    title: dict.faqPage.title,
    description: dict.faqPage.subtitle,
  });
}

const categoryLabels: Record<FaqCategory, { fr: string; en: string }> = {
  booking: { fr: 'Réservation', en: 'Booking' },
  service: { fr: 'Le service', en: 'The service' },
  payment: { fr: 'Paiement', en: 'Payment' },
  areas: { fr: 'Secteurs desservis', en: 'Areas served' },
};

const categoryOrder: FaqCategory[] = ['service', 'booking', 'payment', 'areas'];

export default function FaqPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd data={buildFaqSchema(faqItems.map((f) => ({ question: f.question[locale], answer: f.answer[locale] })))} />
      <Breadcrumbs items={[{ label: dict.nav.faq }]} />
      <PageHero eyebrow={dict.faqPage.eyebrow} title={dict.faqPage.title} subtitle={dict.faqPage.subtitle} />

      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {categoryOrder.map((category) => {
              const items = faqItems.filter((f) => f.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-ink">{categoryLabels[category][locale]}</h2>
                  <div className="mt-4">
                    <Accordion items={items.map((f) => ({ id: f.id, question: f.question[locale], answer: f.answer[locale] }))} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 rounded-lg border border-primary-100 bg-primary-50 px-8 py-10 text-center">
            <h2 className="text-xl font-semibold text-primary-900">{dict.faqPage.ctaTitle}</h2>
            <div className="mt-5">
              <CtaButton href={routes.contact(locale)} size="lg">
                {dict.faqPage.ctaButton}
              </CtaButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
