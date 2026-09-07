import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Container } from './container';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-sand-200 bg-sand-50 py-3">
      <Container>
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-primary-800">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}
