import type { EventScope } from './task';

export const APPROVAL_STATUSES = ['Draft', 'Pending Approval', 'Approved', 'Rejected'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/**
 * A line item within a budget category. vendorId is optional — a budget
 * item can exist with no vendor (e.g. a contingency line). Quote figures
 * are never auto-copied in; a user must deliberately link/import them.
 */
export interface BudgetItem {
  id: string;
  categoryId: string;
  vendorId?: string;
  event: EventScope;
  itemName: string;
  description?: string;
  originalBudget: number;
  latestEstimate?: number;
  negotiatedAmount?: number;
  taxAmount?: number;
  otherCharges?: number;
  committedAmount?: number;
  actualAmount?: number;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
