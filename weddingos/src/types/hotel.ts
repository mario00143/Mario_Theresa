export interface Hotel {
  id: string;
  name: string;
  address?: string;
  area: string;
  city: string;
  primaryContact?: string;
  phone?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  breakfastIncluded: boolean;
  breakfastStartTime?: string;
  breakfastEndTime?: string;
  earlyCheckInPolicy?: string;
  lateCheckoutPolicy?: string;
  parkingAvailable: boolean;
  busAccess: boolean;
  accessibleRoomsAvailable: boolean;
  notes?: string;

  // Planning fields (contract/payment logic itself is Phase 4 scope).
  negotiatedRateNotes?: string;
  cancellationNotes?: string;
  groupBookingReference?: string;
  bookingOwner?: string;

  /** Deliberate, optional link to a commercial Vendor record — never set automatically. */
  vendorId?: string;

  createdAt: string;
  updatedAt: string;
}
