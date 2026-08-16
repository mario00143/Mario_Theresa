import { useCallback } from 'react';
import type { Refund } from '@/types';
import { refundsStore } from '@/data/stores';
import { addRefund, deleteRefund, updateRefund, type NewRefundInput } from '@/data/repositories/refundRepository';
import { useStoreValue } from './useStore';

export function useRefunds() {
  const refunds = useStoreValue(refundsStore);

  return {
    refunds,
    addRefund: useCallback((input: NewRefundInput) => addRefund(input), []),
    updateRefund: useCallback((id: string, patch: Partial<Omit<Refund, 'id' | 'createdAt'>>) => updateRefund(id, patch), []),
    deleteRefund: useCallback((id: string) => deleteRefund(id), []),
  };
}

export function useRefundsForVendor(vendorId: string | undefined): Refund[] {
  const refunds = useStoreValue(refundsStore);
  return vendorId ? refunds.filter((r) => r.vendorId === vendorId) : [];
}
