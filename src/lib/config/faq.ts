import type { Bilingual } from './types';

/**
 * ============================================================================
 *  GENERAL FAQ — ClicMénage
 * ============================================================================
 * Shown (subset) on the homepage and (full list) on /faq. Service-specific
 * FAQs live alongside each service in services.ts instead.
 * ============================================================================
 */

export type FaqCategory = 'booking' | 'service' | 'payment' | 'areas';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: Bilingual;
  answer: Bilingual;
  /** Shown in the condensed homepage FAQ preview. */
  featuredOnHome?: boolean;
}

export const faqItems: FaqItem[] = [
  {
    id: 'home-presence',
    category: 'service',
    featuredOnHome: true,
    question: { fr: 'Dois-je être présent pendant le ménage?', en: 'Do I need to be home during the cleaning?' },
    answer: {
      fr: "Non, vous n'avez pas besoin d'être présent pendant le ménage. Vous pourrez indiquer vos instructions d'accès (code, boîte à clés, etc.) dans les instructions particulières lors de la réservation.",
      en: 'No, you don’t need to be home during the cleaning. You’ll be able to share your access instructions (a code, a lockbox, etc.) in the special instructions during booking.',
    },
  },
  {
    id: 'cleaning-products',
    category: 'service',
    featuredOnHome: true,
    question: { fr: 'Dois-je fournir les produits de nettoyage?', en: 'Do I need to provide cleaning products?' },
    answer: {
      fr: "Ce n'est généralement pas nécessaire, mais vous pouvez demander qu'on utilise vos propres produits (par exemple pour des raisons de sensibilité ou de préférence) en le précisant dans les instructions particulières.",
      en: 'It’s usually not necessary, but you can request that we use your own products (for example for sensitivity or preference reasons) by noting it in the special instructions.',
    },
  },
  {
    id: 'duration',
    category: 'service',
    featuredOnHome: true,
    question: { fr: 'Combien de temps dure un ménage?', en: 'How long does a cleaning take?' },
    answer: {
      fr: 'La durée varie selon la taille du domicile, le type de ménage choisi et les extras ajoutés. Une estimation s’affiche en temps réel pendant votre réservation.',
      en: 'Duration varies based on your home’s size, the type of cleaning selected, and any extras added. An estimate is shown live during your booking.',
    },
  },
  {
    id: 'whats-included',
    category: 'service',
    question: { fr: 'Qu’est-ce qui est inclus dans un ménage?', en: 'What is included in a cleaning?' },
    answer: {
      fr: 'Chaque service a une liste détaillée de tâches incluses, visible sur sa page dédiée (ménage régulier, en profondeur, ou déménagement). Vous pouvez aussi ajouter des extras selon vos besoins.',
      en: 'Each service has a detailed list of included tasks, visible on its dedicated page (regular, deep, or move-in/move-out cleaning). You can also add extras based on your needs.',
    },
  },
  {
    id: 'reschedule',
    category: 'booking',
    featuredOnHome: true,
    question: { fr: 'Puis-je reporter mon rendez-vous?', en: 'Can I reschedule my appointment?' },
    answer: {
      fr: 'Oui, vous pouvez demander un report selon notre politique d’annulation et de report. Consultez la page dédiée pour les délais applicables.',
      en: 'Yes, you can request a reschedule according to our cancellation and rescheduling policy. See the dedicated page for applicable timelines.',
    },
  },
  {
    id: 'areas-served',
    category: 'areas',
    featuredOnHome: true,
    question: { fr: 'Quels secteurs desservez-vous?', en: 'What areas do you serve?' },
    answer: {
      fr: "Nous desservons le Grand Montréal et une partie de la Rive-Sud, incluant Montréal, Laval, Longueuil, Brossard, Saint-Lambert, Boucherville, Saint-Bruno, Saint-Hubert, l'Ouest-de-l'Île (Dorval, Pointe-Claire, Kirkland, DDO, Beaconsfield, Pierrefonds), ainsi que Candiac, La Prairie, Saint-Constant, Sainte-Catherine, Delson, Châteauguay et Mercier. Entrez votre code postal lors de la réservation pour confirmer que votre adresse est couverte.",
      en: "We serve Greater Montreal and part of the South Shore, including Montreal, Laval, Longueuil, Brossard, Saint-Lambert, Boucherville, Saint-Bruno, Saint-Hubert, the West Island (Dorval, Pointe-Claire, Kirkland, DDO, Beaconsfield, Pierrefonds), as well as Candiac, La Prairie, Saint-Constant, Sainte-Catherine, Delson, Châteauguay, and Mercier. Enter your postal code during booking to confirm your address is covered.",
    },
  },
  {
    id: 'recurring-how',
    category: 'booking',
    question: { fr: 'Comment fonctionnent les ménages récurrents?', en: 'How do recurring cleanings work?' },
    answer: {
      fr: 'Lors de la réservation, choisissez une fréquence (hebdomadaire, aux deux semaines ou aux quatre semaines) plutôt qu’un ménage unique. Un tarif préférentiel s’applique automatiquement aux visites récurrentes.',
      en: 'During booking, choose a frequency (weekly, biweekly, or every four weeks) instead of a one-time cleaning. A preferred rate is applied automatically to recurring visits.',
    },
  },
  {
    id: 'add-extras',
    category: 'booking',
    question: { fr: 'Puis-je ajouter des extras à ma réservation?', en: 'Can I add extras to my booking?' },
    answer: {
      fr: 'Oui, l’étape 5 du formulaire de réservation vous permet d’ajouter des extras comme l’intérieur du four, du réfrigérateur, des fenêtres et plus encore.',
      en: 'Yes, step 5 of the booking form lets you add extras such as the inside of the oven, fridge, windows, and more.',
    },
  },
  {
    id: 'payment-how',
    category: 'payment',
    featuredOnHome: true,
    question: { fr: 'Comment fonctionne le paiement?', en: 'How does payment work?' },
    answer: {
      fr: 'Le paiement se fait en ligne de façon sécurisée à la fin du processus de réservation. Vos informations de carte ne sont jamais stockées sur nos serveurs.',
      en: 'Payment is made securely online at the end of the booking process. Your card information is never stored on our servers.',
    },
  },
  {
    id: 'price-change',
    category: 'payment',
    question: { fr: 'Le prix peut-il changer après ma réservation?', en: 'Can the price change after I book?' },
    answer: {
      fr: 'Le prix affiché est une estimation basée sur les informations fournies. Il peut être ajusté si l’état réel du domicile diffère significativement de ce qui a été indiqué lors de la réservation.',
      en: 'The price shown is an estimate based on the information provided. It may be adjusted if the home’s actual condition differs significantly from what was indicated during booking.',
    },
  },
];

export function getFeaturedFaqItems(): FaqItem[] {
  return faqItems.filter((f) => f.featuredOnHome);
}

export function getFaqItemsByCategory(category: FaqCategory): FaqItem[] {
  return faqItems.filter((f) => f.category === category);
}
