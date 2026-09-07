import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { Container } from '@/components/ui/container';
import { HouseLineArt } from '@/components/ui/house-line-art';
import { whyChoosePhoto } from '@/lib/config/homepage-media';

/**
 * Merged "Why ClicMénage" + "Trust" — these used to be two back-to-back
 * card grids saying similar things (simplicity, reliability, local
 * knowledge). One image + checklist section says it once, with a photo
 * doing the emotional work a card grid can't.
 */
export function WhyChoose({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-accent-50 py-14 sm:py-20">
      {/* Subtle house-outline watermark — the brand identity showing up
          away from the header/footer, without redrawing the logo itself. */}
      {/* aria-hidden is already set inside HouseLineArt's own <svg>. */}
      <HouseLineArt className="pointer-events-none absolute -right-16 -top-16 hidden h-72 w-72 text-accent-100 sm:block" />
      <Container className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.75rem] shadow-lifted ring-1 ring-accent-200 lg:order-2 lg:max-w-none">
          <Image
            src={whyChoosePhoto.src}
            alt={whyChoosePhoto.alt[locale]}
            fill
            unoptimized
            sizes="(min-width: 1024px) 40vw, 85vw"
            className="object-cover"
            style={{ objectPosition: whyChoosePhoto.objectPosition }}
          />
          <div className="animate-wipe-reveal absolute inset-0 bg-accent-50" aria-hidden="true" />
        </div>

        <div className="lg:order-1">
          <span className="eyebrow">{dict.whyChoose.eyebrow}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">{dict.whyChoose.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">{dict.whyChoose.subtitle}</p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {dict.whyChoose.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
