import type { AppSettings, PhotographyPlan, RunSheetItem, TransportRoute } from '@/types';
import { receptionDateTimeISO, weddingDateTimeISO } from './date';
import { resolveRunSheetPlannedDateTimeISO } from './runSheetLogic';

export interface DelayConflictContext {
  churchAccessStartDateTimeISO?: string;
  photographyPlans?: PhotographyPlan[];
  transportRoutes?: TransportRoute[];
}

function transportRouteDepartureISO(route: TransportRoute): string | null {
  if (!route.plannedDepartureDate) return null;
  return `${route.plannedDepartureDate}T${route.plannedDepartureTime ?? '00:00'}:00`;
}

/**
 * Checks a single item's proposed (shifted) time against the known
 * hard constraints listed in section 11. Only checks the constraints
 * relevant to the item's category and to data actually on file — this is
 * a warning system, not an auto-resolver.
 */
export function detectDelayConflicts(item: RunSheetItem, proposedDateTimeISO: string, settings: AppSettings, context: DelayConflictContext = {}): string[] {
  const conflicts: string[] = [];
  const proposed = new Date(proposedDateTimeISO).getTime();
  if (Number.isNaN(proposed)) return conflicts;

  const ceremonyStart = new Date(weddingDateTimeISO(settings)).getTime();
  const receptionStart = new Date(receptionDateTimeISO(settings)).getTime();

  if ((item.category === 'Ceremony' || item.category === 'Church') && proposed > ceremonyStart) {
    conflicts.push('Ceremony start conflict — proposed time falls at or after the ceremony start.');
  }

  if (item.category === 'Church' && context.churchAccessStartDateTimeISO) {
    const access = new Date(context.churchAccessStartDateTimeISO).getTime();
    if (!Number.isNaN(access) && proposed < access) {
      conflicts.push('Venue access violation — proposed time falls before church access opens.');
    }
  }

  if (item.category === 'Catering' && proposed > receptionStart) {
    conflicts.push('Catering service timing conflict — proposed time falls after reception start.');
  }

  if (item.relatedTransportRouteIds.length > 0 && context.transportRoutes) {
    for (const routeId of item.relatedTransportRouteIds) {
      const route = context.transportRoutes.find((r) => r.id === routeId);
      const departureISO = route ? transportRouteDepartureISO(route) : null;
      if (!departureISO) continue;
      const departure = new Date(departureISO).getTime();
      if (!Number.isNaN(departure) && proposed > departure) {
        conflicts.push(`Transport departure conflict — route "${route!.name}" is scheduled to depart before the proposed time.`);
      }
    }
  }

  if (item.category === 'Vendor' && item.endTime && item.date) {
    const contractedEnd = new Date(`${item.date}T${item.endTime}:00`).getTime();
    if (!Number.isNaN(contractedEnd) && proposed > contractedEnd) {
      conflicts.push('Vendor contracted end time conflict — proposed time falls after this item\'s scheduled end.');
    }
  }

  if (item.category === 'Guest Arrival' && proposed > ceremonyStart) {
    conflicts.push('Guest arrival/departure conflict — guests would arrive at or after the ceremony start.');
  }

  if (item.category === 'Photography' && context.photographyPlans) {
    const relevantPlan = context.photographyPlans.find((p) => p.event === item.event);
    if (relevantPlan?.coverageEnd) {
      const coverageEnd = new Date(relevantPlan.coverageEnd).getTime();
      if (!Number.isNaN(coverageEnd) && proposed > coverageEnd) {
        conflicts.push('Photography coverage conflict — proposed time falls after the booked coverage window ends.');
      }
    }
  }

  if (item.category === 'Music / AV' && proposed > receptionStart) {
    conflicts.push('Sound/AV window conflict — proposed time falls after reception start.');
  }

  return conflicts;
}

export interface DelayPropagationRow {
  itemId: string;
  activity: string;
  originalDateTimeISO: string | null;
  proposedDateTimeISO: string | null;
  owner?: string;
  vendorIds: string[];
  conflicts: string[];
}

/**
 * Finds every run-sheet item that (directly or transitively) depends on
 * sourceItemId and previews what a shiftMinutes delay would do to each —
 * without mutating anything (section 10). The caller decides which rows,
 * if any, to actually apply via applyDelayShift.
 */
export function computeDelayPropagationPreview(
  sourceItemId: string,
  shiftMinutes: number,
  allItems: RunSheetItem[],
  settings: AppSettings,
  context: DelayConflictContext = {},
): DelayPropagationRow[] {
  const dependents = new Set<string>();
  let frontier = [sourceItemId];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const item of allItems) {
      if (frontier.includes(item.id)) continue;
      if (item.dependencyIds.some((d) => frontier.includes(d)) && !dependents.has(item.id)) {
        dependents.add(item.id);
        next.push(item.id);
      }
    }
    frontier = next;
  }

  return allItems
    .filter((i) => dependents.has(i.id))
    .map((item) => {
      const original = resolveRunSheetPlannedDateTimeISO(item, settings);
      const proposed = original ? new Date(new Date(original).getTime() + shiftMinutes * 60_000).toISOString() : null;
      return {
        itemId: item.id,
        activity: item.activity,
        originalDateTimeISO: original,
        proposedDateTimeISO: proposed,
        owner: item.owner,
        vendorIds: item.vendorIds,
        conflicts: proposed ? detectDelayConflicts(item, proposed, settings, context) : [],
      };
    });
}
