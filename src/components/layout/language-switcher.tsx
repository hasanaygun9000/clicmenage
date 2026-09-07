'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, localeLabels, type Locale } from '@/lib/i18n/config';
import { getAlternatePath } from '@/lib/i18n/route-map';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() ?? '/';

  return (
    <div className={cn('flex items-center gap-1 text-sm font-semibold', className)} role="group" aria-label="Language / Langue">
      {locales.map((l, index) => (
        <span key={l} className="flex items-center gap-1">
          {index > 0 && <span className="text-sand-300" aria-hidden="true">|</span>}
          <Link
            href={getAlternatePath(pathname, l)}
            aria-current={l === locale ? 'true' : undefined}
            className={cn(
              // min-h-11 keeps the tap target at 44px even though the visible
              // text stays compact — the header row already centers this
              // group vertically, so the extra hit area doesn't grow the header.
              'inline-flex min-h-11 items-center rounded px-1.5 py-1 transition-colors',
              l === locale ? 'text-primary-800' : 'text-ink-muted hover:text-primary-700'
            )}
          >
            {localeLabels[l]}
          </Link>
        </span>
      ))}
    </div>
  );
}
