import type { EventScope } from './task';

export const RUN_SHEET_RELATIVE_REFERENCES = ['None', 'Ceremony Start', 'Reception Start'] as const;
export type RunSheetRelativeReference = (typeof RUN_SHEET_RELATIVE_REFERENCES)[number];

export const RUN_SHEET_CATEGORIES = [
  'Groom Preparation',
  'Family Preparation',
  'Church',
  'Ceremony',
  'Photography',
  'Transport',
  'Guest Arrival',
  'Reception',
  'Catering',
  'Décor / Production',
  'Music / AV',
  'Vendor',
  'Gift / Hospitality',
  'Closeout',
  'Other',
] as const;
export type RunSheetCategory = (typeof RUN_SHEET_CATEGORIES)[number];

export const RUN_SHEET_STATUSES = ['Planned', 'Ready', 'In Progress', 'Delayed', 'Complete', 'Skipped', 'Cancelled'] as const;
export type RunSheetStatus = (typeof RUN_SHEET_STATUSES)[number];

/** Statuses that count as "already underway or done" for current/next-item detection. */
export const RUN_SHEET_ACTIVE_OR_DONE_STATUSES: RunSheetStatus[] = ['In Progress', 'Delayed', 'Complete', 'Skipped'];

/**
 * One entry on the wedding-day run sheet. Items can be fixed-time
 * (relativeReference: 'None', startTime/endTime are the source of truth)
 * or relative to Ceremony/Reception start (relativeOffsetMinutes added to
 * the live settings-derived ceremony/reception time — recomputed on every
 * read, never persisted as a stale snapshot).
 */
export interface RunSheetItem {
  id: string;
  event: EventScope;
  date: string;
  startTime?: string;
  endTime?: string;
  relativeReference: RunSheetRelativeReference;
  relativeOffsetMinutes?: number;
  location?: string;
  activity: string;
  category: RunSheetCategory;
  owner?: string;
  backupOwner?: string;
  participantIds: string[];
  vendorIds: string[];
  requiredItemIds: string[];
  relatedTaskIds: string[];
  relatedTransportRouteIds: string[];
  cue?: string;
  dependencyIds: string[];
  contingencyAction?: string;
  status: RunSheetStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  delayMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
