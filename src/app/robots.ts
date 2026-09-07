import type { MetadataRoute } from 'next';
import { business } from '@/lib/config/business';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/fr/reserver', '/en/booking'],
      },
    ],
    sitemap: `${business.siteUrl}/sitemap.xml`,
  };
}
