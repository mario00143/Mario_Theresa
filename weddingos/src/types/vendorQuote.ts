import type { EventScope } from './task';

export const QUOTE_STATUSES = ['Received', 'Under Review', 'Negotiating', 'Accepted', 'Rejected', 'Expired'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/**
 * A single quotation from a vendor. totalAmount is a derived field
 * (baseAmount - discountAmount + taxAmount + otherCharges) — it is stored
 * rather than computed on the fly so a quote's total reflects what was
 * actually quoted at the time, but callers should always set it via
 * `computeQuoteTotal` (utils/budgetLogic.ts) rather than typing it by hand.
 * Tax is never assumed as a percentage — the actual tax amount is recorded.
 */
export interface VendorQuote {
  id: string;
  vendorId: string;
  quoteReference?: string;
  quoteDate?: string;
  validUntil?: string;
  event: EventScope;
  scopeSummary?: string;
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  otherCharges: number;
  totalAmount: number;
  negotiatedAmount?: number;
  currency: string;
  status: QuoteStatus;
  isSelected: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
