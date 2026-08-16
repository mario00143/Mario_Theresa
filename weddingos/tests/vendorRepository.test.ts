import { beforeEach, describe, expect, it } from 'vitest';
import { addVendor, confirmVendor, deleteVendor, updateVendor } from '@/data/repositories/vendorRepository';
import { addVendorContact, deleteVendorContact } from '@/data/repositories/vendorContactRepository';
import { addVendorQuote, selectVendorQuote } from '@/data/repositories/vendorQuoteRepository';
import { addContract } from '@/data/repositories/contractRepository';
import { addPaymentSchedule } from '@/data/repositories/paymentScheduleRepository';
import { addPayment } from '@/data/repositories/paymentRepository';
import { addBudgetCategory } from '@/data/repositories/budgetCategoryRepository';
import { addBudgetItem } from '@/data/repositories/budgetItemRepository';
import { addHotel } from '@/data/repositories/hotelRepository';
import {
  budgetItemsStore,
  contractsStore,
  hotelsStore,
  paymentSchedulesStore,
  paymentsStore,
  refundsStore,
  resetToDemoData,
  vendorContactsStore,
  vendorQuotesStore,
  vendorsStore,
} from '@/data/stores';
import { computeVendorReadiness, isCriticalVendorNotReconfirmed } from '@/utils/vendorReadiness';
import { addRefund } from '@/data/repositories/refundRepository';

function newVendor(overrides: Parameters<typeof addVendor>[0] = {} as Parameters<typeof addVendor>[0]) {
  return addVendor({
    name: 'Test Vendor',
    category: 'Photography',
    status: 'Researching',
    event: 'Wedding',
    gstApplicable: false,
    ...overrides,
  });
}

describe('vendor CRUD and cascade delete', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('creates a vendor with default final-confirmation fields', () => {
    const vendor = newVendor();
    expect(vendor.finalPrimaryContactConfirmed).toBe(false);
    expect(vendor.finalBackupContactConfirmed).toBe(false);
    expect(vendorsStore.get().some((v) => v.id === vendor.id)).toBe(true);
  });

  it('updates a vendor', () => {
    const vendor = newVendor();
    updateVendor(vendor.id, { status: 'Shortlisted' });
    expect(vendorsStore.get().find((v) => v.id === vendor.id)?.status).toBe('Shortlisted');
  });

  it('cascades vendor deletion to contacts, quotes, contracts, payment schedules, payments, and refunds', () => {
    const vendor = newVendor();
    const contact = addVendorContact({ vendorId: vendor.id, name: 'Contact A', preferredContactMethod: 'Phone' });
    const quote = addVendorQuote({
      vendorId: vendor.id, event: 'Wedding', baseAmount: 1000, discountAmount: 0, taxAmount: 0, otherCharges: 0,
      currency: 'INR', status: 'Received', isSelected: false,
    });
    const contract = addContract({ vendorId: vendor.id, status: 'Draft' });
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 1000, status: 'Upcoming' });
    const payment = addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 500, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    const refund = addRefund({ vendorId: vendor.id, refundType: 'Refundable Deposit', status: 'Expected' });

    deleteVendor(vendor.id);

    expect(vendorsStore.get().some((v) => v.id === vendor.id)).toBe(false);
    expect(vendorContactsStore.get().some((c) => c.id === contact.id)).toBe(false);
    expect(vendorQuotesStore.get().some((q) => q.id === quote.id)).toBe(false);
    expect(contractsStore.get().some((c) => c.id === contract.id)).toBe(false);
    expect(paymentSchedulesStore.get().some((s) => s.id === schedule.id)).toBe(false);
    expect(paymentsStore.get().some((p) => p.id === payment.id)).toBe(false);
    expect(refundsStore.get().some((r) => r.id === refund.id)).toBe(false);
  });

  it('un-links (does not delete) budget items and hotels that merely reference the deleted vendor', () => {
    const vendor = newVendor();
    const category = addBudgetCategory({ name: 'Photography', plannedAmount: 100000, contingencyAmount: 5000, sortOrder: 0 });
    const item = addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Photo package', originalBudget: 100000, approvalStatus: 'Draft' });
    const hotel = addHotel({ name: 'Test Hotel', area: '', city: 'Hyderabad', vendorId: vendor.id, breakfastIncluded: false, parkingAvailable: false, busAccess: false, accessibleRoomsAvailable: false });

    deleteVendor(vendor.id);

    expect(budgetItemsStore.get().find((i) => i.id === item.id)?.vendorId).toBeUndefined();
    expect(hotelsStore.get().find((h) => h.id === hotel.id)?.vendorId).toBeUndefined();
  });

  it('deleting a contact un-links it from primaryContactId/backupContactId', () => {
    const vendor = newVendor();
    const primary = addVendorContact({ vendorId: vendor.id, name: 'Primary', preferredContactMethod: 'Phone' });
    updateVendor(vendor.id, { primaryContactId: primary.id });

    deleteVendorContact(primary.id);

    expect(vendorsStore.get().find((v) => v.id === vendor.id)?.primaryContactId).toBeUndefined();
  });
});

