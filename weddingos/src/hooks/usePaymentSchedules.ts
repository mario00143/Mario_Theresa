import { useCallback } from 'react';
import type { PaymentSchedule } from '@/types';
import { paymentSchedulesStore } from '@/data/stores';
import {
  addPaymentSchedule,
  cancelPaymentSchedule,
  deletePaymentSchedule,
  updatePaymentSchedule,
  type NewPaymentScheduleInput,
} from '@/data/repositories/paymentScheduleRepository';
import { useStoreValue } from './useStore';

export function usePaymentSchedules() {
  const paymentSchedules = useStoreValue(paymentSchedulesStore);

  return {
    paymentSchedules,
    addPaymentSchedule: useCallback((input: NewPaymentScheduleInput) => addPaymentSchedule(input), []),
    updatePaymentSchedule: useCallback(
      (id: string, patch: Partial<Omit<PaymentSchedule, 'id' | 'createdAt'>>) => updatePaymentSchedule(id, patch),
      [],
    ),
    cancelPaymentSchedule: useCallback((id: string) => cancelPaymentSchedule(id), []),
    deletePaymentSchedule: useCallback((id: string) => deletePaymentSchedule(id), []),
  };
}

export function usePaymentSchedulesForVendor(vendorId: string | undefined): PaymentSchedule[] {
  const paymentSchedules = useStoreValue(paymentSchedulesStore);
  return vendorId ? paymentSchedules.filter((s) => s.vendorId === vendorId) : [];
}
