import { useCallback } from 'react';
import type { Payment } from '@/types';
import { paymentsStore } from '@/data/stores';
import { addPayment, deletePayment, updatePayment, type NewPaymentInput } from '@/data/repositories/paymentRepository';
import { useStoreValue } from './useStore';

export function usePayments() {
  const payments = useStoreValue(paymentsStore);

  return {
    payments,
    addPayment: useCallback((input: NewPaymentInput) => addPayment(input), []),
    updatePayment: useCallback((id: string, patch: Partial<Omit<Payment, 'id' | 'createdAt'>>) => updatePayment(id, patch), []),
    deletePayment: useCallback((id: string) => deletePayment(id), []),
  };
}

export function usePaymentsForVendor(vendorId: string | undefined): Payment[] {
  const payments = useStoreValue(paymentsStore);
  return vendorId ? payments.filter((p) => p.vendorId === vendorId) : [];
}

export function usePaymentsForSchedule(paymentScheduleId: string | undefined): Payment[] {
  const payments = useStoreValue(paymentsStore);
  return paymentScheduleId ? payments.filter((p) => p.paymentScheduleId === paymentScheduleId) : [];
}
