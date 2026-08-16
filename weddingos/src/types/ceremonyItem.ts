export const CEREMONY_ITEM_CATEGORIES = [
  'Rings',
  'Minnu',
  'Chain / Thread',
  'Manthrakodi',
  'Bouquet',
  'Boutonniere',
  'Corsage',
  'Candle',
  'Scripture / Reading',
  'Church Program',
  'Marriage Documents',
  'Gift',
  'Clothing',
  'Other',
] as const;
export type CeremonyItemCategory = (typeof CEREMONY_ITEM_CATEGORIES)[number];

export const CEREMONY_ITEM_APPLICABILITY = ['Applicable', 'Not Applicable', 'Confirm with Parish / Family'] as const;
export type CeremonyItemApplicability = (typeof CEREMONY_ITEM_APPLICABILITY)[number];

export const CEREMONY_ITEM_STATUSES = [
  'Not Procured',
  'Ordered',
  'Received',
  'Ready',
  'In Transit',
  'At Venue',
  'Used',
  'Returned',
  'Not Applicable',
] as const;
export type CeremonyItemStatus = (typeof CEREMONY_ITEM_STATUSES)[number];

export const CEREMONY_ITEM_VERIFICATION_STATUSES = ['Not Verified', 'Verified', 'Recheck Required'] as const;
export type CeremonyItemVerificationStatus = (typeof CEREMONY_ITEM_VERIFICATION_STATUSES)[number];

/** Default critical items (section 11) — rings, applicable minnu/chain/manthrakodi, documents, and readings/program. */
export const DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES: CeremonyItemCategory[] = [
  'Rings',
  'Minnu',
  'Chain / Thread',
  'Manthrakodi',
  'Marriage Documents',
  'Scripture / Reading',
  'Church Program',
];

export interface CeremonyItem {
  id: string;
  name: string;
  category: CeremonyItemCategory;
  applicability: CeremonyItemApplicability;
  owner?: string;
  custodian?: string;
  backupCustodian?: string;
  storageLocation?: string;
  requiredAtLocation?: string;
  requiredByDate?: string;
  requiredByTime?: string;
  status: CeremonyItemStatus;
  verificationStatus: CeremonyItemVerificationStatus;
  lastVerifiedAt?: string;
  relatedVendorId?: string;
  relatedBudgetItemId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
