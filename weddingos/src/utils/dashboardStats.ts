import type {
  BudgetCategory,
  BudgetItem,
  Contract,
  Decision,
  Guest,
  Household,
  Payment,
  PaymentSchedule,
  Refund,
  RoomAssignment,
  Task,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
  Vendor,
} from '@/types';
import {
  completionPercentage,
  criticalCompletionPercentage,
  getDependencyStatus,
  isProtectedPeriodViolation,
  isTaskDueWithin,
  isTaskDueWithinTwoWeeks,
  isTaskOverdue,
} from './taskLogic';
import { isDecisionOverdue } from './decisionLogic';
import { isFollowUpOverdue } from './invitationLogic';
import { detectDataIssues } from './guestDataQuality';
import { findGuestsRequiringAccommodationUnassigned } from './logisticsStats';
import { isTransportAssignmentActive, seatsAssignedForRoute } from './transportLogic';
import { computeCategorySummary } from './budgetLogic';
import { computePaymentScheduleStatus } from './paymentLogic';
import { isCriticalVendorNotReconfirmed } from './vendorReadiness';
import type { WeddingPrepIssue, WeddingPrepIssueCategory } from './weddingPrepDataQuality';
import { daysUntil, todayISO } from './date';

export interface PlanningHealth {
  overallCompletion: number;
  criticalCompletion: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueNext7Days: number;
  dueNext14Days: number;
  blockedTasks: number;
  pendingDecisions: number;
}

export function computePlanningHealth(tasks: Task[], decisions: Decision[]): PlanningHealth {
  const nonCancelled = tasks.filter((t) => t.status !== 'Cancelled');
  return {
    overallCompletion: completionPercentage(tasks),
    criticalCompletion: criticalCompletionPercentage(tasks),
    totalTasks: nonCancelled.length,
    completedTasks: tasks.filter((t) => t.status === 'Done').length,
    overdueTasks: tasks.filter((t) => isTaskOverdue(t)).length,
    dueNext7Days: tasks.filter((t) => isTaskDueWithin(t, 7)).length,
    dueNext14Days: tasks.filter((t) => isTaskDueWithinTwoWeeks(t)).length,
    blockedTasks: tasks.filter((t) => t.status === 'Blocked').length,
    pendingDecisions: decisions.filter((d) => d.status === 'Open' || d.status === 'Under Discussion').length,
  };
}

export type AttentionSeverity = 'critical' | 'warning';

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  message: string;
  linkType: 'task' | 'decision' | 'household' | 'guest' | 'route' | 'travel' | 'vendor';
  linkId: string;
}

export function buildAttentionItems(tasks: Task[], decisions: Decision[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const task of tasks) {
    if (isTaskOverdue(task) && task.priority === 'Critical') {
      items.push({
        id: `overdue-critical-${task.id}`,
        severity: 'critical',
        message: `Critical task overdue: "${task.title}"`,
        linkType: 'task',
        linkId: task.id,
      });
    } else if (isTaskOverdue(task) && task.priority === 'High') {
      items.push({
        id: `overdue-high-${task.id}`,
        severity: 'warning',
        message: `High-priority task overdue: "${task.title}"`,
        linkType: 'task',
        linkId: task.id,
      });
    }

    if (task.status === 'Blocked') {
      items.push({
        id: `blocked-${task.id}`,
        severity: 'warning',
        message: `Task blocked: "${task.title}"${task.blockedReason ? ` — ${task.blockedReason}` : ''}`,
        linkType: 'task',
        linkId: task.id,
      });
    }

    if (isProtectedPeriodViolation(task)) {
      items.push({
        id: `protected-${task.id}`,
        severity: 'critical',
        message: `Protected engagement period — consider completing "${task.title}" earlier.`,
        linkType: 'task',
        linkId: task.id,
      });
    }

    const dependencyStatus = getDependencyStatus(task, tasks);
    if (dependencyStatus.isBlockedByDependency && task.status !== 'Done' && task.status !== 'Cancelled') {
      items.push({
        id: `dependency-${task.id}`,
        severity: 'warning',
        message: `Dependency incomplete for "${task.title}" (waiting on ${dependencyStatus.incomplete.length} task${dependencyStatus.incomplete.length === 1 ? '' : 's'})`,
        linkType: 'task',
        linkId: task.id,
      });
    }
  }

  for (const decision of decisions) {
    if (isDecisionOverdue(decision)) {
      items.push({
        id: `decision-overdue-${decision.id}`,
        severity: 'critical',
        message: `Decision overdue: "${decision.title}"`,
        linkType: 'decision',
        linkId: decision.id,
      });
    }
  }

  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}

export function upcomingIncompleteTasks(tasks: Task[], limit = 10): Task[] {
  return tasks
    .filter((t) => t.status !== 'Done' && t.status !== 'Cancelled' && t.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0))
    .slice(0, limit);
}

