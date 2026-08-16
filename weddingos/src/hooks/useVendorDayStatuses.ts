import { useCallback } from 'react';
import type { VendorDayStatus } from '@/types';
import { vendorDayStatusesStore } from '@/data/stores';
import {
  addVendorDayStatus,
  checkInVendor,
  deleteVendorDayStatus,
  markVendorCompleted,
  markVendorDelayed,
  markVendorEnRoute,
  markVendorNoShow,
  markVendorReady,
  updateVendorDayStatus,
  type NewVendorDayStatusInput,
} from '@/data/repositories/vendorDayStatusRepository';
import { useStoreValue } from './useStore';

export function useVendorDayStatuses() {
  const statuses = useStoreValue(vendorDayStatusesStore);

  return {
    vendorDayStatuses: statuses,
    addVendorDayStatus: useCallback((input: NewVendorDayStatusInput) => addVendorDayStatus(input), []),
    updateVendorDayStatus: useCallback((id: string, patch: Partial<Omit<VendorDayStatus, 'id' | 'createdAt'>>) => updateVendorDayStatus(id, patch), []),
    deleteVendorDayStatus: useCallback((id: string) => deleteVendorDayStatus(id), []),
    markVendorEnRoute: useCallback((id: string) => markVendorEnRoute(id), []),
    checkInVendor: useCallback((id: string, actualArrivalTime?: string) => checkInVendor(id, actualArrivalTime), []),
    markVendorReady: useCallback((id: string) => markVendorReady(id), []),
    markVendorDelayed: useCallback((id: string) => markVendorDelayed(id), []),
    markVendorCompleted: useCallback((id: string, actualDepartureTime?: string) => markVendorCompleted(id, actualDepartureTime), []),
    markVendorNoShow: useCallback((id: string) => markVendorNoShow(id), []),
  };
}

export function useVendorDayStatusForVendor(vendorId: string | undefined): VendorDayStatus | undefined {
  const statuses = useStoreValue(vendorDayStatusesStore);
  return vendorId ? statuses.find((s) => s.vendorId === vendorId) : undefined;
}
