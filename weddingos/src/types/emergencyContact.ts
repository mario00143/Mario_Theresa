export const EMERGENCY_CONTACT_CATEGORIES = [
  'Hospital',
  'Ambulance',
  'Pharmacy',
  'Police',
  'Fire',
  'Venue Security',
  'Hotel',
  'Church',
  'Transport',
  'Family Emergency',
  'Medical Professional',
  'Other',
] as const;
export type EmergencyContactCategory = (typeof EMERGENCY_CONTACT_CATEGORIES)[number];

export const EMERGENCY_CONTACT_PRIORITIES = ['Primary', 'Secondary', 'Reference'] as const;
export type EmergencyContactPriority = (typeof EMERGENCY_CONTACT_PRIORITIES)[number];

export interface EmergencyContact {
  id: string;
  category: EmergencyContactCategory;
  name: string;
  phone: string;
  alternatePhone?: string;
  location?: string;
  notes?: string;
  priority: EmergencyContactPriority;
  createdAt: string;
  updatedAt: string;
}
