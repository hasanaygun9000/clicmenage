import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { termsSections } from '@/lib/config/policies';
import { PolicyContent } from '@/components/policies/policy-content';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'conditions-utilisation',
    alternatePath: { fr: 'conditions-utilisation', en: 'terms-of-service' },
    title: dict.policies.terms.title,
    description: dict.policies.terms.intro,
    noIndex: true,
  });
}

export default function TermsFrPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'en') redirect('/en/terms-of-service');
  const dict = getDictionary(params.locale);
  return (
    <PolicyContent
      locale={params.locale}
      dict={dict}
      title={dict.policies.terms.title}
      intro={dict.policies.terms.intro}
      breadcrumbLabel={dict.footer.termsLink}
      sections={termsSections}
    />
  );
}
