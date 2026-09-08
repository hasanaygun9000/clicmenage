/**
 * Shape of a UI dictionary. Both fr.ts and en.ts must satisfy this type,
 * so TypeScript will error immediately if a translation key is missing
 * from either language.
 */
export interface Dictionary {
  meta: {
    siteName: string;
    tagline: string;
    defaultDescription: string;
  };
  nav: {
    services: string;
    howItWorks: string;
    areas: string;
    faq: string;
    contact: string;
    about: string;
    bookNow: string;
    menu: string;
    closeMenu: string;
  };
  common: {
    loading: string;
    submit: string;
    next: string;
    back: string;
    close: string;
    required: string;
    optional: string;
    from: string;
    perVisit: string;
    learnMore: string;
    viewAll: string;
    minutesAbbrev: string;
    bookNow: string;
    getQuote: string;
    error: string;
    success: string;
    yes: string;
    no: string;
    edit: string;
    subtotal: string;
    taxes: string;
    total: string;
    estimatedTotal: string;
    demoPricingNotice: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustBadges: string[];
    postalPlaceholder: string;
    postalCta: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { title: string; description: string }[];
  };
  services: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaViewDetails: string;
    ctaBook: string;
    sectionCtaTitle: string;
    sectionCtaSubtitle: string;
    sectionCtaButton: string;
    includedTitle: string;
    whoForTitle: string;
    benefitsTitle: string;
    extrasTitle: string;
    faqTitle: string;
    otherServicesTitle: string;
  };
  whyChoose: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  trust: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  extras: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  areas: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewCity: string;
    notListedTitle: string;
    notListedSubtitle: string;
    emailPlaceholder: string;
    notifyMe: string;
    moreAreasNote: string;
  };
  faqHome: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
  footer: {
    description: string;
    servicesTitle: string;
    areasTitle: string;
    companyTitle: string;
    legalTitle: string;
    contactTitle: string;
    aboutLink: string;
    contactLink: string;
    faqLink: string;
    privacyLink: string;
    termsLink: string;
    cancellationLink: string;
    rights: string;
    socialNote: string;
  };
  mobileCta: {
    label: string;
  };
  booking: {
    title: string;
    subtitle: string;
    stepLabel: string;
    stepOf: string;
    stepNames: string[];
    continueButton: string;
    backButton: string;
    /** Shown next to the Continue button only while it's disabled, so the reason is visible instead of a silently-inert button. */
    continueHint: string;
    summaryTitle: string;
    /** Shown in the sidebar while on step 1, before an area/service is known — must not reuse step2's copy. */
    summaryStep1Note: string;
    editStep: string;
    step1: {
      title: string;
      subtitle: string;
      postalLabel: string;
      postalPlaceholder: string;
      addressLabel: string;
      addressPlaceholder: string;
      checkButton: string;
      inAreaMessage: string;
      outOfAreaTitle: string;
      outOfAreaMessage: string;
      notifyEmailPlaceholder: string;
      notifySubmit: string;
      notifySuccess: string;
      invalidPostal: string;
    };
    step2: {
      title: string;
      subtitle: string;
    };
    step3: {
      title: string;
      subtitle: string;
      housingTypeLabel: string;
      housingTypeOptions: { condoApartment: string; house: string; townhouse: string; duplexTriplex: string };
      bedroomsLabel: string;
      studio: string;
      sixPlus: string;
      fullBathroomsLabel: string;
      fullBathroomsHint: string;
      halfBathroomsLabel: string;
      halfBathroomsHint: string;
      sqftLabel: string;
      sqftHint: string;
      sqftOptions: {
        under750: string;
        from750to999: string;
        from1000to1499: string;
        from1500to1999: string;
        from2000to2499: string;
        from2500to2999: string;
        over3000: string;
        unknown: string;
      };
      floorsLabel: string;
      floorsHint: string;
      floorsOptions: { one: string; two: string; threePlus: string };
      lastCleaningLabel: string;
      lastCleaningHint: string;
      lastCleaningOptions: {
        under1month: string;
        oneToThreeMonths: string;
        threeToSixMonths: string;
        over6months: string;
        over1year: string;
        unknown: string;
      };
      petHairLabel: string;
      petHairOptions: { none: string; some: string; heavy: string };
      furnishingStateLabel: string;
      furnishingStateOptions: { empty: string; partlyFurnished: string; furnished: string };
      deepRecommendedTitle: string;
      deepRecommendedMessage: string;
      deepRequiredTitle: string;
      deepRequiredMessage: string;
      switchToDeepButton: string;
      keepRegularButton: string;
      manualReviewNotice: string;
    };
    step4: {
      title: string;
      subtitle: string;
      savingsBadge: string;
    };
    step5: {
      title: string;
      subtitle: string;
      noneSelected: string;
      quantityLabel: string;
      perWindowUnit: string;
      perLoadUnit: string;
      perBedUnit: string;
    };
    step6: {
      title: string;
      subtitle: string;
      dateLabel: string;
      windowLabel: string;
      noSlotsMessage: string;
      leadTimeNote: string;
    };
    step7: {
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      unit: string;
      unitPlaceholder: string;
      postalCode: string;
      city: string;
      instructions: string;
      instructionsPlaceholder: string;
      accessNote: string;
      emailInvalid: string;
    };
    step8: {
      title: string;
      subtitle: string;
      serviceLabel: string;
      homeSizeLabel: string;
      frequencyLabel: string;
      extrasLabel: string;
      dateLabel: string;
      addressLabel: string;
      contactLabel: string;
      priceBreakdownTitle: string;
      promoNote: string;
      termsAgree: string;
      termsLinkText: string;
    };
    step9: {
      title: string;
      subtitle: string;
      payLabel: string;
      mockNotice: string;
      confirmButton: string;
      processingButton: string;
      successTitle: string;
      successMessage: string;
      confirmationNumberLabel: string;
      backHomeButton: string;
      errorTitle: string;
      errorMessage: string;
      tryAgain: string;
    };
    errors: {
      requiredField: string;
      invalidEmail: string;
      invalidPhone: string;
      invalidPostal: string;
      selectOption: string;
      selectDate: string;
    };
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    formName: string;
    formEmail: string;
    formPhone: string;
    formSubject: string;
    formMessage: string;
    formSubmit: string;
    formSubmitting: string;
    formSuccessTitle: string;
    formSuccessMessage: string;
    formErrorMessage: string;
    infoTitle: string;
    phoneLabel: string;
    emailLabel: string;
    hoursLabel: string;
    areaLabel: string;
    contactInfoPending: string;
    faqShortcutTitle: string;
    faqShortcutCta: string;
    bookingCtaTitle: string;
    bookingCtaSubtitle: string;
    bookingCtaButton: string;
  };
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    missionTitle: string;
    missionBody: string;
    approachTitle: string;
    approachBody: string;
    localTitle: string;
    localBody: string;
    ctaTitle: string;
    ctaButton: string;
  };
  faqPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    categoriesTitle: string;
    ctaTitle: string;
    ctaButton: string;
  };
  policies: {
    lastUpdatedLabel: string;
    reviewNotice: string;
    privacy: { title: string; intro: string };
    terms: { title: string; intro: string };
    cancellation: { title: string; intro: string };
  };
  notFound: {
    title: string;
    message: string;
    cta: string;
  };
}
