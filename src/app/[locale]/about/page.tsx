import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { AboutContent } from '@/components/about/about-content';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'about',
    alternatePath: { fr: 'a-propos', en: 'about' },
    title: dict.about.title,
    description: dict.about.intro,
  });
}

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'fr') redirect('/fr/a-propos');
  const dict = getDictionary(params.locale);
  return <AboutContent locale={params.locale} dict={dict} />;
}
