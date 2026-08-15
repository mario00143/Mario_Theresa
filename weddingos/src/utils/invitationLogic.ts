import type { Guest, Household } from '@/types';
import { daysUntil } from './date';
import { householdRsvpSummary } from './rsvpLogic';

const RSVP_INCOMPLETE_STATES = ['Partial', 'Pending'] as const;

/** True if the household's invitation has gone out but at least one invited event's RSVP is still unresolved. */
export function needsRsvpFollowUp(household: Household, guests: Guest[]): boolean {
  if (household.invitationStatus !== 'Sent' && household.invitationStatus !== 'Delivered') return false;
  return household.invitedEvents.some((event) =>
    RSVP_INCOMPLETE_STATES.includes(householdRsvpSummary(household, guests, event) as (typeof RSVP_INCOMPLETE_STATES)[number]),
  );
}

export function daysSinceSent(household: Household, reference: Date = new Date()): number | null {
  if (!household.sentAt) return null;
  const diff = daysUntil(household.sentAt, reference);
  return diff === null ? null : -diff;
}

export function isFollowUpOverdue(household: Household, reference: Date = new Date()): boolean {
  if (!household.nextFollowUpAt) return false;
  const diff = daysUntil(household.nextFollowUpAt, reference);
  return diff !== null && diff < 0;
}

export function isFollowUpDueSoon(household: Household, days = 3, reference: Date = new Date()): boolean {
  if (!household.nextFollowUpAt) return false;
  const diff = daysUntil(household.nextFollowUpAt, reference);
  return diff !== null && diff >= 0 && diff <= days;
}
