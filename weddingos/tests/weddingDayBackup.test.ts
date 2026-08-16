import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, importBackup, normalizeBackup, validateBackup } from '@/data/repositories/backupRepository';
import {
  ceremonyItemMovementsStore,
  closeoutItemsStore,
  dutyAssignmentsStore,
  emergencyContactsStore,
  emergencyResponseCardsStore,
  finalReadinessReviewsStore,
  guestOperationalStatusesStore,
  liveIssuesStore,
  manifestFreezeStatesStore,
  resetToDemoData,
  runSheetItemsStore,
  vendorDayStatusesStore,
} from '@/data/stores';
import { BACKUP_VERSION } from '@/types';

const WEDDING_DAY_KEYS = [
  'runSheetItems',
  'liveIssues',
  'dutyAssignments',
  'vendorDayStatuses',
  'ceremonyItemMovements',
  'emergencyContacts',
  'emergencyResponseCards',
  'closeoutItems',
  'finalReadinessReviews',
  'guestOperationalStatuses',
  'manifestFreezeStates',
] as const;

describe('version 6 backup export', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports version 6 with all wedding-day command center collections included', () => {
    const backup = exportBackup();
    expect(backup.version).toBe(6);
    expect(BACKUP_VERSION).toBe(6);
    expect(backup.runSheetItems.length).toBeGreaterThan(0);
    expect(backup.liveIssues.length).toBeGreaterThan(0);
    expect(backup.dutyAssignments.length).toBeGreaterThan(0);
    expect(backup.vendorDayStatuses.length).toBeGreaterThan(0);
    expect(backup.ceremonyItemMovements.length).toBeGreaterThan(0);
    expect(backup.emergencyContacts.length).toBeGreaterThan(0);
    expect(backup.emergencyResponseCards.length).toBeGreaterThan(0);
    expect(backup.closeoutItems.length).toBeGreaterThan(0);
    // Not seeded on demo data (nothing reviewed/frozen yet 148+ days out) — legitimately empty.
    expect(backup.finalReadinessReviews).toEqual([]);
    expect(backup.guestOperationalStatuses.length).toBeGreaterThan(0);
    expect(backup.manifestFreezeStates).toEqual([]);
  });
});

describe('version 6 backup round trip', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('validates and imports a well-formed version 6 backup', () => {
    const backup = exportBackup();
    const result = validateBackup(backup);
    expect(result.valid).toBe(true);

    const trimmed = {
      ...backup,
      runSheetItems: backup.runSheetItems.slice(0, 5),
      liveIssues: backup.liveIssues.slice(0, 2),
      dutyAssignments: backup.dutyAssignments.slice(0, 3),
      vendorDayStatuses: backup.vendorDayStatuses.slice(0, 2),
      closeoutItems: backup.closeoutItems.slice(0, 4),
    };
    importBackup(trimmed);
    expect(runSheetItemsStore.get()).toHaveLength(5);
    expect(liveIssuesStore.get()).toHaveLength(2);
    expect(dutyAssignmentsStore.get()).toHaveLength(3);
    expect(vendorDayStatusesStore.get()).toHaveLength(2);
    expect(closeoutItemsStore.get()).toHaveLength(4);
  });
});

describe('version 5 backward compatibility', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  function stripWeddingDay() {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of WEDDING_DAY_KEYS) delete rest[key];
    const settings = rest.settings as Record<string, unknown>;
    const { weddingDay: _wd, ...settingsRest } = settings;
    return { ...rest, settings: settingsRest, version: 5 };
  }

  it('accepts a version 5 backup that has no wedding-day fields at all', () => {
    const v5Backup = stripWeddingDay();
    const result = validateBackup(v5Backup);
    expect(result.valid).toBe(true);
  });

  it('normalizes a version 5 backup to include empty wedding-day arrays and default settings', () => {
    const v5Backup = stripWeddingDay();
    const normalized = normalizeBackup(v5Backup);
    for (const key of WEDDING_DAY_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.settings.weddingDay).toBeDefined();
    expect(normalized.settings.weddingDay.commandCenterVisibilityDays).toBeGreaterThan(0);
    expect(normalized.churchProfiles.length).toBeGreaterThan(0);
  });

  it('importing a normalized version 5 backup does not fail and clears wedding-day data', () => {
    const v5Backup = stripWeddingDay();
    const normalized = normalizeBackup(v5Backup);
    importBackup(normalized);

    expect(runSheetItemsStore.get()).toEqual([]);
    expect(liveIssuesStore.get()).toEqual([]);
    expect(dutyAssignmentsStore.get()).toEqual([]);
    expect(vendorDayStatusesStore.get()).toEqual([]);
    expect(ceremonyItemMovementsStore.get()).toEqual([]);
    expect(emergencyContactsStore.get()).toEqual([]);
    expect(emergencyResponseCardsStore.get()).toEqual([]);
    expect(closeoutItemsStore.get()).toEqual([]);
    expect(finalReadinessReviewsStore.get()).toEqual([]);
    expect(guestOperationalStatusesStore.get()).toEqual([]);
    expect(manifestFreezeStatesStore.get()).toEqual([]);
  });
});

