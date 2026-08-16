import { beforeEach, describe, expect, it } from 'vitest';
import {
  budgetCategoriesStore,
  budgetItemsStore,
  contractsStore,
  paymentSchedulesStore,
  paymentsStore,
  refundsStore,
  resetToDemoData,
  vendorContactsStore,
  vendorQuotesStore,
  vendorsStore,
} from '@/data/stores';
import {
  budgetToCSV,
  contractsToCSV,
  paymentHistoryToCSV,
  paymentsDueToCSV,
  refundsToCSV,
  vendorQuotesToCSV,
  vendorReadinessToCSV,
  vendorsToCSV,
} from '@/data/repositories/financeCsv';

describe('finance CSV exports', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('produces vendor CSV with a header row and one row per vendor', () => {
    const csv = vendorsToCSV(vendorsStore.get(), vendorContactsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Vendor Name');
    expect(lines.length).toBe(vendorsStore.get().length + 1);
  });

  it('produces vendor quote CSV with a header row and one row per quote', () => {
    const csv = vendorQuotesToCSV(vendorQuotesStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Total Amount');
    expect(lines.length).toBe(vendorQuotesStore.get().length + 1);
  });

  it('produces contract CSV with a header row and one row per contract', () => {
    const csv = contractsToCSV(contractsStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Contract Reference');
    expect(lines.length).toBe(contractsStore.get().length + 1);
  });

  it('produces budget CSV with a header row and one row per budget item', () => {
    const csv = budgetToCSV(budgetCategoriesStore.get(), budgetItemsStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Original Budget');
    expect(lines.length).toBe(budgetItemsStore.get().length + 1);
  });

  it('produces payments due CSV with a header row and one row per schedule', () => {
    const csv = paymentsDueToCSV(paymentSchedulesStore.get(), vendorsStore.get(), paymentsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Outstanding');
    expect(lines.length).toBe(paymentSchedulesStore.get().length + 1);
  });

  it('produces payment history CSV with a header row and one row per payment', () => {
    const csv = paymentHistoryToCSV(paymentsStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Reference Number');
    expect(lines.length).toBe(paymentsStore.get().length + 1);
  });

  it('produces refund CSV with a header row and one row per refund', () => {
    const csv = refundsToCSV(refundsStore.get(), vendorsStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Refund Type');
    expect(lines.length).toBe(refundsStore.get().length + 1);
  });

  it('produces vendor readiness CSV limited to selected/contracted/confirmed vendors', () => {
    const csv = vendorReadinessToCSV(
      vendorsStore.get(),
      vendorContactsStore.get(),
      vendorQuotesStore.get(),
      contractsStore.get(),
      paymentSchedulesStore.get(),
      paymentsStore.get(),
    );
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Readiness Level');
    const expectedCount = vendorsStore
      .get()
      .filter((v) => v.status === 'Selected' || v.status === 'Contracted' || v.status === 'Confirmed').length;
    expect(lines.length).toBe(expectedCount + 1);
  });
});
