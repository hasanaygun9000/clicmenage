import Link from 'next/link';
import { CompassIcon } from 'lucide-react';
import { defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { homeHref } from '@/lib/config/nav';
import { Container } from '@/components/ui/container';

/**
 * Next.js does not pass route params to a segment's not-found.tsx, so the
 * exact locale of the broken URL isn't available here. The surrounding
 * app/[locale]/layout.tsx (which DOES receive params) still renders the
 * correct-locale header/footer around this page — only this body copy
 * falls back to the site's default language.
 */
export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <section className="flex min-h-[60vh] items-center justify-center py-20">
      <Container className="flex max-w-md flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-800">
          <CompassIcon className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">{dict.notFound.title}</h1>
        <p className="mt-2 text-ink-muted">{dict.notFound.message}</p>
        <Link href={homeHref(defaultLocale)} className="btn-primary mt-6">
          {dict.notFound.cta}
        </Link>
      </Container>
    </section>
  );
}
