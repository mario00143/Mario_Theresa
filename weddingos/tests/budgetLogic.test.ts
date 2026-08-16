import { beforeEach, describe, expect, it } from 'vitest';
import { addVendor } from '@/data/repositories/vendorRepository';
import { addBudgetCategory, deleteBudgetCategory } from '@/data/repositories/budgetCategoryRepository';
import { addBudgetItem, deleteBudgetItem } from '@/data/repositories/budgetItemRepository';
import { addPaymentSchedule } from '@/data/repositories/paymentScheduleRepository';
import { addPayment } from '@/data/repositories/paymentRepository';
import { budgetItemsStore, paymentSchedulesStore, paymentsStore, resetToDemoData } from '@/data/stores';
import { computeBudgetOverview, computeCategorySummary, computeItemForecast, findUnbudgetedCommitments } from '@/utils/budgetLogic';
import type { BudgetItem } from '@/types';

function makeItem(overrides: Partial<BudgetItem> = {}): BudgetItem {
  return {
    id: 'item-1', categoryId: 'cat-1', event: 'Wedding', itemName: 'Test item', originalBudget: 100000,
    approvalStatus: 'Draft', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computeItemForecast (exact cascade: committed ?? negotiated ?? latestEstimate ?? original)', () => {
  it('falls back to originalBudget when nothing else is set', () => {
    expect(computeItemForecast(makeItem({ originalBudget: 50000 }))).toBe(50000);
  });

  it('prefers latestEstimate over originalBudget', () => {
    expect(computeItemForecast(makeItem({ originalBudget: 50000, latestEstimate: 60000 }))).toBe(60000);
  });

  it('prefers negotiatedAmount over latestEstimate', () => {
    expect(computeItemForecast(makeItem({ originalBudget: 50000, latestEstimate: 60000, negotiatedAmount: 55000 }))).toBe(55000);
  });

  it('prefers committedAmount over negotiatedAmount', () => {
    expect(computeItemForecast(makeItem({ originalBudget: 50000, latestEstimate: 60000, negotiatedAmount: 55000, committedAmount: 58000 }))).toBe(58000);
  });
});

describe('category and budget overview calculations', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('flags a category as over-threshold when forecast exceeds plan by the warning percent', () => {
    const category = addBudgetCategory({ name: 'Décor Test', plannedAmount: 100000, contingencyAmount: 10000, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'Decor', originalBudget: 100000, latestEstimate: 115000, approvalStatus: 'Draft' });

    const summary = computeCategorySummary(category, budgetItemsStore.get(), 10);
    expect(summary.isOverThreshold).toBe(true);
    expect(summary.contingencyUsed).toBe(10000); // capped at the contingency buffer
    expect(summary.contingencyRemaining).toBe(0);
  });

  it('does not flag a category within the warning threshold', () => {
    const category = addBudgetCategory({ name: 'Cake Test', plannedAmount: 100000, contingencyAmount: 10000, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'Cake', originalBudget: 100000, latestEstimate: 105000, approvalStatus: 'Draft' });

    const summary = computeCategorySummary(category, budgetItemsStore.get(), 10);
    expect(summary.isOverThreshold).toBe(false);
  });

  it('separates approved from unapproved committed amounts in the overview', () => {
    const category = addBudgetCategory({ name: 'Music Test', plannedAmount: 200000, contingencyAmount: 10000, sortOrder: 0 });
    addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'DJ', originalBudget: 100000, committedAmount: 95000, approvalStatus: 'Pending Approval' });
    addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'Choir', originalBudget: 50000, committedAmount: 45000, approvalStatus: 'Approved' });

    const categoryItems = budgetItemsStore.get().filter((i) => i.categoryId === category.id);
    const overview = computeBudgetOverview([category], categoryItems, 10);
    expect(overview.unapprovedCommitted).toBe(95000);
    expect(overview.approvedCommitted).toBe(45000);
  });

  it('finds budget items committed against a category with no plan on file', () => {
    const category = addBudgetCategory({ name: 'Unplanned', plannedAmount: 0, contingencyAmount: 0, sortOrder: 0 });
    const item = addBudgetItem({ categoryId: category.id, event: 'Wedding', itemName: 'Surprise cost', originalBudget: 0, committedAmount: 20000, approvalStatus: 'Draft' });

    const unbudgeted = findUnbudgetedCommitments([category], budgetItemsStore.get());
    expect(unbudgeted.some((i) => i.id === item.id)).toBe(true);
  });
});

describe('budget category cascade delete', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('deleting a category deletes its items and un-links their payment schedules/payments', () => {
    const vendor = addVendor({ name: 'Cascade Vendor', category: 'Cake', status: 'Selected', event: 'Wedding', gstApplicable: false });
    const category = addBudgetCategory({ name: 'Cascade Cat', plannedAmount: 50000, contingencyAmount: 0, sortOrder: 0 });
    const item = addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Cake', originalBudget: 50000, approvalStatus: 'Draft' });
    const schedule = addPaymentSchedule({ vendorId: vendor.id, budgetItemId: item.id, milestone: 'Advance', amount: 20000, status: 'Upcoming' });
    const payment = addPayment({ vendorId: vendor.id, budgetItemId: item.id, paymentDate: '2026-01-01', amount: 10000, paymentMethod: 'UPI', invoiceReceived: false, receiptReceived: false });

    deleteBudgetCategory(category.id);

    expect(budgetItemsStore.get().some((i) => i.id === item.id)).toBe(false);
    expect(paymentSchedulesStore.get().find((s) => s.id === schedule.id)?.budgetItemId).toBeUndefined();
    expect(paymentsStore.get().find((p) => p.id === payment.id)?.budgetItemId).toBeUndefined();
  });

  it('deleting a budget item un-links its payment schedules/payments without deleting them', () => {
    const vendor = addVendor({ name: 'Item Vendor', category: 'Cake', status: 'Selected', event: 'Wedding', gstApplicable: false });
    const category = addBudgetCategory({ name: 'Item Cat', plannedAmount: 50000, contingencyAmount: 0, sortOrder: 0 });
    const item = addBudgetItem({ categoryId: category.id, vendorId: vendor.id, event: 'Wedding', itemName: 'Cake', originalBudget: 50000, approvalStatus: 'Draft' });
    const schedule = addPaymentSchedule({ vendorId: vendor.id, budgetItemId: item.id, milestone: 'Advance', amount: 20000, status: 'Upcoming' });

    deleteBudgetItem(item.id);

    expect(paymentSchedulesStore.get().some((s) => s.id === schedule.id)).toBe(true);
    expect(paymentSchedulesStore.get().find((s) => s.id === schedule.id)?.budgetItemId).toBeUndefined();
  });
});
