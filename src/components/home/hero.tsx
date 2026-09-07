import Image from 'next/image';
import { CheckCircle2, MapPin, MousePointerClick } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { Container } from '@/components/ui/container';
import { CtaButton } from '@/components/ui/cta-button';
import { HeroPostalForm } from './hero-postal-form';
import { routes } from '@/lib/config/routes';
import { bookingHref } from '@/lib/config/nav';
import { heroPhoto } from '@/lib/config/homepage-media';

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-primary-50">
      {/* Real brand-color presence instead of a barely-visible tint — two
          overlapping blue/green glows plus a thin orange thread along the
          top edge, so all three brand colors read immediately on load. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 10%, rgba(22,63,93,0.16) 0, transparent 45%), radial-gradient(circle at 90% 0%, rgba(46,154,92,0.20) 0, transparent 42%)',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-700 via-accent-500 to-orange-500" aria-hidden="true" />
      <Container className="relative grid gap-14 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <span className="eyebrow">{dict.hero.eyebrow}</span>
          <h1 className="mt-4 text-4xl font-bold text-ink sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            {dict.hero.title}{' '}
            {/* No underline decoration here — a native wavy text-decoration
                breaks unpredictably across wrapped lines (looks like a
                spell-check squiggle, not a design choice). The green color
                on a serif display weight is enough emphasis on its own. */}
            <span className="text-accent-600">{dict.hero.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">{dict.hero.subtitle}</p>

          <div className="mt-8">
            <HeroPostalForm locale={locale} dict={dict} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <CtaButton href={bookingHref(locale)} size="lg">
              {dict.hero.ctaPrimary}
            </CtaButton>
            <CtaButton href={routes.services(locale)} variant="secondary" size="lg">
              {dict.hero.ctaSecondary}
            </CtaButton>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {dict.hero.trustBadges.map((badge) => (
              <li key={badge} className="flex items-center gap-2 text-sm text-ink-light">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-in lg:justify-self-end" style={{ animationDelay: '150ms' }}>
          <HeroVisual locale={locale} />
        </div>
      </Container>
    </section>
  );
}

/**
 * Residential visual for the hero: a real interior photo (see
 * src/lib/config/homepage-media.ts for sourcing/licensing) in place of the
 * earlier gradient-and-line-art placeholder, paired with a floating
 * booking-confirmation card and a small brand-cursor badge, so the visual
 * communicates "book a professional home cleaning online" rather than an
 * abstract SaaS-style dashboard.
 *
 * The frame's entrance uses a one-time diagonal wipe reveal — the page's
 * single signature motion, echoing a cleaning pass across the photo. It
 * only plays once on load and is neutralized site-wide by the
 * prefers-reduced-motion override in globals.css.
 */
function HeroVisual({ locale }: { locale: Locale }) {
  const t =
    locale === 'fr'
      ? {
          cardTitle: 'Ménage résidentiel',
          cardTime: "Aujourd'hui · 10 h – 12 h",
          area: 'Votre secteur',
          confirmed: 'Confirmé',
          badge: 'Réservez en quelques clics',
        }
      : {
          cardTitle: 'Residential cleaning',
          cardTime: 'Today · 10 AM – 12 PM',
          area: 'Your area',
          confirmed: 'Confirmed',
          badge: 'Book in a few clicks',
        };

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-primary-50 shadow-lifted ring-1 ring-sand-200">
        <Image
          src={heroPhoto.src}
          alt={heroPhoto.alt[locale]}
          fill
          priority
          // unoptimized: these are hotlinked Unsplash photos already served
          // pre-sized/pre-compressed via URL params (see homepage-media.ts).
          // Skipping Next's own re-optimization avoids that step depending
          // on the dev machine's outbound network/proxy setup to Unsplash.
          unoptimized
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 90vw"
          className="object-cover"
          style={{ objectPosition: heroPhoto.objectPosition }}
        />
        {/* One-time wipe reveal — the page's signature motion. A soft-edged
            panel slides off to the right on load, like a cleaning pass
            uncovering the room. Purely decorative, so aria-hidden. */}
        <div className="animate-wipe-reveal absolute inset-0 bg-sand-50" aria-hidden="true" />
      </div>

      {/* Small brand-cursor badge — echoes the logo's click/cursor mark.
          Offsets stay inside the frame on narrow phones (no negative
          horizontal offset until `sm:`) to avoid any horizontal overflow. */}
      <div className="absolute -top-4 left-4 flex items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md sm:left-8">
        <MousePointerClick className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {t.badge}
      </div>

      {/* Floating booking-confirmation card. Stays within the frame's own
          width on mobile (right-2, not a negative offset) so it can never
          push the page into horizontal scroll on narrow phones; only
          extends past the frame edge from `sm:` up where there's room. */}
      <div className="absolute -bottom-6 right-2 w-56 max-w-[80%] rounded-2xl bg-white p-4 shadow-lifted ring-1 ring-sand-200 sm:-bottom-8 sm:-right-8 sm:w-64 sm:max-w-none sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{t.cardTitle}</p>
            <p className="text-xs text-ink-muted">{t.cardTime}</p>
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between border-t border-sand-100 pt-3.5 text-xs">
          <span className="flex items-center gap-1 text-ink-muted">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {t.area}
          </span>
          <span className="font-semibold text-accent-700">{t.confirmed}</span>
        </div>
      </div>
    </div>
  );
}
