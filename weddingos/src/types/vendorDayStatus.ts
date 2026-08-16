export const VENDOR_DAY_STATUSES = ['Expected', 'En Route', 'Arrived', 'Setting Up', 'Ready', 'In Service', 'Completed', 'Delayed', 'No Show'] as const;
export type VendorDayStatusValue = (typeof VENDOR_DAY_STATUSES)[number];

/** Day-of operational tracking for one vendor; references Phase 4's Vendor rather than duplicating contact/category data. */
export interface VendorDayStatus {
  id: string;
  vendorId: string;
  expectedArrivalTime?: string;
  actualArrivalTime?: string;
  expectedDepartureTime?: string;
  actualDepartureTime?: string;
  primaryContactConfirmed: boolean;
  teamSizeExpected?: number;
  teamSizeActual?: number;
  setupComplete: boolean;
  serviceReady: boolean;
  finalSettlementChecked: boolean;
  status: VendorDayStatusValue;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
