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
import type { Vendor } from './vendor';
import type { VendorContact } from './vendorContact';
import type { VendorQuote } from './vendorQuote';
import type { Contract } from './contract';
import type { BudgetCategory } from './budgetCategory';
import type { BudgetItem } from './budgetItem';
import type { PaymentSchedule } from './paymentSchedule';
import type { Payment } from './payment';
import type { Refund } from './refund';
import type { ChurchProfile } from './churchProfile';
import type { ChurchRequirement } from './churchRequirement';
import type { CeremonyParticipant } from './ceremonyParticipant';
import type { CeremonySequenceItem } from './ceremonySequenceItem';
import type { CeremonyItem } from './ceremonyItem';
import type { CateringPlan } from './cateringPlan';
import type { MenuItem } from './menuItem';
import type { DecorPlan } from './decorPlan';
import type { DecorDeliverable } from './decorDeliverable';
import type { AttireProfile } from './attireProfile';
import type { AttireItem } from './attireItem';
import type { GroomingAppointment } from './groomingAppointment';
import type { PhotographyPlan } from './photographyPlan';
import type { PhotoGroup } from './photoGroup';
import type { MusicCue } from './musicCue';
import type { MusicAVPlan } from './musicAVPlan';
import type { GiftPlan } from './giftPlan';
import type { WelcomeKit } from './welcomeKit';
import type { WelcomeKitItem } from './welcomeKitItem';

/**
 * Version 1: settings/tasks/decisions/owners only (Phase 1).
 * Version 2: adds households/guests (Phase 2).
 * Version 3: adds travel/accommodation/transport logistics (Phase 3).
 * Version 4: adds vendors/quotes/contracts/budget/payments/refunds (Phase 4).
 * Version 5: adds church/ceremony/catering/décor/attire/photography/music/gifts wedding-preparation records (Phase 5).
 * Older files still import successfully — see backupRepository.normalizeBackup
 * — with the collections introduced after their version initialized empty.
 */
export const BACKUP_VERSION = 5;

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
  vendors: Vendor[];
  vendorContacts: VendorContact[];
  vendorQuotes: VendorQuote[];
  contracts: Contract[];
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  paymentSchedules: PaymentSchedule[];
  payments: Payment[];
  refunds: Refund[];
  churchProfiles: ChurchProfile[];
  churchRequirements: ChurchRequirement[];
  ceremonyParticipants: CeremonyParticipant[];
  ceremonySequenceItems: CeremonySequenceItem[];
  ceremonyItems: CeremonyItem[];
  cateringPlans: CateringPlan[];
  menuItems: MenuItem[];
  decorPlans: DecorPlan[];
  decorDeliverables: DecorDeliverable[];
  attireProfiles: AttireProfile[];
  attireItems: AttireItem[];
  groomingAppointments: GroomingAppointment[];
  photographyPlans: PhotographyPlan[];
  photoGroups: PhotoGroup[];
  musicCues: MusicCue[];
  musicAVPlans: MusicAVPlan[];
  giftPlans: GiftPlan[];
  welcomeKits: WelcomeKit[];
  welcomeKitItems: WelcomeKitItem[];
}
