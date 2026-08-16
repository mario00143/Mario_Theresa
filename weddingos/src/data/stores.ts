import type {
  AppSettings,
  AttireItem,
  AttireProfile,
  BudgetCategory,
  BudgetItem,
  CateringPlan,
  CeremonyItem,
  CeremonyItemMovement,
  CeremonyParticipant,
  CeremonySequenceItem,
  ChurchProfile,
  ChurchRequirement,
  CloseoutItem,
  Contract,
  Decision,
  DecorDeliverable,
  DecorPlan,
  Driver,
  DutyAssignment,
  EmergencyContact,
  EmergencyResponseCard,
  FinalReadinessReview,
  GiftPlan,
  GroomingAppointment,
  Guest,
  GuestOperationalStatus,
  Hotel,
  Household,
  LiveIssue,
  ManifestFreezeState,
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
  RunSheetItem,
  Task,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
  Vendor,
  VendorContact,
  VendorDayStatus,
  VendorQuote,
  WelcomeKit,
  WelcomeKitItem,
} from '@/types';
import { createStore } from '@/lib/store';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/lib/storage';
import { hydrateSyncedStore, withSupabaseSync } from '@/lib/supabaseSync';
import { legacyEntityMap } from './supabase/entityRegistry';
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
  writeJSON(STORAGE_KEYS.runSheetItems, bundle.runSheetItems);
  writeJSON(STORAGE_KEYS.liveIssues, bundle.liveIssues);
  writeJSON(STORAGE_KEYS.dutyAssignments, bundle.dutyAssignments);
  writeJSON(STORAGE_KEYS.vendorDayStatuses, bundle.vendorDayStatuses);
  writeJSON(STORAGE_KEYS.ceremonyItemMovements, bundle.ceremonyItemMovements);
  writeJSON(STORAGE_KEYS.emergencyContacts, bundle.emergencyContacts);
  writeJSON(STORAGE_KEYS.emergencyResponseCards, bundle.emergencyResponseCards);
  writeJSON(STORAGE_KEYS.closeoutItems, bundle.closeoutItems);
  writeJSON(STORAGE_KEYS.finalReadinessReviews, bundle.finalReadinessReviews);
  writeJSON(STORAGE_KEYS.guestOperationalStatuses, bundle.guestOperationalStatuses);
  writeJSON(STORAGE_KEYS.manifestFreezeStates, bundle.manifestFreezeStates);
  writeJSON(STORAGE_KEYS.seeded, true);
}

ensureSeeded();

