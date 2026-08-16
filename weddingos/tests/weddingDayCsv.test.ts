import { beforeEach, describe, expect, it } from 'vitest';
import {
  ceremonyItemMovementsStore,
  ceremonyItemsStore,
  closeoutItemsStore,
  driversStore,
  dutyAssignmentsStore,
  guestOperationalStatusesStore,
  guestsStore,
  hotelsStore,
  householdsStore,
  liveIssuesStore,
  resetToDemoData,
  roomAssignmentsStore,
  roomsStore,
  runSheetItemsStore,
  settingsStore,
  transportAssignmentsStore,
  transportRoutesStore,
  vehiclesStore,
  vendorDayStatusesStore,
  vendorsStore,
} from '@/data/stores';
import {
  ceremonyItemMovementsToCSV,
  churchShuttleManifestToCSV,
  closeoutChecklistToCSV,
  departureManifestToCSV,
  dutyRosterToCSV,
  guestArrivalManifestToCSV,
  liveIssuesToCSV,
  receptionShuttleManifestToCSV,
  roomingManifestToCSV,
  runSheetToCSV,
  vendorDayStatusToCSV,
  vipElderlyManifestToCSV,
} from '@/data/repositories/weddingDayCsv';
import { buildChurchShuttleManifest, buildGuestArrivalManifest, buildHotelRoomingManifest, buildReceptionShuttleManifest, buildVipElderlyManifest } from '@/utils/manifestLogic';

describe('wedding day CSV exports', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('produces run sheet CSV with a header row and one row per item', () => {
    const csv = runSheetToCSV(runSheetItemsStore.get(), settingsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Activity');
    expect(lines.length).toBe(runSheetItemsStore.get().length + 1);
  });

  it('produces live issues CSV with a header row and one row per issue', () => {
    const csv = liveIssuesToCSV(liveIssuesStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Severity');
    expect(lines.length).toBe(liveIssuesStore.get().length + 1);
  });

  it('produces duty roster CSV with a header row and one row per duty', () => {
    const csv = dutyRosterToCSV(dutyAssignmentsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Role');
    expect(lines.length).toBe(dutyAssignmentsStore.get().length + 1);
  });

  it('produces vendor day status CSV with a header row and one row per status, resolving vendor names', () => {
    const csv = vendorDayStatusToCSV(vendorDayStatusesStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Vendor');
    expect(lines.length).toBe(vendorDayStatusesStore.get().length + 1);
    expect(lines[1]).not.toContain('Unknown');
  });

  it('produces ceremony item movements CSV with a header row and one row per movement, resolving item names', () => {
    const csv = ceremonyItemMovementsToCSV(ceremonyItemMovementsStore.get(), ceremonyItemsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Action');
    expect(lines.length).toBe(ceremonyItemMovementsStore.get().length + 1);
    expect(lines[1]).not.toContain('Unknown');
  });

  it('produces guest arrival manifest CSV from the derived manifest rows', () => {
    const rows = buildGuestArrivalManifest(
      guestsStore.get(), householdsStore.get(), transportAssignmentsStore.get(), transportRoutesStore.get(),
      vehiclesStore.get(), driversStore.get(), roomAssignmentsStore.get(), roomsStore.get(), hotelsStore.get(),
    );
    const csv = guestArrivalManifestToCSV(rows);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Guest Name');
    expect(lines.length).toBe(rows.length + 1);
  });

  it('produces rooming manifest CSV from the derived manifest rows', () => {
    const rows = buildHotelRoomingManifest(roomAssignmentsStore.get(), roomsStore.get(), hotelsStore.get(), guestsStore.get());
    const csv = roomingManifestToCSV(rows);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Room Number');
    expect(lines.length).toBe(rows.length + 1);
  });

  it('produces church and reception shuttle manifest CSVs from the derived manifest rows', () => {
    const churchRows = buildChurchShuttleManifest(transportRoutesStore.get(), transportAssignmentsStore.get(), vehiclesStore.get(), driversStore.get(), guestsStore.get());
    const churchCsv = churchShuttleManifestToCSV(churchRows);
    expect(churchCsv.split('\n')[0]).toContain('Route');
    expect(churchCsv.split('\n').length).toBe(churchRows.length + 1);

    const receptionRows = buildReceptionShuttleManifest(transportRoutesStore.get(), transportAssignmentsStore.get(), vehiclesStore.get(), driversStore.get(), guestsStore.get());
    const receptionCsv = receptionShuttleManifestToCSV(receptionRows);
    expect(receptionCsv.split('\n')[0]).toContain('Route');
    expect(receptionCsv.split('\n').length).toBe(receptionRows.length + 1);
  });

  it('produces departure manifest CSV with a header row', () => {
    const csv = departureManifestToCSV([]);
    expect(csv.split('\n')[0]).toContain('Departure Service');
  });

  it('produces VIP/elderly manifest CSV from the derived manifest rows', () => {
    const rows = buildVipElderlyManifest(
      guestsStore.get(), guestOperationalStatusesStore.get(), transportAssignmentsStore.get(), transportRoutesStore.get(),
      roomAssignmentsStore.get(), roomsStore.get(), hotelsStore.get(), dutyAssignmentsStore.get(),
    );
    const csv = vipElderlyManifestToCSV(rows);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Requirement');
    expect(lines.length).toBe(rows.length + 1);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('produces closeout checklist CSV with a header row and one row per item', () => {
    const csv = closeoutChecklistToCSV(closeoutItemsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Status');
    expect(lines.length).toBe(closeoutItemsStore.get().length + 1);
  });
});
