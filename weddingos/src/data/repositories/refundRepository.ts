import type { Refund } from '@/types';
import { generateId } from '@/lib/id';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import { refundsStore } from '../stores';

export type NewRefundInput = Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addRefund(input: NewRefundInput): Refund {
  const timestamp = nowISO();
  const refund: Refund = { ...input, id: generateId('refund'), createdAt: timestamp, updatedAt: timestamp };
  refundsStore.set((prev) => [...prev, refund]);
  logAuditAction({ action: 'refund.create', entityType: 'Refund', entityId: refund.id, summary: `Recorded a ${refund.refundType} for vendor ${refund.vendorId}` });
  return refund;
}

export function updateRefund(id: string, patch: Partial<Omit<Refund, 'id' | 'createdAt'>>): void {
  refundsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r)));
  logAuditAction({ action: 'refund.update', entityType: 'Refund', entityId: id, summary: `Updated refund ${id}` });
}

export function deleteRefund(id: string): void {
  refundsStore.set((prev) => prev.filter((r) => r.id !== id));
  logAuditAction({ action: 'refund.delete', entityType: 'Refund', entityId: id, summary: `Deleted refund ${id}` });
}
