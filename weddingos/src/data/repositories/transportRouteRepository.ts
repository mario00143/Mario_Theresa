import type { TransportRoute } from '@/types';
import { generateId } from '@/lib/id';
import { liveIssuesStore, runSheetItemsStore, transportAssignmentsStore, transportRoutesStore } from '../stores';

export type NewTransportRouteInput = Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addTransportRoute(input: NewTransportRouteInput): TransportRoute {
  const timestamp = nowISO();
  const route: TransportRoute = { ...input, id: generateId('route'), createdAt: timestamp, updatedAt: timestamp };
  transportRoutesStore.set((prev) => [...prev, route]);
  return route;
}

export function updateTransportRoute(id: string, patch: Partial<Omit<TransportRoute, 'id' | 'createdAt'>>): void {
  transportRoutesStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r)));
}

/** Deletes a route and cascades: any transport assignments on that route are removed too. Un-links Phase 6 references. */
export function deleteTransportRoute(id: string): void {
  transportRoutesStore.set((prev) => prev.filter((r) => r.id !== id));
  transportAssignmentsStore.set((prev) => prev.filter((a) => a.routeId !== id));
  runSheetItemsStore.set((prev) =>
    prev.map((r) =>
      r.relatedTransportRouteIds.includes(id) ? { ...r, relatedTransportRouteIds: r.relatedTransportRouteIds.filter((rid) => rid !== id), updatedAt: nowISO() } : r,
    ),
  );
  liveIssuesStore.set((prev) => prev.map((i) => (i.relatedTransportRouteId === id ? { ...i, relatedTransportRouteId: undefined, updatedAt: nowISO() } : i)));
}
