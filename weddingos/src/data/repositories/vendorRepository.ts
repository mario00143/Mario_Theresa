import type { Vendor } from '@/types';
import { generateId } from '@/lib/id';
import {
  budgetItemsStore,
  contractsStore,
  hotelsStore,
  paymentSchedulesStore,
  paymentsStore,
  refundsStore,
  vehiclesStore,
  vendorContactsStore,
  vendorQuotesStore,
  vendorsStore,
} from '../stores';

export type NewVendorInput = Omit<
  Vendor,
  'id' | 'createdAt' | 'updatedAt' | 'finalPrimaryContactConfirmed' | 'finalBackupContactConfirmed'
> &
  Partial<Pick<Vendor, 'finalPrimaryContactConfirmed' | 'finalBackupContactConfirmed'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addVendor(input: NewVendorInput): Vendor {
  const timestamp = nowISO();
  const vendor: Vendor = {
    finalPrimaryContactConfirmed: false,
    finalBackupContactConfirmed: false,
    ...input,
    id: generateId('vendor'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  vendorsStore.set((prev) => [...prev, vendor]);
  return vendor;
}

export function updateVendor(id: string, patch: Partial<Omit<Vendor, 'id' | 'createdAt'>>): void {
  vendorsStore.set((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: nowISO() } : v)));
}

/**
 * Deletes a vendor and cascades to its owned records (contacts, quotes,
 * contracts, payment schedules, payments, refunds). Un-links (rather than
 * deletes) records that merely reference the vendor optionally, since those
 * — budget items, hotels, vehicles — can stand on their own.
 */
export function deleteVendor(id: string): void {
  vendorsStore.set((prev) => prev.filter((v) => v.id !== id));
  vendorContactsStore.set((prev) => prev.filter((c) => c.vendorId !== id));
  vendorQuotesStore.set((prev) => prev.filter((q) => q.vendorId !== id));
  contractsStore.set((prev) => prev.filter((c) => c.vendorId !== id));
  paymentSchedulesStore.set((prev) => prev.filter((s) => s.vendorId !== id));
  paymentsStore.set((prev) => prev.filter((p) => p.vendorId !== id));
  refundsStore.set((prev) => prev.filter((r) => r.vendorId !== id));
  budgetItemsStore.set((prev) => prev.map((item) => (item.vendorId === id ? { ...item, vendorId: undefined, updatedAt: nowISO() } : item)));
  hotelsStore.set((prev) => prev.map((h) => (h.vendorId === id ? { ...h, vendorId: undefined, updatedAt: nowISO() } : h)));
  vehiclesStore.set((prev) => prev.map((v) => (v.vendorId === id ? { ...v, vendorId: undefined, updatedAt: nowISO() } : v)));
}

/** Marks a vendor Confirmed and stamps the final-confirmation fields (section 21's "Confirm Vendor" action). */
export function confirmVendor(
  id: string,
  patch: {
    confirmedBy?: string;
    confirmationNotes?: string;
    finalTeamSize?: number;
    finalArrivalTime?: string;
    finalPrimaryContactConfirmed?: boolean;
    finalBackupContactConfirmed?: boolean;
  },
): void {
  const timestamp = nowISO();
  vendorsStore.set((prev) =>
    prev.map((v) =>
      v.id === id
        ? {
            ...v,
            ...patch,
            lastConfirmedAt: timestamp,
            updatedAt: timestamp,
          }
        : v,
    ),
  );
}
