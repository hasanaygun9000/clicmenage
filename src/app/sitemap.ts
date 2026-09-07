import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';
import { business } from '@/lib/config/business';
import { services } from '@/lib/config/services';
import { getLandingPageAreas } from '@/lib/config/service-areas';
import { routes } from '@/lib/config/routes';

/**
 * Dynamically generated sitemap covering every indexable page in both
 * locales. Booking and legal-policy pages are intentionally excluded
 * (they're marked noIndex in their metadata — see buildMetadata calls).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  function addPair(pathBuilder: (locale: 'fr' | 'en') => string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) {
    for (const locale of locales) {
      entries.push({
        url: `${business.siteUrl}${pathBuilder(locale)}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            fr: `${business.siteUrl}${pathBuilder('fr')}`,
            en: `${business.siteUrl}${pathBuilder('en')}`,
          },
        },
      });
    }
  }

  addPair((l) => routes.home(l), 1, 'weekly');
  addPair((l) => routes.services(l), 0.9, 'monthly');
  addPair((l) => routes.howItWorks(l), 0.6, 'monthly');
  addPair((l) => routes.areas(l), 0.8, 'monthly');
  addPair((l) => routes.faq(l), 0.6, 'monthly');
  addPair((l) => routes.contact(l), 0.5, 'yearly');
  addPair((l) => routes.about(l), 0.4, 'yearly');

  for (const service of services) {
    addPair((l) => routes.service(l, service.slug), 0.8, 'monthly');
  }

  for (const area of getLandingPageAreas()) {
    addPair((l) => routes.area(l, area.slug), 0.85, 'monthly');
  }

  return entries;
}
