import Image from 'next/image';
import { ClipboardList, ListChecks, CalendarCheck, Home } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { Container } from '@/components/ui/container';
import { howItWorksPhoto } from '@/lib/config/homepage-media';

const stepIcons = [ClipboardList, ListChecks, CalendarCheck, Home];

/**
 * A vertical timeline (steps + connecting line) beside a supporting photo,
 * instead of the generic symmetric 4-column icon grid — this genuinely is a
 * sequence (book → confirm → clean → done), so the numbering stays, it's
 * just given a real line to sit on rather than floating above each card.
 */
export function HowItWorks({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-primary-50 py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{dict.howItWorks.eyebrow}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">{dict.howItWorks.title}</h2>
          <p className="mt-4 text-lg text-ink-muted">{dict.howItWorks.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <ol className="relative">
            {/* The connecting line — a literal path through the steps,
                tying back to the cursor/path motif rather than decoration
                for its own sake. */}
            <div className="absolute bottom-6 left-6 top-6 w-0.5 bg-primary-200" aria-hidden="true" />
            {dict.howItWorks.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? ClipboardList;
              const isLast = index === dict.howItWorks.steps.length - 1;
              return (
                <li key={step.title} className={isLast ? 'relative flex gap-5' : 'relative flex gap-5 pb-10'}>
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-800 text-white ring-4 ring-sand-50">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="pt-1">
                    {/* orange-700, not -600: -600 measures 4.44:1 on this
                        section's sand-50 background, just under the 4.5:1
                        AA minimum for normal text. -700 gives real margin. */}
                    <span className="block text-xs font-semibold uppercase tracking-wide text-orange-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.75rem] shadow-lifted ring-1 ring-primary-200 lg:max-w-none">
            <Image
              src={howItWorksPhoto.src}
              alt={howItWorksPhoto.alt[locale]}
              fill
              unoptimized
              sizes="(min-width: 1024px) 40vw, 85vw"
              className="object-cover"
              style={{ objectPosition: howItWorksPhoto.objectPosition }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
