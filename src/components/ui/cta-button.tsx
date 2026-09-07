import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

export function CtaButton({
  href,
  children,
  variant = 'primary',
  className,
  icon,
  size = 'md',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
  size?: 'md' | 'lg';
}) {
  return (
    <Link
      href={href}
      className={cn(variantClass[variant], size === 'lg' && 'px-7 py-4 text-base', className)}
    >
      {children}
      {icon}
    </Link>
  );
}
