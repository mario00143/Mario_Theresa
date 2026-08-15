import type { EventScope } from './task';

export const TRAVEL_DIRECTIONS = ['Arrival', 'Departure', 'Internal Transfer'] as const;
export type TravelDirection = (typeof TRAVEL_DIRECTIONS)[number];

export const TRAVEL_MODES = ['Flight', 'Train', 'Bus', 'Car', 'Taxi', 'Other'] as const;
export type TravelMode = (typeof TRAVEL_MODES)[number];

export const TRAVEL_BOOKING_STATUSES = [
  'Not Required',
  'Not Booked',
  'Planned',
  'Booked',
  'Confirmed',
  'Changed',
  'Cancelled',
] as const;
export type TravelBookingStatus = (typeof TRAVEL_BOOKING_STATUSES)[number];

/**
 * One leg of a guest's journey. A multi-leg trip (e.g. Kochi -> Bengaluru ->
 * Hyderabad) is modeled as two TravelSegment records sharing the same
 * guestId, not as a nested itinerary — keeps the shape flat and relational.
 */
export interface TravelSegment {
  id: string;
  guestId: string;
  householdId: string;
  event: EventScope;
  direction: TravelDirection;
  travelMode: TravelMode;
  origin: string;
  destination: string;
  carrier?: string;
  serviceNumber?: string;
  bookingReference?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  bookingOwner?: string;
  bookingStatus: TravelBookingStatus;
  ticketConfirmed: boolean;
  luggageNotes?: string;
  specialAssistance?: string;
  pickupRequired: boolean;
  dropRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
