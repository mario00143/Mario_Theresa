export const CEREMONY_ITEM_MOVEMENT_ACTIONS = ['Verified', 'Checked Out', 'In Transit', 'Received', 'Used', 'Returned', 'Secured'] as const;
export type CeremonyItemMovementAction = (typeof CEREMONY_ITEM_MOVEMENT_ACTIONS)[number];

/** One custody/location event in a ceremony item's day-of movement chain (section 19). */
export interface CeremonyItemMovement {
  id: string;
  ceremonyItemId: string;
  action: CeremonyItemMovementAction;
  timestamp: string;
  fromLocation?: string;
  toLocation?: string;
  handedBy?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
