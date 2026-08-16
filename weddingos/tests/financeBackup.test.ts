import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, importBackup, normalizeBackup, validateBackup } from '@/data/repositories/backupRepository';
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
import { BACKUP_VERSION } from '@/types';

const FINANCE_KEYS = [
  'vendors',
  'vendorContacts',
  'vendorQuotes',
  'contracts',
  'budgetCategories',
  'budgetItems',
  'paymentSchedules',
  'payments',
  'refunds',
] as const;

describe('version 4+ backup export', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports the current version with all finance collections included', () => {
    const backup = exportBackup();
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(BACKUP_VERSION).toBeGreaterThanOrEqual(4);
    expect(backup.vendors.length).toBeGreaterThan(0);
    expect(backup.vendorContacts.length).toBeGreaterThan(0);
    expect(backup.vendorQuotes.length).toBeGreaterThan(0);
    expect(backup.contracts.length).toBeGreaterThan(0);
    expect(backup.budgetCategories.length).toBeGreaterThan(0);
    expect(backup.budgetItems.length).toBeGreaterThan(0);
    expect(backup.paymentSchedules.length).toBeGreaterThan(0);
    expect(backup.payments.length).toBeGreaterThan(0);
    expect(backup.refunds.length).toBeGreaterThan(0);
  });
});

describe('version 4 backup round trip', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('validates and imports a well-formed version 4 backup', () => {
    const backup = exportBackup();
    const result = validateBackup(backup);
    expect(result.valid).toBe(true);

    const trimmed = {
      ...backup,
      vendors: backup.vendors.slice(0, 2),
      vendorQuotes: backup.vendorQuotes.slice(0, 2),
      contracts: backup.contracts.slice(0, 1),
      budgetItems: backup.budgetItems.slice(0, 3),
      payments: backup.payments.slice(0, 2),
    };
    importBackup(trimmed);
    expect(vendorsStore.get()).toHaveLength(2);
    expect(vendorQuotesStore.get()).toHaveLength(2);
    expect(contractsStore.get()).toHaveLength(1);
    expect(budgetItemsStore.get()).toHaveLength(3);
    expect(paymentsStore.get()).toHaveLength(2);
  });
});

describe('version 3 backward compatibility', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  function stripFinance() {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of FINANCE_KEYS) delete rest[key];
    return { ...rest, version: 3 };
  }

  it('accepts a version 3 backup that has no finance fields at all', () => {
    const v3Backup = stripFinance();
    const result = validateBackup(v3Backup);
    expect(result.valid).toBe(true);
  });

  it('normalizes a version 3 backup to include empty finance arrays', () => {
    const v3Backup = stripFinance();
    const normalized = normalizeBackup(v3Backup);
    for (const key of FINANCE_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.hotels.length).toBeGreaterThan(0);
    expect(normalized.travelSegments.length).toBeGreaterThan(0);
  });

  it('importing a normalized version 3 backup does not fail and clears finance data', () => {
    const v3Backup = stripFinance();
    const normalized = normalizeBackup(v3Backup);
    importBackup(normalized);

    expect(vendorsStore.get()).toEqual([]);
    expect(vendorContactsStore.get()).toEqual([]);
    expect(vendorQuotesStore.get()).toEqual([]);
    expect(contractsStore.get()).toEqual([]);
    expect(budgetCategoriesStore.get()).toEqual([]);
    expect(budgetItemsStore.get()).toEqual([]);
    expect(paymentSchedulesStore.get()).toEqual([]);
    expect(paymentsStore.get()).toEqual([]);
    expect(refundsStore.get()).toEqual([]);
  });
});

describe('version 1 and 2 backward compatibility with finance', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('normalizes a version 1 backup to include empty guest, logistics, and finance arrays', () => {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of FINANCE_KEYS) delete rest[key];
    delete rest.households;
    delete rest.guests;
    delete rest.travelSegments;
    delete rest.hotels;
    const v1Backup = { ...rest, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    expect(normalized.households).toEqual([]);
    expect(normalized.guests).toEqual([]);
    expect(normalized.travelSegments).toEqual([]);
    for (const key of FINANCE_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.tasks.length).toBeGreaterThan(0);
  });

  it('normalizes a version 2 backup (households/guests present, finance absent) correctly', () => {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of FINANCE_KEYS) delete rest[key];
    delete rest.travelSegments;
    delete rest.hotels;
    const v2Backup = { ...rest, version: 2 };

    const result = validateBackup(v2Backup);
    expect(result.valid).toBe(true);

    const normalized = normalizeBackup(v2Backup);
    expect(normalized.households.length).toBeGreaterThan(0);
    expect(normalized.guests.length).toBeGreaterThan(0);
    for (const key of FINANCE_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
  });
});

describe('invalid finance backup rejection', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('rejects a version 4 backup with a malformed vendor (invalid status)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      vendors: [{ ...backup.vendors[0], status: 'Enchanted' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('vendor'))).toBe(true);
  });

  it('rejects a version 4 backup with a malformed payment (invalid payment method)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      payments: [{ ...backup.payments[0], paymentMethod: 'Bitcoin' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('payment'))).toBe(true);
  });

  it('rejects a version 4 backup with a malformed budget item (invalid approval status)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      budgetItems: [{ ...backup.budgetItems[0], approvalStatus: 'Vetoed' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('budget'))).toBe(true);
  });

  it('rejects a version 4 backup missing the contracts array entirely', () => {
    const backup = exportBackup();
    const { contracts: _contracts, ...rest } = backup;
    const result = validateBackup(rest);
    expect(result.valid).toBe(false);
  });

  it('rejects a version 4 backup with a malformed refund (invalid refund type)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      refunds: [{ ...backup.refunds[0], refundType: 'Mystery' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('refund'))).toBe(true);
  });
});
