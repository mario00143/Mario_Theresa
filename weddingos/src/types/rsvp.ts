import type { GuestEvent } from './guestEvent';

export const RSVP_STATUSES = ['Pending', 'Attending', 'Declined', 'Maybe', 'No Response'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const RESPONSE_METHODS = ['Phone', 'WhatsApp', 'Email', 'In Person', 'Family Member', 'Website', 'Other'] as const;
export type ResponseMethod = (typeof RESPONSE_METHODS)[number];

export interface RsvpResponse {
  event: GuestEvent;
  status: RsvpStatus;
  respondedAt?: string;
  responseMethod?: ResponseMethod;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfInfants?: number;
  dietaryConfirmed?: boolean;
  travelDetailsSubmitted?: boolean;
  accommodationRequested?: boolean;
  pickupRequested?: boolean;
  notes?: string;
}

/** Household-level rollup of its members' RSVP responses for one event. */
export const HOUSEHOLD_RSVP_STATES = ['Attending', 'Declined', 'Partial', 'Pending'] as const;
export type HouseholdRsvpState = (typeof HOUSEHOLD_RSVP_STATES)[number];
