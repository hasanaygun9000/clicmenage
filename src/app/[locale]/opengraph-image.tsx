import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

// Uses the Node runtime (not edge) so we can read the real logo file from
// disk and embed it as-is — never redrawn or approximated.
export const runtime = 'nodejs';
export const alt = 'ClicMénage';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Dynamically generated Open Graph image — built from the same official
 * logo file used across the site (public/brand/clicmenage-logo.png), on a
 * light background that matches the brand system in tailwind.config.ts.
 * No external image asset dependency at request time beyond that one file.
 */
export default function OgImage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const logoBuffer = readFileSync(join(process.cwd(), 'public/brand/clicmenage-logo.png'));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          backgroundImage:
            'radial-gradient(circle at 8% 10%, rgba(22,63,93,0.06) 0, transparent 42%), radial-gradient(circle at 92% 95%, rgba(46,154,92,0.08) 0, transparent 40%)',
          padding: '90px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={480} height={160} alt="" style={{ objectFit: 'contain' }} />
        <p style={{ marginTop: 44, fontSize: 34, color: '#5C6773', maxWidth: 920 }}>{dict.meta.tagline}</p>
      </div>
    ),
    { ...size }
  );
}
