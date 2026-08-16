import { beforeEach, describe, expect, it } from 'vitest';
import { addVendor, updateVendor } from '@/data/repositories/vendorRepository';
import { addVendorQuote, selectVendorQuote } from '@/data/repositories/vendorQuoteRepository';
import { addContract } from '@/data/repositories/contractRepository';
import { addBudgetCategory } from '@/data/repositories/budgetCategoryRepository';
import { addBudgetItem } from '@/data/repositories/budgetItemRepository';
import { addPaymentSchedule } from '@/data/repositories/paymentScheduleRepository';
import { addPayment } from '@/data/repositories/paymentRepository';
import { addRefund } from '@/data/repositories/refundRepository';
import {
  budgetCategoriesStore,
  budgetItemsStore,
  contractsStore,
  paymentSchedulesStore,
  paymentsStore,
  refundsStore,
  resetToDemoData,
  vendorQuotesStore,
  vendorsStore,
} from '@/data/stores';
import { detectFinancialIssues, type FinancialIssueCategory } from '@/utils/financialDataQuality';

function newVendor(overrides: Parameters<typeof addVendor>[0] = {} as Parameters<typeof addVendor>[0]) {
  return addVendor({ name: 'DQ Vendor', category: 'Catering', status: 'Selected', event: 'Wedding', gstApplicable: false, ...overrides });
}

function runIssues(referenceDateTimeISO = '2026-08-16T00:00:00.000Z') {
  return detectFinancialIssues({
    vendors: vendorsStore.get(),
    vendorQuotes: vendorQuotesStore.get(),
    contracts: contractsStore.get(),
    budgetCategories: budgetCategoriesStore.get(),
    budgetItems: budgetItemsStore.get(),
    paymentSchedules: paymentSchedulesStore.get(),
    payments: paymentsStore.get(),
    refunds: refundsStore.get(),
    weddingDateTimeISO: '2027-01-30T10:00:00.000Z',
    criticalVendorCategories: ['Catering'],
    budgetVarianceWarningPercent: 10,
    reconfirmationHoursThreshold: 72,
    referenceDateTimeISO,
  });
}

function hasCategory(issues: ReturnType<typeof runIssues>, category: FinancialIssueCategory) {
  return issues.some((i) => i.category === category);
}

