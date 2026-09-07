import type { ReactNode } from 'react';
import { Container } from './container';

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-sand-200 bg-sand-50 py-12 sm:py-16">
      <Container className="max-w-3xl text-center">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-ink-muted">{subtitle}</p>}
        {children}
      </Container>
    </section>
  );
}
