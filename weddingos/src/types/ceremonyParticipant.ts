import type { HouseholdSide } from './household';

export const CEREMONY_PARTICIPANT_ROLES = [
  'Groom',
  'Bride',
  'Groom Father',
  'Groom Mother',
  'Bride Father',
  'Bride Mother',
  'Witness',
  'Reader',
  'Backup Reader',
  'Clergy',
  'Choir Lead',
  'Ring Custodian',
  'Minnu Custodian',
  'Manthrakodi Custodian',
  'Bouquet Custodian',
  'Usher',
  'Family Photo Coordinator',
  'Ceremony Coordinator',
  'Other',
] as const;
export type CeremonyParticipantRole = (typeof CEREMONY_PARTICIPANT_ROLES)[number];

export interface CeremonyParticipant {
  id: string;
  role: CeremonyParticipantRole;
  name: string;
  linkedGuestId?: string;
  linkedContact?: string;
  phone?: string;
  email?: string;
  side?: HouseholdSide;
  confirmed: boolean;
  backupName?: string;
  backupPhone?: string;
  arrivalTime?: string;
  rehearsalRequired: boolean;
  rehearsalConfirmed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
