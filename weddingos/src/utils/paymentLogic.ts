import type { Payment, PaymentSchedule, PaymentScheduleStatus } from '@/types';
import { parseDate, todayISO } from './date';

export function totalPaidForSchedule(payments: Payment[], scheduleId: string): number {
  return payments.filter((p) => p.paymentScheduleId === scheduleId).reduce((sum, p) => sum + p.amount, 0);
}

export function totalPaidForVendor(payments: Payment[], vendorId: string): number {
  return payments.filter((p) => p.vendorId === vendorId).reduce((sum, p) => sum + p.amount, 0);
}

export function totalPaidForBudgetItem(payments: Payment[], budgetItemId: string): number {
  return payments.filter((p) => p.budgetItemId === budgetItemId).reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Recomputes a schedule's live status from its actual payments rather than
 * trusting the stored `status` field — dates move and payments get
 * recorded, so this is always derived fresh. A schedule explicitly marked
 * Cancelled stays Cancelled regardless of payments or dates.
 */
export function computePaymentScheduleStatus(
  schedule: PaymentSchedule,
  payments: Payment[],
  referenceDate: string = todayISO(),
): PaymentScheduleStatus {
  if (schedule.status === 'Cancelled') return 'Cancelled';

  const paid = totalPaidForSchedule(payments, schedule.id);
  if (paid >= schedule.amount && schedule.amount > 0) return 'Paid';
  if (paid > 0) return 'Partially Paid';

  if (!schedule.dueDate) return 'Upcoming';
  const due = parseDate(schedule.dueDate);
  const today = parseDate(referenceDate);
  if (!due || !today) return 'Upcoming';
  if (due.getTime() < today.getTime()) return 'Overdue';
  if (due.getTime() === today.getTime()) return 'Due';
  return 'Upcoming';
}

export function scheduleBalance(schedule: PaymentSchedule, payments: Payment[]): number {
  return Math.max(0, schedule.amount - totalPaidForSchedule(payments, schedule.id));
}

export function scheduleOverpaid(schedule: PaymentSchedule, payments: Payment[]): number {
  return Math.max(0, totalPaidForSchedule(payments, schedule.id) - schedule.amount);
}

export function isLargeCashPayment(payment: Payment, threshold: number): boolean {
  return payment.paymentMethod === 'Cash' && payment.amount >= threshold;
}

export type DueBucket = 'Overdue' | 'Due Today' | 'Due in 7 Days' | 'Due in 14 Days' | 'Due in 30 Days' | 'Later';

/** Which payment-calendar bucket a schedule's due date falls into, given its live status. */
export function dueBucketFor(schedule: PaymentSchedule, payments: Payment[], referenceDate: string = todayISO()): DueBucket | null {
  const status = computePaymentScheduleStatus(schedule, payments, referenceDate);
  if (status === 'Paid' || status === 'Cancelled') return null;
  if (status === 'Overdue') return 'Overdue';
  if (!schedule.dueDate) return 'Later';

  const due = parseDate(schedule.dueDate);
  const today = parseDate(referenceDate);
  if (!due || !today) return 'Later';
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays <= 0) return 'Due Today';
  if (diffDays <= 7) return 'Due in 7 Days';
  if (diffDays <= 14) return 'Due in 14 Days';
  if (diffDays <= 30) return 'Due in 30 Days';
  return 'Later';
}
