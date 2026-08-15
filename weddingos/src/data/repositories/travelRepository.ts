import type { TravelSegment } from '@/types';
import { generateId } from '@/lib/id';
import { travelSegmentsStore } from '../stores';

export type NewTravelSegmentInput = Omit<TravelSegment, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addTravelSegment(input: NewTravelSegmentInput): TravelSegment {
  const timestamp = nowISO();
  const segment: TravelSegment = {
    ...input,
    id: generateId('travel'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  travelSegmentsStore.set((prev) => [...prev, segment]);
  return segment;
}

export function updateTravelSegment(id: string, patch: Partial<Omit<TravelSegment, 'id' | 'createdAt'>>): void {
  travelSegmentsStore.set((prev) =>
    prev.map((segment) => (segment.id === id ? { ...segment, ...patch, updatedAt: nowISO() } : segment)),
  );
}

export function deleteTravelSegment(id: string): void {
  travelSegmentsStore.set((prev) => prev.filter((segment) => segment.id !== id));
}

export function duplicateTravelSegment(id: string): TravelSegment | null {
  const source = travelSegmentsStore.get().find((s) => s.id === id);
  if (!source) return null;
  const timestamp = nowISO();
  const duplicate: TravelSegment = {
    ...source,
    id: generateId('travel'),
    bookingReference: undefined,
    ticketConfirmed: false,
    bookingStatus: 'Not Booked',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  travelSegmentsStore.set((prev) => [...prev, duplicate]);
  return duplicate;
}
