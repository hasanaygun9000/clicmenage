import type { Bilingual } from './types';

/**
 * ============================================================================
 *  HOMEPAGE PHOTOGRAPHY — licensed stock, not business content
 * ============================================================================
 * These are mood/atmosphere photos (bright, clean interiors) used to give the
 * homepage visual warmth. They are NOT photos of ClicMénage's actual homes,
 * team, or work — no business claim is made by using them, same as any
 * cleaning-service marketing site using stock photography for atmosphere.
 *
 * Source: unsplash.com, free tier (Unsplash License — no attribution
 * required, but each photo's page is credited below for traceability).
 * Self-hosted under /public/images (downloaded once, committed to the repo)
 * rather than hotlinked from images.unsplash.com — hotlinking made these
 * images depend on Next's remote-image loader reaching Unsplash from
 * wherever the app runs, which isn't reliable on every network/machine.
 * Self-hosting removes that dependency entirely.
 *
 * Each entry's `alt` is real, descriptive alt text (not the surrounding
 * section's heading) since these are meaningful images, not decorative ones.
 * ============================================================================
 */

export interface HomepagePhoto {
  /** Local path under /public. */
  src: string;
  alt: Bilingual;
  /** Unsplash photo page, for attribution/traceability if ever asked. */
  credit: string;
  /** Focal point for CSS object-position, tuned per photo for mobile crops. */
  objectPosition?: string;
}

export const heroPhoto: HomepagePhoto = {
  src: '/images/hero.jpg',
  alt: {
    fr: 'Salon lumineux et soigné avec plantes, exemple du résultat recherché après un ménage résidentiel.',
    en: 'A bright, tidy living room with plants — the kind of result a residential cleaning aims for.',
  },
  credit: 'https://unsplash.com/photos/a-bright-living-room-with-several-plants-8R6wCppGu3I',
  objectPosition: 'center 40%',
};

/** Keyed by `pricingKey` from src/lib/config/services.ts. */
export const servicePhotos: Record<'regular' | 'deep' | 'move', HomepagePhoto> = {
  regular: {
    src: '/images/service-regular.jpg',
    alt: {
      fr: 'Coin cuisine baigné de lumière naturelle, comptoirs dégagés et propres.',
      en: 'A kitchen corner in natural light, counters clear and clean.',
    },
    credit: 'https://unsplash.com/photos/sunlight-illuminates-a-bright-modern-kitchen-corner-jx18EJtMroQ',
  },
  deep: {
    src: '/images/service-deep.jpg',
    alt: {
      fr: 'Chambre blanche impeccable, baignée de soleil — l’effet recherché après un ménage en profondeur.',
      en: 'A crisp white bedroom in bright sunlight — the effect a deep clean aims for.',
    },
    credit: 'https://unsplash.com/photos/a-clean-white-bedroom-with-bright-sunlight-HajDIO6PKFk',
  },
  move: {
    src: '/images/service-move.jpg',
    alt: {
      fr: 'Salon minimaliste et lumineux, prêt à accueillir de nouveaux occupants.',
      en: 'A bright, minimal living room, ready for new occupants.',
    },
    credit: 'https://unsplash.com/photos/modern-minimalist-living-room-with-white-furniture-4r9OKorlcTk',
  },
};

export const whyChoosePhoto: HomepagePhoto = {
  src: '/images/why-choose.jpg',
  alt: {
    fr: 'Pile de serviettes fraîchement pliées — le souci du détail au cœur de notre service.',
    en: 'A stack of freshly folded towels — the attention to detail behind the service.',
  },
  credit: 'https://unsplash.com/photos/a-stack-of-folded-towels-sitting-on-a-towel-rack-7GCHCT-y1HI',
};

export const howItWorksPhoto: HomepagePhoto = {
  src: '/images/how-it-works.jpg',
  alt: {
    fr: 'Lit fait avec des draps blancs impeccables, résultat final d’un ménage réservé en ligne.',
    en: 'A neatly made bed with crisp white linens — the end result of a booking.',
  },
  credit: 'https://unsplash.com/photos/a-neatly-made-bed-with-white-linens-and-pillows-ooDvIpnXkwo',
};
