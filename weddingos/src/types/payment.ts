export const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cash', 'Cheque', 'Other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/**
 * A single recorded payment against a vendor (optionally against a specific
 * budget item and/or payment schedule milestone — a scheduled milestone may
 * be settled across several partial payments). Deliberately excludes bank
 * account numbers, card numbers, UPI PINs, and any other credential —
 * referenceNumber is a transaction/reference id only.
 */
export interface Payment {
  id: string;
  vendorId: string;
  budgetItemId?: string;
  paymentScheduleId?: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  invoiceReceived: boolean;
  invoiceReference?: string;
  receiptReceived: boolean;
  receiptReference?: string;
  paidBy?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
