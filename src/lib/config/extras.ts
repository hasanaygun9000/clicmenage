import type { Bilingual } from './types';
import type { ServicePricingKey } from '@/lib/pricing/pricing-config';

/**
 * ============================================================================
 *  EXTRAS CATALOG — ClicMénage
 * ============================================================================
 * Add-on tasks selectable in step 5 of the booking flow. Prices (and
 * whether an extra is flat or scales with a quantity the client enters —
 * windows, laundry loads, beds) live in pricing-config.ts (keyed by `id`)
 * so this file stays purely descriptive — change a price without touching
 * this list, or add a new extra by adding one entry here AND one price
 * entry in pricing-config.ts.
 *
 * `excludedForServices` hides an extra for a service tier whose standard
 * scope already includes that task — Move-In/Out already includes inside
 * oven/fridge/empty-cabinets (see services.ts), so those three are never
 * offered as extras there (charging twice for the same task would be a
 * bug, not an upsell).
 * ============================================================================
 */

export interface ExtraDefinition {
  id: string;
  name: Bilingual;
  description: Bilingual;
  icon: 'Refrigerator' | 'Flame' | 'PanelTop' | 'Archive' | 'Shirt' | 'BedDouble' | 'Droplets' | 'ChefHat' | 'Sun';
  /** Service tiers whose standard scope already includes this task, so it should not be offered as an extra there. */
  excludedForServices?: ServicePricingKey[];
}

export const extras: ExtraDefinition[] = [
  {
    id: 'inside-oven',
    name: { fr: 'Intérieur du four', en: 'Inside oven' },
    description: { fr: 'Dégraissage et nettoyage de l’intérieur du four.', en: 'Degreasing and cleaning of the oven interior.' },
    icon: 'Flame',
    excludedForServices: ['move'],
  },
  {
    id: 'inside-fridge',
    name: { fr: 'Intérieur du réfrigérateur', en: 'Inside refrigerator' },
    description: { fr: 'Nettoyage complet de l’intérieur du frigo, tablettes incluses.', en: 'Full interior clean of the fridge, shelves included.' },
    icon: 'Refrigerator',
    excludedForServices: ['move'],
  },
  {
    id: 'inside-empty-cabinets',
    name: { fr: 'Intérieur des armoires de cuisine (vides)', en: 'Inside empty kitchen cabinets' },
    description: { fr: 'Nettoyage de l’intérieur des armoires de cuisine, une fois vidées.', en: 'Cleaning inside kitchen cabinets, once emptied.' },
    icon: 'Archive',
    excludedForServices: ['move'],
  },
  {
    id: 'interior-windows',
    name: { fr: 'Fenêtres intérieures et rebords', en: 'Interior windows & tracks' },
    description: {
      fr: 'Lavage des fenêtres et rebords accessibles depuis l’intérieur — indiquez le nombre de fenêtres.',
      en: 'Washing of windows and tracks reachable from inside — tell us how many windows.',
    },
    icon: 'PanelTop',
  },
  {
    id: 'laundry-wash-fold',
    name: { fr: 'Lessive lavée et pliée', en: 'Laundry wash & fold' },
    description: {
      fr: 'Une brassée de lessive lavée, séchée et pliée — indiquez le nombre de brassées.',
      en: 'A load of laundry washed, dried and folded — tell us how many loads.',
    },
    icon: 'Shirt',
  },
  {
    id: 'change-bedsheets',
    name: { fr: 'Changement de draps', en: 'Change bedsheets' },
    description: {
      fr: 'Retrait des draps utilisés et installation de draps propres — indiquez le nombre de lits.',
      en: 'Removing used sheets and putting on clean ones — tell us how many beds.',
    },
    icon: 'BedDouble',
  },
  {
    id: 'dishwasher',
    name: { fr: 'Lave-vaisselle (charger/décharger)', en: 'Dishwasher load/unload' },
    description: { fr: 'Chargement ou déchargement du lave-vaisselle.', en: 'Loading or unloading the dishwasher.' },
    icon: 'Droplets',
  },
  {
    id: 'second-kitchen',
    name: { fr: 'Deuxième cuisine', en: 'Second kitchen' },
    description: { fr: 'Nettoyage d’une cuisine secondaire (ex. sous-sol).', en: 'Cleaning of a secondary kitchen (e.g. basement).' },
    icon: 'ChefHat',
  },
  {
    id: 'balcony-patio',
    name: { fr: 'Balcon ou terrasse (simple)', en: 'Balcony or patio (simple)' },
    description: { fr: 'Balayage et nettoyage léger d’un balcon ou d’une terrasse.', en: 'Sweeping and a light clean of a balcony or patio.' },
    icon: 'Sun',
  },
];

export function getExtraById(id: string): ExtraDefinition | undefined {
  return extras.find((e) => e.id === id);
}

/** Extras selectable for a given service tier — filters out tasks already included in that tier's standard scope. */
export function getExtrasForService(service: ServicePricingKey): ExtraDefinition[] {
  return extras.filter((extra) => !extra.excludedForServices?.includes(service));
}
