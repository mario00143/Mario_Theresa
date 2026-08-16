import type { VendorDayStatus, VendorDayStatusValue } from '@/types';
import { generateId } from '@/lib/id';
import { vendorDayStatusesStore } from '../stores';

export type NewVendorDayStatusInput = Omit<
  VendorDayStatus,
  'id' | 'createdAt' | 'updatedAt' | 'primaryContactConfirmed' | 'setupComplete' | 'serviceReady' | 'finalSettlementChecked'
> &
  Partial<Pick<VendorDayStatus, 'primaryContactConfirmed' | 'setupComplete' | 'serviceReady' | 'finalSettlementChecked'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addVendorDayStatus(input: NewVendorDayStatusInput): VendorDayStatus {
  const timestamp = nowISO();
  const status: VendorDayStatus = {
    primaryContactConfirmed: false,
    setupComplete: false,
    serviceReady: false,
    finalSettlementChecked: false,
    ...input,
    id: generateId('vendorday'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  vendorDayStatusesStore.set((prev) => [...prev, status]);
  return status;
}

export function updateVendorDayStatus(id: string, patch: Partial<Omit<VendorDayStatus, 'id' | 'createdAt'>>): void {
  vendorDayStatusesStore.set((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: nowISO() } : s)));
}

export function deleteVendorDayStatus(id: string): void {
  vendorDayStatusesStore.set((prev) => prev.filter((s) => s.id !== id));
}

function setStatus(id: string, status: VendorDayStatusValue, extra: Partial<VendorDayStatus> = {}): void {
  updateVendorDayStatus(id, { status, ...extra });
}

export function markVendorEnRoute(id: string): void {
  setStatus(id, 'En Route');
}

export function checkInVendor(id: string, actualArrivalTime: string = nowISO()): void {
  setStatus(id, 'Arrived', { actualArrivalTime, primaryContactConfirmed: true });
}

export function markVendorReady(id: string): void {
  setStatus(id, 'Ready', { setupComplete: true, serviceReady: true });
}

export function markVendorDelayed(id: string): void {
  setStatus(id, 'Delayed');
}

export function markVendorCompleted(id: string, actualDepartureTime: string = nowISO()): void {
  setStatus(id, 'Completed', { actualDepartureTime });
}

export function markVendorNoShow(id: string): void {
  setStatus(id, 'No Show');
}
