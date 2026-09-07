import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { HowItWorksPageContent } from '@/components/home/how-it-works-page-content';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'comment-ca-marche',
    alternatePath: { fr: 'comment-ca-marche', en: 'how-it-works' },
    title: dict.howItWorks.title,
    description: dict.howItWorks.subtitle,
  });
}

export default function CommentCaMarchePage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'en') redirect('/en/how-it-works');
  const dict = getDictionary(params.locale);
  return <HowItWorksPageContent locale={params.locale} dict={dict} />;
}
