export const DECOR_DELIVERABLE_STATUSES = [
  'Concept',
  'Quoted',
  'Approved',
  'In Production',
  'Delivered',
  'Installed',
  'Verified',
  'Removed',
] as const;
export type DecorDeliverableStatus = (typeof DECOR_DELIVERABLE_STATUSES)[number];

export interface DecorDeliverable {
  id: string;
  decorPlanId: string;
  name: string;
  quantity?: number;
  material?: string;
  floralType?: string;
  freshFlowers: boolean;
  powerRequired: boolean;
  installationOwner?: string;
  status: DecorDeliverableStatus;
  approvalNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
