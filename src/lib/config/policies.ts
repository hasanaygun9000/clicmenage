import type { Bilingual } from './types';

/**
 * ============================================================================
 *  LEGAL POLICY CONTENT — ClicMénage
 * ============================================================================
 * ⚠️ STARTER TEMPLATES ONLY. These policies were generated as a reasonable
 * starting point for a Quebec residential cleaning service, but they are
 * NOT a substitute for legal advice. A qualified legal professional must
 * review (and likely adjust) this text — especially the cancellation
 * policy's specific timelines and the privacy policy's data-handling
 * claims — before the site goes live. See LAUNCH_CHECKLIST.md.
 * ============================================================================
 */

export interface PolicySection {
  heading: Bilingual;
  paragraphs: Bilingual[];
}

export const lastUpdated = '2026-01-01'; // PLACEHOLDER — update when policies are finalized.

export const privacyPolicySections: PolicySection[] = [
  {
    heading: { fr: 'Renseignements que nous recueillons', en: 'Information we collect' },
    paragraphs: [
      {
        fr: "Lorsque vous utilisez notre site ou effectuez une réservation, nous recueillons les renseignements que vous nous fournissez directement : nom, adresse courriel, numéro de téléphone, adresse de service et toute instruction particulière que vous ajoutez à votre réservation.",
        en: 'When you use our site or make a booking, we collect the information you provide directly to us: name, email address, phone number, service address, and any special instructions you add to your booking.',
      },
      {
        fr: "Nous pouvons également recueillir des renseignements techniques de base (comme le type d'appareil ou le navigateur utilisé) à des fins d'amélioration du site, de façon agrégée et non identifiable dans la mesure du possible.",
        en: 'We may also collect basic technical information (such as device or browser type) to help improve the site, aggregated and de-identified wherever possible.',
      },
    ],
  },
  {
    heading: { fr: 'Utilisation des renseignements', en: 'How we use your information' },
    paragraphs: [
      {
        fr: "Vos renseignements sont utilisés pour traiter votre réservation, communiquer avec vous au sujet de votre ménage, et améliorer notre service. Nous ne vendons pas vos renseignements personnels à des tiers.",
        en: 'Your information is used to process your booking, communicate with you about your cleaning, and improve our service. We do not sell your personal information to third parties.',
      },
    ],
  },
  {
    heading: { fr: 'Paiement', en: 'Payment' },
    paragraphs: [
      {
        fr: "Le traitement des paiements est assuré par un fournisseur de paiement tiers sécurisé. ClicMénage ne stocke pas les numéros complets de carte de crédit sur ses propres serveurs.",
        en: 'Payment processing is handled by a secure third-party payment provider. ClicMénage does not store full credit card numbers on its own servers.',
      },
    ],
  },
  {
    heading: { fr: 'Vos droits', en: 'Your rights' },
    paragraphs: [
      {
        fr: "Vous pouvez en tout temps demander l'accès, la correction ou la suppression de vos renseignements personnels en nous contactant à l'adresse indiquée sur notre page Contact.",
        en: 'You may at any time request access to, correction of, or deletion of your personal information by contacting us at the address listed on our Contact page.',
      },
    ],
  },
];

export const termsSections: PolicySection[] = [
  {
    heading: { fr: 'Acceptation des conditions', en: 'Acceptance of terms' },
    paragraphs: [
      {
        fr: "En utilisant le site web de ClicMénage ou en réservant un service, vous acceptez les présentes conditions d'utilisation.",
        en: 'By using the ClicMénage website or booking a service, you agree to these terms of service.',
      },
    ],
  },
  {
    heading: { fr: 'Réservations et prix', en: 'Bookings and pricing' },
    paragraphs: [
      {
        fr: "Les prix affichés lors de la réservation sont des estimations basées sur les renseignements fournis. Le prix final peut être ajusté si l'état réel du domicile diffère significativement de ce qui a été indiqué.",
        en: "Prices shown during booking are estimates based on the information provided. The final price may be adjusted if the home's actual condition differs significantly from what was indicated.",
      },
    ],
  },
  {
    heading: { fr: 'Accès au domicile', en: 'Home access' },
    paragraphs: [
      {
        fr: "Vous êtes responsable de fournir un accès sécuritaire à votre domicile à l'heure convenue, que ce soit en personne ou par un moyen d'accès convenu (code, boîte à clés, etc.).",
        en: 'You are responsible for providing safe access to your home at the agreed time, whether in person or through an agreed access method (code, lockbox, etc.).',
      },
    ],
  },
  {
    heading: { fr: 'Limitation de responsabilité', en: 'Limitation of liability' },
    paragraphs: [
      {
        fr: "Cette section doit être rédigée avec l'aide d'un professionnel du droit afin de refléter fidèlement les protections et limitations applicables à ClicMénage.",
        en: 'This section must be drafted with the help of a legal professional to accurately reflect the protections and limitations applicable to ClicMénage.',
      },
    ],
  },
];

export const cancellationSections: PolicySection[] = [
  {
    heading: { fr: 'Annulation par le client', en: 'Cancellation by the customer' },
    paragraphs: [
      {
        fr: "PLACEHOLDER — précisez ici le délai minimal (par exemple 24 ou 48 heures avant le rendez-vous) pour annuler sans frais, ainsi que les frais applicables en cas d'annulation tardive.",
        en: 'PLACEHOLDER — specify the minimum notice period here (e.g. 24 or 48 hours before the appointment) to cancel without a fee, along with any fees for late cancellation.',
      },
    ],
  },
  {
    heading: { fr: 'Report de rendez-vous', en: 'Rescheduling an appointment' },
    paragraphs: [
      {
        fr: "Vous pouvez demander de reporter votre rendez-vous en nous contactant avant le délai indiqué ci-dessus. Nous ferons de notre mieux pour vous proposer une nouvelle date rapprochée.",
        en: 'You can request to reschedule your appointment by contacting us before the notice period above. We will do our best to offer you a nearby new date.',
      },
    ],
  },
  {
    heading: { fr: 'Annulation par ClicMénage', en: 'Cancellation by ClicMénage' },
    paragraphs: [
      {
        fr: "En cas de circonstances imprévues, il se peut que nous devions annuler ou reporter un rendez-vous. Nous vous en informerons le plus rapidement possible et vous proposerons une nouvelle date.",
        en: 'In the event of unforeseen circumstances, we may need to cancel or reschedule an appointment. We will notify you as soon as possible and offer a new date.',
      },
    ],
  },
];
