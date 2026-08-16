import type { EventScope } from './task';

export const VENDOR_CATEGORIES = [
  'Church / Parish',
  'Reception Venue',
  'Catering',
  'Cake',
  'Décor',
  'Flowers',
  'Lighting',
  'Sound / AV',
  'Photography',
  'Videography',
  'Live Streaming',
  'Music / Choir',
  'DJ / Band',
  'Emcee',
  'Accommodation',
  'Transportation',
  'Invitations / Printing',
  'Attire',
  'Jewellery / Ceremony Items',
  'Grooming',
  'Gifts / Favors',
  'Security',
  'Valet / Parking',
  'Rental Equipment',
  'Legal / Documentation',
  'Other',
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_STATUSES = [
  'Researching',
  'Shortlisted',
  'Quoted',
  'Negotiating',
  'Selected',
  'Contracted',
  'Confirmed',
  'Completed',
  'Cancelled',
] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

/**
 * A commercial vendor/supplier. Final-confirmation fields live directly on
 * the vendor (rather than a separate entity) — one vendor has at most one
 * "current" confirmation state, so a child entity would just add a join for
 * no benefit at this scale.
 */
export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  primaryContactId?: string;
  backupContactId?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  gstApplicable: boolean;
  gstNumber?: string;
  bookingOwner?: string;
  event: EventScope;
  notes?: string;

  // Final vendor confirmation (section 21).
  lastConfirmedAt?: string;
  confirmedBy?: string;
  confirmationNotes?: string;
  finalTeamSize?: number;
  finalArrivalTime?: string;
  finalPrimaryContactConfirmed: boolean;
  finalBackupContactConfirmed: boolean;

  createdAt: string;
  updatedAt: string;
}
