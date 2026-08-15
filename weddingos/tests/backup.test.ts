import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, importBackup, tasksToCSV, validateBackup } from '@/data/repositories/backupRepository';
import { resetToDemoData, tasksStore } from '@/data/stores';
import { BACKUP_VERSION } from '@/types';

describe('backup export', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports a backup with the current version, settings, tasks, decisions and owners', () => {
    const backup = exportBackup();
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(typeof backup.exportedAt).toBe('string');
    expect(backup.tasks.length).toBeGreaterThan(0);
    expect(backup.decisions.length).toBeGreaterThan(0);
    expect(backup.owners.length).toBeGreaterThan(0);
    expect(backup.settings.couple.groomName).toBeTruthy();
  });

  it('produces CSV output with a header row and one row per task', () => {
    const csv = tasksToCSV(tasksStore.get());
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Title');
    expect(lines.length).toBe(tasksStore.get().length + 1);
  });
});

describe('backup import validation', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('accepts a well-formed backup exported from the app itself', () => {
    const backup = exportBackup();
    const result = validateBackup(backup);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a completely malformed object', () => {
    const result = validateBackup({ foo: 'bar' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects null and non-object input', () => {
    expect(validateBackup(null).valid).toBe(false);
    expect(validateBackup('not an object').valid).toBe(false);
    expect(validateBackup(42).valid).toBe(false);
  });

  it('rejects a backup with an invalid task status', () => {
    const backup = exportBackup();
    const corrupted = {
      ...backup,
      tasks: [{ ...backup.tasks[0], status: 'Not A Real Status' }],
    };
    const result = validateBackup(corrupted);
    expect(result.valid).toBe(false);
  });

  it('rejects a backup missing the settings section', () => {
    const backup = exportBackup();
    const { settings: _settings, ...rest } = backup;
    const result = validateBackup(rest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('settings'))).toBe(true);
  });

  it('imports a validated backup and replaces the current task list', () => {
    const backup = exportBackup();
    const trimmed = { ...backup, tasks: backup.tasks.slice(0, 1) };
    importBackup(trimmed);
    expect(tasksStore.get()).toHaveLength(1);
  });
});
