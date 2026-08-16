export const GROOMING_TYPES = ['Haircut', 'Beard / Shave', 'Styling', 'Makeup', 'Facial', 'Nail / Grooming', 'Other'] as const;
export type GroomingType = (typeof GROOMING_TYPES)[number];

export const GROOMING_STATUSES = ['Planned', 'Booked', 'Confirmed', 'Completed', 'Cancelled'] as const;
export type GroomingStatus = (typeof GROOMING_STATUSES)[number];

export interface GroomingAppointment {
  id: string;
  personRole: string;
  type: GroomingType;
  vendorId?: string;
  date?: string;
  time?: string;
  location?: string;
  status: GroomingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
