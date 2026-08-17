import { describe, expect, it } from 'vitest';
import { validateDocumentFile } from '@/data/supabase/documentRepository';
import { buildDocumentStoragePath } from '@/data/documents/storagePath';
import { DEFAULT_MAX_DOCUMENT_SIZE_BYTES } from '@/types';

function makeFile(name: string, type: string, size: number): File {
  const file = new File([new Uint8Array(Math.min(size, 1024))], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateDocumentFile (section 39)', () => {
  it('accepts an allowed type under the size limit', () => {
    expect(validateDocumentFile(makeFile('contract.pdf', 'application/pdf', 1024))).toBeNull();
  });

  it('accepts every allowed type from the spec list', () => {
    const allowed = [
      ['a.pdf', 'application/pdf'],
      ['a.jpg', 'image/jpeg'],
      ['a.png', 'image/png'],
      ['a.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      ['a.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      ['a.txt', 'text/plain'],
    ] as const;
    for (const [name, type] of allowed) {
      expect(validateDocumentFile(makeFile(name, type, 100))).toBeNull();
    }
  });

  it('rejects an executable file type', () => {
    const result = validateDocumentFile(makeFile('malware.exe', 'application/x-msdownload', 100));
    expect(result?.reason).toBe('type');
  });

  it('rejects a file over the default 10MB size limit', () => {
    const result = validateDocumentFile(makeFile('big.pdf', 'application/pdf', DEFAULT_MAX_DOCUMENT_SIZE_BYTES + 1));
    expect(result?.reason).toBe('size');
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validateDocumentFile(makeFile('exact.pdf', 'application/pdf', DEFAULT_MAX_DOCUMENT_SIZE_BYTES))).toBeNull();
  });

  it('rejects a file whose extension does not match an allowed type, even with a spoofed allowed MIME type (section 37)', () => {
    const result = validateDocumentFile(makeFile('payload.exe', 'application/pdf', 100));
    expect(result?.reason).toBe('type');
  });

  it('rejects a file with no extension at all', () => {
    const result = validateDocumentFile(makeFile('noextension', 'application/pdf', 100));
    expect(result?.reason).toBe('type');
  });

  it('extension check is case-insensitive', () => {
    expect(validateDocumentFile(makeFile('SCAN.PDF', 'application/pdf', 100))).toBeNull();
  });
});

describe('buildDocumentStoragePath (section 37-38): filename sanitization, no path traversal, randomized + workspace-prefixed', () => {
  it('strips every slash from the filename so a traversal-style name cannot add or escape path segments', () => {
    const path = buildDocumentStoragePath('workspace-1', 'Contract', '../../etc/passwd');
    expect(path.startsWith('workspace-1/Contract/')).toBe(true);
    // Exactly 3 segments (workspaceId/category/filename) — the malicious input's slashes
    // were all replaced with underscores, so it cannot introduce a 4th segment or escape upward.
    expect(path.split('/')).toHaveLength(3);
    const filenamePart = path.split('/')[2];
    expect(filenamePart).not.toContain('/');
  });

  it('strips shell/special characters, keeping only the safe character set', () => {
    const path = buildDocumentStoragePath('workspace-1', 'Other', 'weird;name`$(rm -rf).pdf');
    const filenamePart = path.split('/')[2];
    expect(/^[a-zA-Z0-9._-]+-[a-zA-Z0-9._-]+$/.test(filenamePart)).toBe(true);
  });

  it('prefixes every path with the workspace id, so one workspace can never guess into another', () => {
    const pathA = buildDocumentStoragePath('workspace-a', 'Contract', 'file.pdf');
    const pathB = buildDocumentStoragePath('workspace-b', 'Contract', 'file.pdf');
    expect(pathA.startsWith('workspace-a/')).toBe(true);
    expect(pathB.startsWith('workspace-b/')).toBe(true);
    expect(pathA).not.toBe(pathB);
  });

  it('randomizes the stored filename so two uploads of the same original filename never collide', () => {
    const first = buildDocumentStoragePath('workspace-1', 'Contract', 'contract.pdf');
    const second = buildDocumentStoragePath('workspace-1', 'Contract', 'contract.pdf');
    expect(first).not.toBe(second);
  });
});