/** Guest-related Attention Required items: overdue RSVP follow-ups, households flagged for invitation follow-up, and a data-quality summary. */
export function buildGuestAttentionItems(households: Household[], guests: Guest[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const household of households) {
    if (isFollowUpOverdue(household)) {
      items.push({
        id: `rsvp-followup-overdue-${household.id}`,
        severity: 'critical',
        message: `RSVP follow-up overdue for "${household.householdName}"`,
        linkType: 'household',
        linkId: household.id,
      });
    }
    if (household.invitationStatus === 'Follow-up Required') {
      items.push({
        id: `invitation-followup-${household.id}`,
        severity: 'warning',
        message: `Invitation follow-up required for "${household.householdName}"`,
        linkType: 'household',
        linkId: household.id,
      });
    }
  }

  const dataIssues = detectDataIssues(households, guests);
  if (dataIssues.length > 0) {
    items.push({
      id: 'guest-data-issues-summary',
      severity: 'warning',
      message: `${dataIssues.length} guest data issue${dataIssues.length === 1 ? '' : 's'} need${dataIssues.length === 1 ? 's' : ''} review`,
      linkType: 'route',
      linkId: '/guests/reports',
    });
  }

  return items;
}

/**
 * Logistics-related Attention Required items: unassigned pickups, guests
 * needing a room, vehicle capacity conflicts, routes without a driver, and
 * guests arriving within 7 days whose travel/accommodation/pickup chain is
 * still incomplete. Deliberately narrow — the full 17-check list lives in
 * Logistics > Reports > Data Issues, not on the main dashboard.
 */
export function buildLogisticsAttentionItems(
  guests: Guest[],
  travelSegments: TravelSegment[],
  roomAssignments: RoomAssignment[],
  vehicles: Vehicle[],
  routes: TransportRoute[],
  transportAssignments: TransportAssignment[],
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const activeTransport = transportAssignments.filter(isTransportAssignmentActive);
  const assignedSegmentIds = new Set(activeTransport.map((a) => a.travelSegmentId).filter(Boolean));

  for (const segment of travelSegments) {
    if (segment.direction === 'Arrival' && segment.pickupRequired && !assignedSegmentIds.has(segment.id)) {
      const guestName = guestById.get(segment.guestId)?.fullName ?? 'A guest';
      const arrivesSoon = daysUntil(segment.arrivalDate) !== null && daysUntil(segment.arrivalDate)! <= 7 && daysUntil(segment.arrivalDate)! >= 0;
      items.push({
        id: `logistics-pickup-unassigned-${segment.id}`,
        severity: arrivesSoon ? 'critical' : 'warning',
        message: `Pickup unassigned for "${guestName}" (${segment.destination})`,
        linkType: 'travel',
        linkId: segment.id,
      });
    }
  }

  const unassignedAccommodationGuests = findGuestsRequiringAccommodationUnassigned(guests, roomAssignments);
  for (const guest of unassignedAccommodationGuests) {
    items.push({
      id: `logistics-room-unassigned-${guest.id}`,
      severity: 'warning',
      message: `Room unassigned for "${guest.fullName}"`,
      linkType: 'guest',
      linkId: guest.id,
    });
  }

  const unassignedAccommodationGuestIds = new Set(unassignedAccommodationGuests.map((g) => g.id));
  for (const segment of travelSegments) {
    if (segment.direction !== 'Arrival') continue;
    const arrivesSoon = daysUntil(segment.arrivalDate) !== null && daysUntil(segment.arrivalDate)! <= 7 && daysUntil(segment.arrivalDate)! >= 0;
    if (!arrivesSoon || !unassignedAccommodationGuestIds.has(segment.guestId)) continue;
    const guestName = guestById.get(segment.guestId)?.fullName ?? 'A guest';
    items.push({
      id: `logistics-arrival-soon-no-room-${segment.id}`,
      severity: 'critical',
      message: `"${guestName}" arrives within 7 days but still has no room assigned`,
      linkType: 'guest',
      linkId: segment.guestId,
    });
  }

  for (const route of routes) {
    if (route.vehicleId) {
      const vehicle = vehicleById.get(route.vehicleId);
      if (vehicle && seatsAssignedForRoute(transportAssignments, route.id) > vehicle.passengerCapacity) {
        items.push({
          id: `logistics-vehicle-capacity-${route.id}`,
          severity: 'critical',
          message: `Vehicle capacity exceeded on route "${route.name}"`,
          linkType: 'route',
          linkId: '/logistics/transport',
        });
      }
    }
    if (!route.driverId) {
      items.push({
        id: `logistics-route-no-driver-${route.id}`,
        severity: 'warning',
        message: `Route "${route.name}" has no driver assigned`,
        linkType: 'route',
        linkId: '/logistics/transport',
      });
    }
  }

  return items;
}

