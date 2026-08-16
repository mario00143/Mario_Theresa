import { useCallback } from 'react';
import type { VendorContact } from '@/types';
import { vendorContactsStore } from '@/data/stores';
import {
  addVendorContact,
  deleteVendorContact,
  updateVendorContact,
  type NewVendorContactInput,
} from '@/data/repositories/vendorContactRepository';
import { useStoreValue } from './useStore';

export function useVendorContacts() {
  const vendorContacts = useStoreValue(vendorContactsStore);

  return {
    vendorContacts,
    addVendorContact: useCallback((input: NewVendorContactInput) => addVendorContact(input), []),
    updateVendorContact: useCallback(
      (id: string, patch: Partial<Omit<VendorContact, 'id' | 'createdAt'>>) => updateVendorContact(id, patch),
      [],
    ),
    deleteVendorContact: useCallback((id: string) => deleteVendorContact(id), []),
  };
}

export function useVendorContactsForVendor(vendorId: string | undefined): VendorContact[] {
  const vendorContacts = useStoreValue(vendorContactsStore);
  return vendorId ? vendorContacts.filter((c) => c.vendorId === vendorId) : [];
}
