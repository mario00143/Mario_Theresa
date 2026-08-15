import type { AppSettings } from './settings';
import type { Task } from './task';
import type { Decision } from './decision';
import type { Owner } from './owner';

export const BACKUP_VERSION = 1;

export interface WeddingOSBackup {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  tasks: Task[];
  decisions: Decision[];
  owners: Owner[];
}
