import type { VendorQuote } from '@/types';

/** totalAmount = baseAmount - discountAmount + taxAmount + otherCharges. Tax is never assumed as a percentage — always the actual recorded amount. */
export function computeQuoteTotal(quote: Pick<VendorQuote, 'baseAmount' | 'discountAmount' | 'taxAmount' | 'otherCharges'>): number {
  return quote.baseAmount - quote.discountAmount + quote.taxAmount + quote.otherCharges;
}

/** The commercial value a quote represents once negotiated — the negotiated amount overrides the quoted total when present. */
export function effectiveQuoteAmount(quote: Pick<VendorQuote, 'totalAmount' | 'negotiatedAmount'>): number {
  return quote.negotiatedAmount ?? quote.totalAmount;
}
