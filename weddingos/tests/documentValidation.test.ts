import { describe, expect, it } from 'vitest';
import { validateDocumentFile } from '@/data/supabase/documentRepository';
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
});
