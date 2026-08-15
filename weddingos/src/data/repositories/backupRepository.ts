import type { AppSettings, Decision, Guest, GuestEvent, Household, Owner, Task, WeddingOSBackup } from '@/types';
import {
  AGE_CATEGORIES,
  BACKUP_VERSION,
  DENOMINATIONS,
  DECISION_STATUSES,
  DIETARY_PREFERENCES,
  EVENTS,
  HOUSEHOLD_SIDES,
  INVITATION_STATUSES,
  PRIORITIES,
  TASK_STATUSES,
} from '@/types';
import { decisionsStore, guestsStore, householdsStore, ownersStore, settingsStore, tasksStore } from '../stores';

export function exportBackup(): WeddingOSBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settingsStore.get(),
    tasks: tasksStore.get(),
    decisions: decisionsStore.get(),
    owners: ownersStore.get(),
    households: householdsStore.get(),
    guests: guestsStore.get(),
  };
}

export interface BackupValidationResult {
  valid: boolean;
  errors: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidSettings(value: unknown): value is AppSettings {
  if (!isPlainObject(value)) return false;
  const { couple, engagement, wedding, weddingDetails } = value;
  if (!isPlainObject(couple) || typeof couple.groomName !== 'string' || typeof couple.brideName !== 'string') return false;
  if (!isPlainObject(engagement) || typeof engagement.date !== 'string') return false;
  if (!isPlainObject(wedding) || typeof wedding.date !== 'string') return false;
  if (!isPlainObject(weddingDetails) || typeof weddingDetails.currency !== 'string') return false;
  if (!DENOMINATIONS.includes(weddingDetails.denomination as (typeof DENOMINATIONS)[number])) return false;
  return true;
}

function isValidTask(value: unknown): value is Task {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (!TASK_STATUSES.includes(value.status as (typeof TASK_STATUSES)[number])) return false;
  if (!PRIORITIES.includes(value.priority as (typeof PRIORITIES)[number])) return false;
  if (!Array.isArray(value.dependencies) || !Array.isArray(value.tags) || !Array.isArray(value.subtasks)) return false;
  return true;
}

function isValidDecision(value: unknown): value is Decision {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!DECISION_STATUSES.includes(value.status as (typeof DECISION_STATUSES)[number])) return false;
  if (!Array.isArray(value.options)) return false;
  return true;
}

function isValidOwner(value: unknown): value is Owner {
  return isPlainObject(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

function isValidHousehold(value: unknown): value is Household {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.householdName !== 'string') return false;
  if (!HOUSEHOLD_SIDES.includes(value.side as (typeof HOUSEHOLD_SIDES)[number])) return false;
  if (!INVITATION_STATUSES.includes(value.invitationStatus as (typeof INVITATION_STATUSES)[number])) return false;
  if (!Array.isArray(value.invitedEvents) || !Array.isArray(value.invitationMethod)) return false;
  return true;
}

function isValidGuest(value: unknown): value is Guest {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.householdId !== 'string' || typeof value.fullName !== 'string') return false;
  if (!AGE_CATEGORIES.includes(value.ageCategory as (typeof AGE_CATEGORIES)[number])) return false;
  if (!DIETARY_PREFERENCES.includes(value.dietaryPreference as (typeof DIETARY_PREFERENCES)[number])) return false;
  if (!Array.isArray(value.invitedEvents) || !Array.isArray(value.rsvpResponses)) return false;
  return true;
}

/**
 * Accepts both version 1 (Phase 1: settings/tasks/decisions/owners only) and
 * version 2 (Phase 2: adds households/guests) backups. A version-1 file is
 * valid even without households/guests — those are optional there and are
 * initialized to empty arrays on import (see normalizeBackup).
 */
