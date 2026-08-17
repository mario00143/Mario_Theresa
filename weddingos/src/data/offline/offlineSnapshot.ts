import type { OfflineSnapshot } from '@/types/offlineSnapshot';
import { OFFLINE_PACK_STALE_THRESHOLD_HOURS } from '@/types/offlineSnapshot';
import { OFFLINE_SNAPSHOT_SCHEMA_VERSION } from '@/lib/appVersion';
import { getRuntimeSession } from '@/lib/runtimeSession';
import {
  buildChurchShuttleManifest,
  buildDepartureManifest,
  buildFamilyDutyManifest,
  buildGuestArrivalManifest,
  buildHotelRoomingManifest,
  buildReceptionShuttleManifest,
  buildVendorContactManifest,
  buildVipElderlyManifest,
} from '@/utils/manifestLogic';
import { LIVE_ISSUE_OPEN_STATUSES } from '@/types/liveIssue';
import {
  ceremonyItemsStore,
  churchProfilesStore,
  closeoutItemsStore,
  driversStore,
  dutyAssignmentsStore,
  emergencyContactsStore,
  guestOperationalStatusesStore,
  guestsStore,
  householdsStore,
  hotelsStore,
  liveIssuesStore,
  roomAssignmentsStore,
  roomsStore,
  runSheetItemsStore,
  settingsStore,
  transportAssignmentsStore,
  transportRoutesStore,
  travelSegmentsStore,
  vehiclesStore,
  vendorContactsStore,
  vendorDayStatusesStore,
  vendorsStore,
} from '@/data/stores';
import { getSnapshot, putSnapshot, clearSnapshot, isIndexedDbAvailable } from './offlineDb';

/** Every store folded into the Offline Pack, so freshness (`sourceUpdatedAt`) reflects all of them, not just a subset. */
function latestUpdatedAt(...collections: { updatedAt: string }[][]): string {
  let latest = '';
  for (const collection of collections) {
    for (const record of collection) {
      if (record.updatedAt > latest) latest = record.updatedAt;
    }
  }
  return latest || new Date(0).toISOString();
}

export function generateOfflineSnapshot(): OfflineSnapshot {
  const { workspaceId } = getRuntimeSession();
  const settings = settingsStore.get();
  const guests = guestsStore.get();
  const households = householdsStore.get();
  const transportAssignments = transportAssignmentsStore.get();
  const transportRoutes = transportRoutesStore.get();
  const vehicles = vehiclesStore.get();
  const drivers = driversStore.get();
  const roomAssignments = roomAssignmentsStore.get();
  const rooms = roomsStore.get();
  const hotels = hotelsStore.get();
  const travelSegments = travelSegmentsStore.get();
  const operationalStatuses = guestOperationalStatusesStore.get();
  const dutyAssignments = dutyAssignmentsStore.get();
  const vendors = vendorsStore.get();
  const vendorContacts = vendorContactsStore.get();
  const vendorDayStatuses = vendorDayStatusesStore.get();
  const churchProfiles = churchProfilesStore.get();
  const runSheet = runSheetItemsStore.get();
  const emergencyContacts = emergencyContactsStore.get();
  const ceremonyItems = ceremonyItemsStore.get();
  const closeoutItems = closeoutItemsStore.get();
  const liveIssues = liveIssuesStore.get();

  const church = churchProfiles[0];

  const snapshot: OfflineSnapshot = {
    id: 'current',
    workspaceId,
    generatedAt: new Date().toISOString(),
    weddingDate: settings.wedding.date,
    sourceUpdatedAt: latestUpdatedAt(runSheet, emergencyContacts, vendorContacts, dutyAssignments, ceremonyItems, closeoutItems, liveIssues, roomAssignments, transportAssignments),
    schemaVersion: OFFLINE_SNAPSHOT_SCHEMA_VERSION,
    runSheet,
    emergencyContacts,
    vendorContacts: buildVendorContactManifest(vendors, vendorContacts, vendorDayStatuses),
    duties: dutyAssignments,
    familyDuty: buildFamilyDutyManifest(dutyAssignments),
    ceremonyItems,
    manifests: {
      guestArrival: buildGuestArrivalManifest(guests, households, transportAssignments, transportRoutes, vehicles, drivers, roomAssignments, rooms, hotels),
      churchShuttle: buildChurchShuttleManifest(transportRoutes, transportAssignments, vehicles, drivers, guests),
      receptionShuttle: buildReceptionShuttleManifest(transportRoutes, transportAssignments, vehicles, drivers, guests),
      departure: buildDepartureManifest(guests, travelSegments, transportAssignments, transportRoutes, vehicles, drivers),
    },
    roomingList: buildHotelRoomingManifest(roomAssignments, rooms, hotels, guests),
    vipAssistance: buildVipElderlyManifest(guests, operationalStatuses, transportAssignments, transportRoutes, roomAssignments, rooms, hotels, dutyAssignments),
    openCriticalIssues: liveIssues.filter((issue) => LIVE_ISSUE_OPEN_STATUSES.includes(issue.status) && (issue.severity === 'High' || issue.severity === 'Critical')),
    closeoutItems,
    venueDetails: {
      churchName: church?.churchName,
      churchAddress: church?.address,
      churchPhone: church?.churchOfficePhone,
      clergyName: church?.primaryClergyName,
      clergyPhone: church?.primaryClergyPhone,
      receptionVenue: settings.wedding.receptionVenue,
      receptionLocation: settings.wedding.location,
      ceremonyTime: settings.wedding.ceremonyTime,
      receptionTime: settings.wedding.receptionTime,
      timezone: settings.weddingDetails.timezone,
    },
  };

  return snapshot;
}

/** Regenerates the Offline Pack and persists it to IndexedDB. Call sites: manual "Refresh Offline Pack" button, after a sync completes touching relevant records, and automatically before Wedding Day Mode is entered if the existing pack is stale. */
export async function refreshOfflineSnapshot(): Promise<OfflineSnapshot | null> {
  if (!isIndexedDbAvailable()) return null;
  const snapshot = generateOfflineSnapshot();
  await putSnapshot(snapshot);
  return snapshot;
}

export async function loadOfflineSnapshot(): Promise<OfflineSnapshot | undefined> {
  return getSnapshot();
}

export async function discardOfflineSnapshot(): Promise<void> {
  await clearSnapshot();
}

export function offlineSnapshotAgeMs(snapshot: Pick<OfflineSnapshot, 'generatedAt'>, now: Date = new Date()): number {
  return now.getTime() - new Date(snapshot.generatedAt).getTime();
}

export function isOfflineSnapshotStale(snapshot: Pick<OfflineSnapshot, 'generatedAt'>, now: Date = new Date(), thresholdHours = OFFLINE_PACK_STALE_THRESHOLD_HOURS): boolean {
  return offlineSnapshotAgeMs(snapshot, now) > thresholdHours * 60 * 60 * 1000;
}
