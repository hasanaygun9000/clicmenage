'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { bookingHref } from '@/lib/config/nav';

/**
 * Tasteful sticky mobile CTA. Hidden on the booking flow itself (it would
 * be redundant there — the whole page is already the booking flow) and
 * respects safe-area insets so it doesn't collide with iOS home indicators.
 */
export function MobileStickyCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() ?? '';
  const isOnBookingFlow = pathname.includes(`/${bookingHref(locale).split('/').pop()}`);

  if (isOnBookingFlow) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 p-3 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <Link href={bookingHref(locale)} className="btn-primary w-full text-base">
        {dict.mobileCta.label}
      </Link>
    </div>
  );
}
