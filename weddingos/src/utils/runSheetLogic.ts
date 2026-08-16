import type { AppSettings, RunSheetItem } from '@/types';
import { receptionDateTimeISO, weddingDateTimeISO } from './date';

/** Resolves the "R" or "C" anchor datetime for a relative-reference run-sheet item, or null for fixed-time items. */
function anchorDateTimeISO(item: RunSheetItem, settings: AppSettings): string | null {
  if (item.relativeReference === 'Ceremony Start') return weddingDateTimeISO(settings);
  if (item.relativeReference === 'Reception Start') return receptionDateTimeISO(settings);
  return null;
}

/**
 * The item's planned date/time as an ISO string, computed live from
 * settings for relative items (never persisted, so it always reflects the
 * latest ceremony/reception time — section 6) or read directly from the
 * stored startTime for fixed items.
 */
export function resolveRunSheetPlannedDateTimeISO(item: RunSheetItem, settings: AppSettings): string | null {
  const anchor = anchorDateTimeISO(item, settings);
  if (anchor !== null) {
    const offset = item.relativeOffsetMinutes ?? 0;
    const anchorTime = new Date(anchor).getTime();
    if (Number.isNaN(anchorTime)) return null;
    return new Date(anchorTime + offset * 60_000).toISOString();
  }
  if (!item.startTime) return null;
  return `${item.date}T${item.startTime}:00`;
}

/** Human label for the relative reference, e.g. "C-180" -> "3h00m before Ceremony Start". Fixed items get their clock time. */
export function formatRunSheetRelativeLabel(item: RunSheetItem): string {
  if (item.relativeReference === 'None') return item.startTime ?? '—';
  const offset = item.relativeOffsetMinutes ?? 0;
  const anchorShort = item.relativeReference === 'Ceremony Start' ? 'C' : 'R';
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  const duration = hours > 0 ? `${hours}h${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
  return `${anchorShort}${sign}${abs} (${duration} ${offset >= 0 ? 'after' : 'before'} ${item.relativeReference})`;
}

/** Sorts run-sheet items by their resolved planned time (items with no resolvable time sort last, in original order). */
export function sortRunSheetItems(items: RunSheetItem[], settings: AppSettings): RunSheetItem[] {
  return [...items].sort((a, b) => {
    const aTime = resolveRunSheetPlannedDateTimeISO(a, settings);
    const bTime = resolveRunSheetPlannedDateTimeISO(b, settings);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime.localeCompare(bTime);
  });
}

/**
 * The item that should be happening "now" (section 8): the last item
 * that's In Progress or Delayed, or failing that the most recent
 * Planned/Ready item whose planned time has already passed and that
 * isn't yet Complete/Skipped/Cancelled.
 */
export function getCurrentRunSheetItem(items: RunSheetItem[], settings: AppSettings, referenceDateTimeISO: string): RunSheetItem | undefined {
  const sorted = sortRunSheetItems(items, settings);
  const inProgress = sorted.find((i) => i.status === 'In Progress' || i.status === 'Delayed');
  if (inProgress) return inProgress;

  const now = new Date(referenceDateTimeISO).getTime();
  const candidates = sorted.filter((i) => {
    if (i.status === 'Complete' || i.status === 'Skipped' || i.status === 'Cancelled') return false;
    const planned = resolveRunSheetPlannedDateTimeISO(i, settings);
    if (planned === null) return false;
    return new Date(planned).getTime() <= now;
  });
  return candidates.at(-1);
}

/** The next N items after "now", in planned order, excluding anything already finished/cancelled/skipped or currently in progress (section 8). */
export function getNextRunSheetItems(items: RunSheetItem[], settings: AppSettings, referenceDateTimeISO: string, count = 3): RunSheetItem[] {
  const sorted = sortRunSheetItems(items, settings);
  const now = new Date(referenceDateTimeISO).getTime();
  const current = getCurrentRunSheetItem(items, settings, referenceDateTimeISO);
  return sorted
    .filter((i) => i.id !== current?.id)
    .filter((i) => i.status !== 'Complete' && i.status !== 'Skipped' && i.status !== 'Cancelled' && i.status !== 'In Progress' && i.status !== 'Delayed')
    .filter((i) => {
      const planned = resolveRunSheetPlannedDateTimeISO(i, settings);
      return planned === null || new Date(planned).getTime() > now;
    })
    .slice(0, count);
}

/** Formats a resolved planned/proposed ISO datetime as a local clock time (Asia/Kolkata via the browser's own timezone). */
export function formatRunSheetClockTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export type RunSheetTimingLabel = 'Ahead' | 'On Time' | string;

/**
 * Compares actual progress against the plan (section 9): "Ahead",
 * "On Time" (within a 5-minute tolerance), or "Running X min late".
 * Uses actualStartTime if the item has started, otherwise the reference
 * time itself against the planned time.
 */
export function computeRunSheetTimingStatus(item: RunSheetItem, settings: AppSettings, referenceDateTimeISO: string): RunSheetTimingLabel {
  const planned = resolveRunSheetPlannedDateTimeISO(item, settings);
  if (planned === null) return 'On Time';
  const plannedTime = new Date(planned).getTime();
  const compareTime = new Date(item.actualStartTime ?? referenceDateTimeISO).getTime();
  const diffMinutes = Math.round((compareTime - plannedTime) / 60_000);
  if (diffMinutes <= -5) return 'Ahead';
  if (diffMinutes <= 5) return 'On Time';
  return `Running ${diffMinutes} min late`;
}
