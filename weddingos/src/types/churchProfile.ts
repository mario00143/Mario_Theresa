import type { EventScope } from './task';
import type { Denomination } from './settings';

/** One primary wedding church profile today; modeled so a future multi-church scenario just adds more rows. */
export interface ChurchProfile {
  id: string;
  event: EventScope;
  churchName: string;
  denomination: Denomination;
  parishName?: string;
  address?: string;
  city?: string;
  primaryClergyName?: string;
  primaryClergyPhone?: string;
  churchOfficePhone?: string;
  churchOfficeEmail?: string;
  ceremonyDate?: string;
  ceremonyStartTime?: string;
  accessStartTime?: string;
  rehearsalDate?: string;
  rehearsalTime?: string;
  seatingCapacity?: number;
  parkingNotes?: string;
  accessibilityNotes?: string;
  photographyRestrictions?: string;
  videoRestrictions?: string;
  musicRestrictions?: string;
  decorRestrictions?: string;
  confettiPetalRestrictions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
