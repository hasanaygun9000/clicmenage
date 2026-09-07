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
    path: 'areas',
    alternatePath: { fr: 'secteurs', en: 'areas' },
    title: dict.areas.title,
    description: dict.areas.subtitle,
  });
}

export default function AreasPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'fr') redirect('/fr/secteurs');
  const dict = getDictionary(params.locale);
  return <AreasIndexContent locale={params.locale} dict={dict} />;
}
