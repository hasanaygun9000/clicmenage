import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { localizedSlugs } from '@/lib/i18n/localized-slugs';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { getLandingPageAreas, getServiceAreaBySlug } from '@/lib/config/service-areas';
import { LocationPage } from '@/components/areas/location-page';

const PREFIX = localizedSlugs.locationPrefix;

function parseLocationSlug(locale: Locale, locationSlug: string): string | null {
  const expectedPrefix = `${PREFIX[locale]}-`;
  if (!locationSlug.startsWith(expectedPrefix)) return null;
  return locationSlug.slice(expectedPrefix.length);
}

export function generateStaticParams() {
  const areas = getLandingPageAreas();
  return locales.flatMap((locale) =>
    areas.map((area) => ({ locale, locationSlug: `${PREFIX[locale]}-${area.slug}` }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; locationSlug: string };
}): Promise<Metadata> {
  const citySlug = parseLocationSlug(params.locale, params.locationSlug);
  if (!citySlug) return {};
  const area = getServiceAreaBySlug(citySlug);
  if (!area || !area.hasLandingPage || !area.landingContent) return {};

  const dict = getDictionary(params.locale);
  const title =
    params.locale === 'fr' ? `Ménage résidentiel à ${area.name.fr}` : `Residential cleaning in ${area.name.en}`;

  return buildMetadata({
    locale: params.locale,
    path: `${PREFIX[params.locale]}-${citySlug}`,
    alternatePath: { fr: `${PREFIX.fr}-${citySlug}`, en: `${PREFIX.en}-${citySlug}` },
    title: `${title} — ${dict.meta.siteName}`,
    description: area.landingContent.heroNote[params.locale],
  });
}

export default function LocationLandingPage({ params }: { params: { locale: Locale; locationSlug: string } }) {
  const citySlug = parseLocationSlug(params.locale, params.locationSlug);
  if (!citySlug) notFound();

  const area = getServiceAreaBySlug(citySlug);
  if (!area || !area.active || !area.hasLandingPage || !area.landingContent) notFound();

  const dict = getDictionary(params.locale);
  return <LocationPage area={area} locale={params.locale} dict={dict} />;
}
