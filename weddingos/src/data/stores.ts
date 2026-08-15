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
  writeJSON(STORAGE_KEYS.seeded, true);
}
