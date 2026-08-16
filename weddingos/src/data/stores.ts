import type {
  AppSettings,
  AttireItem,
  AttireProfile,
  BudgetCategory,
  BudgetItem,
  CateringPlan,
  CeremonyItem,
  CeremonyParticipant,
  CeremonySequenceItem,
  ChurchProfile,
  ChurchRequirement,
  Contract,
  Decision,
  DecorDeliverable,
  DecorPlan,
  Driver,
  GiftPlan,
  GroomingAppointment,
  Guest,
  Hotel,
  Household,
  MenuItem,
  MusicAVPlan,
  MusicCue,
  Owner,
  Payment,
  PaymentSchedule,
  PhotoGroup,
  PhotographyPlan,
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
  WelcomeKit,
  WelcomeKitItem,
} from '@/types';
import { createStore } from '@/lib/store';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/lib/storage';
import { createSeedBundle } from './seed';

/**
 * Seeds localStorage exactly once (tracked by the `seeded` flag). If the
 * user later deletes every task, we must NOT re-seed — this flag is what
 * distinguishes "never seeded" from "seeded then emptied by the user".
 */
function ensureSeeded(): void {
  const alreadySeeded = readJSON<boolean>(STORAGE_KEYS.seeded, false);
  if (alreadySeeded) return;

  const bundle = createSeedBundle();
  writeJSON(STORAGE_KEYS.settings, bundle.settings);
  writeJSON(STORAGE_KEYS.tasks, bundle.tasks);
  writeJSON(STORAGE_KEYS.decisions, bundle.decisions);
  writeJSON(STORAGE_KEYS.owners, bundle.owners);
  writeJSON(STORAGE_KEYS.households, bundle.households);
  writeJSON(STORAGE_KEYS.guests, bundle.guests);
  writeJSON(STORAGE_KEYS.travelSegments, bundle.travelSegments);
  writeJSON(STORAGE_KEYS.hotels, bundle.hotels);
  writeJSON(STORAGE_KEYS.roomTypes, bundle.roomTypes);
  writeJSON(STORAGE_KEYS.rooms, bundle.rooms);
  writeJSON(STORAGE_KEYS.roomAssignments, bundle.roomAssignments);
  writeJSON(STORAGE_KEYS.vehicles, bundle.vehicles);
  writeJSON(STORAGE_KEYS.drivers, bundle.drivers);
  writeJSON(STORAGE_KEYS.transportRoutes, bundle.transportRoutes);
  writeJSON(STORAGE_KEYS.transportAssignments, bundle.transportAssignments);
  writeJSON(STORAGE_KEYS.vendors, bundle.vendors);
  writeJSON(STORAGE_KEYS.vendorContacts, bundle.vendorContacts);
  writeJSON(STORAGE_KEYS.vendorQuotes, bundle.vendorQuotes);
  writeJSON(STORAGE_KEYS.contracts, bundle.contracts);
  writeJSON(STORAGE_KEYS.budgetCategories, bundle.budgetCategories);
  writeJSON(STORAGE_KEYS.budgetItems, bundle.budgetItems);
  writeJSON(STORAGE_KEYS.paymentSchedules, bundle.paymentSchedules);
  writeJSON(STORAGE_KEYS.payments, bundle.payments);
  writeJSON(STORAGE_KEYS.refunds, bundle.refunds);
  writeJSON(STORAGE_KEYS.churchProfiles, bundle.churchProfiles);
  writeJSON(STORAGE_KEYS.churchRequirements, bundle.churchRequirements);
  writeJSON(STORAGE_KEYS.ceremonyParticipants, bundle.ceremonyParticipants);
  writeJSON(STORAGE_KEYS.ceremonySequenceItems, bundle.ceremonySequenceItems);
  writeJSON(STORAGE_KEYS.ceremonyItems, bundle.ceremonyItems);
  writeJSON(STORAGE_KEYS.cateringPlans, bundle.cateringPlans);
  writeJSON(STORAGE_KEYS.menuItems, bundle.menuItems);
  writeJSON(STORAGE_KEYS.decorPlans, bundle.decorPlans);
  writeJSON(STORAGE_KEYS.decorDeliverables, bundle.decorDeliverables);
  writeJSON(STORAGE_KEYS.attireProfiles, bundle.attireProfiles);
  writeJSON(STORAGE_KEYS.attireItems, bundle.attireItems);
  writeJSON(STORAGE_KEYS.groomingAppointments, bundle.groomingAppointments);
  writeJSON(STORAGE_KEYS.photographyPlans, bundle.photographyPlans);
  writeJSON(STORAGE_KEYS.photoGroups, bundle.photoGroups);
  writeJSON(STORAGE_KEYS.musicCues, bundle.musicCues);
  writeJSON(STORAGE_KEYS.musicAVPlans, bundle.musicAVPlans);
  writeJSON(STORAGE_KEYS.giftPlans, bundle.giftPlans);
  writeJSON(STORAGE_KEYS.welcomeKits, bundle.welcomeKits);
  writeJSON(STORAGE_KEYS.welcomeKitItems, bundle.welcomeKitItems);
  writeJSON(STORAGE_KEYS.seeded, true);
}

