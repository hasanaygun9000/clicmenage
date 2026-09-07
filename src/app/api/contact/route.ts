import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validation/schemas';
import { sendEmail } from '@/lib/email/provider';
import { business } from '@/lib/config/business';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed', issues: parsed.error.flatten() }, { status: 422 });
  }

  // Honeypot: a real visitor never fills the hidden "company" field.
  // Silently accept (so a bot doesn't learn its submission was rejected)
  // without actually sending anything.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, subject, message } = parsed.data;

  await sendEmail({
    to: business.internalNotificationEmail,
    template: 'contact_form_notification',
    data: { name, email, phone, subject, message },
  });

  return NextResponse.json({ ok: true });
}
