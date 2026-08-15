import type { GuestEvent } from './guestEvent';
import type { RsvpResponse } from './rsvp';

export const AGE_CATEGORIES = ['Adult', 'Child', 'Infant'] as const;
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

export const PLUS_ONE_STATUSES = ['Not Applicable', 'Allowed', 'Confirmed', 'Declined', 'Pending'] as const;
export type PlusOneStatus = (typeof PLUS_ONE_STATUSES)[number];

export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Non-Vegetarian',
  'Vegan',
  'Jain',
  'Other',
  'Not Specified',
] as const;
export type DietaryPreference = (typeof DIETARY_PREFERENCES)[number];

export const GUEST_RELATIONSHIPS = [
  'Head of Household',
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandparent',
  'Other Relative',
  'Friend',
  'Other',
] as const;

export const GUEST_TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Master', 'Baby', 'Dr', 'Fr', 'Rev', 'Sr'] as const;

export interface Guest {
  id: string;
  householdId: string;
  fullName: string;
  preferredName?: string;
  title?: string;
  ageCategory: AgeCategory;
  relationship?: string;
  phone?: string;
  email?: string;
  invitedEvents: GuestEvent[];
  rsvpResponses: RsvpResponse[];
  dietaryPreference: DietaryPreference;
  dietaryNotes?: string;
  allergies?: string;
  accessibilityRequirements?: string;
  elderlyAssistanceRequired: boolean;
  infantRequirements?: string;
  accommodationRequired: boolean;
  travelDetailsRequired: boolean;
  pickupRequired: boolean;
  plusOneStatus: PlusOneStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
