import type { Payment, PaymentSchedule, Refund } from '@/types';
import { totalPaidForVendor } from './paymentLogic';

export interface VendorReconciliation {
  vendorId: string;
  committed: number;
  scheduled: number;
  paid: number;
  outstanding: number;
  overpaid: number;
  refundExpected: number;
  refundReceived: number;
}

/** Section 24: the full contracted → scheduled → paid → outstanding chain for one vendor. */
export function computeVendorReconciliation(
  vendorId: string,
  committed: number,
  paymentSchedules: PaymentSchedule[],
  payments: Payment[],
  refunds: Refund[],
): VendorReconciliation {
  const scheduled = paymentSchedules
    .filter((s) => s.vendorId === vendorId && s.status !== 'Cancelled')
    .reduce((sum, s) => sum + s.amount, 0);
  const paid = totalPaidForVendor(payments, vendorId);
  const vendorRefunds = refunds.filter((r) => r.vendorId === vendorId);

  return {
    vendorId,
    committed,
    scheduled,
    paid,
    outstanding: Math.max(0, committed - paid),
    overpaid: Math.max(0, paid - committed),
    refundExpected: vendorRefunds.reduce((sum, r) => sum + (r.expectedAmount ?? 0), 0),
    refundReceived: vendorRefunds.reduce((sum, r) => sum + (r.receivedAmount ?? 0), 0),
  };
}

const SCHEDULE_MISMATCH_TOLERANCE = 1;

/**
 * True when a vendor's scheduled-payment total differs from its committed
 * amount by more than ₹1 — unless a schedule for that vendor carries a note
 * explaining the deliberate mismatch (section 24: "Allow deliberate
 * mismatch with a note").
 */
export function hasUndocumentedScheduleMismatch(vendorId: string, committed: number, paymentSchedules: PaymentSchedule[]): boolean {
  const vendorSchedules = paymentSchedules.filter((s) => s.vendorId === vendorId && s.status !== 'Cancelled');
  const scheduled = vendorSchedules.reduce((sum, s) => sum + s.amount, 0);
  const diff = Math.abs(scheduled - committed);
  if (diff <= SCHEDULE_MISMATCH_TOLERANCE) return false;
  const hasDocumentation = vendorSchedules.some((s) => s.notes?.trim());
  return !hasDocumentation;
}
