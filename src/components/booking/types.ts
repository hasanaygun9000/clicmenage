import type {
  FrequencyKey,
  ServicePricingKey,
  HousingType,
  SqftBucket,
  LastCleaning,
  PetHair,
  FurnishingState,
} from '@/lib/pricing/pricing-config';
import type { SelectedExtra } from '@/lib/pricing/engine';
import type { BookingCustomer } from '@/lib/booking/types';

export type AreaCheckStatus = 'idle' | 'checking' | 'in-area' | 'out-of-area' | 'invalid';

export interface BookingWizardState {
  postalCode: string;
  areaCheckStatus: AreaCheckStatus;
  areaSlug: string | null;
  areaName: string | null;
  notifyEmail: string;
  notifySubmitted: boolean;

  service: ServicePricingKey | null;
  housingType: HousingType | null;
  /** 0 = studio, 1-5 = exact count, 6 = "6+". null = not yet answered. */
  bedrooms: number | null;
  fullBathrooms: number | null;
  halfBathrooms: number;
  sqftBucket: SqftBucket | null;
  /** Only asked (and only ever applied) for house/townhouse. */
  floors: number | null;
  lastCleaning: LastCleaning | null;
  petHair: PetHair | null;
  /** Move-In/Out only. */
  furnishingState: FurnishingState | null;
  /** Client explicitly confirmed the Deep-recommendation/requirement notice in step 3 (see getDeepRecommendationLevel). */
  deepRecommendationAcknowledged: boolean;
  frequency: FrequencyKey;
  extras: SelectedExtra[];
  date: string;
  timeWindowId: string;

  customer: BookingCustomer;
  termsAccepted: boolean;
}

export const initialBookingState: BookingWizardState = {
  postalCode: '',
  areaCheckStatus: 'idle',
  areaSlug: null,
  areaName: null,
  notifyEmail: '',
  notifySubmitted: false,

  service: null,
  housingType: null,
  bedrooms: null,
  fullBathrooms: null,
  halfBathrooms: 0,
  sqftBucket: null,
  floors: null,
  lastCleaning: null,
  petHair: null,
  furnishingState: null,
  deepRecommendationAcknowledged: false,
  frequency: 'once',
  extras: [],
  date: '',
  timeWindowId: '',

  customer: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    unit: '',
    postalCode: '',
    city: '',
    instructions: '',
  },
  termsAccepted: false,
};

export const TOTAL_STEPS = 9;

export interface StepProps {
  state: BookingWizardState;
  update: (patch: Partial<BookingWizardState>) => void;
  updateCustomer: (patch: Partial<BookingCustomer>) => void;
  locale: import('@/lib/i18n/config').Locale;
  dict: import('@/lib/i18n/dictionary-type').Dictionary;
  goToStep?: (step: number) => void;
}
