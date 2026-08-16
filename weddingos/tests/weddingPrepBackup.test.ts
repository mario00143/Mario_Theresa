import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, importBackup, normalizeBackup, validateBackup } from '@/data/repositories/backupRepository';
import {
  attireItemsStore,
  attireProfilesStore,
  cateringPlansStore,
  ceremonyItemsStore,
  ceremonyParticipantsStore,
  ceremonySequenceItemsStore,
  churchProfilesStore,
  churchRequirementsStore,
  decorDeliverablesStore,
  decorPlansStore,
  giftPlansStore,
  groomingAppointmentsStore,
  menuItemsStore,
  musicAVPlansStore,
  musicCuesStore,
  photoGroupsStore,
  photographyPlansStore,
  resetToDemoData,
  welcomeKitItemsStore,
  welcomeKitsStore,
} from '@/data/stores';
import { BACKUP_VERSION } from '@/types';

const WEDDING_PREP_KEYS = [
  'churchProfiles',
  'churchRequirements',
  'ceremonyParticipants',
  'ceremonySequenceItems',
  'ceremonyItems',
  'cateringPlans',
  'menuItems',
  'decorPlans',
  'decorDeliverables',
  'attireProfiles',
  'attireItems',
  'groomingAppointments',
  'photographyPlans',
  'photoGroups',
  'musicCues',
  'musicAVPlans',
  'giftPlans',
  'welcomeKits',
  'welcomeKitItems',
] as const;

describe('version 5 backup export', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports the current backup version with all wedding-preparation collections included', () => {
    const backup = exportBackup();
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(backup.churchProfiles.length).toBeGreaterThan(0);
    expect(backup.churchRequirements.length).toBeGreaterThan(0);
    expect(backup.ceremonyParticipants.length).toBeGreaterThan(0);
    expect(backup.ceremonySequenceItems.length).toBeGreaterThan(0);
    expect(backup.ceremonyItems.length).toBeGreaterThan(0);
    expect(backup.cateringPlans.length).toBeGreaterThan(0);
    expect(backup.menuItems.length).toBeGreaterThan(0);
    expect(backup.decorPlans.length).toBeGreaterThan(0);
    expect(backup.decorDeliverables.length).toBeGreaterThan(0);
    expect(backup.attireProfiles.length).toBeGreaterThan(0);
    expect(backup.attireItems.length).toBeGreaterThan(0);
    expect(backup.groomingAppointments.length).toBeGreaterThan(0);
    expect(backup.photographyPlans.length).toBeGreaterThan(0);
    expect(backup.photoGroups.length).toBeGreaterThan(0);
    expect(backup.musicCues.length).toBeGreaterThan(0);
    expect(backup.musicAVPlans.length).toBeGreaterThan(0);
    expect(backup.giftPlans.length).toBeGreaterThan(0);
    expect(backup.welcomeKits.length).toBeGreaterThan(0);
    expect(backup.welcomeKitItems.length).toBeGreaterThan(0);
  });
});

describe('version 5 backup round trip', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('validates and imports a well-formed version 5 backup', () => {
    const backup = exportBackup();
    const result = validateBackup(backup);
    expect(result.valid).toBe(true);

    const trimmed = {
      ...backup,
      churchRequirements: backup.churchRequirements.slice(0, 3),
      ceremonyParticipants: backup.ceremonyParticipants.slice(0, 2),
      ceremonyItems: backup.ceremonyItems.slice(0, 4),
      menuItems: backup.menuItems.slice(0, 5),
      giftPlans: backup.giftPlans.slice(0, 2),
    };
    importBackup(trimmed);
    expect(churchRequirementsStore.get()).toHaveLength(3);
    expect(ceremonyParticipantsStore.get()).toHaveLength(2);
    expect(ceremonyItemsStore.get()).toHaveLength(4);
    expect(menuItemsStore.get()).toHaveLength(5);
    expect(giftPlansStore.get()).toHaveLength(2);
  });
});

