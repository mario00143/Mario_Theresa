import { beforeEach, describe, expect, it } from 'vitest';
import { addVendor } from '@/data/repositories/vendorRepository';
import { addPaymentSchedule, cancelPaymentSchedule, deletePaymentSchedule } from '@/data/repositories/paymentScheduleRepository';
import { addPayment, deletePayment, InvalidPaymentAmountError, PaymentLinkedEntityNotFoundError, updatePayment } from '@/data/repositories/paymentRepository';
import { addRefund } from '@/data/repositories/refundRepository';
import { paymentSchedulesStore, paymentsStore, refundsStore, resetToDemoData } from '@/data/stores';
import { computePaymentScheduleStatus, dueBucketFor, isLargeCashPayment, scheduleBalance, scheduleOverpaid, totalPaidForSchedule, totalPaidForVendor } from '@/utils/paymentLogic';
import { computeVendorReconciliation, hasUndocumentedScheduleMismatch } from '@/utils/reconciliation';

function newVendor() {
  return addVendor({ name: 'Payment Test Vendor', category: 'Catering', status: 'Contracted', event: 'Wedding', gstApplicable: false });
}

describe('payment hard-block validation (section 16)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('throws InvalidPaymentAmountError for a zero amount', () => {
    const vendor = newVendor();
    expect(() =>
      addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 0, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false }),
    ).toThrow(InvalidPaymentAmountError);
  });

  it('throws InvalidPaymentAmountError for a negative amount', () => {
    const vendor = newVendor();
    expect(() =>
      addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: -500, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false }),
    ).toThrow(InvalidPaymentAmountError);
  });

  it('never writes a payment when the amount is invalid', () => {
    const vendor = newVendor();
    const before = paymentsStore.get().length;
    expect(() =>
      addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: -1, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false }),
    ).toThrow();
    expect(paymentsStore.get()).toHaveLength(before);
  });

  it('throws PaymentLinkedEntityNotFoundError when the vendor does not exist', () => {
    expect(() =>
      addPayment({ vendorId: 'nonexistent-vendor', paymentDate: '2026-01-01', amount: 1000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false }),
    ).toThrow(PaymentLinkedEntityNotFoundError);
  });

  it('throws PaymentLinkedEntityNotFoundError when the linked budget item does not exist', () => {
    const vendor = newVendor();
    expect(() =>
      addPayment({ vendorId: vendor.id, budgetItemId: 'nonexistent-item', paymentDate: '2026-01-01', amount: 1000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false }),
    ).toThrow(PaymentLinkedEntityNotFoundError);
  });

  it('throws PaymentLinkedEntityNotFoundError when the linked payment schedule does not exist', () => {
    const vendor = newVendor();
    expect(() =>
      addPayment({ vendorId: vendor.id, paymentScheduleId: 'nonexistent-schedule', paymentDate: '2026-01-01', amount: 1000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false }),
    ).toThrow(PaymentLinkedEntityNotFoundError);
  });

  it('allows a valid payment and rejects a subsequent invalid update', () => {
    const vendor = newVendor();
    const payment = addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 1000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    expect(() => updatePayment(payment.id, { amount: -50 })).toThrow(InvalidPaymentAmountError);
  });

  it('deletes a payment', () => {
    const vendor = newVendor();
    const payment = addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 1000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    deletePayment(payment.id);
    expect(paymentsStore.get().some((p) => p.id === payment.id)).toBe(false);
  });
});

describe('large cash payment detection (configurable threshold)', () => {
  it('flags a cash payment at or above the threshold', () => {
    expect(isLargeCashPayment({ paymentMethod: 'Cash', amount: 50000 } as never, 50000)).toBe(true);
    expect(isLargeCashPayment({ paymentMethod: 'Cash', amount: 49999 } as never, 50000)).toBe(false);
  });

  it('never flags a non-cash payment regardless of amount', () => {
    expect(isLargeCashPayment({ paymentMethod: 'Bank Transfer', amount: 5000000 } as never, 50000)).toBe(false);
  });
});

