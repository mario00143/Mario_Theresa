import type {
  AppSettings,
  CeremonyItem,
  GuestOperationalStatus,
  LiveIssue,
  RunSheetItem,
  TransportAssignment,
  TransportRoute,
  Vendor,
  VendorDayStatus,
} from '@/types';
import { isVendorLate } from './vendorDayLogic';
import { criticalOpenLiveIssues, isLiveIssueOpen } from './liveIssueLogic';
import { resolveRunSheetPlannedDateTimeISO } from './runSheetLogic';

export type CommandCenterAlertSeverity = 'critical' | 'warning';

export interface CommandCenterAlert {
  id: string;
  severity: CommandCenterAlertSeverity;
  message: string;
  linkType: 'runSheetItem' | 'liveIssue' | 'vendor' | 'route' | 'guest';
  linkId: string;
}

export interface CommandCenterAlertsInput {
  runSheetItems: RunSheetItem[];
  ceremonyItems: CeremonyItem[];
  liveIssues: LiveIssue[];
  transportRoutes: TransportRoute[];
  transportAssignments: TransportAssignment[];
  vendors: Vendor[];
  vendorDayStatuses: VendorDayStatus[];
  guestOperationalStatuses: GuestOperationalStatus[];
  settings: AppSettings;
  referenceDateTimeISO: string;
}

/** Section 8: the full set of "needs attention right now" signals surfaced on the Command Center. */
export function computeCommandCenterAlerts(input: CommandCenterAlertsInput): CommandCenterAlert[] {
  const alerts: CommandCenterAlert[] = [];
  const now = new Date(input.referenceDateTimeISO).getTime();

  // 1. Delayed critical run-sheet items.
  for (const item of input.runSheetItems) {
    if (item.status === 'Delayed' || (item.delayMinutes ?? 0) > 0) {
      alerts.push({
        id: `delay-${item.id}`,
        severity: 'critical',
        message: `"${item.activity}" is delayed${item.delayMinutes ? ` by ${item.delayMinutes} min` : ''}.`,
        linkType: 'runSheetItem',
        linkId: item.id,
      });
    }
  }

  // 2. Upcoming items with no owner (within the next 2 hours, so the list stays focused on what matters now).
  for (const item of input.runSheetItems) {
    if (item.owner || item.status === 'Complete' || item.status === 'Skipped' || item.status === 'Cancelled') continue;
    const planned = resolveRunSheetPlannedDateTimeISO(item, input.settings);
    if (!planned) continue;
    const hoursUntil = (new Date(planned).getTime() - now) / 3_600_000;
    if (hoursUntil >= -1 && hoursUntil <= 2) {
      alerts.push({ id: `no-owner-${item.id}`, severity: 'warning', message: `"${item.activity}" has no owner assigned.`, linkType: 'runSheetItem', linkId: item.id });
    }
  }

  // 3. Vendor-category run-sheet items with no vendor linked.
  for (const item of input.runSheetItems) {
    if (item.category === 'Vendor' && item.vendorIds.length === 0 && item.status !== 'Complete' && item.status !== 'Cancelled') {
      alerts.push({ id: `no-vendor-${item.id}`, severity: 'warning', message: `"${item.activity}" has no vendor linked.`, linkType: 'runSheetItem', linkId: item.id });
    }
  }

  // 4. Required ceremony items not yet Ready/Verified.
  const ceremonyItemById = new Map(input.ceremonyItems.map((i) => [i.id, i]));
  for (const item of input.runSheetItems) {
    if (item.status === 'Complete' || item.status === 'Cancelled') continue;
    for (const requiredId of item.requiredItemIds) {
      const ceremonyItem = ceremonyItemById.get(requiredId);
      if (ceremonyItem && ceremonyItem.applicability === 'Applicable' && ceremonyItem.verificationStatus !== 'Verified') {
        alerts.push({
          id: `missing-item-${item.id}-${requiredId}`,
          severity: 'critical',
          message: `"${ceremonyItem.name}" required for "${item.activity}" is not yet verified.`,
          linkType: 'runSheetItem',
          linkId: item.id,
        });
      }
    }
  }

  // 5. Unresolved high/critical issues.
  for (const issue of input.liveIssues) {
    if (isLiveIssueOpen(issue) && (issue.severity === 'High' || issue.severity === 'Critical')) {
      alerts.push({
        id: `issue-${issue.id}`,
        severity: issue.severity === 'Critical' ? 'critical' : 'warning',
        message: `${issue.severity} issue open: "${issue.title}".`,
        linkType: 'liveIssue',
        linkId: issue.id,
      });
    }
  }

  // 6. Transport routes running late (planned departure passed, not yet dispatched/completed).
  for (const route of input.transportRoutes) {
    if (route.status === 'Dispatched' || route.status === 'Completed' || route.status === 'Cancelled') continue;
    if (!route.plannedDepartureDate) continue;
    const plannedISO = `${route.plannedDepartureDate}T${route.plannedDepartureTime ?? '00:00'}:00`;
    const planned = new Date(plannedISO).getTime();
    if (!Number.isNaN(planned) && now > planned) {
      alerts.push({ id: `route-late-${route.id}`, severity: 'warning', message: `Route "${route.name}" has not departed yet.`, linkType: 'route', linkId: route.id });
    }
  }

  // 7. Vendors not checked in past their grace period.
  for (const status of input.vendorDayStatuses) {
    if (isVendorLate(status, input.settings.weddingDay.vendorArrivalGraceMinutes, input.referenceDateTimeISO)) {
      const vendor = input.vendors.find((v) => v.id === status.vendorId);
      alerts.push({ id: `vendor-late-${status.id}`, severity: 'critical', message: `"${vendor?.name ?? 'Vendor'}" has not checked in.`, linkType: 'vendor', linkId: status.vendorId });
    }
    if (status.status === 'No Show') {
      const vendor = input.vendors.find((v) => v.id === status.vendorId);
      alerts.push({ id: `vendor-noshow-${status.id}`, severity: 'critical', message: `"${vendor?.name ?? 'Vendor'}" marked No Show.`, linkType: 'vendor', linkId: status.vendorId });
    }
  }

  // 8. VIP/elderly guests flagged as needing assistance, or whose transport was cancelled/no-show.
  for (const status of input.guestOperationalStatuses) {
    if (status.state === 'Assistance Required') {
      alerts.push({ id: `guest-assist-${status.id}`, severity: 'warning', message: 'A VIP/elderly guest needs assistance.', linkType: 'guest', linkId: status.guestId });
    }
  }
  for (const assignment of input.transportAssignments) {
    if (assignment.assignmentStatus === 'No Show' || assignment.assignmentStatus === 'Cancelled') {
      const isTrackedGuest = input.guestOperationalStatuses.some((s) => s.guestId === assignment.guestId);
      if (isTrackedGuest) {
        alerts.push({
          id: `guest-transport-${assignment.id}`,
          severity: 'warning',
          message: `Transport exception for a tracked guest (${assignment.assignmentStatus}).`,
          linkType: 'guest',
          linkId: assignment.guestId,
        });
      }
    }
  }

  return alerts;
}

/** Emergency-severity subset: open Critical issues in Medical or Security categories — the top-of-list "Emergency alert" bucket. */
export function computeEmergencyAlerts(liveIssues: LiveIssue[]): LiveIssue[] {
  return criticalOpenLiveIssues(liveIssues).filter((i) => i.category === 'Medical' || i.category === 'Security');
}
