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
| Prices (base price, per-bedroom, per-bathroom, extras, discounts, taxes) | `src/lib/pricing/pricing-config.ts` |
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

Open `src/lib/pricing/pricing-config.ts`. Every dollar amount shown anywhere on the site — service pages, the booking flow, the review screen — is calculated from the numbers in that one file. Change a number there, save, and it updates everywhere. The current numbers are clearly marked as **demo pricing** (see the `isDemoPricing` flag at the top of the file) — set it to `false` once you've entered your real prices, and the "demo pricing" notice will disappear from the site automatically.

### Adding a new city

Open `src/lib/config/service-areas.ts` and copy an existing entry (e.g. `saint-bruno`). Give it a new `slug`, its postal code prefixes (`fsaPrefixes`), and — if you want a full SEO landing page for it — a `landingContent` block with a short intro and list of neighbourhoods. That's it; the areas grid, the postal-code checker in the booking flow, and the location page all pick it up automatically.

### Adding a new service or extra

Copy an existing entry in `src/lib/config/services.ts` (or `extras.ts`), give it a new key, and add a matching price in `src/lib/pricing/pricing-config.ts`. The services grid, service pages, and booking flow all read from these files.

## The booking flow, step by step

The booking flow (`/fr/reserver` or `/en/booking`) is 9 steps: service area (postal code) → cleaning type → home size → frequency → extras → date & time → your info → review → payment. Its logic lives in `src/components/booking/`, one file per step, and the scheduling rules (business days, minimum lead time, blackout dates) live in `src/lib/config/booking-rules.ts`.

The price shown during booking is only ever an estimate for the customer's convenience — the server always recalculates the authoritative price from `src/lib/pricing/engine.ts` when the booking is actually submitted (see `src/app/api/bookings/route.ts`), so a customer can never manipulate the price by editing the page.

### How the booking math was tested

Since the sandboxed environment couldn't install packages, the pricing engine and postal-code validator were executed directly (not through the website UI, but as real code) with the following scenarios, and every result was checked by hand:

- Regular cleaning, 2 bedrooms / 1 bathroom, one-time → correct
- Deep cleaning, 4 bedrooms / 2 bathrooms, with 2 extras → correct multiplier + extras applied
- Regular cleaning, 3 bedrooms / 2 bathrooms, weekly (recurring discount) → 20% discount applied correctly
- Move-in/move-out, studio (0 bedrooms) / 1 bathroom → correct
- A small booking that falls below the $89 minimum → the minimum floor correctly kicks in
- Valid Montreal and Brossard postal codes → correctly matched to the right city
- An Ottawa postal code → correctly rejected as out of service area
- Malformed postal codes → correctly rejected

You should still click through the booking flow yourself once you run `npm run dev`, on both desktop and a real phone, before launch.

## Connecting real services (Stripe, email, database)

None of these are required for the site to work — they all run in a safe "demo mode" until configured:

- **Payments (Stripe)**: `src/lib/payments/stripe.ts`. Add your Stripe keys to `.env.local` and follow the comment at the top of the file.
- **Transactional emails**: `src/lib/email/provider.ts`. Currently logs what it would send. Pick a provider (Resend or Postmark both have generous free tiers), add the API key, and follow the comment at the top of the file.
- **Database (bookings storage)**: `src/lib/db/bookings.ts`. Currently stores bookings in memory (they reset when the server restarts) — fine for demoing, not for production. Supabase is recommended (free tier, hosted Postgres) — the file explains exactly what to do.

## Deploying

This is a standard Next.js app, so it deploys cleanly to [Vercel](https://vercel.com) (recommended — connect your GitHub repo and it builds automatically) or any host that supports Next.js. Remember to set your environment variables (from `.env.local`) in your hosting provider's dashboard — `.env.local` itself is never uploaded anywhere (it's excluded via `.gitignore`).

## Before you launch

See `LAUNCH_CHECKLIST.md` for the full list of what still needs to be filled in (real pricing, contact info, legal review, etc.) before this goes live.
