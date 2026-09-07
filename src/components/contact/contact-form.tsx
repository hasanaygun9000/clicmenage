'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { trackEvent } from '@/lib/analytics/events';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.contact;
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', company: '' });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('failed');
      trackEvent('contact_form_submitted');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center rounded-lg border border-sand-200 bg-white p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-accent-600" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold text-ink">{t.formSuccessTitle}</h3>
        <p className="mt-2 text-sm text-ink-muted">{t.formSuccessMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-sand-200 bg-white p-6 sm:p-8">
      {/* Honeypot field — hidden from real users via CSS, catches simple bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="contact-name" className="label">
          {t.formName}
        </label>
        <input
          id="contact-name"
          required
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className="label">
            {t.formEmail}
          </label>
          <input
            id="contact-email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="label">
            {t.formPhone}
          </label>
          <input
            id="contact-phone"
            type="tel"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="label">
          {t.formSubject}
        </label>
        <input
          id="contact-subject"
          required
          className="input"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          {t.formMessage}
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          className="input"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {status === 'error' && (
        <div role="alert" className="flex items-start gap-2.5 rounded-md bg-error-50 px-4 py-3 text-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm">{t.formErrorMessage}</p>
        </div>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto">
        {status === 'submitting' ? t.formSubmitting : t.formSubmit}
      </button>
    </form>
  );
}