export const settingsStore = createStore<AppSettings>(STORAGE_KEYS.settings, seedSettingsFallback());
export const tasksStore = withSupabaseSync(createStore<Task[]>(STORAGE_KEYS.tasks, []), legacyEntityMap('tasks'));
export const decisionsStore = withSupabaseSync(createStore<Decision[]>(STORAGE_KEYS.decisions, []), legacyEntityMap('decisions'));
export const ownersStore = withSupabaseSync(createStore<Owner[]>(STORAGE_KEYS.owners, []), legacyEntityMap('owners'));
export const householdsStore = withSupabaseSync(createStore<Household[]>(STORAGE_KEYS.households, []), legacyEntityMap('households'));
export const guestsStore = withSupabaseSync(createStore<Guest[]>(STORAGE_KEYS.guests, []), legacyEntityMap('guests'));
export const travelSegmentsStore = withSupabaseSync(createStore<TravelSegment[]>(STORAGE_KEYS.travelSegments, []), legacyEntityMap('travelSegments'));
export const hotelsStore = withSupabaseSync(createStore<Hotel[]>(STORAGE_KEYS.hotels, []), legacyEntityMap('hotels'));
export const roomTypesStore = withSupabaseSync(createStore<RoomType[]>(STORAGE_KEYS.roomTypes, []), legacyEntityMap('roomTypes'));
export const roomsStore = withSupabaseSync(createStore<Room[]>(STORAGE_KEYS.rooms, []), legacyEntityMap('rooms'));
export const roomAssignmentsStore = withSupabaseSync(createStore<RoomAssignment[]>(STORAGE_KEYS.roomAssignments, []), legacyEntityMap('roomAssignments'));
export const vehiclesStore = withSupabaseSync(createStore<Vehicle[]>(STORAGE_KEYS.vehicles, []), legacyEntityMap('vehicles'));
export const driversStore = withSupabaseSync(createStore<Driver[]>(STORAGE_KEYS.drivers, []), legacyEntityMap('drivers'));
export const transportRoutesStore = withSupabaseSync(createStore<TransportRoute[]>(STORAGE_KEYS.transportRoutes, []), legacyEntityMap('transportRoutes'));
export const transportAssignmentsStore = withSupabaseSync(createStore<TransportAssignment[]>(STORAGE_KEYS.transportAssignments, []), legacyEntityMap('transportAssignments'));
export const vendorsStore = withSupabaseSync(createStore<Vendor[]>(STORAGE_KEYS.vendors, []), legacyEntityMap('vendors'));
export const vendorContactsStore = withSupabaseSync(createStore<VendorContact[]>(STORAGE_KEYS.vendorContacts, []), legacyEntityMap('vendorContacts'));
export const vendorQuotesStore = withSupabaseSync(createStore<VendorQuote[]>(STORAGE_KEYS.vendorQuotes, []), legacyEntityMap('vendorQuotes'));
export const contractsStore = withSupabaseSync(createStore<Contract[]>(STORAGE_KEYS.contracts, []), legacyEntityMap('contracts'));
export const budgetCategoriesStore = withSupabaseSync(createStore<BudgetCategory[]>(STORAGE_KEYS.budgetCategories, []), legacyEntityMap('budgetCategories'));
export const budgetItemsStore = withSupabaseSync(createStore<BudgetItem[]>(STORAGE_KEYS.budgetItems, []), legacyEntityMap('budgetItems'));
export const paymentSchedulesStore = withSupabaseSync(createStore<PaymentSchedule[]>(STORAGE_KEYS.paymentSchedules, []), legacyEntityMap('paymentSchedules'));
export const paymentsStore = withSupabaseSync(createStore<Payment[]>(STORAGE_KEYS.payments, []), legacyEntityMap('payments'));
export const refundsStore = withSupabaseSync(createStore<Refund[]>(STORAGE_KEYS.refunds, []), legacyEntityMap('refunds'));
export const churchProfilesStore = withSupabaseSync(createStore<ChurchProfile[]>(STORAGE_KEYS.churchProfiles, []), legacyEntityMap('churchProfiles'));
export const churchRequirementsStore = withSupabaseSync(createStore<ChurchRequirement[]>(STORAGE_KEYS.churchRequirements, []), legacyEntityMap('churchRequirements'));
export const ceremonyParticipantsStore = withSupabaseSync(createStore<CeremonyParticipant[]>(STORAGE_KEYS.ceremonyParticipants, []), legacyEntityMap('ceremonyParticipants'));
export const ceremonySequenceItemsStore = withSupabaseSync(createStore<CeremonySequenceItem[]>(STORAGE_KEYS.ceremonySequenceItems, []), legacyEntityMap('ceremonySequenceItems'));
export const ceremonyItemsStore = withSupabaseSync(createStore<CeremonyItem[]>(STORAGE_KEYS.ceremonyItems, []), legacyEntityMap('ceremonyItems'));
export const cateringPlansStore = withSupabaseSync(createStore<CateringPlan[]>(STORAGE_KEYS.cateringPlans, []), legacyEntityMap('cateringPlans'));
export const menuItemsStore = withSupabaseSync(createStore<MenuItem[]>(STORAGE_KEYS.menuItems, []), legacyEntityMap('menuItems'));
export const decorPlansStore = withSupabaseSync(createStore<DecorPlan[]>(STORAGE_KEYS.decorPlans, []), legacyEntityMap('decorPlans'));
export const decorDeliverablesStore = withSupabaseSync(createStore<DecorDeliverable[]>(STORAGE_KEYS.decorDeliverables, []), legacyEntityMap('decorDeliverables'));
export const attireProfilesStore = withSupabaseSync(createStore<AttireProfile[]>(STORAGE_KEYS.attireProfiles, []), legacyEntityMap('attireProfiles'));
export const attireItemsStore = withSupabaseSync(createStore<AttireItem[]>(STORAGE_KEYS.attireItems, []), legacyEntityMap('attireItems'));
export const groomingAppointmentsStore = withSupabaseSync(createStore<GroomingAppointment[]>(STORAGE_KEYS.groomingAppointments, []), legacyEntityMap('groomingAppointments'));
export const photographyPlansStore = withSupabaseSync(createStore<PhotographyPlan[]>(STORAGE_KEYS.photographyPlans, []), legacyEntityMap('photographyPlans'));
export const photoGroupsStore = withSupabaseSync(createStore<PhotoGroup[]>(STORAGE_KEYS.photoGroups, []), legacyEntityMap('photoGroups'));
export const musicCuesStore = withSupabaseSync(createStore<MusicCue[]>(STORAGE_KEYS.musicCues, []), legacyEntityMap('musicCues'));
export const musicAVPlansStore = withSupabaseSync(createStore<MusicAVPlan[]>(STORAGE_KEYS.musicAVPlans, []), legacyEntityMap('musicAVPlans'));
export const giftPlansStore = withSupabaseSync(createStore<GiftPlan[]>(STORAGE_KEYS.giftPlans, []), legacyEntityMap('giftPlans'));
export const welcomeKitsStore = withSupabaseSync(createStore<WelcomeKit[]>(STORAGE_KEYS.welcomeKits, []), legacyEntityMap('welcomeKits'));
export const welcomeKitItemsStore = withSupabaseSync(createStore<WelcomeKitItem[]>(STORAGE_KEYS.welcomeKitItems, []), legacyEntityMap('welcomeKitItems'));
export const runSheetItemsStore = withSupabaseSync(createStore<RunSheetItem[]>(STORAGE_KEYS.runSheetItems, []), legacyEntityMap('runSheetItems'));
export const liveIssuesStore = withSupabaseSync(createStore<LiveIssue[]>(STORAGE_KEYS.liveIssues, []), legacyEntityMap('liveIssues'));
export const dutyAssignmentsStore = withSupabaseSync(createStore<DutyAssignment[]>(STORAGE_KEYS.dutyAssignments, []), legacyEntityMap('dutyAssignments'));
export const vendorDayStatusesStore = withSupabaseSync(createStore<VendorDayStatus[]>(STORAGE_KEYS.vendorDayStatuses, []), legacyEntityMap('vendorDayStatuses'));
export const ceremonyItemMovementsStore = withSupabaseSync(createStore<CeremonyItemMovement[]>(STORAGE_KEYS.ceremonyItemMovements, []), legacyEntityMap('ceremonyItemMovements'));
export const emergencyContactsStore = withSupabaseSync(createStore<EmergencyContact[]>(STORAGE_KEYS.emergencyContacts, []), legacyEntityMap('emergencyContacts'));
export const emergencyResponseCardsStore = withSupabaseSync(createStore<EmergencyResponseCard[]>(STORAGE_KEYS.emergencyResponseCards, []), legacyEntityMap('emergencyResponseCards'));
export const closeoutItemsStore = withSupabaseSync(createStore<CloseoutItem[]>(STORAGE_KEYS.closeoutItems, []), legacyEntityMap('closeoutItems'));
export const finalReadinessReviewsStore = withSupabaseSync(createStore<FinalReadinessReview[]>(STORAGE_KEYS.finalReadinessReviews, []), legacyEntityMap('finalReadinessReviews'));
export const guestOperationalStatusesStore = withSupabaseSync(createStore<GuestOperationalStatus[]>(STORAGE_KEYS.guestOperationalStatuses, []), legacyEntityMap('guestOperationalStatuses'));
export const manifestFreezeStatesStore = withSupabaseSync(createStore<ManifestFreezeState[]>(STORAGE_KEYS.manifestFreezeStates, []), legacyEntityMap('manifestFreezeStates'));

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
  runSheetItemsStore.set(bundle.runSheetItems);
  liveIssuesStore.set(bundle.liveIssues);
  dutyAssignmentsStore.set(bundle.dutyAssignments);
  vendorDayStatusesStore.set(bundle.vendorDayStatuses);
  ceremonyItemMovementsStore.set(bundle.ceremonyItemMovements);
  emergencyContactsStore.set(bundle.emergencyContacts);
  emergencyResponseCardsStore.set(bundle.emergencyResponseCards);
  closeoutItemsStore.set(bundle.closeoutItems);
  finalReadinessReviewsStore.set(bundle.finalReadinessReviews);
  guestOperationalStatusesStore.set(bundle.guestOperationalStatuses);
  manifestFreezeStatesStore.set(bundle.manifestFreezeStates);
  writeJSON(STORAGE_KEYS.seeded, true);
}

