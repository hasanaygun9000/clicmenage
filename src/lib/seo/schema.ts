import type { Locale } from '@/lib/i18n/config';
import { business, isPhoneConfigured, isPublicEmailConfigured, isStreetAddressConfigured } from '@/lib/config/business';
import type { ServiceDefinition } from '@/lib/config/services';
import type { ServiceArea } from '@/lib/config/service-areas';

/**
 * JSON-LD structured data builders. Each function returns a plain object
 * meant to be serialized into a <script type="application/ld+json"> tag
 * via the <JsonLd /> component (src/components/seo/json-ld.tsx).
 */

export function buildLocalBusinessSchema(locale: Locale) {
  // Only publish fields that are actually confirmed — an empty telephone/
  // email string or an empty opening-hours array would be misleading noise
  // in structured data search engines read as fact.
  return {
    '@context': 'https://schema.org',
    '@type': 'HousekeepingService',
    name: business.displayName,
    url: business.siteUrl,
    ...(isPhoneConfigured() ? { telephone: business.phone } : {}),
    ...(isPublicEmailConfigured() ? { email: business.email } : {}),
    areaServed: {
      '@type': 'Place',
      name: locale === 'fr' ? business.region.fr : business.region.en,
    },
    address: {
      '@type': 'PostalAddress',
      ...(isStreetAddressConfigured() ? { streetAddress: business.address.streetAddress } : {}),
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      ...(business.address.postalCode ? { postalCode: business.address.postalCode } : {}),
      addressCountry: business.address.addressCountry,
    },
    ...(business.hours.length > 0
      ? {
          openingHoursSpecification: business.hours.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.days,
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
  };
}

export function buildServiceSchema(service: ServiceDefinition, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name[locale],
    name: service.name[locale],
    description: service.shortDescription[locale],
    provider: {
      '@type': 'HousekeepingService',
      name: business.displayName,
      url: business.siteUrl,
    },
    areaServed: {
      '@type': 'Place',
      name: locale === 'fr' ? business.region.fr : business.region.en,
    },
  };
}

export function buildLocationServiceSchema(area: ServiceArea, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: locale === 'fr' ? 'Ménage résidentiel' : 'Residential cleaning',
    name: `${locale === 'fr' ? 'Ménage résidentiel à' : 'Residential cleaning in'} ${area.name[locale]}`,
    provider: {
      '@type': 'HousekeepingService',
      name: business.displayName,
      url: business.siteUrl,
    },
    areaServed: {
      '@type': 'City',
      name: area.name[locale],
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
