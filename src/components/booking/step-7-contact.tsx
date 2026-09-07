'use client';

import { useState } from 'react';
import type { StepProps } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Step7Contact({ state, updateCustomer, dict }: StepProps) {
  const t = dict.booking.step7;
  const c = state.customer;
  const [emailTouched, setEmailTouched] = useState(false);
  const emailInvalid = emailTouched && c.email.length > 0 && !EMAIL_PATTERN.test(c.email);

  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-ink-muted">{t.subtitle}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="label">
            {t.firstName}
          </label>
          <input id="firstName" className="input" value={c.firstName} onChange={(e) => updateCustomer({ firstName: e.target.value })} />
        </div>
        <div>
          <label htmlFor="lastName" className="label">
            {t.lastName}
          </label>
          <input id="lastName" className="input" value={c.lastName} onChange={(e) => updateCustomer({ lastName: e.target.value })} />
        </div>
        <div>
          <label htmlFor="email" className="label">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={c.email}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? 'email-error' : undefined}
            onChange={(e) => updateCustomer({ email: e.target.value })}
            onBlur={() => setEmailTouched(true)}
          />
          {emailInvalid && (
            <p id="email-error" role="alert" className="field-error">
              {t.emailInvalid}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="label">
            {t.phone}
          </label>
          <input id="phone" type="tel" className="input" value={c.phone} onChange={(e) => updateCustomer({ phone: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className="label">
            {t.address}
          </label>
          <input id="address" className="input" value={c.address} onChange={(e) => updateCustomer({ address: e.target.value })} />
        </div>
        <div>
          <label htmlFor="unit" className="label">
            {t.unit}
          </label>
          <input id="unit" className="input" placeholder={t.unitPlaceholder} value={c.unit} onChange={(e) => updateCustomer({ unit: e.target.value })} />
        </div>
        <div>
          <label htmlFor="city" className="label">
            {t.city}
          </label>
          <input id="city" className="input" value={c.city} onChange={(e) => updateCustomer({ city: e.target.value })} />
        </div>
        <div>
          <label htmlFor="customerPostal" className="label">
            {t.postalCode}
          </label>
          <input id="customerPostal" className="input" value={c.postalCode} onChange={(e) => updateCustomer({ postalCode: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="instructions" className="label">
            {t.instructions}
          </label>
          <textarea
            id="instructions"
            rows={4}
            className="input"
            placeholder={t.instructionsPlaceholder}
            value={c.instructions}
            onChange={(e) => updateCustomer({ instructions: e.target.value })}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted">{t.accessNote}</p>
    </div>
  );
}