const WEDDING_PREP_ATTENTION_ROUTES: Partial<Record<WeddingPrepIssueCategory, string>> = {
  'church-requirement-overdue': '/wedding-prep/church',
  'critical-ceremony-item-unverified': '/wedding-prep/ceremony-items',
  'decor-install-timing-conflict': '/wedding-prep/decor',
};

/**
 * Wedding-prep-related Attention Required items: overdue church requirements,
 * unverified critical ceremony items close to the wedding, and décor install
 * timing conflicts surface individually; everything else from the full
 * 24-check list rolls up into a single summary item. Deliberately narrow —
 * the full list lives in Wedding Prep > Reports > Data Issues, not on the
 * main dashboard.
 */
export function buildWeddingPrepAttentionItems(issues: WeddingPrepIssue[]): AttentionItem[] {
  const items: AttentionItem[] = [];
  let rolledUp = 0;

  for (const issue of issues) {
    const route = WEDDING_PREP_ATTENTION_ROUTES[issue.category];
    if (route) {
      items.push({ id: `wedding-prep-${issue.id}`, severity: 'critical', message: issue.message, linkType: 'route', linkId: route });
    } else {
      rolledUp += 1;
    }
  }

  if (rolledUp > 0) {
    items.push({
      id: 'wedding-prep-issues-summary',
      severity: 'warning',
      message: `${rolledUp} other wedding prep issue${rolledUp === 1 ? '' : 's'} need${rolledUp === 1 ? 's' : ''} review`,
      linkType: 'route',
      linkId: '/wedding-prep/reports',
    });
  }

  return items;
}

const VENDOR_STATUSES_EXPECTING_CONTRACT: Vendor['status'][] = ['Selected', 'Contracted', 'Confirmed', 'Completed'];

/**
 * Finance-related Attention Required items: overdue payments, vendors
 * missing a contract, critical vendors not reconfirmed within the
 * threshold window, budget categories over their plan, and overdue
 * refunds. Deliberately narrow — the full 17-check list lives in
 * Vendors & Budget > Reports > Data Issues, not on the main dashboard.
 */
export function buildFinanceAttentionItems(
  vendors: Vendor[],
  contracts: Contract[],
  budgetCategories: BudgetCategory[],
  budgetItems: BudgetItem[],
  paymentSchedules: PaymentSchedule[],
  payments: Payment[],
  refunds: Refund[],
  criticalVendorCategories: string[],
  weddingDateTimeISO: string,
  reconfirmationHoursThreshold: number,
  budgetVarianceWarningPercent: number,
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const vendorById = new Map(vendors.map((v) => [v.id, v]));

  for (const schedule of paymentSchedules) {
    if (computePaymentScheduleStatus(schedule, payments) === 'Overdue') {
      const vendor = vendorById.get(schedule.vendorId);
      items.push({
        id: `finance-payment-overdue-${schedule.id}`,
        severity: 'critical',
        message: `Payment "${schedule.milestone}" overdue for "${vendor?.name ?? 'a vendor'}"`,
        linkType: 'vendor',
        linkId: schedule.vendorId,
      });
    }
  }

  const contractsByVendor = new Set(contracts.map((c) => c.vendorId));
  for (const vendor of vendors) {
    if (VENDOR_STATUSES_EXPECTING_CONTRACT.includes(vendor.status) && !contractsByVendor.has(vendor.id)) {
      items.push({
        id: `finance-contract-missing-${vendor.id}`,
        severity: 'warning',
        message: `"${vendor.name}" is ${vendor.status} but has no contract on file`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }
    if (isCriticalVendorNotReconfirmed(vendor, criticalVendorCategories, weddingDateTimeISO, reconfirmationHoursThreshold, new Date().toISOString())) {
      items.push({
        id: `finance-not-reconfirmed-${vendor.id}`,
        severity: 'critical',
        message: `Critical vendor "${vendor.name}" has not been reconfirmed within ${reconfirmationHoursThreshold} hours of the wedding`,
        linkType: 'vendor',
        linkId: vendor.id,
      });
    }
  }

  for (const category of budgetCategories) {
    const summary = computeCategorySummary(category, budgetItems, budgetVarianceWarningPercent);
    if (summary.isOverThreshold) {
      items.push({
        id: `finance-budget-over-${category.id}`,
        severity: 'warning',
        message: `"${category.name}" is more than ${budgetVarianceWarningPercent}% over its planned budget`,
        linkType: 'route',
        linkId: '/vendors/budget',
      });
    }
  }

  const today = todayISO();
  for (const refund of refunds) {
    if ((refund.status === 'Expected' || refund.status === 'Partially Received') && refund.expectedDate && refund.expectedDate < today) {
      const vendor = vendorById.get(refund.vendorId);
      items.push({
        id: `finance-refund-overdue-${refund.id}`,
        severity: 'warning',
        message: `${refund.refundType} refund overdue from "${vendor?.name ?? 'a vendor'}"`,
        linkType: 'vendor',
        linkId: refund.vendorId,
      });
    }
  }

  return items;
}
