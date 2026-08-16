import type { EventScope } from './task';

export const CATERING_SERVICE_STYLES = ['Buffet', 'Plated', 'Family Style', 'Kerala Sadya Style', 'Mixed', 'Other'] as const;
export type CateringServiceStyle = (typeof CATERING_SERVICE_STYLES)[number];

export interface CateringPlan {
  id: string;
  event: EventScope;
  vendorId?: string;
  venueId?: string;
  serviceStyle: CateringServiceStyle;
  guestCountTarget?: number;
  /** User-entered final count — never auto-overwritten by the RSVP-derived suggestion. */
  guaranteedCount?: number;
  finalCountDueDate?: string;
  bufferCount?: number;
  vegetarianCount?: number;
  nonVegetarianCount?: number;
  veganCount?: number;
  jainCount?: number;
  childCount?: number;
  infantCount?: number;
  vendorMealCount?: number;
  clergyMealCount?: number;
  driverMealCount?: number;
  staffMealCount?: number;
  coupleMealReserved: boolean;
  leftoverPlan?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