describe('version 4 backward compatibility', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  function stripWeddingPrep() {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of WEDDING_PREP_KEYS) delete rest[key];
    return { ...rest, version: 4 };
  }

  it('accepts a version 4 backup that has no wedding-preparation fields at all', () => {
    const v4Backup = stripWeddingPrep();
    const result = validateBackup(v4Backup);
    expect(result.valid).toBe(true);
  });

  it('normalizes a version 4 backup to include empty wedding-preparation arrays', () => {
    const v4Backup = stripWeddingPrep();
    const normalized = normalizeBackup(v4Backup);
    for (const key of WEDDING_PREP_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.vendors.length).toBeGreaterThan(0);
    expect(normalized.budgetItems.length).toBeGreaterThan(0);
  });

  it('importing a normalized version 4 backup does not fail and clears wedding-preparation data', () => {
    const v4Backup = stripWeddingPrep();
    const normalized = normalizeBackup(v4Backup);
    importBackup(normalized);

    expect(churchProfilesStore.get()).toEqual([]);
    expect(churchRequirementsStore.get()).toEqual([]);
    expect(ceremonyParticipantsStore.get()).toEqual([]);
    expect(ceremonySequenceItemsStore.get()).toEqual([]);
    expect(ceremonyItemsStore.get()).toEqual([]);
    expect(cateringPlansStore.get()).toEqual([]);
    expect(menuItemsStore.get()).toEqual([]);
    expect(decorPlansStore.get()).toEqual([]);
    expect(decorDeliverablesStore.get()).toEqual([]);
    expect(attireProfilesStore.get()).toEqual([]);
    expect(attireItemsStore.get()).toEqual([]);
    expect(groomingAppointmentsStore.get()).toEqual([]);
    expect(photographyPlansStore.get()).toEqual([]);
    expect(photoGroupsStore.get()).toEqual([]);
    expect(musicCuesStore.get()).toEqual([]);
    expect(musicAVPlansStore.get()).toEqual([]);
    expect(giftPlansStore.get()).toEqual([]);
    expect(welcomeKitsStore.get()).toEqual([]);
    expect(welcomeKitItemsStore.get()).toEqual([]);
  });
});

describe('version 1, 2, 3 backward compatibility with wedding preparation', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('normalizes a version 3 backup (no finance, no wedding-prep fields) correctly', () => {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of WEDDING_PREP_KEYS) delete rest[key];
    const financeKeys = ['vendors', 'vendorContacts', 'vendorQuotes', 'contracts', 'budgetCategories', 'budgetItems', 'paymentSchedules', 'payments', 'refunds'];
    for (const key of financeKeys) delete rest[key];
    const v3Backup = { ...rest, version: 3 };

    const result = validateBackup(v3Backup);
    expect(result.valid).toBe(true);

    const normalized = normalizeBackup(v3Backup);
    for (const key of WEDDING_PREP_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.hotels.length).toBeGreaterThan(0);
  });

  it('normalizes a version 1 backup to include empty wedding-preparation arrays alongside everything else', () => {
    const backup = exportBackup();
    const rest = { ...backup } as Record<string, unknown>;
    for (const key of WEDDING_PREP_KEYS) delete rest[key];
    const otherKeys = [
      'vendors', 'vendorContacts', 'vendorQuotes', 'contracts', 'budgetCategories', 'budgetItems', 'paymentSchedules', 'payments', 'refunds',
      'travelSegments', 'hotels', 'roomTypes', 'rooms', 'roomAssignments', 'vehicles', 'drivers', 'transportRoutes', 'transportAssignments',
      'households', 'guests',
    ];
    for (const key of otherKeys) delete rest[key];
    const v1Backup = { ...rest, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    for (const key of WEDDING_PREP_KEYS) {
      expect(normalized[key]).toEqual([]);
    }
    expect(normalized.tasks.length).toBeGreaterThan(0);
  });
});

describe('invalid wedding-preparation backup rejection', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('rejects a version 5 backup with a malformed church requirement (invalid status)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, churchRequirements: [{ ...backup.churchRequirements[0], status: 'Blessed' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('church'))).toBe(true);
  });

  it('rejects a version 5 backup with a malformed ceremony item (invalid category)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, ceremonyItems: [{ ...backup.ceremonyItems[0], category: 'Confetti Cannon' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('ceremony item'))).toBe(true);
  });

  it('rejects a version 5 backup with a malformed décor plan (invalid area)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, decorPlans: [{ ...backup.decorPlans[0], area: 'Moon' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('décor'))).toBe(true);
  });

  it('rejects a version 5 backup missing the ceremonyParticipants array entirely', () => {
    const backup = exportBackup();
    const { ceremonyParticipants: _cp, ...rest } = backup;
    const result = validateBackup(rest);
    expect(result.valid).toBe(false);
  });

  it('rejects a version 5 backup with a malformed gift plan (invalid recipient type)', () => {
    const backup = exportBackup();
    const corrupted = { ...backup, giftPlans: [{ ...backup.giftPlans[0], recipientType: 'Aliens' }] };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('gift'))).toBe(true);
  });
});
