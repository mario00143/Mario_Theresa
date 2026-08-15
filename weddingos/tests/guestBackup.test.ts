import { beforeEach, describe, expect, it } from 'vitest';
import {
  exportBackup,
  importBackup,
  normalizeBackup,
  validateBackup,
} from '@/data/repositories/backupRepository';
import { guestsStore, householdsStore, resetToDemoData } from '@/data/stores';
import { BACKUP_VERSION } from '@/types';

describe('version 2 backup export', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports version 2 with households and guests included', () => {
    const backup = exportBackup();
    expect(backup.version).toBe(2);
    expect(BACKUP_VERSION).toBe(2);
    expect(backup.households.length).toBeGreaterThan(0);
    expect(backup.guests.length).toBeGreaterThan(0);
  });
});

describe('version 2 backup import', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('validates and imports a well-formed version 2 backup', () => {
    const backup = exportBackup();
    const result = validateBackup(backup);
    expect(result.valid).toBe(true);

    const trimmed = { ...backup, households: backup.households.slice(0, 2), guests: backup.guests.slice(0, 3) };
    importBackup(trimmed);
    expect(householdsStore.get()).toHaveLength(2);
    expect(guestsStore.get()).toHaveLength(3);
  });
});

describe('version 1 backward compatibility', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('accepts a version 1 backup that has no households/guests fields at all', () => {
    const backup = exportBackup();
    const { households: _h, guests: _g, ...v1Shape } = backup;
    const v1Backup = { ...v1Shape, version: 1 };

    const result = validateBackup(v1Backup);
    expect(result.valid).toBe(true);
  });

  it('normalizes a version 1 backup to include empty households/guests arrays', () => {
    const backup = exportBackup();
    const { households: _h, guests: _g, ...v1Shape } = backup;
    const v1Backup = { ...v1Shape, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    expect(normalized.households).toEqual([]);
    expect(normalized.guests).toEqual([]);
    expect(normalized.tasks.length).toBeGreaterThan(0);
  });

  it('importing a normalized version 1 backup does not fail and clears guest data', () => {
    const backup = exportBackup();
    const { households: _h, guests: _g, ...v1Shape } = backup;
    const v1Backup = { ...v1Shape, version: 1 };

    const normalized = normalizeBackup(v1Backup);
    importBackup(normalized);

    expect(householdsStore.get()).toEqual([]);
    expect(guestsStore.get()).toEqual([]);
    expect(householdsStore.get().length + guestsStore.get().length).toBe(0);
  });
});

describe('invalid backup rejection', () => {
  it('rejects a backup with a malformed household (invalid side)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      households: [{ ...backup.households[0], side: 'Not A Real Side' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('household'))).toBe(true);
  });

  it('rejects a backup with a malformed guest (invalid age category)', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      guests: [{ ...backup.guests[0], ageCategory: 'Teenager' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('guest'))).toBe(true);
  });

  it('rejects a version 2 backup missing the households array entirely', () => {
    const backup = exportBackup();
    const { households: _h, ...rest } = backup;
    const result = validateBackup(rest);
    expect(result.valid).toBe(false);
  });

  it('still rejects completely malformed input', () => {
    expect(validateBackup(null).valid).toBe(false);
    expect(validateBackup({ foo: 'bar' }).valid).toBe(false);
    expect(validateBackup('nonsense').valid).toBe(false);
  });
});
