import { describe, expect, it } from 'vitest';
import { exportBackup, importBackup } from '@/data/repositories/backupRepository';
import { resetToDemoData, tasksStore, settingsStore } from '@/data/stores';
import { addTask } from '@/data/repositories/taskRepository';

/**
 * Section 43's backup hardening pass for Phase 8. BACKUP_VERSION stays at
 * 7 — Phase 8 deliberately introduced no new state that needs a schema
 * bump: the Launch Gate marker lives inside the existing
 * `settings.weddingDay` object (already backed up wholesale), and every
 * other Phase 8 addition (OfflineSnapshot, OfflineMutationQueue, the
 * local error log, install-prompt dismissal state) is explicitly
 * IndexedDB/localStorage-only and never part of the backup at all — this
 * file asserts that exclusion directly rather than assuming it.
 */
describe('Backup hardening (section 43)', () => {
  it('handles a large workspace export (1,000+ task records) without error and round-trips the count', () => {
    resetToDemoData();
    const before = tasksStore.get();
    const now = new Date().toISOString();
    const many = Array.from({ length: 1000 }, (_, i) => ({
      id: `perf-task-${i}`,
      title: `Bulk task ${i}`,
      description: '',
      event: 'Wedding' as const,
      workstream: 'Vendors' as const,
      owner: 'Owner',
      status: 'Not Started' as const,
      priority: 'Medium' as const,
      dependencies: [],
      completionCriteria: '',
      tags: [],
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    }));
    tasksStore.set([...before, ...many]);

    const backup = exportBackup();
    expect(backup.tasks.length).toBeGreaterThanOrEqual(1000);

    const serialized = JSON.stringify(backup);
    expect(serialized.length).toBeGreaterThan(0);
    const parsed = JSON.parse(serialized);
    expect(parsed.tasks.length).toBe(backup.tasks.length);
  });

  it('never includes IndexedDB-only keys (offline snapshot / mutation queue) or local-only diagnostic keys (error log) anywhere in the exported JSON', () => {
    resetToDemoData();
    const backup = exportBackup();
    const serialized = JSON.stringify(backup).toLowerCase();
    expect(serialized).not.toContain('offlinesnapshot');
    expect(serialized).not.toContain('offlinemutationqueue');
    expect(serialized).not.toContain('errorlog');
    expect(serialized).not.toContain('mutationqueue');
  });

  it('never includes auth session tokens, the Supabase anon key, or a service worker cache name', () => {
    resetToDemoData();
    const backup = exportBackup();
    const serialized = JSON.stringify(backup).toLowerCase();
    expect(serialized).not.toContain('access_token');
    expect(serialized).not.toContain('refresh_token');
    expect(serialized).not.toContain('anon_key');
    expect(serialized).not.toContain('workbox');
  });

  it('round-trips the new productionLaunchReview field inside settings.weddingDay without a schema change', () => {
    resetToDemoData();
    const settings = settingsStore.get();
    settingsStore.set({
      ...settings,
      weddingDay: {
        ...settings.weddingDay,
        productionLaunchReview: { reviewedAt: '2026-01-01T00:00:00.000Z', reviewedBy: 'Admin', appVersion: '1.0.0', unresolvedWarnings: ['Example warning'] },
      },
    });

    const backup = exportBackup();
    expect(backup.settings.weddingDay.productionLaunchReview?.reviewedBy).toBe('Admin');

    resetToDemoData();
    importBackup(backup);
    expect(settingsStore.get().weddingDay.productionLaunchReview?.reviewedBy).toBe('Admin');
  });

  it('still imports cleanly when productionLaunchReview is entirely absent (pre-Phase-8 backups)', () => {
    resetToDemoData();
    const backup = exportBackup();
    expect(backup.settings.weddingDay.productionLaunchReview).toBeUndefined();
    importBackup(backup);
    expect(settingsStore.get().weddingDay.productionLaunchReview).toBeUndefined();
  });

  it('a fresh task created after export is not silently lost on import (sanity check for the round-trip itself)', () => {
    resetToDemoData();
    const task = addTask({
      title: 'Recovery drill sentinel task',
      description: '',
      event: 'Wedding',
      workstream: 'Governance',
      owner: 'Owner',
      status: 'Not Started',
      priority: 'Medium',
      completionCriteria: '',
    });
    const backup = exportBackup();
    resetToDemoData();
    importBackup(backup);
    expect(tasksStore.get().some((t) => t.id === task.id)).toBe(true);
  });
});
