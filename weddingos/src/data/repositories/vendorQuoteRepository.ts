import type { VendorQuote } from '@/types';
import { generateId } from '@/lib/id';
import { vendorQuotesStore } from '../stores';
import { computeQuoteTotal } from '@/utils/financeCalc';

export type NewVendorQuoteInput = Omit<VendorQuote, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addVendorQuote(input: NewVendorQuoteInput): VendorQuote {
  const timestamp = nowISO();
  const quote: VendorQuote = {
    ...input,
    totalAmount: computeQuoteTotal(input),
    id: generateId('quote'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  vendorQuotesStore.set((prev) => [...prev, quote]);
  return quote;
}

/** Recomputes totalAmount whenever any of its inputs change. */
export function updateVendorQuote(id: string, patch: Partial<Omit<VendorQuote, 'id' | 'createdAt'>>): void {
  vendorQuotesStore.set((prev) =>
    prev.map((q) => {
      if (q.id !== id) return q;
      const next = { ...q, ...patch };
      return { ...next, totalAmount: computeQuoteTotal(next), updatedAt: nowISO() };
    }),
  );
}

export function deleteVendorQuote(id: string): void {
  vendorQuotesStore.set((prev) => prev.filter((q) => q.id !== id));
}

/** Selects a quote as the vendor's chosen one — at most one quote per vendor is ever selected. */
export function selectVendorQuote(id: string): void {
  const timestamp = nowISO();
  vendorQuotesStore.set((prev) => {
    const target = prev.find((q) => q.id === id);
    if (!target) return prev;
    return prev.map((q) => {
      if (q.id === id) return { ...q, isSelected: true, status: 'Accepted', updatedAt: timestamp };
      if (q.vendorId === target.vendorId) return { ...q, isSelected: false, updatedAt: timestamp };
      return q;
    });
  });
}

export function rejectVendorQuote(id: string): void {
  vendorQuotesStore.set((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'Rejected', isSelected: false, updatedAt: nowISO() } : q)));
}

export function markVendorQuoteNegotiating(id: string): void {
  vendorQuotesStore.set((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'Negotiating', updatedAt: nowISO() } : q)));
}
