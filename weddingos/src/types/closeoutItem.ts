export const CLOSEOUT_CATEGORIES = [
  'Gifts / Cash',
  'Vendor Settlement',
  'Rental Return',
  'Venue Handover',
  'Leftover Food',
  'Lost & Found',
  'Guest Transport',
  'Hotel Return',
  'Ceremony Items',
  'Documents',
  'Equipment',
  'Other',
] as const;
export type CloseoutCategory = (typeof CLOSEOUT_CATEGORIES)[number];

export const CLOSEOUT_STATUSES = ['Pending', 'In Progress', 'Complete', 'Exception'] as const;
export type CloseoutStatus = (typeof CLOSEOUT_STATUSES)[number];

export interface CloseoutItem {
  id: string;
  category: CloseoutCategory;
  title: string;
  owner?: string;
  status: CloseoutStatus;
  dueTime?: string;
  completedAt?: string;
  verificationNote?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
