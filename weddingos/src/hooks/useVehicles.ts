import { useCallback } from 'react';
import type { Vehicle } from '@/types';
import { vehiclesStore } from '@/data/stores';
import { addVehicle, deleteVehicle, updateVehicle, type NewVehicleInput } from '@/data/repositories/vehicleRepository';
import { useStoreValue } from './useStore';

export function useVehicles() {
  const vehicles = useStoreValue(vehiclesStore);

  return {
    vehicles,
    addVehicle: useCallback((input: NewVehicleInput) => addVehicle(input), []),
    updateVehicle: useCallback((id: string, patch: Partial<Omit<Vehicle, 'id' | 'createdAt'>>) => updateVehicle(id, patch), []),
    deleteVehicle: useCallback((id: string) => deleteVehicle(id), []),
  };
}

export function useVehicle(id: string | undefined): Vehicle | undefined {
  const vehicles = useStoreValue(vehiclesStore);
  return id ? vehicles.find((v) => v.id === id) : undefined;
}
