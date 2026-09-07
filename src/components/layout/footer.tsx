import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary-type';
import { services } from '@/lib/config/services';
import { getLandingPageAreas } from '@/lib/config/service-areas';
import { business, isPhoneConfigured, isPublicEmailConfigured } from '@/lib/config/business';
import { routes } from '@/lib/config/routes';
import { Logo } from './logo';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const areas = getLandingPageAreas().filter((a) => !a.parentSlug); // top-level areas only, keep footer concise
  const showContactColumn = isPhoneConfigured() || isPublicEmailConfigured();

  return (
    <footer className="border-t-4 border-t-primary-800 bg-white">
      <Container className="py-14">
        <div className={cn('grid grid-cols-2 gap-10 sm:grid-cols-2', showContactColumn ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
          <div className="col-span-2 lg:col-span-1">
            <Logo locale={locale} className="h-8" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">{dict.footer.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">{dict.footer.servicesTitle}</h3>
            <ul className="mt-4 space-y-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={routes.service(locale, s.slug)} className="text-sm text-ink-muted hover:text-primary-800">
                    {s.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">{dict.footer.areasTitle}</h3>
            <ul className="mt-4 space-y-3">
              {areas.slice(0, 6).map((a) => (
                <li key={a.slug}>
                  <Link href={routes.area(locale, a.slug)} className="text-sm text-ink-muted hover:text-primary-800">
                    {a.name[locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={routes.areas(locale)} className="text-sm font-medium text-primary-700 hover:text-primary-900">
                  {dict.common.viewAll}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">{dict.footer.companyTitle}</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href={routes.about(locale)} className="text-sm text-ink-muted hover:text-primary-800">
                  {dict.footer.aboutLink}
                </Link>
              </li>
              <li>
                <Link href={routes.contact(locale)} className="text-sm text-ink-muted hover:text-primary-800">
                  {dict.footer.contactLink}
                </Link>
              </li>
              <li>
                <Link href={routes.faq(locale)} className="text-sm text-ink-muted hover:text-primary-800">
                  {dict.footer.faqLink}
                </Link>
              </li>
            </ul>
          </div>

          {(isPhoneConfigured() || isPublicEmailConfigured()) && (
            <div>
              <h3 className="text-sm font-semibold text-ink">{dict.footer.contactTitle}</h3>
              <ul className="mt-4 space-y-3">
                {isPhoneConfigured() && (
                  <li>
                    <a href={business.phoneHref} className="flex items-center gap-2 text-sm text-ink-muted hover:text-primary-800">
                      <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      {business.phone}
                    </a>
                  </li>
                )}
                {isPublicEmailConfigured() && (
                  <li>
                    <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-sm text-ink-muted hover:text-primary-800">
                      <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      {business.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-sand-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            © {year} {business.displayName}. {dict.footer.rights}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={routes.privacy(locale)} className="text-sm text-ink-muted hover:text-primary-800">
              {dict.footer.privacyLink}
            </Link>
            <Link href={routes.terms(locale)} className="text-sm text-ink-muted hover:text-primary-800">
              {dict.footer.termsLink}
            </Link>
            <Link href={routes.cancellation(locale)} className="text-sm text-ink-muted hover:text-primary-800">
              {dict.footer.cancellationLink}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
