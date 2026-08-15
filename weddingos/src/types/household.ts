import type { GuestEvent } from './guestEvent';

export const HOUSEHOLD_SIDES = ['Groom', 'Bride', 'Both'] as const;
export type HouseholdSide = (typeof HOUSEHOLD_SIDES)[number];

export const RELATIONSHIP_CATEGORIES = [
  'Immediate Family',
  'Extended Family',
  'Relative',
  'Friend',
  'Neighbor',
  'Colleague',
  'Community / Church',
  'Family Friend',
  'Other',
] as const;
export type RelationshipCategory = (typeof RELATIONSHIP_CATEGORIES)[number];

export const INVITATION_PRIORITIES = ['Must Invite', 'Priority', 'Standard', 'Optional'] as const;
export type InvitationPriority = (typeof INVITATION_PRIORITIES)[number];

export const INVITATION_METHODS = [
  'Printed',
  'Digital',
  'Both',
  'Hand Delivered',
  'Courier',
  'WhatsApp',
  'Email',
  'Other',
] as const;
export type InvitationMethod = (typeof INVITATION_METHODS)[number];

export const INVITATION_STATUSES = [
  'Not Prepared',
  'Ready',
  'Sent',
  'Delivered',
  'Follow-up Required',
  'Complete',
] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export interface Household {
  id: string;
  householdName: string;
  primaryContactName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  side: HouseholdSide;
  relationshipCategory: RelationshipCategory;
  relationshipDetail?: string;
  city: string;
  state?: string;
  country: string;
  invitationPriority: InvitationPriority;
  invitedEvents: GuestEvent[];
  invitationMethod: InvitationMethod[];
  invitationStatus: InvitationStatus;
  invitationOwner?: string;
  rsvpFollowUpOwner?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  notes?: string;

  // Invitation tracking (section 11)
  preparedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  courierTrackingNumber?: string;
  deliveryNotes?: string;

  // Follow-up tracking (section 13)
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
  followUpNotes?: string;

  createdAt: string;
  updatedAt: string;
}