describe('payment schedule status derivation (always live, never trusted from storage)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('is Upcoming when there is no due date and no payments', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, status: 'Upcoming' });
    expect(computePaymentScheduleStatus(schedule, [])).toBe('Upcoming');
  });

  it('is Overdue when the due date has passed with no payments', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, dueDate: '2026-01-01', status: 'Upcoming' });
    expect(computePaymentScheduleStatus(schedule, [], '2026-06-01')).toBe('Overdue');
  });

  it('is Due on the due date itself', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, dueDate: '2026-06-01', status: 'Upcoming' });
    expect(computePaymentScheduleStatus(schedule, [], '2026-06-01')).toBe('Due');
  });

  it('is Partially Paid when some but not all of the amount has been paid', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, status: 'Upcoming' });
    const payment = addPayment({ vendorId: vendor.id, paymentScheduleId: schedule.id, paymentDate: '2026-01-01', amount: 4000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    expect(computePaymentScheduleStatus(schedule, [payment])).toBe('Partially Paid');
    expect(scheduleBalance(schedule, [payment])).toBe(6000);
  });

  it('is Paid once the full amount (or more) has been paid, and reports overpaid separately', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, status: 'Upcoming' });
    const payment = addPayment({ vendorId: vendor.id, paymentScheduleId: schedule.id, paymentDate: '2026-01-01', amount: 12000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    expect(computePaymentScheduleStatus(schedule, [payment])).toBe('Paid');
    expect(scheduleBalance(schedule, [payment])).toBe(0);
    expect(scheduleOverpaid(schedule, [payment])).toBe(2000);
  });

  it('a Cancelled schedule stays Cancelled regardless of payments or overdue dates', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, dueDate: '2020-01-01', status: 'Upcoming' });
    cancelPaymentSchedule(schedule.id);
    const cancelled = paymentSchedulesStore.get().find((s) => s.id === schedule.id)!;
    expect(computePaymentScheduleStatus(cancelled, [], '2026-06-01')).toBe('Cancelled');
  });

  it('deleting a payment schedule un-links (not deletes) its payments', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 10000, status: 'Upcoming' });
    const payment = addPayment({ vendorId: vendor.id, paymentScheduleId: schedule.id, paymentDate: '2026-01-01', amount: 5000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    deletePaymentSchedule(schedule.id);
    expect(paymentsStore.get().some((p) => p.id === payment.id)).toBe(true);
    expect(paymentsStore.get().find((p) => p.id === payment.id)?.paymentScheduleId).toBeUndefined();
  });
});

describe('payment calendar due-date buckets', () => {
  it('buckets an overdue schedule as Overdue regardless of days-until math', () => {
    const schedule = { dueDate: '2020-01-01', amount: 1000, status: 'Upcoming' } as Parameters<typeof dueBucketFor>[0];
    expect(dueBucketFor(schedule, [], '2026-06-01')).toBe('Overdue');
  });

  it('buckets a same-day due schedule as Due Today', () => {
    const schedule = { dueDate: '2026-06-01', amount: 1000, status: 'Upcoming' } as Parameters<typeof dueBucketFor>[0];
    expect(dueBucketFor(schedule, [], '2026-06-01')).toBe('Due Today');
  });

  it('buckets a schedule due in 5 days as "Due in 7 Days"', () => {
    const schedule = { dueDate: '2026-06-06', amount: 1000, status: 'Upcoming' } as Parameters<typeof dueBucketFor>[0];
    expect(dueBucketFor(schedule, [], '2026-06-01')).toBe('Due in 7 Days');
  });

  it('buckets a schedule due in 20 days as "Due in 30 Days"', () => {
    const schedule = { dueDate: '2026-06-21', amount: 1000, status: 'Upcoming' } as Parameters<typeof dueBucketFor>[0];
    expect(dueBucketFor(schedule, [], '2026-06-01')).toBe('Due in 30 Days');
  });

  it('buckets a far-future schedule as Later', () => {
    const schedule = { dueDate: '2027-01-01', amount: 1000, status: 'Upcoming' } as Parameters<typeof dueBucketFor>[0];
    expect(dueBucketFor(schedule, [], '2026-06-01')).toBe('Later');
  });

  it('returns null (excluded from the calendar) for a Paid or Cancelled schedule', () => {
    const paidSchedule = { id: 'sched-paid', dueDate: '2026-06-01', amount: 1000, status: 'Upcoming' } as Parameters<typeof dueBucketFor>[0];
    const cancelled = { id: 'sched-cancelled', dueDate: '2020-01-01', amount: 1000, status: 'Cancelled' } as Parameters<typeof dueBucketFor>[0];
    const payments = [{ paymentScheduleId: 'sched-paid', amount: 1000 }] as never;
    expect(dueBucketFor(paidSchedule, payments, '2026-06-01')).toBeNull();
    expect(dueBucketFor(cancelled, [], '2026-06-01')).toBeNull();
  });
});

