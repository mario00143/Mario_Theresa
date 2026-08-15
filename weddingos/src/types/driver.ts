/** Deliberately excludes identity-document fields (license number, ID proof, etc) — not needed operationally and out of scope for privacy reasons. */
export interface Driver {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  vehicleId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
