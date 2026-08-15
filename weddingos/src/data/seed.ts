import type {
  AppSettings,
  Decision,
  Driver,
  Guest,
  Hotel,
  Household,
  Owner,
  Room,
  RoomAssignment,
  RoomType,
  Task,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
} from '@/types';
import { seedOwners } from './owners.seed';
import { seedSettings } from './settings.seed';
import { buildSeedTasks } from './tasks.seed';
import { buildSeedDecisions } from './decisions.seed';
import { buildSeedHouseholdsAndGuests } from './households.seed';
import { buildSeedLogistics } from './logistics.seed';

export interface SeedBundle {
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

export function createSeedBundle(): SeedBundle {
  const { tasks, idByKey } = buildSeedTasks();
  const decisions = buildSeedDecisions(idByKey);
  const { households, guests } = buildSeedHouseholdsAndGuests();
  const logistics = buildSeedLogistics(households, guests);
  return {
    settings: seedSettings(),
    tasks,
    decisions,
    owners: seedOwners(),
    households,
    guests,
    ...logistics,
  };
}
