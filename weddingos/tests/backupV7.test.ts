import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, normalizeBackup, validateBackup } from '@/data/repositories/backupRepository';
import { resetToDemoData } from '@/data/stores';
import { BACKUP_VERSION } from '@/types';

describe('backup v7 — workspace/documents fields (section 59)', () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it('exports version 7 with workspace/documents/redactedSections left undefined for a pure local export', () => {
    const backup = exportBackup();
    expect(BACKUP_VERSION).toBe(7);
    expect(backup.version).toBe(7);
    expect(backup.workspace).toBeUndefined();
    expect(backup.documents).toBeUndefined();
    expect(backup.redactedSections).toBeUndefined();
  });

  it('never includes auth credentials, password hashes, invite tokens, or signed URLs in the exported shape', () => {
    const backup = exportBackup();
    const serialized = JSON.stringify(backup).toLowerCase();
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('tokenhash');
    expect(serialized).not.toContain('signedurl');
  });

  it('accepts a backup with workspace metadata and document metadata present', () => {
    const backup = exportBackup();
    const withWorkspace = {
      ...backup,
      workspace: {
        name: 'Test Wedding',
        slug: 'test-wedding',
        groomName: 'Alex',
        brideName: 'Priya',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      },
      documents: [
        {
          id: 'doc-1',
          workspaceId: 'ws-1',
          category: 'Contract' as const,
          title: 'Venue contract',
          storagePath: 'ws-1/Contract/uuid-file.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          uploadedBy: 'user-1',
          uploadedAt: '2026-01-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    const result = validateBackup(withWorkspace);
    expect(result.valid).toBe(true);
  });

  it('rejects malformed workspace metadata', () => {
    const backup = exportBackup();
    const result = validateBackup({ ...backup, workspace: { name: 'Only a name' } });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('workspace'))).toBe(true);
  });

  it('rejects a non-array documents field', () => {
    const backup = exportBackup();
    const result = validateBackup({ ...backup, documents: 'not an array' });
    expect(result.valid).toBe(false);
  });

  it('normalizeBackup passes workspace/documents/redactedSections through when present, and leaves them undefined when absent', () => {
    const backup = exportBackup();
    const normalizedWithout = normalizeBackup(backup);
    expect(normalizedWithout.workspace).toBeUndefined();
    expect(normalizedWithout.documents).toBeUndefined();

    const withExtras = { ...backup, workspace: { name: 'X', slug: 'x', groomName: 'A', brideName: 'B', timezone: 'UTC', currency: 'INR' }, redactedSections: ['payments'] };
    const normalizedWith = normalizeBackup(withExtras);
    expect(normalizedWith.workspace?.name).toBe('X');
    expect(normalizedWith.redactedSections).toEqual(['payments']);
  });

  it('still accepts a pure v6-shaped backup with no v7 fields at all', () => {
    const backup = exportBackup();
    const v6Shaped = { ...backup, version: 6 };
    delete (v6Shaped as { workspace?: unknown }).workspace;
    delete (v6Shaped as { documents?: unknown }).documents;
    const result = validateBackup(v6Shaped);
    expect(result.valid).toBe(true);
  });
});