describe('financial data quality checks (section 26)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('flags a Selected vendor with no budget item', () => {
    newVendor();
    expect(hasCategory(runIssues(), 'selected-vendor-no-budget-item')).toBe(true);
  });

  it('flags a Selected vendor with no selected quote', () => {
    newVendor();
    expect(hasCategory(runIssues(), 'selected-vendor-no-selected-quote')).toBe(true);
  });

  it('flags a Confirmed vendor with no signed contract', () => {
    newVendor({ status: 'Confirmed' } as Parameters<typeof addVendor>[0]);
    expect(hasCategory(runIssues(), 'confirmed-vendor-no-signed-contract')).toBe(true);
  });

  it('does not flag a Confirmed vendor whose contract is Signed', () => {
    const vendor = newVendor({ status: 'Confirmed' } as Parameters<typeof addVendor>[0]);
    addContract({ vendorId: vendor.id, status: 'Signed', finalSettlementDueDate: '2027-01-01' });
    expect(hasCategory(runIssues(), 'confirmed-vendor-no-signed-contract')).toBe(false);
  });

  it('flags a contract with no payment schedule', () => {
    const vendor = newVendor();
    addContract({ vendorId: vendor.id, status: 'Draft', finalSettlementDueDate: '2027-01-01' });
    expect(hasCategory(runIssues(), 'contract-no-payment-schedule')).toBe(true);
  });

  it('flags a contract with no final settlement date', () => {
    const vendor = newVendor();
    addContract({ vendorId: vendor.id, status: 'Draft' });
    expect(hasCategory(runIssues(), 'contract-final-settlement-missing')).toBe(true);
  });

  it('flags an overdue payment schedule', () => {
    const vendor = newVendor();
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 1000, dueDate: '2020-01-01', status: 'Upcoming' });
    expect(hasCategory(runIssues(), 'payment-overdue')).toBe(true);
  });

  it('flags total payments exceeding the committed amount', () => {
    const vendor = newVendor();
    const category = addBudgetCategory({ name: 'DQ Cat', plannedAmount: 100000, contingencyAmount: 0, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Catering', originalBudget: 100000, committedAmount: 50000, approvalStatus: 'Approved' });
    addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 60000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    expect(hasCategory(runIssues(), 'payment-exceeds-commitment')).toBe(true);
  });

  it('flags an undocumented mismatch between scheduled total and committed amount', () => {
    const vendor = newVendor();
    const category = addBudgetCategory({ name: 'DQ Cat 2', plannedAmount: 100000, contingencyAmount: 0, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Catering', originalBudget: 100000, committedAmount: 100000, approvalStatus: 'Approved' });
    addPaymentSchedule({ vendorId: vendor.id, milestone: 'Advance', amount: 40000, status: 'Upcoming' });
    expect(hasCategory(runIssues(), 'schedule-differs-from-commitment')).toBe(true);
  });

  it('flags a missing invoice/receipt for a payment to a Completed vendor', () => {
    const vendor = newVendor({ status: 'Completed' } as Parameters<typeof addVendor>[0]);
    addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 5000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    const issues = runIssues();
    expect(hasCategory(issues, 'invoice-missing-completed-vendor')).toBe(true);
    expect(hasCategory(issues, 'receipt-missing-completed-vendor')).toBe(true);
  });

  it('flags a refund that is overdue', () => {
    const vendor = newVendor();
    addRefund({ vendorId: vendor.id, refundType: 'Refundable Deposit', status: 'Expected', expectedAmount: 5000, expectedDate: '2020-01-01' });
    expect(hasCategory(runIssues(), 'refund-overdue')).toBe(true);
  });

  it('flags a budget category over its plan threshold', () => {
    const category = addBudgetCategory({ name: 'DQ Over', plannedAmount: 100000, contingencyAmount: 0, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'Over item', originalBudget: 100000, latestEstimate: 120000, approvalStatus: 'Draft' });
    expect(hasCategory(runIssues(), 'budget-category-over-plan')).toBe(true);
  });

  it('flags a committed budget item that is not Approved', () => {
    const category = addBudgetCategory({ name: 'DQ Commit', plannedAmount: 100000, contingencyAmount: 0, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'Commit item', originalBudget: 100000, committedAmount: 50000, approvalStatus: 'Pending Approval' });
    expect(hasCategory(runIssues(), 'committed-without-approval')).toBe(true);
  });

  it('flags payments recorded against a Rejected budget item', () => {
    const vendor = newVendor();
    const category = addBudgetCategory({ name: 'DQ Reject', plannedAmount: 100000, contingencyAmount: 0, sortOrder: 0 });
    const item = addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Rejected item', originalBudget: 100000, approvalStatus: 'Rejected' });
    addPayment({ vendorId: vendor.id, budgetItemId: item.id, paymentDate: '2026-01-01', amount: 1000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });
    expect(hasCategory(runIssues(), 'paid-against-rejected-item')).toBe(true);
  });

  it('flags a Completed vendor with an outstanding balance', () => {
    const vendor = newVendor({ status: 'Completed' } as Parameters<typeof addVendor>[0]);
    const category = addBudgetCategory({ name: 'DQ Completed', plannedAmount: 100000, contingencyAmount: 0, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Completed item', originalBudget: 100000, committedAmount: 100000, approvalStatus: 'Approved' });
    addPayment({ vendorId: vendor.id, paymentDate: '2026-01-01', amount: 20000, paymentMethod: 'UPI', invoiceReceived: true, receiptReceived: true });
    expect(hasCategory(runIssues(), 'completed-vendor-outstanding-balance')).toBe(true);
  });

  it('flags a critical vendor not reconfirmed within the threshold window', () => {
    newVendor({ category: 'Catering' } as Parameters<typeof addVendor>[0]);
    expect(hasCategory(runIssues('2027-01-29T10:00:00.000Z'), 'critical-vendor-not-reconfirmed')).toBe(true);
  });

  it('flags an expired quote that is still marked selected', () => {
    const vendor = newVendor();
    const quote = addVendorQuote({
      vendorId: vendor.id, event: 'Wedding', baseAmount: 1000, discountAmount: 0, taxAmount: 0, otherCharges: 0,
      currency: 'INR', status: 'Received', isSelected: false, validUntil: '2026-01-01',
    });
    selectVendorQuote(quote.id);
    expect(hasCategory(runIssues(), 'quote-expired-still-selected')).toBe(true);
  });

  it('does not flag a clean, fully-prepared vendor even though the demo dataset carries its own deliberate issues', () => {
    const vendor = newVendor({ status: 'Confirmed', category: 'Décor' } as Parameters<typeof addVendor>[0]);
    updateVendor(vendor.id, { lastConfirmedAt: '2026-08-16T00:00:00.000Z' });
    const category = addBudgetCategory({ name: 'Clean Cat', plannedAmount: 100000, contingencyAmount: 10000, sortOrder: 0 });
    const item = addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Clean item', originalBudget: 100000, committedAmount: 100000, approvalStatus: 'Approved' });
    const quote = addVendorQuote({
      vendorId: vendor.id, event: 'Wedding', baseAmount: 100000, discountAmount: 0, taxAmount: 0, otherCharges: 0,
      currency: 'INR', status: 'Received', isSelected: false,
    });
    selectVendorQuote(quote.id);
    const contract = addContract({ vendorId: vendor.id, status: 'Signed', finalSettlementDueDate: '2027-01-01' });
    addPaymentSchedule({ vendorId: vendor.id, budgetItemId: item.id, milestone: 'Full payment', amount: 100000, dueDate: '2027-01-01', status: 'Upcoming' });

    const issues = runIssues();
    const relatedToThisVendor = issues.some(
      (i) =>
        (i.linkType === 'vendor' && i.linkId === vendor.id) ||
        (i.linkType === 'contract' && i.linkId === contract.id) ||
        (i.linkType === 'budgetItem' && i.linkId === item.id),
    );
    expect(relatedToThisVendor).toBe(false);
  });
});
