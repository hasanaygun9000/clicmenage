import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/globals.css';
import { locales, localeHtmlTag, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { business } from '@/lib/config/business';
import { buildLocalBusinessSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileStickyCta } from '@/components/layout/mobile-sticky-cta';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';

// Inter (body) and Fraunces (heading — a warm variable serif, deliberately
// not another geometric sans, so ClicMénage reads as a premium home-service
// brand rather than a SaaS template) are self-hosted via @fontsource and
// registered as CSS custom properties in globals.css, not loaded here via
// next/font/google — see the comment there for why.

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#163F5D', // primary-800 — must match tailwind.config.ts `primary` brand blue
};

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return {
    metadataBase: new URL(business.siteUrl),
    title: {
      default: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      template: `%s — ${dict.meta.siteName}`,
    },
    description: dict.meta.defaultDescription,
    icons: {
      // Cropped directly from the official logo's icon mark (house + cursor)
      // — not redrawn. See public/brand/clicmenage-logo.png for the source.
      icon: [
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/apple-icon.png',
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale as Locale)) {
    notFound();
  }
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  return (
    <html lang={localeHtmlTag[locale]}>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={buildLocalBusinessSchema(locale)} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-800 focus:px-4 focus:py-2 focus:text-white"
        >
          {locale === 'fr' ? 'Aller au contenu principal' : 'Skip to main content'}
        </a>
        <Header locale={locale} dict={dict} />
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
        <Footer locale={locale} dict={dict} />
        <MobileStickyCta locale={locale} dict={dict} />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
