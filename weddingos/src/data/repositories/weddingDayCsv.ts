import type {
  AppSettings,
  CeremonyItem,
  CeremonyItemMovement,
  CloseoutItem,
  DutyAssignment,
  LiveIssue,
  RunSheetItem,
  Vendor,
  VendorDayStatus,
} from '@/types';
import type {
  DepartureManifestRow,
  GuestArrivalManifestRow,
  HotelRoomingManifestRow,
  ShuttleManifestRow,
  VipElderlyManifestRow,
} from '@/utils/manifestLogic';
import { formatRunSheetClockTime, formatRunSheetRelativeLabel, resolveRunSheetPlannedDateTimeISO } from '@/utils/runSheetLogic';

function csvEscape(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function runSheetToCSV(items: RunSheetItem[], settings: AppSettings): string {
  const headers = [
    'Time', 'Timing Reference', 'Activity', 'Category', 'Location', 'Owner', 'Backup Owner',
    'Cue', 'Status', 'Delay (min)', 'Contingency Action', 'Notes',
  ];
  const rows = items.map((item) => {
    const planned = resolveRunSheetPlannedDateTimeISO(item, settings);
    return [
      formatRunSheetClockTime(planned),
      formatRunSheetRelativeLabel(item),
      item.activity,
      item.category,
      item.location ?? '',
      item.owner ?? '',
      item.backupOwner ?? '',
      item.cue ?? '',
      item.status,
      item.delayMinutes ?? '',
      item.contingencyAction ?? '',
      item.notes ?? '',
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function liveIssuesToCSV(issues: LiveIssue[]): string {
  const headers = [
    'Title', 'Category', 'Severity', 'Status', 'Reported At', 'Reported By', 'Owner', 'Backup Owner',
    'Location', 'Mitigation', 'Resolution', 'Resolved At', 'Follow-up Required', 'Notes',
  ];
  const rows = issues.map((i) =>
    [
      i.title, i.category, i.severity, i.status, i.reportedAt, i.reportedBy ?? '', i.owner ?? '', i.backupOwner ?? '',
      i.location ?? '', i.mitigation ?? '', i.resolution ?? '', i.resolvedAt ?? '', i.followUpRequired ? 'Yes' : 'No', i.notes ?? '',
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function dutyRosterToCSV(duties: DutyAssignment[]): string {
  const headers = [
    'Role', 'Person Name', 'Phone', 'Backup Person', 'Backup Phone', 'Start Time', 'End Time',
    'Location', 'Responsibilities', 'Status', 'Notes',
  ];
  const rows = duties.map((d) =>
    [d.role, d.personName, d.phone ?? '', d.backupPersonName ?? '', d.backupPhone ?? '', d.startTime ?? '', d.endTime ?? '', d.location ?? '', d.responsibilities ?? '', d.status, d.notes ?? '']
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function vendorDayStatusToCSV(statuses: VendorDayStatus[], vendors: Vendor[]): string {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const headers = [
    'Vendor', 'Expected Arrival', 'Actual Arrival', 'Expected Departure', 'Actual Departure',
    'Primary Contact Confirmed', 'Team Size Expected', 'Team Size Actual', 'Setup Complete',
    'Service Ready', 'Final Settlement Checked', 'Status', 'Notes',
  ];
  const rows = statuses.map((s) =>
    [
      vendorById.get(s.vendorId)?.name ?? 'Unknown',
      s.expectedArrivalTime ?? '',
      s.actualArrivalTime ?? '',
      s.expectedDepartureTime ?? '',
      s.actualDepartureTime ?? '',
      s.primaryContactConfirmed ? 'Yes' : 'No',
      s.teamSizeExpected ?? '',
      s.teamSizeActual ?? '',
      s.setupComplete ? 'Yes' : 'No',
      s.serviceReady ? 'Yes' : 'No',
      s.finalSettlementChecked ? 'Yes' : 'No',
      s.status,
      s.notes ?? '',
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function ceremonyItemMovementsToCSV(movements: CeremonyItemMovement[], ceremonyItems: CeremonyItem[]): string {
  const itemById = new Map(ceremonyItems.map((i) => [i.id, i]));
  const headers = ['Item', 'Action', 'Timestamp', 'From Location', 'To Location', 'Handed By', 'Received By', 'Notes'];
  const rows = movements.map((m) =>
    [itemById.get(m.ceremonyItemId)?.name ?? 'Unknown', m.action, m.timestamp, m.fromLocation ?? '', m.toLocation ?? '', m.handedBy ?? '', m.receivedBy ?? '', m.notes ?? '']
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function guestArrivalManifestToCSV(rows: GuestArrivalManifestRow[]): string {
  const headers = ['Guest Name', 'Household', 'Arrival Time', 'Arrival Point', 'Pickup Route', 'Vehicle', 'Driver', 'Hotel', 'Room'];
  const lines = rows.map((r) =>
    [r.guestName, r.householdName, r.arrivalTime ?? '', r.arrivalPoint ?? '', r.pickupRoute ?? '', r.vehicle ?? '', r.driver ?? '', r.hotel ?? '', r.room ?? '']
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export function roomingManifestToCSV(rows: HotelRoomingManifestRow[]): string {
  const headers = ['Hotel', 'Room Number', 'Guest Names', 'Check-In', 'Check-Out', 'Special Needs'];
  const lines = rows.map((r) => [r.hotelName, r.roomNumber, r.guestNames.join('; '), r.checkInDate, r.checkOutDate, r.specialNeeds ?? ''].map(csvEscape).join(','));
  return [headers.join(','), ...lines].join('\n');
}

function shuttleManifestToCSV(rows: ShuttleManifestRow[]): string {
  const headers = ['Hotel', 'Route', 'Departure Time', 'Vehicle', 'Driver', 'Guest Names'];
  const lines = rows.map((r) =>
    [r.hotelName ?? '', r.routeName, r.departureTime ?? '', r.vehicle ?? '', r.driver ?? '', r.guestNames.join('; ')].map(csvEscape).join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export const churchShuttleManifestToCSV = shuttleManifestToCSV;
export const receptionShuttleManifestToCSV = shuttleManifestToCSV;

export function departureManifestToCSV(rows: DepartureManifestRow[]): string {
  const headers = ['Guest Name', 'Departure Service', 'Required Departure From Hotel', 'Vehicle', 'Driver'];
  const lines = rows.map((r) => [r.guestName, r.departureService ?? '', r.requiredDepartureFromHotel ?? '', r.vehicle ?? '', r.driver ?? ''].map(csvEscape).join(','));
  return [headers.join(','), ...lines].join('\n');
}

export function vipElderlyManifestToCSV(rows: VipElderlyManifestRow[]): string {
  const headers = ['Guest Name', 'Requirement', 'Assigned Helper', 'Transport', 'Hotel Details'];
  const lines = rows.map((r) => [r.guestName, r.requirement, r.assignedHelper ?? '', r.transport ?? '', r.hotelDetails ?? ''].map(csvEscape).join(','));
  return [headers.join(','), ...lines].join('\n');
}

export function closeoutChecklistToCSV(items: CloseoutItem[]): string {
  const headers = ['Category', 'Title', 'Owner', 'Status', 'Due Time', 'Completed At', 'Verification Note', 'Notes'];
  const rows = items.map((i) =>
    [i.category, i.title, i.owner ?? '', i.status, i.dueTime ?? '', i.completedAt ?? '', i.verificationNote ?? '', i.notes ?? '']
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

function csvFilename(slug: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-${slug}-${stamp}.csv`;
}

export const runSheetCsvFilename = () => csvFilename('run-sheet');
export const liveIssuesCsvFilename = () => csvFilename('live-issues');
export const dutyRosterCsvFilename = () => csvFilename('duty-roster');
export const vendorDayStatusCsvFilename = () => csvFilename('vendor-day-status');
export const ceremonyItemMovementsCsvFilename = () => csvFilename('ceremony-item-movements');
export const guestArrivalManifestCsvFilename = () => csvFilename('guest-arrival-manifest');
export const roomingManifestCsvFilename = () => csvFilename('rooming-manifest');
export const churchShuttleManifestCsvFilename = () => csvFilename('church-shuttle-manifest');
export const receptionShuttleManifestCsvFilename = () => csvFilename('reception-shuttle-manifest');
export const departureManifestCsvFilename = () => csvFilename('departure-manifest');
export const vipElderlyManifestCsvFilename = () => csvFilename('vip-elderly-manifest');
export const closeoutChecklistCsvFilename = () => csvFilename('closeout-checklist');
