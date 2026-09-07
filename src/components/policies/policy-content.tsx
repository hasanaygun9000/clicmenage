import { AlertTriangle } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import type { PolicySection } from '@/lib/config/policies';
import { lastUpdated } from '@/lib/config/policies';
import { Container } from '@/components/ui/container';
import { PageHero } from '@/components/ui/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export function PolicyContent({
  locale,
  dict,
  title,
  intro,
  breadcrumbLabel,
  sections,
}: {
  locale: Locale;
  dict: Dictionary;
  title: string;
  intro: string;
  breadcrumbLabel: string;
  sections: PolicySection[];
}) {
  return (
    <>
      <Breadcrumbs items={[{ label: breadcrumbLabel }]} />
      <PageHero title={title} subtitle={intro} />

      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-amber-900">{dict.policies.reviewNotice}</p>
          </div>

          <p className="mt-6 text-sm text-ink-muted">
            {dict.policies.lastUpdatedLabel}: {lastUpdated}
          </p>

          <div className="mt-8 space-y-10">
            {sections.map((section) => (
              <div key={section.heading[locale]}>
                <h2 className="text-xl font-semibold text-ink">{section.heading[locale]}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-base leading-relaxed text-ink-muted">
                      {p[locale]}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
