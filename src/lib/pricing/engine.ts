import { pricingConfig, type FrequencyKey, type ServicePricingKey } from './pricing-config';

export interface PricingInput {
  service: ServicePricingKey;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  frequency: FrequencyKey;
  extraIds: string[];
}

export interface PricingLineItem {
  id: string;
  label: string;
  amount: number;
}

export interface PricingBreakdown {
  currency: string;
  isDemoPricing: boolean;
  lineItems: PricingLineItem[];
  cleaningSubtotal: number;
  extrasSubtotal: number;
  frequencyDiscountRate: number;
  frequencyDiscountAmount: number;
  subtotalBeforeMinimum: number;
  minimumApplied: boolean;
  subtotal: number;
  gstAmount: number;
  qstAmount: number;
  taxAmount: number;
  total: number;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Computes the full price breakdown for a booking configuration.
 * This is the single function both the booking wizard (client-side, for
 * the live-updating estimate) and the booking API route (server-side, for
 * authoritative pricing before payment) call — see SECURITY note in
 * src/app/api/bookings/route.ts about never trusting a client-sent total.
 */
export function calculatePricing(input: PricingInput): PricingBreakdown {
  const serviceConfig = pricingConfig.services[input.service];
  const bedrooms = Math.max(0, input.bedrooms);
  const bathrooms = Math.max(0, input.bathrooms);

  const bedroomsCost = bedrooms * pricingConfig.perBedroomPrice;
  const bathroomsCost = bathrooms * pricingConfig.perBathroomPrice;

  let sqftCost = 0;
  if (input.sqft && input.sqft > pricingConfig.sqft.threshold) {
    const extraUnits = Math.ceil((input.sqft - pricingConfig.sqft.threshold) / 500);
    sqftCost = extraUnits * pricingConfig.sqft.pricePerExtra500Sqft;
  }

  const preMultiplierSubtotal = serviceConfig.basePrice + bedroomsCost + bathroomsCost + sqftCost;
  const cleaningSubtotal = round2(preMultiplierSubtotal * serviceConfig.multiplier);

  const extrasSubtotal = round2(
    input.extraIds.reduce((sum, id) => sum + (pricingConfig.extrasPricing[id] ?? 0), 0)
  );

  const frequencyDiscountRate = pricingConfig.frequencyDiscounts[input.frequency] ?? 0;
  const frequencyDiscountAmount = round2(cleaningSubtotal * frequencyDiscountRate);

  const subtotalBeforeMinimum = round2(cleaningSubtotal - frequencyDiscountAmount + extrasSubtotal);
  const minimumApplied = subtotalBeforeMinimum < pricingConfig.minimumBookingAmount;
  const subtotal = minimumApplied ? pricingConfig.minimumBookingAmount : subtotalBeforeMinimum;

  let gstAmount = 0;
  let qstAmount = 0;
  if (pricingConfig.taxes.enabled) {
    gstAmount = round2(subtotal * pricingConfig.taxes.gst.rate);
    qstAmount = round2(subtotal * pricingConfig.taxes.qst.rate);
  }
  const taxAmount = round2(gstAmount + qstAmount);
  const total = round2(subtotal + taxAmount);

  const lineItems: PricingLineItem[] = [
    { id: 'base', label: 'base', amount: round2(serviceConfig.basePrice) },
  ];
  if (bedroomsCost > 0) lineItems.push({ id: 'bedrooms', label: 'bedrooms', amount: round2(bedroomsCost) });
  if (bathroomsCost > 0) lineItems.push({ id: 'bathrooms', label: 'bathrooms', amount: round2(bathroomsCost) });
  if (sqftCost > 0) lineItems.push({ id: 'sqft', label: 'sqft', amount: round2(sqftCost) });

  return {
    currency: pricingConfig.currency,
    isDemoPricing: pricingConfig.isDemoPricing,
    lineItems,
    cleaningSubtotal,
    extrasSubtotal,
    frequencyDiscountRate,
    frequencyDiscountAmount,
    subtotalBeforeMinimum,
    minimumApplied,
    subtotal,
    gstAmount,
    qstAmount,
    taxAmount,
    total,
  };
}

export function formatCurrency(amount: number, locale: 'fr' | 'en'): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: pricingConfig.currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