describe('vendor payment reconciliation', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('computes outstanding = committed - paid, floored at zero', () => {
    const vendor = newVendor();
    addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 30000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    const reconciliation = computeVendorReconciliation(vendor.id, 100000, [], paymentsStore.get(), []);
    expect(reconciliation.outstanding).toBe(70000);
    expect(reconciliation.overpaid).toBe(0);
  });

  it('computes overpaid instead of a negative outstanding when paid exceeds committed', () => {
    const vendor = newVendor();
    addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 120000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    const reconciliation = computeVendorReconciliation(vendor.id, 100000, [], paymentsStore.get(), []);
    expect(reconciliation.outstanding).toBe(0);
    expect(reconciliation.overpaid).toBe(20000);
  });

  it('flags an undocumented mismatch between scheduled total and committed amount beyond ₹1 tolerance', () => {
    const vendor = newVendor();
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 40000, status: 'Upcoming' });
    expect(hasUndocumentedScheduleMismatch(vendor.id, 100000, paymentSchedulesStore.get())).toBe(true);
  });

  it('does not flag a mismatch within the ₹1 tolerance', () => {
    const vendor = newVendor();
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 99999.5, status: 'Upcoming' });
    expect(hasUndocumentedScheduleMismatch(vendor.id, 100000, paymentSchedulesStore.get())).toBe(false);
  });

  it('allows a deliberate mismatch when a note documents it', () => {
    const vendor = newVendor();
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 40000, status: 'Upcoming', notes: 'Deliberately partial — remainder billed post-event.' });
    expect(hasUndocumentedScheduleMismatch(vendor.id, 100000, paymentSchedulesStore.get())).toBe(false);
  });
});

describe('totals helpers', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('sums payments per vendor and per schedule independently', () => {
    const vendor = newVendor();
    const schedule = addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 20000, status: 'Upcoming' });
    addPayment({ vendorId: vendor.id, paymentScheduleId: schedule.id, paymentDate: '2026-01-01', amount: 10000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    addPayment({ vendorId: vendor.id, paymentDate: '2026-01-02', amount: 5000, paymentMethod: 'Cash', invoiceReceived: false, receiptReceived: false });

    expect(totalPaidForVendor(paymentsStore.get(), vendor.id)).toBe(15000);
    expect(totalPaidForSchedule(paymentsStore.get(), schedule.id)).toBe(10000);
  });
});

describe('refund repository', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('creates and updates a refund', () => {
    const vendor = newVendor();
    const refund = addRefund({ vendorId: vendor.id, refundType: 'Refundable Deposit', status: 'Expected', expectedAmount: 10000 });
    expect(refundsStore.get().some((r) => r.id === refund.id)).toBe(true);
  });
});
