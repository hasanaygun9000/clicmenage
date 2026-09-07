# ClicMénage — launch checklist

This is everything that still needs a real, confirmed answer before the ClicMénage website goes live. Nothing on this list was invented — every placeholder in the code is clearly marked so the site can be built and previewed today, without blocking on any of this.

## Brand & content

- [x] Official ClicMénage logo integrated (`public/brand/clicmenage-logo.png`, rendered via `src/components/layout/logo.tsx` in the header and footer — the file itself was not modified/redrawn). The site favicon and social-share preview image were also generated directly from this logo file (cropped, not redrawn) instead of the earlier placeholder mark.
- [ ] Real photos of the team/service, if you want them (the homepage hero currently uses a photo-ready frame with a placeholder brand illustration — see the comment in `src/components/home/hero.tsx` for exactly where to drop in a real photo)
- [ ] Real customer reviews/testimonials (none are shown — a fabricated review was never added; the review component is ready but empty until you provide real ones)
- [ ] Company "About" story — the About page has honest, generic copy and is marked for you to personalize once you decide what to share

## Business information

Phone, email, hours, and street address are all **hidden automatically** on the live site until you fill them in below — nothing fake is ever shown to a visitor. See `.env.example` for the exact variables and `src/lib/config/business.ts` for how each one is used.

- [ ] Company phone number (`NEXT_PUBLIC_BUSINESS_PHONE` / `NEXT_PUBLIC_BUSINESS_PHONE_HREF`)
- [ ] Company email address (`NEXT_PUBLIC_BUSINESS_EMAIL`)
- [ ] Real business hours (`NEXT_PUBLIC_BUSINESS_HOURS_FR` / `NEXT_PUBLIC_BUSINESS_HOURS_EN`, plus `hours` in `business.ts` for the structured-data version)
- [ ] Domain name registered and configured (`NEXT_PUBLIC_SITE_URL` in `.env.local`)
- [ ] Social media links, only if/when real accounts exist (`src/lib/config/business.ts`) — left blank by default so no fake/unclaimed accounts are advertised

## Pricing

- [ ] Real base prices, per-bedroom/bathroom pricing, and deep-clean/move multipliers (`src/lib/pricing/pricing-config.ts`)
- [ ] Real extras pricing (fridge, oven, windows, etc.)
- [ ] Real recurring-frequency discounts
- [ ] Confirm the $89 minimum booking amount (or change it)
- [ ] Confirm GST/QST tax rates are current, and set `taxes.enabled` as appropriate
- [ ] Once real pricing is entered, set `isDemoPricing: false` in the same file — this removes the "demo pricing" notice shown throughout the site. Every price in `pricing-config.ts` is explicitly commented `DEMO / TO BE CONFIRMED BEFORE LAUNCH`.

## Service areas

- [ ] Double-check the postal code (FSA) coverage lists per city in `src/lib/config/service-areas.ts` against Canada Post's official boundaries — most were cross-checked against public FSA data during this revision, but Canada Post is the authoritative source and boundaries near the edges of an FSA can include addresses just outside the city you'd expect
- [ ] **Saint-Philippe is listed as a served area but its postal codes will NOT pass the automated booking check yet.** Its postal codes fall under FSA `J0L`, a large rural code shared with many unrelated small municipalities — adding it as-is would incorrectly accept addresses from towns ClicMénage doesn't serve. Until you can confirm a precise way to recognize Saint-Philippe addresses (e.g. specific streets/postal codes), a Saint-Philippe customer will need to book manually or you'll need to decide how to handle this. See the comment on the `saint-philippe` entry in `service-areas.ts`.
- [ ] Note: Candiac and La Prairie share the same FSA (`J5R`) per Canada Post — the booking form correctly accepts both, but which of the two names is shown back to the customer is decided by array order in `service-areas.ts`, not a precise per-address lookup
- [ ] Confirm which cities should have a full SEO landing page vs. just being listed

## Booking rules

- [ ] Confirm business days, minimum lead time, and maximum advance booking window (`src/lib/config/booking-rules.ts`)
- [ ] Add any known blackout dates (statutory holidays, etc.)

## Payments

- [ ] Create a Stripe account and add `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your production environment
- [ ] Complete the Stripe integration in `src/lib/payments/stripe.ts` (currently runs in a clearly-labeled mock mode — bookings are created but no money moves)

## Email

- [ ] Choose a transactional email provider (Resend or Postmark recommended) and add its API key
- [ ] Complete the integration in `src/lib/email/provider.ts` and write the actual email templates (confirmation, reminder, reschedule, cancellation, business alert)

## Database

- [ ] Set up a Supabase project (or your preferred database) and add credentials
- [ ] Complete the integration in `src/lib/db/bookings.ts` — bookings currently live in memory only and are lost on server restart

## Legal

- [ ] **Have a legal professional review the Privacy Policy, Terms of Service, and Cancellation Policy** (`src/lib/config/policies.ts`) — these are clearly-marked starter templates, not verified legal documents
- [ ] Fill in the real cancellation/rescheduling notice period (currently a placeholder)
- [ ] Confirm whether a street address should be published, or service-area-only (`src/lib/config/business.ts`)

## Trust & credibility

- [ ] Add real information about insurance, background checks, or certifications — only if and when they're actually true. Nothing has been invented; the trust section currently says only what's verifiably true today.
- [ ] Add real Google reviews once the business has some (see the review component notes)

## Marketing & analytics

- [ ] Google Business Profile — set up and link (`NEXT_PUBLIC_GOOGLE_BUSINESS_URL` in `.env.local`)
- [ ] Google Analytics / Tag Manager / Meta Pixel IDs, if desired (all optional, all off by default — see `.env.example`)

## Technical

- [ ] Run `npm install`, `npm run lint`, `npm run typecheck`, and `npm run build` locally to confirm a clean build (this could not be run in the sandboxed environment this site was built in — see `README.md`)
- [ ] Click through the entire booking flow yourself on both desktop and a real phone
- [ ] Deploy to Vercel (or your preferred host) and set all environment variables there
- [ ] Verify the sitemap (`/sitemap.xml`) and `robots.txt` after deploying to a real domain
- [ ] Submit the sitemap to Google Search Console
