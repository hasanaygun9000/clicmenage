import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PageHero } from '@/components/ui/page-hero';
import { AreasGrid } from '@/components/home/areas-grid';

export function AreasIndexContent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.areas }]} />
      <PageHero eyebrow={dict.areas.eyebrow} title={dict.areas.title} subtitle={dict.areas.subtitle} />
      <AreasGrid locale={locale} dict={dict} />
    </>
  );
}
