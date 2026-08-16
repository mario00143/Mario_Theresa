import type { Refund } from '@/types';
import { generateId } from '@/lib/id';
import { refundsStore } from '../stores';

export type NewRefundInput = Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addRefund(input: NewRefundInput): Refund {
  const timestamp = nowISO();
  const refund: Refund = { ...input, id: generateId('refund'), createdAt: timestamp, updatedAt: timestamp };
  refundsStore.set((prev) => [...prev, refund]);
  return refund;
}

export function updateRefund(id: string, patch: Partial<Omit<Refund, 'id' | 'createdAt'>>): void {
  refundsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r)));
}

export function deleteRefund(id: string): void {
  refundsStore.set((prev) => prev.filter((r) => r.id !== id));
}
