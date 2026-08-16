export const WELCOME_KIT_STATUSES = ['Planned', 'Procured', 'Packed', 'Delivered'] as const;
export type WelcomeKitStatus = (typeof WELCOME_KIT_STATUSES)[number];

export interface WelcomeKit {
  id: string;
  name: string;
  targetGuestGroup?: string;
  hotelId?: string;
  quantityPlanned: number;
  quantityPrepared: number;
  distributionLocation?: string;
  distributionOwner?: string;
  status: WelcomeKitStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
