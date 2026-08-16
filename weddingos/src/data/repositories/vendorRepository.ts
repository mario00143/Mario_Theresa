import type { Vendor } from '@/types';
import { generateId } from '@/lib/id';
import {
  attireProfilesStore,
  budgetItemsStore,
  cateringPlansStore,
  ceremonyItemsStore,
  contractsStore,
  decorPlansStore,
  emergencyResponseCardsStore,
  giftPlansStore,
  groomingAppointmentsStore,
  hotelsStore,
  liveIssuesStore,
  musicAVPlansStore,
  musicCuesStore,
  paymentSchedulesStore,
  paymentsStore,
  photographyPlansStore,
  refundsStore,
  runSheetItemsStore,
  vehiclesStore,
  vendorContactsStore,
  vendorDayStatusesStore,
  vendorQuotesStore,
  vendorsStore,
  welcomeKitItemsStore,
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

  // Phase 5 wedding-preparation records — same un-link-not-delete treatment.
  ceremonyItemsStore.set((prev) => prev.map((i) => (i.relatedVendorId === id ? { ...i, relatedVendorId: undefined, updatedAt: nowISO() } : i)));
  cateringPlansStore.set((prev) => prev.map((p) => (p.vendorId === id ? { ...p, vendorId: undefined, updatedAt: nowISO() } : p)));
  decorPlansStore.set((prev) => prev.map((p) => (p.vendorId === id ? { ...p, vendorId: undefined, updatedAt: nowISO() } : p)));
  attireProfilesStore.set((prev) => prev.map((p) => (p.vendorId === id ? { ...p, vendorId: undefined, updatedAt: nowISO() } : p)));
  groomingAppointmentsStore.set((prev) => prev.map((a) => (a.vendorId === id ? { ...a, vendorId: undefined, updatedAt: nowISO() } : a)));
  photographyPlansStore.set((prev) => prev.map((p) => (p.vendorId === id ? { ...p, vendorId: undefined, updatedAt: nowISO() } : p)));
  musicCuesStore.set((prev) => prev.map((c) => (c.linkedVendorId === id ? { ...c, linkedVendorId: undefined, updatedAt: nowISO() } : c)));
  musicAVPlansStore.set((prev) =>
    prev.map((p) => {
      if (p.choirVendorId !== id && p.djVendorId !== id && p.avVendorId !== id) return p;
      return {
        ...p,
        choirVendorId: p.choirVendorId === id ? undefined : p.choirVendorId,
        djVendorId: p.djVendorId === id ? undefined : p.djVendorId,
        avVendorId: p.avVendorId === id ? undefined : p.avVendorId,
        updatedAt: nowISO(),
      };
    }),
  );
  giftPlansStore.set((prev) => prev.map((p) => (p.vendorId === id ? { ...p, vendorId: undefined, updatedAt: nowISO() } : p)));
  welcomeKitItemsStore.set((prev) => prev.map((i) => (i.vendorId === id ? { ...i, vendorId: undefined, updatedAt: nowISO() } : i)));

  // Phase 6 wedding-day records: the vendor's day-of status is a 1:1 extension and cascades; everything else un-links.
  vendorDayStatusesStore.set((prev) => prev.filter((s) => s.vendorId !== id));
  runSheetItemsStore.set((prev) => prev.map((r) => (r.vendorIds.includes(id) ? { ...r, vendorIds: r.vendorIds.filter((v) => v !== id), updatedAt: nowISO() } : r)));
  liveIssuesStore.set((prev) => prev.map((i) => (i.relatedVendorId === id ? { ...i, relatedVendorId: undefined, updatedAt: nowISO() } : i)));
  emergencyResponseCardsStore.set((prev) => prev.map((c) => (c.relatedVendorId === id ? { ...c, relatedVendorId: undefined, updatedAt: nowISO() } : c)));
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
