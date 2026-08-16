import { useCallback } from 'react';
import type { VendorQuote } from '@/types';
import { vendorQuotesStore } from '@/data/stores';
import {
  addVendorQuote,
  deleteVendorQuote,
  markVendorQuoteNegotiating,
  rejectVendorQuote,
  selectVendorQuote,
  updateVendorQuote,
  type NewVendorQuoteInput,
} from '@/data/repositories/vendorQuoteRepository';
import { useStoreValue } from './useStore';

export function useVendorQuotes() {
  const vendorQuotes = useStoreValue(vendorQuotesStore);

  return {
    vendorQuotes,
    addVendorQuote: useCallback((input: NewVendorQuoteInput) => addVendorQuote(input), []),
    updateVendorQuote: useCallback((id: string, patch: Partial<Omit<VendorQuote, 'id' | 'createdAt'>>) => updateVendorQuote(id, patch), []),
    deleteVendorQuote: useCallback((id: string) => deleteVendorQuote(id), []),
    selectVendorQuote: useCallback((id: string) => selectVendorQuote(id), []),
    rejectVendorQuote: useCallback((id: string) => rejectVendorQuote(id), []),
    markVendorQuoteNegotiating: useCallback((id: string) => markVendorQuoteNegotiating(id), []),
  };
}

export function useVendorQuotesForVendor(vendorId: string | undefined): VendorQuote[] {
  const vendorQuotes = useStoreValue(vendorQuotesStore);
  return vendorId ? vendorQuotes.filter((q) => q.vendorId === vendorId) : [];
}
