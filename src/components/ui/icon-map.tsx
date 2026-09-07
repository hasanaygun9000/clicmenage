import {
  Sparkles,
  ShieldCheck,
  Truck,
  Refrigerator,
  Flame,
  PanelTop,
  Archive,
  Shirt,
  Sofa,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps the string icon names used in config files (services.ts, extras.ts)
 * to actual lucide-react components. Keeping icon choice as a string in
 * config means content editors never need to touch imports.
 */
export const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  ShieldCheck,
  Truck,
  Refrigerator,
  Flame,
  PanelTop,
  Archive,
  Shirt,
  Sofa,
};

export function ResolvedIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = iconMap[name] ?? Sparkles;
  return <IconComponent className={className} aria-hidden="true" />;
}
