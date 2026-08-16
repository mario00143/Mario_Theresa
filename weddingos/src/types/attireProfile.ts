import type { EventScope } from './task';

export const ATTIRE_OUTFIT_TYPES = [
  'Suit',
  'Tuxedo',
  'Sherwani',
  'Traditional Kerala',
  'Saree',
  'Dress',
  'Shirt / Trousers',
  'Reception Outfit',
  'Other',
] as const;
export type AttireOutfitType = (typeof ATTIRE_OUTFIT_TYPES)[number];

export const ATTIRE_STATUSES = [
  'Researching',
  'Selected',
  'Ordered',
  'First Fitting',
  'Alteration',
  'Ready',
  'Packed',
  'Worn',
] as const;
export type AttireStatus = (typeof ATTIRE_STATUSES)[number];

export interface AttireProfile {
  id: string;
  personRole: string;
  linkedGuestId?: string;
  event: EventScope;
  outfitType: AttireOutfitType;
  vendorId?: string;
  orderedDate?: string;
  firstFittingDate?: string;
  finalFittingDate?: string;
  readyDate?: string;
  status: AttireStatus;
  storageLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
