export const PREFERRED_CONTACT_METHODS = ['Phone', 'WhatsApp', 'Email', 'Other'] as const;
export type PreferredContactMethod = (typeof PREFERRED_CONTACT_METHODS)[number];

/** A person at a vendor. A vendor may have several — e.g. a sales contact and an on-the-day coordinator. */
export interface VendorContact {
  id: string;
  vendorId: string;
  name: string;
  role?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  preferredContactMethod: PreferredContactMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