ensureSeeded();

export const settingsStore = createStore<AppSettings>(STORAGE_KEYS.settings, seedSettingsFallback());
export const tasksStore = createStore<Task[]>(STORAGE_KEYS.tasks, []);
export const decisionsStore = createStore<Decision[]>(STORAGE_KEYS.decisions, []);
export const ownersStore = createStore<Owner[]>(STORAGE_KEYS.owners, []);
export const householdsStore = createStore<Household[]>(STORAGE_KEYS.households, []);
export const guestsStore = createStore<Guest[]>(STORAGE_KEYS.guests, []);
export const travelSegmentsStore = createStore<TravelSegment[]>(STORAGE_KEYS.travelSegments, []);
export const hotelsStore = createStore<Hotel[]>(STORAGE_KEYS.hotels, []);
export const roomTypesStore = createStore<RoomType[]>(STORAGE_KEYS.roomTypes, []);
export const roomsStore = createStore<Room[]>(STORAGE_KEYS.rooms, []);
export const roomAssignmentsStore = createStore<RoomAssignment[]>(STORAGE_KEYS.roomAssignments, []);
export const vehiclesStore = createStore<Vehicle[]>(STORAGE_KEYS.vehicles, []);
export const driversStore = createStore<Driver[]>(STORAGE_KEYS.drivers, []);
export const transportRoutesStore = createStore<TransportRoute[]>(STORAGE_KEYS.transportRoutes, []);
export const transportAssignmentsStore = createStore<TransportAssignment[]>(STORAGE_KEYS.transportAssignments, []);
export const vendorsStore = createStore<Vendor[]>(STORAGE_KEYS.vendors, []);
export const vendorContactsStore = createStore<VendorContact[]>(STORAGE_KEYS.vendorContacts, []);
export const vendorQuotesStore = createStore<VendorQuote[]>(STORAGE_KEYS.vendorQuotes, []);
export const contractsStore = createStore<Contract[]>(STORAGE_KEYS.contracts, []);
export const budgetCategoriesStore = createStore<BudgetCategory[]>(STORAGE_KEYS.budgetCategories, []);
export const budgetItemsStore = createStore<BudgetItem[]>(STORAGE_KEYS.budgetItems, []);
export const paymentSchedulesStore = createStore<PaymentSchedule[]>(STORAGE_KEYS.paymentSchedules, []);
export const paymentsStore = createStore<Payment[]>(STORAGE_KEYS.payments, []);
export const refundsStore = createStore<Refund[]>(STORAGE_KEYS.refunds, []);
export const churchProfilesStore = createStore<ChurchProfile[]>(STORAGE_KEYS.churchProfiles, []);
export const churchRequirementsStore = createStore<ChurchRequirement[]>(STORAGE_KEYS.churchRequirements, []);
export const ceremonyParticipantsStore = createStore<CeremonyParticipant[]>(STORAGE_KEYS.ceremonyParticipants, []);
export const ceremonySequenceItemsStore = createStore<CeremonySequenceItem[]>(STORAGE_KEYS.ceremonySequenceItems, []);
export const ceremonyItemsStore = createStore<CeremonyItem[]>(STORAGE_KEYS.ceremonyItems, []);
export const cateringPlansStore = createStore<CateringPlan[]>(STORAGE_KEYS.cateringPlans, []);
export const menuItemsStore = createStore<MenuItem[]>(STORAGE_KEYS.menuItems, []);
export const decorPlansStore = createStore<DecorPlan[]>(STORAGE_KEYS.decorPlans, []);
export const decorDeliverablesStore = createStore<DecorDeliverable[]>(STORAGE_KEYS.decorDeliverables, []);
export const attireProfilesStore = createStore<AttireProfile[]>(STORAGE_KEYS.attireProfiles, []);
export const attireItemsStore = createStore<AttireItem[]>(STORAGE_KEYS.attireItems, []);
export const groomingAppointmentsStore = createStore<GroomingAppointment[]>(STORAGE_KEYS.groomingAppointments, []);
export const photographyPlansStore = createStore<PhotographyPlan[]>(STORAGE_KEYS.photographyPlans, []);
export const photoGroupsStore = createStore<PhotoGroup[]>(STORAGE_KEYS.photoGroups, []);
export const musicCuesStore = createStore<MusicCue[]>(STORAGE_KEYS.musicCues, []);
export const musicAVPlansStore = createStore<MusicAVPlan[]>(STORAGE_KEYS.musicAVPlans, []);
export const giftPlansStore = createStore<GiftPlan[]>(STORAGE_KEYS.giftPlans, []);
export const welcomeKitsStore = createStore<WelcomeKit[]>(STORAGE_KEYS.welcomeKits, []);
export const welcomeKitItemsStore = createStore<WelcomeKitItem[]>(STORAGE_KEYS.welcomeKitItems, []);

