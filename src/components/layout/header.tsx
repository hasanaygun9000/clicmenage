'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { primaryNavLinks, bookingHref } from '@/lib/config/nav';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';
import { cn } from '@/lib/utils';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu automatically on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-20">
        {/* Meaningfully bigger than the nav text next to it — the wordmark
            is the one piece of brand identity in the header and should
            read as the dominant element, not compete on equal footing
            with a nav link. */}
        <Logo locale={locale} className="h-11 sm:h-12 lg:h-16" />

        {/* Nav + language + CTA are grouped as one flex block so `justify-between`
            only ever splits the header into two halves (logo | everything else),
            keeping a guaranteed gap between the wordmark and the first nav link
            instead of letting three separate flex items crowd together. */}
        <div className="hidden items-center gap-9 lg:flex">
          <nav className="flex items-center gap-7" aria-label={dict.nav.menu}>
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href(locale)}
                href={link.href(locale)}
                className="text-sm font-medium text-ink-light transition-colors hover:text-primary-800"
              >
                {link.label(dict)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <LanguageSwitcher locale={locale} />
            <Link href={bookingHref(locale)} className="btn-primary">
              {dict.nav.bookNow}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-primary-800 hover:bg-primary-50"
          >
            <span className="sr-only">{mobileOpen ? dict.nav.closeMenu : dict.nav.menu}</span>
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          'grid overflow-hidden border-t border-sand-200 bg-sand-50 transition-[grid-template-rows] duration-200 ease-out lg:hidden',
          mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] border-t-0'
        )}
      >
        <div className="overflow-hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label={dict.nav.menu}>
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href(locale)}
                href={link.href(locale)}
                className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-primary-50"
              >
                {link.label(dict)}
              </Link>
            ))}
            <Link href={bookingHref(locale)} className="btn-primary mt-2 w-full">
              {dict.nav.bookNow}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
