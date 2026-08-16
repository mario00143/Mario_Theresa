export const ATTIRE_ITEM_CATEGORIES = [
  'Main Outfit',
  'Shirt',
  'Trousers',
  'Shoes',
  'Socks',
  'Belt',
  'Tie / Bow Tie',
  'Cufflinks',
  'Pocket Square',
  'Jewellery',
  'Watch',
  'Undergarment',
  'Outerwear',
  'Backup Item',
  'Other',
] as const;
export type AttireItemCategory = (typeof ATTIRE_ITEM_CATEGORIES)[number];

export const ATTIRE_ITEM_STATUSES = ['Not Started', 'Ordered', 'Ready', 'Packed'] as const;
export type AttireItemStatus = (typeof ATTIRE_ITEM_STATUSES)[number];

export interface AttireItem {
  id: string;
  attireProfileId: string;
  itemName: string;
  category: AttireItemCategory;
  required: boolean;
  status: AttireItemStatus;
  backupAvailable: boolean;
  storageLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
