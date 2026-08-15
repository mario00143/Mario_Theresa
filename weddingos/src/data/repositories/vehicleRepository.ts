import type { Vehicle } from '@/types';
import { generateId } from '@/lib/id';
import { driversStore, vehiclesStore } from '../stores';

export type NewVehicleInput = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addVehicle(input: NewVehicleInput): Vehicle {
  const timestamp = nowISO();
  const vehicle: Vehicle = { ...input, id: generateId('vehicle'), createdAt: timestamp, updatedAt: timestamp };
  vehiclesStore.set((prev) => [...prev, vehicle]);
  return vehicle;
}

export function updateVehicle(id: string, patch: Partial<Omit<Vehicle, 'id' | 'createdAt'>>): void {
  vehiclesStore.set((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: nowISO() } : v)));
}

/** Deletes a vehicle and un-links any driver currently assigned to it. */
export function deleteVehicle(id: string): void {
  vehiclesStore.set((prev) => prev.filter((v) => v.id !== id));
  driversStore.set((prev) => prev.map((d) => (d.vehicleId === id ? { ...d, vehicleId: undefined, updatedAt: nowISO() } : d)));
}
