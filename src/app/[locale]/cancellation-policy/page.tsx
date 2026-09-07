import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { cancellationSections } from '@/lib/config/policies';
import { PolicyContent } from '@/components/policies/policy-content';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'cancellation-policy',
    alternatePath: { fr: 'politique-annulation', en: 'cancellation-policy' },
    title: dict.policies.cancellation.title,
    description: dict.policies.cancellation.intro,
    noIndex: true,
  });
}

export default function CancellationEnPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'fr') redirect('/fr/politique-annulation');
  const dict = getDictionary(params.locale);
  return (
    <PolicyContent
      locale={params.locale}
      dict={dict}
      title={dict.policies.cancellation.title}
      intro={dict.policies.cancellation.intro}
      breadcrumbLabel={dict.footer.cancellationLink}
      sections={cancellationSections}
    />
  );
}
