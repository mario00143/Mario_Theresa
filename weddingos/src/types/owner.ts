export interface Owner {
  id: string;
  name: string;
  isCustom: boolean;
}

export const DEFAULT_OWNER_NAMES = [
  'Groom',
  'Bride',
  'Groom Father',
  'Groom Mother',
  'Sibling',
  'Finance Lead',
  'Church Lead',
  'Guest List Lead',
  'Travel Lead',
  'Accommodation Lead',
  'Transport Lead',
  'Vendor Lead',
  'Hospitality Lead',
  'Ceremony Lead',
  'Day-of Coordinator',
] as const;
