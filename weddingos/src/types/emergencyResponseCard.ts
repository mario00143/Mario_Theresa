export const EMERGENCY_RESPONSE_CARD_TYPES = [
  'Medical Emergency',
  'Missing Guest / Child',
  'Lost Valuables',
  'Vendor No Show',
  'Power Failure',
  'AV Failure',
  'Transport Breakdown',
  'Food Shortage',
  'Severe Traffic Delay',
  'Weather Disruption',
  'Security Issue',
] as const;
export type EmergencyResponseCardType = (typeof EMERGENCY_RESPONSE_CARD_TYPES)[number];

/** Operational response checklist — not medical or legal advice. */
export interface EmergencyResponseCard {
  id: string;
  type: EmergencyResponseCardType;
  title: string;
  immediateActions: string[];
  owner?: string;
  backupOwner?: string;
  contactPhone?: string;
  relatedVendorId?: string;
  contingency?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
