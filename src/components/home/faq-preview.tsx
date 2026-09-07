import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { getFeaturedFaqItems } from '@/lib/config/faq';
import { routes } from '@/lib/config/routes';
import { Container } from '@/components/ui/container';
import { Accordion } from '@/components/ui/accordion';
import { CtaButton } from '@/components/ui/cta-button';

export function FaqPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getFeaturedFaqItems().map((f) => ({
    id: f.id,
    question: f.question[locale],
    answer: f.answer[locale],
  }));

  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">{dict.faqHome.eyebrow}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">{dict.faqHome.title}</h2>
          <p className="mt-4 text-lg text-ink-muted">{dict.faqHome.subtitle}</p>
        </div>

        <div className="mt-10">
          <Accordion items={items} />
        </div>

        <div className="mt-8 text-center">
          <CtaButton href={routes.faq(locale)} variant="secondary">
            {dict.faqHome.cta}
          </CtaButton>
        </div>
      </Container>
    </section>
  );
}
