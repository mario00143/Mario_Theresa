import { useCallback } from 'react';
import type { Driver } from '@/types';
import { driversStore } from '@/data/stores';
import { addDriver, deleteDriver, updateDriver, type NewDriverInput } from '@/data/repositories/driverRepository';
import { useStoreValue } from './useStore';

export function useDrivers() {
  const drivers = useStoreValue(driversStore);

  return {
    drivers,
    addDriver: useCallback((input: NewDriverInput) => addDriver(input), []),
    updateDriver: useCallback((id: string, patch: Partial<Omit<Driver, 'id' | 'createdAt'>>) => updateDriver(id, patch), []),
    deleteDriver: useCallback((id: string) => deleteDriver(id), []),
  };
}

export function useDriver(id: string | undefined): Driver | undefined {
  const drivers = useStoreValue(driversStore);
  return id ? drivers.find((d) => d.id === id) : undefined;
}
