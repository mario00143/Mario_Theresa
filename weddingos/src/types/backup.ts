import type { AppSettings } from './settings';
import type { Task } from './task';
import type { Decision } from './decision';
import type { Owner } from './owner';
import type { Household } from './household';
import type { Guest } from './guest';
import type { TravelSegment } from './travel';
import type { Hotel } from './hotel';
import type { Room, RoomType } from './room';
import type { RoomAssignment } from './roomAssignment';
import type { Vehicle } from './vehicle';
import type { Driver } from './driver';
import type { TransportRoute } from './transportRoute';
import type { TransportAssignment } from './transportAssignment';

/**
 * Version 1: settings/tasks/decisions/owners only (Phase 1).
 * Version 2: adds households/guests (Phase 2).
 * Version 3: adds travel/accommodation/transport logistics (Phase 3).
 * Older files still import successfully — see backupRepository.normalizeBackup
 * — with the collections introduced after their version initialized empty.
 */
export const BACKUP_VERSION = 3;

export interface WeddingOSBackup {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  tasks: Task[];
  decisions: Decision[];
  owners: Owner[];
  households: Household[];
  guests: Guest[];
  travelSegments: TravelSegment[];
  hotels: Hotel[];
  roomTypes: RoomType[];
  rooms: Room[];
  roomAssignments: RoomAssignment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  transportRoutes: TransportRoute[];
  transportAssignments: TransportAssignment[];
}
