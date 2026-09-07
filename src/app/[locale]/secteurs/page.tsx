import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { AreasIndexContent } from '@/components/areas/areas-index-content';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'secteurs',
    alternatePath: { fr: 'secteurs', en: 'areas' },
    title: dict.areas.title,
    description: dict.areas.subtitle,
  });
}

export default function SecteursPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'en') redirect('/en/areas');
  const dict = getDictionary(params.locale);
  return <AreasIndexContent locale={params.locale} dict={dict} />;
}