/**
 * Every legacy (v1-v6) collection that's been made Supabase-capable via
 * withSupabaseSync — used by WorkspaceProvider to hydrate all of them from
 * Supabase in one pass right after a workspace is selected. `settingsStore`
 * is intentionally excluded: AppSettings is a single JSONB blob per
 * workspace, not an array collection, and is synced separately by
 * WorkspaceProvider via data/supabase/workspaceSettingsRepository.ts.
 */
const SYNCED_STORE_HYDRATORS: Array<() => Promise<void>> = [
  () => hydrateSyncedStore(tasksStore),
  () => hydrateSyncedStore(decisionsStore),
  () => hydrateSyncedStore(ownersStore),
  () => hydrateSyncedStore(householdsStore),
  () => hydrateSyncedStore(guestsStore),
  () => hydrateSyncedStore(travelSegmentsStore),
  () => hydrateSyncedStore(hotelsStore),
  () => hydrateSyncedStore(roomTypesStore),
  () => hydrateSyncedStore(roomsStore),
  () => hydrateSyncedStore(roomAssignmentsStore),
  () => hydrateSyncedStore(vehiclesStore),
  () => hydrateSyncedStore(driversStore),
  () => hydrateSyncedStore(transportRoutesStore),
  () => hydrateSyncedStore(transportAssignmentsStore),
  () => hydrateSyncedStore(vendorsStore),
  () => hydrateSyncedStore(vendorContactsStore),
  () => hydrateSyncedStore(vendorQuotesStore),
  () => hydrateSyncedStore(contractsStore),
  () => hydrateSyncedStore(budgetCategoriesStore),
  () => hydrateSyncedStore(budgetItemsStore),
  () => hydrateSyncedStore(paymentSchedulesStore),
  () => hydrateSyncedStore(paymentsStore),
  () => hydrateSyncedStore(refundsStore),
  () => hydrateSyncedStore(churchProfilesStore),
  () => hydrateSyncedStore(churchRequirementsStore),
  () => hydrateSyncedStore(ceremonyParticipantsStore),
  () => hydrateSyncedStore(ceremonySequenceItemsStore),
  () => hydrateSyncedStore(ceremonyItemsStore),
  () => hydrateSyncedStore(cateringPlansStore),
  () => hydrateSyncedStore(menuItemsStore),
  () => hydrateSyncedStore(decorPlansStore),
  () => hydrateSyncedStore(decorDeliverablesStore),
  () => hydrateSyncedStore(attireProfilesStore),
  () => hydrateSyncedStore(attireItemsStore),
  () => hydrateSyncedStore(groomingAppointmentsStore),
  () => hydrateSyncedStore(photographyPlansStore),
  () => hydrateSyncedStore(photoGroupsStore),
  () => hydrateSyncedStore(musicCuesStore),
  () => hydrateSyncedStore(musicAVPlansStore),
  () => hydrateSyncedStore(giftPlansStore),
  () => hydrateSyncedStore(welcomeKitsStore),
  () => hydrateSyncedStore(welcomeKitItemsStore),
  () => hydrateSyncedStore(runSheetItemsStore),
  () => hydrateSyncedStore(liveIssuesStore),
  () => hydrateSyncedStore(dutyAssignmentsStore),
  () => hydrateSyncedStore(vendorDayStatusesStore),
  () => hydrateSyncedStore(ceremonyItemMovementsStore),
  () => hydrateSyncedStore(emergencyContactsStore),
  () => hydrateSyncedStore(emergencyResponseCardsStore),
  () => hydrateSyncedStore(closeoutItemsStore),
  () => hydrateSyncedStore(finalReadinessReviewsStore),
  () => hydrateSyncedStore(guestOperationalStatusesStore),
  () => hydrateSyncedStore(manifestFreezeStatesStore),
];

/** Fetches every workspace-scoped collection from Supabase and replaces the local cache with it. Called once after workspace selection/switch. */
export async function hydrateAllSyncedStores(): Promise<void> {
  await Promise.all(SYNCED_STORE_HYDRATORS.map((hydrate) => hydrate()));
}
