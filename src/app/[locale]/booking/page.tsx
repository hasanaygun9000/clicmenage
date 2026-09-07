import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { BookingWizard } from '@/components/booking/booking-wizard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    path: 'booking',
    title: dict.booking.title,
    description: dict.booking.subtitle,
    noIndex: true,
  });
}

export default function BookingPage({ params }: { params: { locale: Locale } }) {
  if (params.locale === 'fr') {
    redirect('/fr/reserver');
  }
  const dict = getDictionary(params.locale);
  return (
    <Suspense fallback={null}>
      <BookingWizard locale={params.locale} dict={dict} />
    </Suspense>
  );
}
