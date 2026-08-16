export const PAYMENT_SCHEDULE_STATUSES = ['Upcoming', 'Due', 'Overdue', 'Partially Paid', 'Paid', 'Cancelled'] as const;
export type PaymentScheduleStatus = (typeof PAYMENT_SCHEDULE_STATUSES)[number];

/**
 * A single planned milestone payment (e.g. "Booking Advance", "Final
 * Settlement"). The `status` field here reflects the last-computed state;
 * always recompute it from linked Payments via computePaymentScheduleStatus
 * rather than trusting a stale stored value across dates.
 */
export interface PaymentSchedule {
  id: string;
  vendorId: string;
  budgetItemId?: string;
  contractId?: string;
  milestone: string;
  dueDate?: string;
  amount: number;
  status: PaymentScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
