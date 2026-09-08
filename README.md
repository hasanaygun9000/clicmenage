# ClicMénage — website & booking system

This is the full source code for the ClicMénage website: a bilingual (French/English) marketing site with an online booking flow for residential cleaning services in Greater Montreal.

You don't need to be a developer to understand this README — it explains what's here, how to preview it, and exactly which files to open when you want to change something (pricing, phone number, service areas, etc).

## What's in this project

- A modern, mobile-first marketing website (homepage, service pages, "how it works", areas served, FAQ, about, contact)
- A 9-step online booking flow with a live-updating price estimate
- A centralized pricing engine (one file controls every price on the site)
- Full French/English bilingual support, with French as the default
- SEO basics: sitemap, robots.txt, page titles/descriptions, structured data for Google
- The wiring for online payments (Stripe), transactional emails, and a database — all built with safe "demo mode" defaults so the site works today, and each is ready to switch on the moment you have real credentials

## Technology used

- **Next.js** (React framework, App Router) with **TypeScript**
- **Tailwind CSS** for styling
- **Zod** for form validation
- No database or paid services are required to run this locally — everything works out of the box in a safe demo mode.

## Before you start: this session couldn't install packages

This project was built in a sandboxed environment without access to the npm package registry, so `npm install` could not be run here, and the app could not be started or built for a final check. The code has been carefully reviewed by hand and by automated scripts that verified every internal import/export in the project (99 files, zero issues found), and the entire pricing engine and postal-code logic was executed and verified directly with real test scenarios (see "How the booking math was tested" below). Still, the very first thing to do is run the install and build yourself (see below) so you can confirm everything compiles cleanly in a normal environment before deploying.

## How to run this locally

You'll need [Node.js](https://nodejs.org) version 18 or newer installed on your computer.

