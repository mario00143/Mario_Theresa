import { useCallback } from 'react';
import type { Vendor } from '@/types';
import { vendorsStore } from '@/data/stores';
import { addVendor, confirmVendor, deleteVendor, updateVendor, type NewVendorInput } from '@/data/repositories/vendorRepository';
import { useStoreValue } from './useStore';

export function useVendors() {
  const vendors = useStoreValue(vendorsStore);

  return {
    vendors,
    addVendor: useCallback((input: NewVendorInput) => addVendor(input), []),
    updateVendor: useCallback((id: string, patch: Partial<Omit<Vendor, 'id' | 'createdAt'>>) => updateVendor(id, patch), []),
    deleteVendor: useCallback((id: string) => deleteVendor(id), []),
    confirmVendor: useCallback((id: string, patch: Parameters<typeof confirmVendor>[1]) => confirmVendor(id, patch), []),
  };
}

export function useVendor(id: string | undefined): Vendor | undefined {
  const vendors = useStoreValue(vendorsStore);
  return id ? vendors.find((v) => v.id === id) : undefined;
}
