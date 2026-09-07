import type { FrequencyKey, ServicePricingKey } from '@/lib/pricing/pricing-config';
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
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  frequency: FrequencyKey;
  extraIds: string[];
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
  bedrooms: 1,
  bathrooms: 1,
  sqft: '',
  frequency: 'once',
  extraIds: [],
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
