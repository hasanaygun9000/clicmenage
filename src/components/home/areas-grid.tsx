'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Mail } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { getLandingPageAreas } from '@/lib/config/service-areas';
import { routes } from '@/lib/config/routes';
import { Container } from '@/components/ui/container';

export function AreasGrid({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const areas = getLandingPageAreas();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleNotifySubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/area-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Non-blocking: still confirm to the user even if logging failed —
      // this is a low-stakes lead-capture form, not a critical transaction.
    }
    setSubmitted(true);
  }

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{dict.areas.eyebrow}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">{dict.areas.title}</h2>
          <p className="mt-4 text-lg text-ink-muted">{dict.areas.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={routes.area(locale, area.slug)}
              className="group flex items-center justify-between gap-3 rounded-lg border border-sand-200 bg-white px-5 py-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
                <span className="text-sm font-medium text-ink">{area.name[locale]}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 flex-shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-800"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">{dict.areas.moreAreasNote}</p>

        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-sand-200 bg-sand-50 p-6 text-center sm:p-8">
          <h3 className="text-lg font-semibold text-ink">{dict.areas.notListedTitle}</h3>
          <p className="mt-2 text-sm text-ink-muted">{dict.areas.notListedSubtitle}</p>
          {submitted ? (
            <p className="mt-4 text-sm font-medium text-accent-700">✓ {dict.booking.step1.notifySuccess}</p>
          ) : (
            <form onSubmit={handleNotifySubmit} className="mx-auto mt-4 flex max-w-sm flex-col gap-2 sm:flex-row">
              <label htmlFor="areas-notify-email" className="sr-only">
                {dict.areas.emailPlaceholder}
              </label>
              <input
                id="areas-notify-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.areas.emailPlaceholder}
                className="input flex-1"
              />
              <button type="submit" className="btn-secondary flex-shrink-0">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {dict.areas.notifyMe}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
