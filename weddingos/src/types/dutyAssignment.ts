export const DUTY_ROLES = [
  'Day-of Command Lead',
  'Church Lead',
  'Ceremony Lead',
  'Guest Registration',
  'Hotel Welcome Desk',
  'Airport Pickup Coordinator',
  'Transport Dispatch',
  'Parking Coordinator',
  'Elderly Assistance',
  'Child Assistance',
  'Clergy Coordinator',
  'Bride-Family Liaison',
  'Groom Personal Assistant',
  'Ceremony Item Custodian',
  'Gift / Cash Custodian',
  'Vendor Payment Custodian',
  'Family Photo Coordinator',
  'Emergency / Medical Contact',
  'Lost & Found Custodian',
  'Venue Closeout Lead',
  'Other',
] as const;
export type DutyRole = (typeof DUTY_ROLES)[number];

/** Roles whose absence, missing phone, or missing backup should be flagged (section 16). */
export const DEFAULT_CRITICAL_DUTY_ROLES: DutyRole[] = [
  'Day-of Command Lead',
  'Church Lead',
  'Ceremony Lead',
  'Clergy Coordinator',
  'Ceremony Item Custodian',
  'Gift / Cash Custodian',
  'Emergency / Medical Contact',
  'Venue Closeout Lead',
];

/** No explicit status enum given in the spec; invented to mirror the Phase 5 lifecycle-status pattern. */
export const DUTY_STATUSES = ['Planned', 'Confirmed', 'Active', 'Completed', 'Unavailable'] as const;
export type DutyStatus = (typeof DUTY_STATUSES)[number];

export interface DutyAssignment {
  id: string;
  role: DutyRole;
  personName: string;
  linkedGuestId?: string;
  phone?: string;
  backupPersonName?: string;
  backupPhone?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  responsibilities?: string;
  status: DutyStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
