import type { Config } from 'tailwindcss';

/**
 * ClicMénage design tokens.
 *
 * This is the single source of truth for brand colors, type scale,
 * radii and spacing. Change values here (and in src/styles/globals.css
 * for the raw CSS variables) to re-skin the whole site — no component
 * should hardcode a hex value.
 *
 * BRAND SYSTEM (v2 — derived from the official logo):
 *   - `primary` (BLUE)   — the "Clic" wordmark + cursor. Trust, booking,
 *                           professionalism. Used for headings/icons/links
 *                           and as the secondary/outline button color.
 *   - `accent`  (GREEN)  — the "Ménage" wordmark + house outline.
 *                           Cleanliness, freshness, residential service.
 *                           This is the PRIMARY call-to-action color
 *                           ("Réserver maintenant" buttons).
 *   - `orange`           — the logo's click-accent marks. A SMALL, sparing
 *                           accent only (badges, numerals, tiny highlights)
 *                           — never a large fill or a button color.
 *   - `sand`             — neutral backgrounds/borders (renamed in spirit
 *                           to a cool, light neutral rather than a warm
 *                           "sand" tone, to sit cleanly next to blue/green).
 *   - `ink`              — text-primary/text-secondary equivalents.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        // Brand blue — "Clic" + cursor
        primary: {
          DEFAULT: '#163F5D',
          50: '#EEF4FA',
          100: '#D8E7F4',
          200: '#B3D0E9',
          300: '#85B4DA',
          400: '#5495C8',
          500: '#2F78B0',
          600: '#20618F',
          700: '#1A4D72',
          800: '#163F5D',
          900: '#102C44',
          950: '#0A1D2E',
        },
        // Brand green — "Ménage" + house outline. Primary CTA color.
        accent: {
          DEFAULT: '#2E9A5C',
          50: '#EAF8EF',
          100: '#CFEFDA',
          200: '#9FDFB8',
          300: '#6FCE95',
          400: '#46BC79',
          500: '#2E9A5C',
          600: '#237C49',
          700: '#1C6039',
          800: '#154A2C',
          900: '#0E331E',
        },
        // Brand orange — small click-accent only. Never a large fill.
        orange: {
          DEFAULT: '#DB6F22',
          50: '#FDF3EA',
          100: '#FBE3CB',
          200: '#F5C494',
          300: '#EEA35D',
          400: '#E8863A',
          500: '#DB6F22',
          600: '#B85819',
          700: '#8F4415',
          800: '#663212',
        },
        // Neutral backgrounds / borders (background, background-soft, border)
        sand: {
          50: '#F7F8FA',
          100: '#F0F2F5',
          200: '#E4E8ED',
          300: '#D2D8E0',
        },
        // Text-primary / text-secondary
        ink: {
          DEFAULT: '#1B2430',
          light: '#3D4A59',
          muted: '#5C6773',
        },
        success: {
          DEFAULT: '#237C49',
          50: '#EAF8EF',
        },
        error: {
          DEFAULT: '#C0362C',
          50: '#FBEDEC',
        },
      },
      fontFamily: {
        // Fraunces (warm serif) is the heading face — serif fallbacks, not
        // sans, so a slow/failed font load still reads as "the same kind
        // of font" instead of visibly swapping category.
        heading: ['var(--font-heading)', 'Georgia', 'Cambria', 'ui-serif', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.4' }],
        sm: ['0.9375rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.65' }],
        lg: ['1.125rem', { lineHeight: '1.65' }],
        xl: ['1.25rem', { lineHeight: '1.55' }],
        '2xl': ['1.5rem', { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.375rem', { lineHeight: '1.15' }],
        '5xl': ['3rem', { lineHeight: '1.08' }],
        '6xl': ['3.75rem', { lineHeight: '1.04' }],
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(22, 63, 93, 0.07), 0 1px 2px rgba(22, 63, 93, 0.04)',
        card: '0 8px 24px rgba(22, 63, 93, 0.08), 0 2px 6px rgba(22, 63, 93, 0.05)',
        lifted: '0 16px 40px rgba(22, 63, 93, 0.14), 0 4px 12px rgba(22, 63, 93, 0.08)',
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // The page's one signature motion: an opaque panel over a photo
        // slides off to the right, like a single cleaning pass revealing
        // the room underneath. Used in exactly two places — see
        // hero.tsx and why-choose.tsx.
        'wipe-reveal': {
          '0%': { clipPath: 'inset(0 0 0 0)' },
          '60%': { clipPath: 'inset(0 0 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'wipe-reveal': 'wipe-reveal 1.1s cubic-bezier(0.65,0,0.35,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
