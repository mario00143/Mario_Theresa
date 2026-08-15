import type { TransportRoute } from '@/types';
import { generateId } from '@/lib/id';
import { transportAssignmentsStore, transportRoutesStore } from '../stores';

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

/** Deletes a route and cascades: any transport assignments on that route are removed too. */
export function deleteTransportRoute(id: string): void {
  transportRoutesStore.set((prev) => prev.filter((r) => r.id !== id));
  transportAssignmentsStore.set((prev) => prev.filter((a) => a.routeId !== id));
}
