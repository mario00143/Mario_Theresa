import type { VendorContact } from '@/types';
import { generateId } from '@/lib/id';
import { vendorContactsStore, vendorsStore } from '../stores';

export type NewVendorContactInput = Omit<VendorContact, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addVendorContact(input: NewVendorContactInput): VendorContact {
  const timestamp = nowISO();
  const contact: VendorContact = { ...input, id: generateId('vendorcontact'), createdAt: timestamp, updatedAt: timestamp };
  vendorContactsStore.set((prev) => [...prev, contact]);
  return contact;
}

export function updateVendorContact(id: string, patch: Partial<Omit<VendorContact, 'id' | 'createdAt'>>): void {
  vendorContactsStore.set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)));
}

/** Deletes a contact and un-links it if it was set as a vendor's primary or backup contact. */
export function deleteVendorContact(id: string): void {
  vendorContactsStore.set((prev) => prev.filter((c) => c.id !== id));
  vendorsStore.set((prev) =>
    prev.map((v) => {
      if (v.primaryContactId !== id && v.backupContactId !== id) return v;
      return {
        ...v,
        primaryContactId: v.primaryContactId === id ? undefined : v.primaryContactId,
        backupContactId: v.backupContactId === id ? undefined : v.backupContactId,
        updatedAt: nowISO(),
      };
    }),
  );
}
