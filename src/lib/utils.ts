import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Generates a friendly, non-sequential booking confirmation number. */
export function generateConfirmationNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `CM-${stamp}${random}`;
}