1. Open a terminal in this project folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment variables template:
   ```
   cp .env.example .env.local
   ```
   (You don't need to fill anything in yet — the site runs in demo mode without it.)
4. Start the local development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/fr` automatically.

To check everything compiles correctly before deploying:
```
npm run lint
npm run typecheck
npm run build
```

## Where to edit things (no code experience needed for most of these)

Everything a non-developer would want to change lives in `src/lib/config/` — plain data files, not application logic.

| I want to change... | Edit this file |
|---|---|
| Phone number, email, business hours, social links (all hidden on the live site until filled in — no fake placeholders shown) | `src/lib/config/business.ts` or `.env.local`, see `.env.example` |
| Prices (reference hours per home size, extras, discounts, taxes, internal cost assumptions) | `src/lib/pricing/pricing-config.ts` |
| Services offered (regular/deep/move-in-out, their descriptions, FAQ) | `src/lib/config/services.ts` |
| Extras (fridge, oven, windows, etc.) | `src/lib/config/extras.ts` |
| Cities/areas served, postal code coverage | `src/lib/config/service-areas.ts` |
| General FAQ | `src/lib/config/faq.ts` |
| Business hours, booking lead time, blackout dates | `src/lib/config/booking-rules.ts` |
| Website text (buttons, headings, labels) — French | `src/lib/i18n/dictionaries/fr.ts` |
| Website text (buttons, headings, labels) — English | `src/lib/i18n/dictionaries/en.ts` |
| Brand colors, fonts, spacing | `tailwind.config.ts` (and the matching CSS variables in `src/styles/globals.css`) |
| Logo (shown in the header and footer) | `public/brand/clicmenage-logo.png` — replace this file directly to update the logo everywhere; don't edit `src/components/layout/logo.tsx` unless you're changing its size |
| Legal pages (privacy, terms, cancellation policy) | `src/lib/config/policies.ts` |

Every one of these files has comments at the top explaining what's safe to change.

### Changing a price

Open `src/lib/pricing/pricing-config.ts`. The client never sees an hourly rate or a promised duration — every price shown anywhere on the site is a fixed, all-in number computed from that file, via `src/lib/pricing/engine.ts` (see the long comment at the top of `pricing-config.ts` for exactly how). Under the hood, the price comes from an internal **estimated person-hours** figure for the job (reference hours per home size + adjustments for square footage, floors, pet hair, and — for Move-In/Out — how furnished the home is), turned into a price using internal cost assumptions (`economics`: labour budget per hour, travel reserve, supplies, card-processing reserve, target margin) that are never shown to the client. Change any of these numbers, save, and every price on the site updates. The current numbers are clearly marked as **demo pricing** (see the `isDemoPricing` flag at the top of the file) — set it to `false` once you've entered your real numbers, and the "demo pricing" notice will disappear from the site automatically.

### Adding a new city

Open `src/lib/config/service-areas.ts` and copy an existing entry (e.g. `saint-bruno`). Give it a new `slug`, its postal code prefixes (`fsaPrefixes`), and — if you want a full SEO landing page for it — a `landingContent` block with a short intro and list of neighbourhoods. That's it; the areas grid, the postal-code checker in the booking flow, and the location page all pick it up automatically.

### Adding a new service or extra

Copy an existing entry in `src/lib/config/services.ts` (or `extras.ts`), give it a new key, and add a matching price in `src/lib/pricing/pricing-config.ts`. The services grid, service pages, and booking flow all read from these files.

## The booking flow, step by step

The booking flow (`/fr/reserver` or `/en/booking`) is 9 steps: service area (postal code) → cleaning type → home size → frequency → extras → date & time → your info → review → payment. Its logic lives in `src/components/booking/`, one file per step, and the scheduling rules (business days, minimum lead time, blackout dates) live in `src/lib/config/booking-rules.ts`.

The price shown during booking is only ever an estimate for the customer's convenience — the server always recalculates the authoritative price from `src/lib/pricing/engine.ts` when the booking is actually submitted (see `src/app/api/bookings/route.ts`), so a customer can never manipulate the price by editing the page.

### How the booking math was tested

This sandboxed environment still can't install packages (same limitation as before — see the note at the top of this README), so `npm run lint`, `npm run typecheck`, `npm run build`, and the new `npm test` suite could not be executed here. **Please run all four yourself** (`npm install` first) and fix anything that comes up — the code has been carefully reviewed by hand, and every file was checked for stale references to the old pricing model (no leftover `basePrice`, `bathrooms`, `extraIds`, etc. anywhere), but a real compiler/linter/test run is the only way to be fully sure.

What *could* be verified directly: the pricing engine (`src/lib/pricing/engine.ts` + `pricing-config.ts`) has zero external dependencies, so it was executed as real code (via `tsx`, bypassing the need for `npm install`) against dozens of scenarios, including all 8 reference home sizes × 3 service tiers from the spec (24 combinations, each landing within one $5 rounding increment of its target price) and the individual rules below — every one checked by hand:

- Studio / 1bed / 2bed·1bath / 2bed·2bath Regular cleaning → each priced correctly and increasing with home size
- A half bathroom → adds hours (and price) correctly
- Square footage 1000+ → adds hours per bucket; under 1000 or "unknown" → adds nothing (never blocks the client)
- 3000+ sq ft → flags `manualReviewRequired` instead of silently promising a final price
- An extra floor (house/townhouse only) → adds hours; ignored for condos/apartments
- Heavy pet hair → adds hours; "some" does not (documented as a future tuning point)
- Weekly / biweekly / every-4-weeks → 15% / 10% / 5% discount applied correctly, on the cleaning price only
- A Regular booking 3–6 months since the last real cleaning → recommended (not required) to switch to Deep
- A Regular booking 6+ months / 1+ year since the last cleaning → required to switch to Deep before continuing
- Move-In/Out empty vs. partly-furnished (×1.15) vs. furnished (×1.30) → priced correctly, higher each time
- Move-In/Out never offers inside oven/fridge/cabinets as extras (already included in that tier's scope)
- A flat-priced extra ignores quantity; a per-window/load/bed extra scales linearly with it
- GST (5%) and QST (9.975%) computed separately and summed correctly
- A very small booking → the $89 minimum floor correctly kicks in
- Valid Montreal and Brossard postal codes → correctly matched to the right city
- An Ottawa postal code → correctly rejected as out of service area
- Malformed postal codes → correctly rejected

A full, runnable version of these checks lives in `src/lib/pricing/__tests__/engine.test.ts` and `src/lib/validation/__tests__/schemas.test.ts` (Vitest — run with `npm test` once you've run `npm install`). Everything that touches React, Next.js, or Zod directly (all the `.tsx` components, and the booking API route) could only be reviewed by hand here, not executed — click through the full booking flow yourself once you run `npm run dev`, on both desktop and a real phone, before launch, paying special attention to booking step 3 (completely rebuilt) and step 5 (extras with quantities).

## Connecting real services (Stripe, email, database)

None of these are required for the site to work — they all run in a safe "demo mode" until configured:

- **Payments (Stripe)**: `src/lib/payments/stripe.ts`. Add your Stripe keys to `.env.local` and follow the comment at the top of the file.
- **Transactional emails**: `src/lib/email/provider.ts`. Currently logs what it would send. Pick a provider (Resend or Postmark both have generous free tiers), add the API key, and follow the comment at the top of the file.
- **Database (bookings storage)**: `src/lib/db/bookings.ts`. Currently stores bookings in memory (they reset when the server restarts) — fine for demoing, not for production. Supabase is recommended (free tier, hosted Postgres) — the file explains exactly what to do.

## Deploying

This is a standard Next.js app, so it deploys cleanly to [Vercel](https://vercel.com) (recommended — connect your GitHub repo and it builds automatically) or any host that supports Next.js. Remember to set your environment variables (from `.env.local`) in your hosting provider's dashboard — `.env.local` itself is never uploaded anywhere (it's excluded via `.gitignore`).

## Before you launch

See `LAUNCH_CHECKLIST.md` for the full list of what still needs to be filled in (real pricing, contact info, legal review, etc.) before this goes live.
