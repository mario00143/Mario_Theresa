export const REFUND_TYPES = ['Refundable Deposit', 'Cancellation Refund', 'Overpayment Refund', 'Other'] as const;
export type RefundType = (typeof REFUND_TYPES)[number];

export const REFUND_STATUSES = ['Expected', 'Partially Received', 'Received', 'Waived', 'Disputed'] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export interface Refund {
  id: string;
  vendorId: string;
  contractId?: string;
  paymentId?: string;
  refundType: RefundType;
  expectedAmount?: number;
  expectedDate?: string;
  receivedAmount?: number;
  receivedDate?: string;
  status: RefundStatus;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
