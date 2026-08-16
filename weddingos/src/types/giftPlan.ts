import type { EventScope } from './task';

export const GIFT_RECIPIENT_TYPES = [
  'Bride',
  'Groom',
  'Bride Parents',
  'Groom Parents',
  'Siblings',
  'Witnesses',
  'Clergy',
  'Groomsmen / Helpers',
  'Guests',
  'Other',
] as const;
export type GiftRecipientType = (typeof GIFT_RECIPIENT_TYPES)[number];

export const GIFT_STATUSES = ['Planned', 'Ordered', 'Received', 'Packed', 'Distributed'] as const;
export type GiftStatus = (typeof GIFT_STATUSES)[number];

export interface GiftPlan {
  id: string;
  recipientType: GiftRecipientType;
  recipientName?: string;
  linkedGuestId?: string;
  event: EventScope;
  giftType: string;
  quantity: number;
  vendorId?: string;
  budgetItemId?: string;
  status: GiftStatus;
  custodian?: string;
  distributionOwner?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
