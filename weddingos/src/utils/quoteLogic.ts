import type { VendorQuote } from '@/types';
import { daysUntil } from './date';
import { effectiveQuoteAmount } from './financeCalc';

export function isQuoteExpired(quote: VendorQuote, referenceDate?: Date): boolean {
  if (!quote.validUntil) return false;
  const diff = daysUntil(quote.validUntil, referenceDate);
  return diff !== null && diff < 0;
}

export function isQuoteExpiringSoon(quote: VendorQuote, withinDays = 7, referenceDate?: Date): boolean {
  if (!quote.validUntil) return false;
  const diff = daysUntil(quote.validUntil, referenceDate);
  return diff !== null && diff >= 0 && diff <= withinDays;
}

export interface QuoteComparisonRow {
  quote: VendorQuote;
  effectiveAmount: number;
  isLowest: boolean;
}

/**
 * Builds a same-category quote comparison. Lowest price is highlighted as a
 * fact, never as a recommendation — the caller decides what "best" means.
 */
export function buildQuoteComparison(quotes: VendorQuote[]): QuoteComparisonRow[] {
  const active = quotes.filter((q) => q.status !== 'Rejected' && q.status !== 'Expired');
  const lowest = active.length > 0 ? Math.min(...active.map((q) => effectiveQuoteAmount(q))) : null;

  return quotes.map((quote) => {
    const amount = effectiveQuoteAmount(quote);
    return {
      quote,
      effectiveAmount: amount,
      isLowest: lowest !== null && amount === lowest && quote.status !== 'Rejected' && quote.status !== 'Expired',
    };
  });
}
