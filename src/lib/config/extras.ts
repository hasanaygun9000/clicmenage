import type { Bilingual } from './types';

/**
 * ============================================================================
 *  EXTRAS CATALOG — ClicMénage
 * ============================================================================
 * Add-on tasks selectable in step 5 of the booking flow. Prices live in
 * pricing-config.ts (keyed by `id`) so this file stays purely descriptive —
 * change a price without touching this list, or add a new extra by adding
 * one entry here AND one price entry in pricing-config.ts.
 * ============================================================================
 */

export interface ExtraDefinition {
  id: string;
  name: Bilingual;
  description: Bilingual;
  icon: 'Refrigerator' | 'Flame' | 'PanelTop' | 'Archive' | 'Shirt' | 'Sofa';
}

export const extras: ExtraDefinition[] = [
  {
    id: 'inside-fridge',
    name: { fr: 'Intérieur du réfrigérateur', en: 'Inside refrigerator' },
    description: { fr: 'Nettoyage complet de l’intérieur du frigo, tablettes incluses.', en: 'Full interior clean of the fridge, shelves included.' },
    icon: 'Refrigerator',
  },
  {
    id: 'inside-oven',
    name: { fr: 'Intérieur du four', en: 'Inside oven' },
    description: { fr: 'Dégraissage et nettoyage de l’intérieur du four.', en: 'Degreasing and cleaning of the oven interior.' },
    icon: 'Flame',
  },
  {
    id: 'interior-windows',
    name: { fr: 'Fenêtres intérieures', en: 'Interior windows' },
    description: { fr: 'Lavage des fenêtres accessibles depuis l’intérieur.', en: 'Washing of windows reachable from inside.' },
    icon: 'PanelTop',
  },
  {
    id: 'inside-cabinets',
    name: { fr: 'Intérieur des armoires', en: 'Inside cabinets' },
    description: { fr: 'Nettoyage de l’intérieur des armoires de cuisine.', en: 'Cleaning inside kitchen cabinets.' },
    icon: 'Archive',
  },
  {
    id: 'laundry-folding',
    name: { fr: 'Lessive et pliage', en: 'Laundry & folding' },
    description: { fr: 'Une brassée de lessive lavée, séchée et pliée.', en: 'One load of laundry washed, dried and folded.' },
    icon: 'Shirt',
  },
  {
    id: 'upholstery-refresh',
    name: { fr: 'Rafraîchissement des tissus d’ameublement', en: 'Upholstery refresh' },
    description: { fr: 'Aspiration et rafraîchissement des divans et fauteuils.', en: 'Vacuuming and refreshing of sofas and armchairs.' },
    icon: 'Sofa',
  },
];

export function getExtraById(id: string): ExtraDefinition | undefined {
  return extras.find((e) => e.id === id);
}
