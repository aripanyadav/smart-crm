/**
 * Formats a numeric value as currency based on the provided currency code.
 * Falls back to USD if the currency is not supported or missing.
 */
export function formatCurrency(value: number | null | undefined, currency: string = 'USD'): string {
  if (value === null || value === undefined) return '';

  const locales: Record<string, string> = {
    USD: 'en-US',
    INR: 'en-IN',
    NPR: 'ne-NP',
    EUR: 'de-DE'
  };

  const locale = locales[currency] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (err) {
    // Fallback to basic USD formatting if Intl fails
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}