export function validateBackup(data: unknown): BackupValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(data)) {
    return { valid: false, errors: ['File does not contain a valid WeddingOS backup object.'] };
  }

  const version = typeof data.version === 'number' ? data.version : null;
  if (version === null) {
    errors.push('Missing or invalid "version" field.');
  }
  if (!isValidSettings(data.settings)) {
    errors.push('Settings section is missing or malformed.');
  }
  if (!Array.isArray(data.tasks) || !data.tasks.every(isValidTask)) {
    errors.push('Tasks section is missing or contains malformed task entries.');
  }
  if (!Array.isArray(data.decisions) || !data.decisions.every(isValidDecision)) {
    errors.push('Decisions section is missing or contains malformed decision entries.');
  }
  if (!Array.isArray(data.owners) || !data.owners.every(isValidOwner)) {
    errors.push('Owners section is missing or contains malformed owner entries.');
  }

  const isV2OrLater = version !== null && version >= 2;
  const householdsProvided = data.households !== undefined;
  const guestsProvided = data.guests !== undefined;

  if (isV2OrLater || householdsProvided) {
    if (!Array.isArray(data.households) || !data.households.every(isValidHousehold)) {
      errors.push('Households section is missing or contains malformed household entries.');
    }
  }
  if (isV2OrLater || guestsProvided) {
    if (!Array.isArray(data.guests) || !data.guests.every(isValidGuest)) {
      errors.push('Guests section is missing or contains malformed guest entries.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalizes a validated backup (of any supported version) into the current
 * in-memory shape. Version-1 files get empty households/guests arrays —
 * this is the Phase 1 -> Phase 2 migration step.
 */
export function normalizeBackup(data: unknown): WeddingOSBackup {
  const raw = data as Record<string, unknown>;
  return {
    version: typeof raw.version === 'number' ? raw.version : BACKUP_VERSION,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    settings: raw.settings as AppSettings,
    tasks: raw.tasks as Task[],
    decisions: raw.decisions as Decision[],
    owners: raw.owners as Owner[],
    households: Array.isArray(raw.households) ? (raw.households as Household[]) : [],
    guests: Array.isArray(raw.guests) ? (raw.guests as Guest[]) : [],
  };
}

/** Replaces all WeddingOS data with the given backup. Caller must validate (and normalize) first and confirm with the user. */
export function importBackup(backup: WeddingOSBackup): void {
  settingsStore.set(backup.settings);
  tasksStore.set(backup.tasks);
  decisionsStore.set(backup.decisions);
  ownersStore.set(backup.owners);
  householdsStore.set(backup.households ?? []);
  guestsStore.set(backup.guests ?? []);
}

function csvEscape(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function tasksToCSV(tasks: Task[]): string {
  const headers = [
    'Title',
    'Event',
    'Workstream',
    'Owner',
    'Approver',
    'Priority',
    'Status',
    'Start Date',
    'Due Date',
    'Completion Criteria',
    'Tags',
  ];
  const rows = tasks.map((task) =>
    [
      task.title,
      task.event,
      task.workstream,
      task.owner,
      task.approver ?? '',
      task.priority,
      task.status,
      task.startDate ?? '',
      task.dueDate ?? '',
      task.completionCriteria,
      task.tags.join('; '),
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function householdsToCSV(households: Household[], guests: Guest[]): string {
  const headers = [
    'Household Name',
    'Primary Contact',
    'Phone',
    'Email',
    'Side',
    'Relationship',
    'City',
    'Invitation Priority',
    'Invitation Method',
    'Invitation Status',
    'Member Count',
  ];
  const rows = households.map((household) => {
    const memberCount = guests.filter((g) => g.householdId === household.id).length;
    return [
      household.householdName,
      household.primaryContactName,
      household.primaryPhone,
      household.email ?? '',
      household.side,
      household.relationshipCategory,
      household.city,
      household.invitationPriority,
      household.invitationMethod.join('; '),
      household.invitationStatus,
      memberCount,
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function guestRsvpForEvent(guest: Guest, event: GuestEvent) {
  return guest.rsvpResponses.find((r) => r.event === event);
}

export function guestsToCSV(guests: Guest[], households: Household[]): string {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const headers = [
    'Guest Name',
    'Household',
    'Side',
    'Age Category',
    'Wedding Invited',
    'Wedding RSVP',
    'Engagement Invited',
    'Engagement RSVP',
    'Dietary Preference',
    'Accommodation Required',
    'Pickup Required',
    'Accessibility Requirement',
  ];
  const rows = guests.map((guest) => {
    const household = householdById.get(guest.householdId);
    const weddingInvited = guest.invitedEvents.includes('Wedding');
    const engagementInvited = guest.invitedEvents.includes('Engagement');
    return [
      guest.fullName,
      household?.householdName ?? '',
      household?.side ?? '',
      guest.ageCategory,
      weddingInvited ? 'Yes' : 'No',
      weddingInvited ? (guestRsvpForEvent(guest, 'Wedding')?.status ?? 'No Response') : '',
      engagementInvited ? 'Yes' : 'No',
      engagementInvited ? (guestRsvpForEvent(guest, 'Engagement')?.status ?? 'No Response') : '',
      guest.dietaryPreference,
      guest.accommodationRequired ? 'Yes' : 'No',
      guest.pickupRequired ? 'Yes' : 'No',
      guest.accessibilityRequirements ?? '',
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

/** One row per guest per invited event. */
export function rsvpReportToCSV(guests: Guest[], households: Household[]): string {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const headers = [
    'Guest Name',
    'Household',
    'Side',
    'Event',
    'RSVP Status',
    'Response Method',
    'Responded At',
    'Dietary Preference',
    'Accommodation Requested',
    'Pickup Requested',
  ];
  const rows: string[] = [];
  for (const guest of guests) {
    const household = householdById.get(guest.householdId);
    for (const event of guest.invitedEvents) {
      const response = guestRsvpForEvent(guest, event);
      rows.push(
        [
          guest.fullName,
          household?.householdName ?? '',
          household?.side ?? '',
          event,
          response?.status ?? 'No Response',
          response?.responseMethod ?? '',
          response?.respondedAt ?? '',
          guest.dietaryPreference,
          response?.accommodationRequested ? 'Yes' : 'No',
          response?.pickupRequested ? 'Yes' : 'No',
        ]
          .map(csvEscape)
          .join(','),
      );
    }
  }
  return [headers.join(','), ...rows].join('\n');
}

export function backupFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-backup-${stamp}.json`;
}

export function tasksCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-tasks-${stamp}.csv`;
}

export function householdsCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-households-${stamp}.csv`;
}

export function guestsCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-guests-${stamp}.csv`;
}

export function rsvpReportCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-rsvp-report-${stamp}.csv`;
}