describe('confirmVendor (final vendor confirmation)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('stamps lastConfirmedAt and confirmation fields', () => {
    const vendor = newVendor();
    confirmVendor(vendor.id, { confirmedBy: 'Groom', finalTeamSize: 3, finalPrimaryContactConfirmed: true });
    const updated = vendorsStore.get().find((v) => v.id === vendor.id)!;
    expect(updated.lastConfirmedAt).toBeTruthy();
    expect(updated.confirmedBy).toBe('Groom');
    expect(updated.finalTeamSize).toBe(3);
    expect(updated.finalPrimaryContactConfirmed).toBe(true);
  });
});

describe('vendor readiness (pass/fail checklist with reasons, not a bare score)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('classifies a vendor with nothing on file as Not Ready, with reasons listed', () => {
    const vendor = newVendor();
    const readiness = computeVendorReadiness(vendor, [], [], [], [], []);
    expect(readiness.level).toBe('Not Ready');
    expect(readiness.reasons.length).toBeGreaterThan(0);
    expect(readiness.reasons).toContain('Quote selected');
  });

  it('classifies a fully-prepared, confirmed vendor as Ready', () => {
    const vendor = newVendor();
    const contact = addVendorContact({ vendorId: vendor.id, name: 'Contact', preferredContactMethod: 'Phone' });
    updateVendor(vendor.id, { primaryContactId: contact.id });
    const quote = addVendorQuote({
      vendorId: vendor.id, event: 'Wedding', baseAmount: 50000, discountAmount: 0, taxAmount: 0, otherCharges: 0,
      currency: 'INR', status: 'Received', isSelected: false,
    });
    selectVendorQuote(quote.id);
    addContract({
      vendorId: vendor.id, status: 'Signed', scopeIncluded: 'Full day coverage', serviceStartDate: '2027-01-30',
      serviceStartTime: '10:00', venueAccessRequirements: 'Entry by 08:00', teamSize: 2, vendorMealCount: 2,
    });
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, dueDate: '2027-01-01', status: 'Paid' });
    confirmVendor(vendor.id, { confirmedBy: 'Groom' });

    const finalVendor = vendorsStore.get().find((v) => v.id === vendor.id)!;
    const readiness = computeVendorReadiness(
      finalVendor,
      vendorContactsStore.get(),
      vendorQuotesStore.get(),
      contractsStore.get(),
      paymentSchedulesStore.get(),
      paymentsStore.get(),
    );
    expect(readiness.level).toBe('Ready');
    expect(readiness.reasons).toHaveLength(0);
  });

  it('flags an overdue payment schedule as an "Advance paid if due" failure', () => {
    const vendor = newVendor();
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, dueDate: '2020-01-01', status: 'Upcoming' });
    const readiness = computeVendorReadiness(vendor, [], [], [], paymentSchedulesStore.get(), [], '2026-08-16');
    expect(readiness.reasons).toContain('Advance paid if due');
  });
});

describe('critical vendor 72-hour reconfirmation window', () => {
  it('is false when the wedding is far in the future', () => {
    const vendor = newVendor({ category: 'Catering', event: 'Wedding' } as Parameters<typeof addVendor>[0]);
    const flagged = isCriticalVendorNotReconfirmed(vendor, ['Catering'], '2027-01-30T10:00:00.000Z', 72, '2026-08-16T00:00:00.000Z');
    expect(flagged).toBe(false);
  });

  it('is true within the 72-hour window when never reconfirmed', () => {
    const vendor = newVendor({ category: 'Catering', event: 'Wedding' } as Parameters<typeof addVendor>[0]);
    const flagged = isCriticalVendorNotReconfirmed(vendor, ['Catering'], '2027-01-30T10:00:00.000Z', 72, '2027-01-29T10:00:00.000Z');
    expect(flagged).toBe(true);
  });

  it('is false once reconfirmed within the window', () => {
    const vendor = newVendor({ category: 'Catering', event: 'Wedding' } as Parameters<typeof addVendor>[0]);
    confirmVendor(vendor.id, { confirmedBy: 'Groom' });
    const reconfirmed = vendorsStore.get().find((v) => v.id === vendor.id)!;
    const flagged = isCriticalVendorNotReconfirmed(
      { ...reconfirmed, lastConfirmedAt: '2027-01-29T09:00:00.000Z' },
      ['Catering'],
      '2027-01-30T10:00:00.000Z',
      72,
      '2027-01-29T10:00:00.000Z',
    );
    expect(flagged).toBe(false);
  });

  it('does not flag a non-critical category', () => {
    const vendor = newVendor({ category: 'Gifts / Favors', event: 'Wedding' } as Parameters<typeof addVendor>[0]);
    const flagged = isCriticalVendorNotReconfirmed(vendor, ['Catering'], '2027-01-30T10:00:00.000Z', 72, '2027-01-29T10:00:00.000Z');
    expect(flagged).toBe(false);
  });

  it('does not flag a cancelled vendor', () => {
    const vendor = newVendor({ category: 'Catering', event: 'Wedding', status: 'Cancelled' } as Parameters<typeof addVendor>[0]);
    const flagged = isCriticalVendorNotReconfirmed(vendor, ['Catering'], '2027-01-30T10:00:00.000Z', 72, '2027-01-29T10:00:00.000Z');
    expect(flagged).toBe(false);
  });
});
