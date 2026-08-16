import type { PaymentSchedule } from '@/types';
import { generateId } from '@/lib/id';
import { paymentSchedulesStore, paymentsStore } from '../stores';

export type NewPaymentScheduleInput = Omit<PaymentSchedule, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addPaymentSchedule(input: NewPaymentScheduleInput): PaymentSchedule {
  const timestamp = nowISO();
  const schedule: PaymentSchedule = { ...input, id: generateId('paysched'), createdAt: timestamp, updatedAt: timestamp };
  paymentSchedulesStore.set((prev) => [...prev, schedule]);
  return schedule;
}

export function updatePaymentSchedule(id: string, patch: Partial<Omit<PaymentSchedule, 'id' | 'createdAt'>>): void {
  paymentSchedulesStore.set((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: nowISO() } : s)));
}

export function cancelPaymentSchedule(id: string): void {
  updatePaymentSchedule(id, { status: 'Cancelled' });
}

/** Deletes a schedule and un-links (not deletes) any payments recorded against it. */
export function deletePaymentSchedule(id: string): void {
  paymentSchedulesStore.set((prev) => prev.filter((s) => s.id !== id));
  paymentsStore.set((prev) => prev.map((p) => (p.paymentScheduleId === id ? { ...p, paymentScheduleId: undefined, updatedAt: nowISO() } : p)));
}