describe('version 1 through 4 backward compatibility with wedding day', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('normalizes a version 4 backup (no wedding-prep, no wedding-day fields) correctly', () => {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of WEDDING_DAY_KEYS) delete rest[key];
    const weddingPrepKeys = [
      'churchProfiles', 'churchRequirements', 'ceremonyParticipants', 'ceremonySequenceItems', 'ceremonyItems',
      'cateringPlans', 'menuItems', 'decorPlans', 'decorDeliverables', 'attireProfiles', 'attireItems',
      'groomingAppointments', 'photographyPlans', 'photoGroups', 'musicCues', 'musicAVPlans', 'giftPlans',
      'welcomeKits', 'welcomeKitItems',
    ];
    for (const key of weddingPrepKeys) delete rest[key];
    const v4Backup = { ...rest, version: 4 };

    const result = validateBackup(v4Backup);
    expect(result.valid).toBe(true);

    const normalized = normalizeBackup(v4Backup);
    for (const key of WEDDING_DAY_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.settings.weddingDay).toBeDefined();
    expect(normalized.vendors.length).toBeGreaterThan(0);
  });

  it('normalizes a version 1 backup to include empty wedding-day arrays alongside everything else', () => {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    const allLaterKeys = [
      ...WEDDING_DAY_KEYS,
      'churchProfiles', 'churchRequirements', 'ceremonyParticipants', 'ceremonySequenceItems', 'ceremonyItems',
      'cateringPlans', 'menuItems', 'decorPlans', 'decorDeliverables', 'attireProfiles', 'attireItems',
      'groomingAppointments', 'photographyPlans', 'photoGroups', 'musicCues', 'musicAVPlans', 'giftPlans',
      'welcomeKits', 'welcomeKitItems',
      'vendors', 'vendorContacts', 'vendorQuotes', 'contracts', 'budgetCategories', 'budgetItems', 'paymentSchedules', 'payments', 'refunds',
      'travelSegments', 'hotels', 'roomTypes', 'rooms', 'roomAssignments', 'vehicles', 'drivers', 'transportRoutes', 'transportAssignments',
      'households', 'guests',
    ];
    for (const key of allLaterKeys) delete rest[key];
    const v1Backup = { ...rest, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    for (const key of WEDDING_DAY_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.settings.weddingDay).toBeDefined();
    expect(normalized.tasks.length).toBeGreaterThan(0);
  });
});

describe('invalid wedding-day backup rejection', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('rejects a version 6 backup with a malformed run sheet item (invalid status)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, runSheetItems: [{ ...backup.runSheetItems[0], status: 'On Fire' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('run sheet'))).toBe(true);
  });

  it('rejects a version 6 backup with a malformed live issue (invalid severity)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, liveIssues: [{ ...backup.liveIssues[0], severity: 'Catastrophic' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('live issue'))).toBe(true);
  });

  it('rejects a version 6 backup with a malformed duty assignment (invalid role)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, dutyAssignments: [{ ...backup.dutyAssignments[0], role: 'Confetti Cannon Operator' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('duty'))).toBe(true);
  });

  it('rejects a version 6 backup with a malformed vendor day status (invalid status)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, vendorDayStatuses: [{ ...backup.vendorDayStatuses[0], status: 'Vanished' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('vendor day'))).toBe(true);
  });

  it('rejects a version 6 backup missing the runSheetItems array entirely', () => {
    const backup = exportBackup();
    const { runSheetItems: _rsi, ...rest } = backup;
    const result = validateBackup(rest);
    expect(result.valid).toBe(false);
  });

  it('rejects a version 6 backup with a malformed closeout item (invalid category)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, closeoutItems: [{ ...backup.closeoutItems[0], category: 'Confetti' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('closeout'))).toBe(true);
  });
});
