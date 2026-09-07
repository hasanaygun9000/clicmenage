import { NextRequest, NextResponse } from 'next/server';
import { areaNotifySchema } from '@/lib/validation/schemas';

/**
 * Captures an email address from someone outside the current service area
 * (or browsing the areas grid) so the business can follow up when it
 * expands. Currently logs only — see LAUNCH_CHECKLIST.md / README for how
 * to wire this into a real mailing list or database table.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = areaNotifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed' }, { status: 422 });
  }

  // eslint-disable-next-line no-console
  console.info('[area-interest] New expansion interest signup', parsed.data);

  return NextResponse.json({ ok: true });
}
