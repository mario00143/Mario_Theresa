import type {
  AppSettings,
  BudgetCategory,
  BudgetItem,
  Contract,
  Decision,
  Driver,
  Guest,
  Hotel,
  Household,
  Owner,
  Payment,
  PaymentSchedule,
  Refund,
  Room,
  RoomAssignment,
  RoomType,
  Task,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
  Vendor,
  VendorContact,
  VendorQuote,
} from '@/types';
import { seedOwners } from './owners.seed';
import { seedSettings } from './settings.seed';
import { buildSeedTasks } from './tasks.seed';
import { buildSeedDecisions } from './decisions.seed';
import { buildSeedHouseholdsAndGuests } from './households.seed';
import { buildSeedLogistics } from './logistics.seed';
import { buildSeedFinance } from './finance.seed';

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
  vendors: Vendor[];
  vendorContacts: VendorContact[];
  vendorQuotes: VendorQuote[];
  contracts: Contract[];
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  paymentSchedules: PaymentSchedule[];
  payments: Payment[];
  refunds: Refund[];
}

export function createSeedBundle(): SeedBundle {
  const { tasks, idByKey } = buildSeedTasks();
  const decisions = buildSeedDecisions(idByKey);
  const { households, guests } = buildSeedHouseholdsAndGuests();
  const logistics = buildSeedLogistics(households, guests);
  const finance = buildSeedFinance(households, guests, logistics.hotels, logistics.vehicles);
  return {
    settings: seedSettings(),
    tasks,
    decisions,
    owners: seedOwners(),
    households,
    guests,
    ...logistics,
    ...finance,
  };
}
