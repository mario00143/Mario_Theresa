import type { EventScope } from './task';

export const DECOR_AREAS = [
  'Church Entrance',
  'Church Aisle',
  'Altar',
  'Reception Entrance',
  'Stage',
  'Couple Seating',
  'Dining Tables',
  'Cake Table',
  'Photo Backdrop',
  'Welcome Signage',
  'Directional Signage',
  'Seating Chart',
  'Gift Counter',
  'Vehicle',
  'Other',
] as const;
export type DecorArea = (typeof DECOR_AREAS)[number];

export const DECOR_APPROVAL_STATUSES = ['Pending', 'Approved', 'Changes Requested', 'Rejected'] as const;
export type DecorApprovalStatus = (typeof DECOR_APPROVAL_STATUSES)[number];

export interface DecorPlan {
  id: string;
  event: EventScope;
  area: DecorArea;
  location?: string;
  theme?: string;
  colorPalette?: string;
  vendorId?: string;
  installDate?: string;
  installStartTime?: string;
  installDeadline?: string;
  teardownDeadline?: string;
  approvalStatus: DecorApprovalStatus;
  approvedBy?: string;
  finalWalkthroughComplete: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
