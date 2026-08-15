import type { Guest, Household } from '@/types';
import { getGuestRsvpForEvent, getGuestRsvpStatus, householdRsvpSummary } from './rsvpLogic';
import { isVerySimilar, normalizeEmail, normalizePhone } from './stringSimilarity';

export type DataIssueCategory =
  | 'missing-primary-contact'
  | 'missing-contact-method'
  | 'orphaned-guest'
  | 'missing-rsvp-status'
  | 'attending-missing-diet'
  | 'accommodation-not-attending'
  | 'pickup-missing-travel-details'
  | 'duplicate-phone'
  | 'duplicate-email'
  | 'possible-duplicate-guest'
  | 'complete-but-incomplete-rsvp';

export interface DataIssue {
  id: string;
  category: DataIssueCategory;
  message: string;
  linkType: 'household' | 'guest';
  linkId: string;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export function detectDataIssues(households: Household[], guests: Guest[]): DataIssue[] {
  const issues: DataIssue[] = [];
  const householdById = new Map(households.map((h) => [h.id, h]));

  for (const household of households) {
    if (!household.primaryContactName.trim()) {
      issues.push({
        id: `no-contact-${household.id}`,
        category: 'missing-primary-contact',
        message: `"${household.householdName || 'Unnamed household'}" has no primary contact name.`,
        linkType: 'household',
        linkId: household.id,
      });
    }
    if (!household.primaryPhone.trim() && !household.email?.trim()) {
      issues.push({
        id: `no-contact-method-${household.id}`,
        category: 'missing-contact-method',
        message: `"${household.householdName || 'Unnamed household'}" has no phone number or email on file.`,
        linkType: 'household',
        linkId: household.id,
      });
    }
    if (household.invitationStatus === 'Complete') {
      const incomplete = household.invitedEvents.some((event) => {
        const state = householdRsvpSummary(household, guests, event);
        return state === 'Partial' || state === 'Pending';
      });
      if (incomplete) {
        issues.push({
          id: `complete-incomplete-rsvp-${household.id}`,
          category: 'complete-but-incomplete-rsvp',
          message: `"${household.householdName}" is marked Complete but at least one member's RSVP is still unresolved.`,
          linkType: 'household',
          linkId: household.id,
        });
      }
    }
  }

  for (const guest of guests) {
    const household = householdById.get(guest.householdId);
    if (!household) {
      issues.push({
        id: `orphaned-guest-${guest.id}`,
        category: 'orphaned-guest',
        message: `"${guest.fullName}" is not linked to any existing household.`,
        linkType: 'guest',
        linkId: guest.id,
      });
      continue;
    }

    for (const event of guest.invitedEvents) {
      if (!getGuestRsvpForEvent(guest, event)) {
        issues.push({
          id: `missing-rsvp-${guest.id}-${event}`,
          category: 'missing-rsvp-status',
          message: `"${guest.fullName}" is invited to ${event} but has no RSVP status recorded.`,
          linkType: 'guest',
          linkId: guest.id,
        });
      } else if (getGuestRsvpStatus(guest, event) === 'Attending' && guest.dietaryPreference === 'Not Specified') {
        issues.push({
          id: `attending-missing-diet-${guest.id}-${event}`,
          category: 'attending-missing-diet',
          message: `"${guest.fullName}" is Attending ${event} but has no dietary preference specified.`,
          linkType: 'guest',
          linkId: guest.id,
        });
      }
    }

    if (guest.accommodationRequired) {
      const attendingSomewhere = guest.invitedEvents.some((event) => getGuestRsvpStatus(guest, event) === 'Attending');
      if (!attendingSomewhere) {
        issues.push({
          id: `accommodation-not-attending-${guest.id}`,
          category: 'accommodation-not-attending',
          message: `"${guest.fullName}" requires accommodation but has not RSVP'd Attending to any invited event.`,
          linkType: 'guest',
          linkId: guest.id,
        });
      }
    }

    if (guest.pickupRequired) {
      const anySubmitted = guest.invitedEvents.some((event) => getGuestRsvpForEvent(guest, event)?.travelDetailsSubmitted);
      if (!anySubmitted) {
        issues.push({
          id: `pickup-missing-travel-${guest.id}`,
          category: 'pickup-missing-travel-details',
          message: `"${guest.fullName}" requested pickup but travel details have not been submitted.`,
          linkType: 'guest',
          linkId: guest.id,
        });
      }
    }
  }

  const phoneGroups = groupBy(households, (h) => (h.primaryPhone.trim() ? normalizePhone(h.primaryPhone) : undefined));
  for (const group of phoneGroups.values()) {
    if (group.length < 2) continue;
    const names = group.map((h) => h.householdName).join(', ');
    for (const household of group) {
      issues.push({
        id: `duplicate-phone-household-${household.id}`,
        category: 'duplicate-phone',
        message: `Phone number is shared by multiple households: ${names}.`,
        linkType: 'household',
        linkId: household.id,
      });
    }
  }

  const emailGroups = groupBy(households, (h) => (h.email?.trim() ? normalizeEmail(h.email) : undefined));
  for (const group of emailGroups.values()) {
    if (group.length < 2) continue;
    const names = group.map((h) => h.householdName).join(', ');
    for (const household of group) {
      issues.push({
        id: `duplicate-email-household-${household.id}`,
        category: 'duplicate-email',
        message: `Email is shared by multiple households: ${names}.`,
        linkType: 'household',
        linkId: household.id,
      });
    }
  }

  const guestPhoneGroups = groupBy(guests, (g) => (g.phone?.trim() ? normalizePhone(g.phone) : undefined));
  for (const group of guestPhoneGroups.values()) {
    if (group.length < 2) continue;
    const names = group.map((g) => g.fullName).join(', ');
    for (const guest of group) {
      issues.push({
        id: `duplicate-phone-guest-${guest.id}`,
        category: 'duplicate-phone',
        message: `Phone number is shared by multiple guests: ${names}.`,
        linkType: 'guest',
        linkId: guest.id,
      });
    }
  }

  const guestEmailGroups = groupBy(guests, (g) => (g.email?.trim() ? normalizeEmail(g.email) : undefined));
  for (const group of guestEmailGroups.values()) {
    if (group.length < 2) continue;
    const names = group.map((g) => g.fullName).join(', ');
    for (const guest of group) {
      issues.push({
        id: `duplicate-email-guest-${guest.id}`,
        category: 'duplicate-email',
        message: `Email is shared by multiple guests: ${names}.`,
        linkType: 'guest',
        linkId: guest.id,
      });
    }
  }

  const flaggedPairs = new Set<string>();
  for (let i = 0; i < guests.length; i++) {
    for (let j = i + 1; j < guests.length; j++) {
      const a = guests[i];
      const b = guests[j];
      if (a.householdId === b.householdId && a.fullName.trim().toLowerCase() === b.fullName.trim().toLowerCase()) continue; // already covered by exact-name-in-household check at entry time
      if (isVerySimilar(a.fullName, b.fullName)) {
        const pairKey = [a.id, b.id].sort().join('|');
        if (flaggedPairs.has(pairKey)) continue;
        flaggedPairs.add(pairKey);
        issues.push({
          id: `possible-duplicate-${pairKey}`,
          category: 'possible-duplicate-guest',
          message: `"${a.fullName}" and "${b.fullName}" have very similar names — check these aren't duplicate entries.`,
          linkType: 'guest',
          linkId: a.id,
        });
      }
    }
  }

  return issues;
}
