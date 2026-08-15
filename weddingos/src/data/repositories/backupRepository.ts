import type { AppSettings, Decision, Owner, Task, WeddingOSBackup } from '@/types';
import { BACKUP_VERSION, DENOMINATIONS, DECISION_STATUSES, EVENTS, PRIORITIES, TASK_STATUSES } from '@/types';
import { decisionsStore, ownersStore, settingsStore, tasksStore } from '../stores';

export function exportBackup(): WeddingOSBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settingsStore.get(),
    tasks: tasksStore.get(),
    decisions: decisionsStore.get(),
    owners: ownersStore.get(),
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

export function validateBackup(data: unknown): BackupValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(data)) {
    return { valid: false, errors: ['File does not contain a valid WeddingOS backup object.'] };
  }
  if (typeof data.version !== 'number') {
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

  return { valid: errors.length === 0, errors };
}

/** Replaces all WeddingOS data with the given backup. Caller must validate first and confirm with the user. */
export function importBackup(backup: WeddingOSBackup): void {
  settingsStore.set(backup.settings);
  tasksStore.set(backup.tasks);
  decisionsStore.set(backup.decisions);
  ownersStore.set(backup.owners);
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

export function backupFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-backup-${stamp}.json`;
}

export function tasksCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-tasks-${stamp}.csv`;
}
