'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { bookingHref } from '@/lib/config/nav';

/**
 * Hero postal-code quick check. Doesn't validate here — it just carries
 * the value into the booking flow's first step via a query param, where
 * the real service-area check runs. Keeps the hero focused on a single,
 * low-friction action that leads straight into booking.
 */
export function HeroPostalForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [postal, setPostal] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = postal.trim() ? `?postal=${encodeURIComponent(postal.trim())}` : '';
    router.push(`${bookingHref(locale)}${query}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row" role="search">
      <label htmlFor="hero-postal" className="sr-only">
        {dict.hero.postalPlaceholder}
      </label>
      <input
        id="hero-postal"
        type="text"
        inputMode="text"
        autoComplete="postal-code"
        value={postal}
        onChange={(e) => setPostal(e.target.value)}
        placeholder={dict.hero.postalPlaceholder}
        className="input flex-1"
      />
      <button type="submit" className="btn-primary flex-shrink-0">
        <Search className="h-4 w-4" aria-hidden="true" />
        {dict.hero.postalCta}
      </button>
    </form>
  );
}
