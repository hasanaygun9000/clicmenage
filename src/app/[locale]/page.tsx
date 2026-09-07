import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { ServicesGrid } from '@/components/home/services-grid';
import { WhyChoose } from '@/components/home/why-choose';
import { ExtrasPreview } from '@/components/home/extras-preview';
import { AreasGrid } from '@/components/home/areas-grid';
import { FaqPreview } from '@/components/home/faq-preview';
import { FinalCta } from '@/components/home/final-cta';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: '',
    title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
    description: dict.meta.defaultDescription,
  });
}

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const locale = params.locale;

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <HowItWorks locale={locale} dict={dict} />
      <ServicesGrid locale={locale} dict={dict} />
      <WhyChoose locale={locale} dict={dict} />
      <ExtrasPreview locale={locale} dict={dict} />
      <AreasGrid locale={locale} dict={dict} />
      <FaqPreview locale={locale} dict={dict} />
      <FinalCta locale={locale} dict={dict} />
    </>
  );
}
