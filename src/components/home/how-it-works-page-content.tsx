import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PageHero } from '@/components/ui/page-hero';
import { HowItWorks } from './how-it-works';
import { ServicesGrid } from './services-grid';
import { FinalCta } from './final-cta';

export function HowItWorksPageContent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.howItWorks }]} />
      <PageHero eyebrow={dict.howItWorks.eyebrow} title={dict.howItWorks.title} subtitle={dict.howItWorks.subtitle} />
      <HowItWorks locale={locale} dict={dict} />
      <ServicesGrid locale={locale} dict={dict} />
      <FinalCta locale={locale} dict={dict} />
    </>
  );
}
