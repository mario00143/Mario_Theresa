import type { RunSheetItem, RunSheetStatus } from '@/types';
import { generateId } from '@/lib/id';
import { liveIssuesStore, runSheetItemsStore } from '../stores';

export type NewRunSheetItemInput = Omit<
  RunSheetItem,
  'id' | 'createdAt' | 'updatedAt' | 'participantIds' | 'vendorIds' | 'requiredItemIds' | 'relatedTaskIds' | 'relatedTransportRouteIds' | 'dependencyIds'
> &
  Partial<Pick<RunSheetItem, 'participantIds' | 'vendorIds' | 'requiredItemIds' | 'relatedTaskIds' | 'relatedTransportRouteIds' | 'dependencyIds'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addRunSheetItem(input: NewRunSheetItemInput): RunSheetItem {
  const timestamp = nowISO();
  const item: RunSheetItem = {
    participantIds: [],
    vendorIds: [],
    requiredItemIds: [],
    relatedTaskIds: [],
    relatedTransportRouteIds: [],
    dependencyIds: [],
    ...input,
    id: generateId('runsheet'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  runSheetItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateRunSheetItem(id: string, patch: Partial<Omit<RunSheetItem, 'id' | 'createdAt'>>): void {
  runSheetItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

/**
 * Deletes a run-sheet item and un-links it from any other item's
 * dependencyIds (dependencies reference items, not the other way around,
 * so there is nothing to cascade — just stale references to clean up).
 */
export function deleteRunSheetItem(id: string): void {
  runSheetItemsStore.set((prev) =>
    prev.filter((i) => i.id !== id).map((i) => (i.dependencyIds.includes(id) ? { ...i, dependencyIds: i.dependencyIds.filter((d) => d !== id), updatedAt: nowISO() } : i)),
  );
  liveIssuesStore.set((prev) => prev.map((i) => (i.relatedRunSheetItemId === id ? { ...i, relatedRunSheetItemId: undefined, updatedAt: nowISO() } : i)));
}

function setStatus(id: string, status: RunSheetStatus, extra: Partial<RunSheetItem> = {}): void {
  runSheetItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, status, ...extra, updatedAt: nowISO() } : i)));
}

/** Quick action: marks an item In Progress and stamps actualStartTime if not already set. */
export function startRunSheetItem(id: string, referenceDateTimeISO: string = nowISO()): void {
  runSheetItemsStore.set((prev) =>
    prev.map((i) => (i.id === id ? { ...i, status: 'In Progress', actualStartTime: i.actualStartTime ?? referenceDateTimeISO, updatedAt: nowISO() } : i)),
  );
}

/** Quick action: marks an item Complete and stamps actualEndTime. */
export function completeRunSheetItem(id: string, referenceDateTimeISO: string = nowISO()): void {
  setStatus(id, 'Complete', { actualEndTime: referenceDateTimeISO });
}

/** Records a delay without touching any other item's planned time — propagation is a separate, explicit user action (section 10). */
export function delayRunSheetItem(id: string, delayMinutes: number, reason?: string): void {
  runSheetItemsStore.set((prev) =>
    prev.map((i) =>
      i.id === id
        ? { ...i, status: 'Delayed', delayMinutes, notes: reason ? [i.notes, `Delay: ${reason}`].filter(Boolean).join('\n') : i.notes, updatedAt: nowISO() }
        : i,
    ),
  );
}

/** Applies a delay shift to a specific set of dependent items' delayMinutes, after the user has reviewed the propagation preview and chosen which to apply. Appends an audit note. */
export function applyDelayShift(itemIds: string[], shiftMinutes: number, auditNote: string): void {
  const timestamp = nowISO();
  runSheetItemsStore.set((prev) =>
    prev.map((i) =>
      itemIds.includes(i.id)
        ? { ...i, delayMinutes: (i.delayMinutes ?? 0) + shiftMinutes, notes: [i.notes, auditNote].filter(Boolean).join('\n'), updatedAt: timestamp }
        : i,
    ),
  );
}