function seedSettingsFallback(): AppSettings {
  // ensureSeeded() above guarantees settings already exist in storage by this point;
  // this fallback only matters if localStorage is unavailable (e.g. private browsing).
  return createSeedBundle().settings;
}

/** Wipes all WeddingOS data and reseeds fresh demo data. Used by Settings > Reset to Demo Data. */
export function resetToDemoData(): void {
  const bundle = createSeedBundle();
  settingsStore.set(bundle.settings);
  tasksStore.set(bundle.tasks);
  decisionsStore.set(bundle.decisions);
  ownersStore.set(bundle.owners);
  householdsStore.set(bundle.households);
  guestsStore.set(bundle.guests);
  travelSegmentsStore.set(bundle.travelSegments);
  hotelsStore.set(bundle.hotels);
  roomTypesStore.set(bundle.roomTypes);
  roomsStore.set(bundle.rooms);
  roomAssignmentsStore.set(bundle.roomAssignments);
  vehiclesStore.set(bundle.vehicles);
  driversStore.set(bundle.drivers);
  transportRoutesStore.set(bundle.transportRoutes);
  transportAssignmentsStore.set(bundle.transportAssignments);
  vendorsStore.set(bundle.vendors);
  vendorContactsStore.set(bundle.vendorContacts);
  vendorQuotesStore.set(bundle.vendorQuotes);
  contractsStore.set(bundle.contracts);
  budgetCategoriesStore.set(bundle.budgetCategories);
  budgetItemsStore.set(bundle.budgetItems);
  paymentSchedulesStore.set(bundle.paymentSchedules);
  paymentsStore.set(bundle.payments);
  refundsStore.set(bundle.refunds);
  churchProfilesStore.set(bundle.churchProfiles);
  churchRequirementsStore.set(bundle.churchRequirements);
  ceremonyParticipantsStore.set(bundle.ceremonyParticipants);
  ceremonySequenceItemsStore.set(bundle.ceremonySequenceItems);
  ceremonyItemsStore.set(bundle.ceremonyItems);
  cateringPlansStore.set(bundle.cateringPlans);
  menuItemsStore.set(bundle.menuItems);
  decorPlansStore.set(bundle.decorPlans);
  decorDeliverablesStore.set(bundle.decorDeliverables);
  attireProfilesStore.set(bundle.attireProfiles);
  attireItemsStore.set(bundle.attireItems);
  groomingAppointmentsStore.set(bundle.groomingAppointments);
  photographyPlansStore.set(bundle.photographyPlans);
  photoGroupsStore.set(bundle.photoGroups);
  musicCuesStore.set(bundle.musicCues);
  musicAVPlansStore.set(bundle.musicAVPlans);
  giftPlansStore.set(bundle.giftPlans);
  welcomeKitsStore.set(bundle.welcomeKits);
  welcomeKitItemsStore.set(bundle.welcomeKitItems);
  writeJSON(STORAGE_KEYS.seeded, true);
}
