import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { privacyPolicySections } from '@/lib/config/policies';
import { PolicyContent } from '@/components/policies/policy-content';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'privacy-policy',
    alternatePath: { fr: 'politique-de-confidentialite', en: 'privacy-policy' },
    title: dict.policies.privacy.title,
    description: dict.policies.privacy.intro,
    noIndex: true,
  });
}

export default function PrivacyEnPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'fr') redirect('/fr/politique-de-confidentialite');
  const dict = getDictionary(params.locale);
  return (
    <PolicyContent
      locale={params.locale}
      dict={dict}
      title={dict.policies.privacy.title}
      intro={dict.policies.privacy.intro}
      breadcrumbLabel={dict.footer.privacyLink}
      sections={privacyPolicySections}
    />
  );
}
