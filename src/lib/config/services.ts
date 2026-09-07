import type { Bilingual, BilingualList } from './types';

/**
 * ============================================================================
 *  SERVICE CATALOG — ClicMénage
 * ============================================================================
 * Each service is a self-contained, data-driven definition. To add a new
 * service later (e.g. "post-construction cleaning"), add an entry here with
 * a new `slug` and a matching entry in `src/lib/pricing/pricing-config.ts`
 * (under `services`) — the services grid, service pages, and booking flow
 * will all pick it up automatically.
 * ============================================================================
 */

export interface ServiceFaqItem {
  question: Bilingual;
  answer: Bilingual;
}

export interface ServiceDefinition {
  slug: string;
  /** Must match a key in pricing-config.ts `services` map. */
  pricingKey: 'regular' | 'deep' | 'move';
  name: Bilingual;
  shortDescription: Bilingual;
  longDescription: Bilingual;
  included: BilingualList;
  whoFor: BilingualList;
  benefits: BilingualList;
  faq: ServiceFaqItem[];
  /** Lucide icon name, kept as a string so it's easy to swap without touching components. */
  icon: 'Sparkles' | 'ShieldCheck' | 'Truck';
}

export const services: ServiceDefinition[] = [
  {
    slug: 'menage-regulier',
    pricingKey: 'regular',
    icon: 'Sparkles',
    name: { fr: 'Ménage régulier', en: 'Regular cleaning' },
    shortDescription: {
      fr: "L'entretien de routine pour garder votre maison propre, semaine après semaine.",
      en: 'Routine upkeep to keep your home clean, week after week.',
    },
    longDescription: {
      fr: "Le ménage régulier est notre service d'entretien de base, pensé pour les visites ponctuelles ou récurrentes. Il couvre les tâches essentielles dans chaque pièce de la maison pour maintenir un environnement propre et agréable au quotidien.",
      en: 'Regular cleaning is our core upkeep service, designed for one-time or recurring visits. It covers the essential tasks in every room to keep your home clean and comfortable day to day.',
    },
    included: {
      fr: [
        'Époussetage de toutes les surfaces accessibles',
        'Nettoyage et désinfection des cuisines (comptoirs, évier, extérieur des électroménagers)',
        'Nettoyage et désinfection des salles de bain',
        'Balayage et lavage des planchers',
        'Aspirateur des tapis et carpettes',
        'Vidage des poubelles',
        'Nettoyage des miroirs et surfaces vitrées accessibles',
      ],
      en: [
        'Dusting of all reachable surfaces',
        'Kitchen cleaning and sanitizing (counters, sink, exterior of appliances)',
        'Bathroom cleaning and sanitizing',
        'Sweeping and mopping of floors',
        'Vacuuming of carpets and rugs',
        'Trash removal',
        'Cleaning of mirrors and accessible glass surfaces',
      ],
    },
    whoFor: {
      fr: [
        'Familles occupées qui veulent garder une maison propre sans y penser',
        'Professionnels avec un horaire chargé',
        'Propriétaires de condo à la recherche d’un entretien régulier',
        'Locataires qui veulent un coup de main hebdomadaire ou aux deux semaines',
      ],
      en: [
        'Busy families who want a clean home without the mental load',
        'Professionals with a demanding schedule',
        'Condo owners looking for regular upkeep',
        'Tenants who want weekly or biweekly help',
      ],
    },
    benefits: {
      fr: [
        'Réservable en une fois ou de façon récurrente',
        'Tarif préférentiel pour les visites récurrentes',
        'Même standard de qualité à chaque visite',
        'Extras ajoutables selon vos besoins du moment',
      ],
      en: [
        'Bookable as a one-time visit or on a recurring basis',
        'Preferred rate for recurring visits',
        'The same quality standard on every visit',
        'Extras can be added whenever you need them',
      ],
    },
    faq: [
      {
        question: { fr: 'À quelle fréquence puis-je réserver un ménage régulier?', en: 'How often can I book a regular cleaning?' },
        answer: {
          fr: 'Vous pouvez réserver une visite unique, ou choisir une fréquence hebdomadaire, aux deux semaines ou aux quatre semaines directement dans le formulaire de réservation.',
          en: 'You can book a single visit, or choose a weekly, biweekly, or every-four-weeks frequency directly in the booking form.',
        },
      },
      {
        question: { fr: 'Dois-je fournir les produits de nettoyage?', en: 'Do I need to provide cleaning products?' },
        answer: {
          fr: "Cette information sera précisée avant votre réservation. En général, notre équipe peut apporter le nécessaire ou utiliser vos produits si vous le préférez — dites-le-nous dans les instructions particulières.",
          en: 'This will be confirmed with you before your booking. Generally, our team can bring what’s needed or use your own products if you prefer — just mention it in the special instructions.',
        },
      },
      {
        question: { fr: 'Combien de temps dure un ménage régulier?', en: 'How long does a regular cleaning take?' },
        answer: {
          fr: "La durée dépend de la taille de votre domicile et du nombre de chambres et salles de bain. Une estimation de temps s'affiche pendant votre réservation.",
          en: 'The duration depends on the size of your home and the number of bedrooms and bathrooms. A time estimate is shown during your booking.',
        },
      },
    ],
  },
  {
    slug: 'menage-en-profondeur',
    pricingKey: 'deep',
    icon: 'ShieldCheck',
    name: { fr: 'Ménage en profondeur', en: 'Deep cleaning' },
    shortDescription: {
      fr: 'Un nettoyage intensif qui va au-delà de l’entretien de routine.',
      en: 'An intensive clean that goes beyond routine upkeep.',
    },
    longDescription: {
      fr: "Le ménage en profondeur s'attaque aux zones souvent négligées lors de l'entretien régulier : plinthes, cadres de porte, luminaires, et recoins qui accumulent la poussière avec le temps. C'est le service idéal pour une remise à neuf ou avant de commencer des visites récurrentes.",
      en: 'Deep cleaning tackles the areas often missed during regular upkeep: baseboards, door frames, light fixtures, and the corners that accumulate dust over time. It’s the ideal service for a reset, or before starting recurring visits.',
    },
    included: {
      fr: [
        'Tout ce qui est inclus dans le ménage régulier',
        'Nettoyage détaillé des plinthes et cadres de porte',
        'Nettoyage des luminaires et interrupteurs',
        'Nettoyage en profondeur des salles de bain (joints, robinetterie)',
        'Nettoyage derrière et sous les meubles accessibles',
        'Nettoyage détaillé de la cuisine (façades d’armoires, petits électroménagers visibles)',
      ],
      en: [
        'Everything included in regular cleaning',
        'Detailed cleaning of baseboards and door frames',
        'Light fixtures and switch plates cleaned',
        'Deep bathroom cleaning (grout, fixtures)',
        'Cleaning behind and under accessible furniture',
        'Detailed kitchen cleaning (cabinet fronts, visible small appliances)',
      ],
    },
    whoFor: {
      fr: [
        'Maisons n’ayant pas eu de ménage professionnel depuis longtemps',
        'Avant de recevoir de la visite ou un événement important',
        'Avant de commencer un plan de ménage récurrent',
        'Après une rénovation légère (sans gros débris de construction)',
      ],
      en: [
        'Homes that haven’t had a professional cleaning in a while',
        'Before hosting guests or an important event',
        'Before starting a recurring cleaning plan',
        'After light renovations (without heavy construction debris)',
      ],
    },
    benefits: {
      fr: [
        'Résultat visible dès la première visite',
        'Bonne base avant de passer à un entretien régulier',
        'Extras supplémentaires disponibles (four, frigo, fenêtres)',
        'Idéal en combinaison avec un ménage récurrent par la suite',
      ],
      en: [
        'A visible difference from the very first visit',
        'A strong starting point before switching to regular upkeep',
        'Additional extras available (oven, fridge, windows)',
        'Ideal to pair with recurring cleanings afterward',
      ],
    },
    faq: [
      {
        question: { fr: 'Quelle est la différence avec le ménage régulier?', en: 'How is this different from regular cleaning?' },
        answer: {
          fr: 'Le ménage en profondeur couvre des zones plus détaillées (plinthes, luminaires, joints) qui ne sont pas traitées à chaque visite régulière. Il prend généralement plus de temps.',
          en: 'Deep cleaning covers more detailed areas (baseboards, light fixtures, grout) that aren’t part of every regular visit. It generally takes more time.',
        },
      },
      {
        question: { fr: 'Est-ce que je devrais commencer par un ménage en profondeur?', en: 'Should I start with a deep cleaning?' },
        answer: {
          fr: "Si c'est votre première réservation ou si ça fait longtemps que votre domicile n'a pas eu un entretien complet, on recommande généralement de commencer par un ménage en profondeur avant de passer à un plan récurrent.",
          en: 'If this is your first booking, or it’s been a while since your home had a full clean, we generally recommend starting with a deep cleaning before moving to a recurring plan.',
        },
      },
      {
        question: { fr: 'Puis-je ajouter des extras à mon ménage en profondeur?', en: 'Can I add extras to my deep cleaning?' },
        answer: {
          fr: 'Oui, vous pouvez ajouter des extras comme l’intérieur du four, du réfrigérateur ou des fenêtres directement dans le formulaire de réservation.',
          en: 'Yes, you can add extras like the inside of the oven, fridge, or windows directly in the booking form.',
        },
      },
    ],
  },
  {
    slug: 'menage-demenagement',
    pricingKey: 'move',
    icon: 'Truck',
    name: { fr: 'Ménage déménagement', en: 'Move-in / move-out cleaning' },
    shortDescription: {
      fr: 'Un ménage complet pour un logement vide, avant ou après un déménagement.',
      en: 'A thorough clean for an empty home, before or after a move.',
    },
    longDescription: {
      fr: "Conçu pour les logements vides, ce service couvre chaque pièce en profondeur — idéal pour remettre les clés d'un appartement en bon état ou pour emménager dans un endroit impeccable. Puisque le logement est vide, notre équipe peut accéder à chaque surface sans obstacle.",
      en: 'Designed for empty homes, this service covers every room thoroughly — ideal for handing back the keys to an apartment in good condition, or moving into a spotless space. Since the home is empty, our team can access every surface without obstruction.',
    },
    included: {
      fr: [
        'Nettoyage complet de toutes les pièces, incluant les garde-robes vides',
        'Intérieur des armoires de cuisine et de salle de bain',
        'Intérieur du four et du réfrigérateur (si laissé sur place)',
        'Nettoyage des plinthes, cadres de portes et de fenêtres',
        'Nettoyage détaillé des salles de bain',
        'Lavage complet des planchers',
      ],
      en: [
        'Full cleaning of every room, including empty closets',
        'Inside kitchen and bathroom cabinets',
        'Inside the oven and refrigerator (if left on site)',
        'Baseboards, door frames and window sills cleaned',
        'Detailed bathroom cleaning',
        'Full floor washing',
      ],
    },
    whoFor: {
      fr: [
        'Locataires qui quittent un logement et veulent récupérer leur dépôt',
        'Propriétaires qui préparent un logement pour de nouveaux occupants',
        'Personnes qui emménagent et veulent commencer dans un espace impeccable',
        'Hôtes Airbnb / location court terme qui préparent une unité entre deux locataires',
      ],
      en: [
        'Tenants moving out who want their unit left in great condition',
        'Landlords preparing a unit for new occupants',
        'People moving in who want to start in a spotless space',
        'Airbnb / short-term rental hosts preparing a unit between guests',
      ],
    },
    benefits: {
      fr: [
        'Couvre les recoins habituellement négligés dans un logement meublé',
        'Idéal pour respecter les exigences de fin de bail',
        'Planifiable autour de votre date de déménagement',
        'Service ponctuel, sans engagement récurrent',
      ],
      en: [
        'Covers the spots usually missed in a furnished home',
        'Ideal for meeting end-of-lease requirements',
        'Can be scheduled around your moving date',
        'One-time service, no recurring commitment required',
      ],
    },
    faq: [
      {
        question: { fr: 'Le logement doit-il être complètement vide?', en: 'Does the home need to be completely empty?' },
        answer: {
          fr: 'Ce service est optimisé pour un logement vide ou presque vide, ce qui nous permet d’accéder à toutes les surfaces. Un logement encore meublé peut prendre plus de temps.',
          en: 'This service is optimized for an empty or nearly empty home, which lets us access every surface. A still-furnished home may take longer.',
        },
      },
      {
        question: { fr: 'Puis-je réserver ce service pour une unité Airbnb?', en: 'Can I book this for an Airbnb unit?' },
        answer: {
          fr: 'Oui, plusieurs hôtes de location court terme utilisent ce service entre deux séjours ou pour une remise à neuf ponctuelle.',
          en: 'Yes, several short-term rental hosts use this service between stays or for a one-time refresh.',
        },
      },
      {
        question: { fr: 'Combien de temps à l’avance dois-je réserver?', en: 'How far in advance should I book?' },
        answer: {
          fr: 'Nous recommandons de réserver dès que votre date de déménagement est confirmée, car ces créneaux sont demandés en fin et en début de mois.',
          en: 'We recommend booking as soon as your moving date is confirmed, since these slots are in demand at the end and beginning of the month.',
        },
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return services.find((s) => s.slug === slug);
}
