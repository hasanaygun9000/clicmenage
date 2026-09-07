import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { homeHref } from '@/lib/config/nav';
import { cn } from '@/lib/utils';

/**
 * Official ClicMénage wordmark (public/brand/clicmenage-logo.png).
 *
 * This is the ONE place the logo is rendered — header and footer both use
 * this component so the asset never needs to be duplicated or re-created
 * elsewhere. The source file itself must never be redrawn, recolored, or
 * altered: only its rendered size changes here, via `className`.
 *
 * The file is a wide (3:1) transparent-background PNG, so it is displayed
 * at a fixed height with `w-auto` to preserve its native proportions —
 * never stretched or cropped.
 */
export function Logo({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <Link href={homeHref(locale)} className="flex flex-shrink-0 items-center" aria-label="ClicMénage">
      {/* The height classes must live on the <Image> itself, not just the
          <Link> wrapper around it — a wrapper's height doesn't change how
          big an inline image renders inside it. (This is why earlier size
          bumps at the header call site had no visible effect.) `className`
          fully replaces the default height so each call site controls its
          own size; `w-auto` always stays to preserve the logo's aspect ratio. */}
      <Image
        src="/brand/clicmenage-logo.png"
        alt="ClicMénage"
        width={2172}
        height={724}
        priority
        className={cn('w-auto', className ?? 'h-8 sm:h-9')}
      />
    </Link>
  );
}
