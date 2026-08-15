import type { Driver } from '@/types';
import { generateId } from '@/lib/id';
import { driversStore } from '../stores';

export type NewDriverInput = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addDriver(input: NewDriverInput): Driver {
  const timestamp = nowISO();
  const driver: Driver = { ...input, id: generateId('driver'), createdAt: timestamp, updatedAt: timestamp };
  driversStore.set((prev) => [...prev, driver]);
  return driver;
}

export function updateDriver(id: string, patch: Partial<Omit<Driver, 'id' | 'createdAt'>>): void {
  driversStore.set((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowISO() } : d)));
}

export function deleteDriver(id: string): void {
  driversStore.set((prev) => prev.filter((d) => d.id !== id));
}
