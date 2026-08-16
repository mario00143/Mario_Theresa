import { describe, expect, it } from 'vitest';
import type { LiveIssue } from '@/types';
import { DEFAULT_WEDDING_DAY_SETTINGS } from '@/types';
import { isLiveIssueEscalationDue, isLiveIssueOpen, liveIssueOpenMinutes, openLiveIssues, criticalOpenLiveIssues } from '@/utils/liveIssueLogic';

function issue(overrides: Partial<LiveIssue> = {}): LiveIssue {
  return {
    id: 'issue-1',
    title: 'Test issue',
    category: 'Other',
    severity: 'Medium',
    status: 'Open',
    reportedAt: '2027-01-30T10:00:00.000Z',
    followUpRequired: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isLiveIssueOpen / openLiveIssues / criticalOpenLiveIssues', () => {
  it('treats Open, Investigating, and Mitigating as open', () => {
    expect(isLiveIssueOpen(issue({ status: 'Open' }))).toBe(true);
    expect(isLiveIssueOpen(issue({ status: 'Investigating' }))).toBe(true);
    expect(isLiveIssueOpen(issue({ status: 'Mitigating' }))).toBe(true);
  });

  it('treats Resolved and Closed as not open', () => {
    expect(isLiveIssueOpen(issue({ status: 'Resolved' }))).toBe(false);
    expect(isLiveIssueOpen(issue({ status: 'Closed' }))).toBe(false);
  });

  it('filters to only open issues', () => {
    const issues = [issue({ id: 'a', status: 'Open' }), issue({ id: 'b', status: 'Resolved' })];
    expect(openLiveIssues(issues).map((i) => i.id)).toEqual(['a']);
  });

  it('filters to only open Critical issues', () => {
    const issues = [
      issue({ id: 'a', status: 'Open', severity: 'Critical' }),
      issue({ id: 'b', status: 'Open', severity: 'High' }),
      issue({ id: 'c', status: 'Resolved', severity: 'Critical' }),
    ];
    expect(criticalOpenLiveIssues(issues).map((i) => i.id)).toEqual(['a']);
  });
});

describe('liveIssueOpenMinutes (section 14)', () => {
  it('computes elapsed minutes from reportedAt to the reference time', () => {
    const minutes = liveIssueOpenMinutes(issue({ reportedAt: '2027-01-30T10:00:00.000Z' }), '2027-01-30T10:25:00.000Z');
    expect(minutes).toBe(25);
  });

  it('measures up to resolvedAt for an already-resolved issue, ignoring the reference time', () => {
    const minutes = liveIssueOpenMinutes(
      issue({ reportedAt: '2027-01-30T10:00:00.000Z', status: 'Resolved', resolvedAt: '2027-01-30T10:10:00.000Z' }),
      '2027-01-30T12:00:00.000Z',
    );
    expect(minutes).toBe(10);
  });

  it('never returns a negative duration', () => {
    const minutes = liveIssueOpenMinutes(issue({ reportedAt: '2027-01-30T10:00:00.000Z' }), '2027-01-30T09:00:00.000Z');
    expect(minutes).toBe(0);
  });
});

describe('isLiveIssueEscalationDue (section 14)', () => {
  it('flags a Critical issue open longer than the critical threshold', () => {
    const due = isLiveIssueEscalationDue(issue({ severity: 'Critical', reportedAt: '2027-01-30T10:00:00.000Z' }), DEFAULT_WEDDING_DAY_SETTINGS, '2027-01-30T10:10:00.000Z');
    expect(due).toBe(true); // default threshold is 5 minutes
  });

  it('does not flag a Critical issue still within its threshold', () => {
    const due = isLiveIssueEscalationDue(issue({ severity: 'Critical', reportedAt: '2027-01-30T10:00:00.000Z' }), DEFAULT_WEDDING_DAY_SETTINGS, '2027-01-30T10:02:00.000Z');
    expect(due).toBe(false);
  });

  it('flags a High issue open longer than the high threshold', () => {
    const due = isLiveIssueEscalationDue(issue({ severity: 'High', reportedAt: '2027-01-30T10:00:00.000Z' }), DEFAULT_WEDDING_DAY_SETTINGS, '2027-01-30T10:20:00.000Z');
    expect(due).toBe(true); // default threshold is 15 minutes
  });

  it('flags a Medium issue open longer than the medium threshold', () => {
    const due = isLiveIssueEscalationDue(issue({ severity: 'Medium', reportedAt: '2027-01-30T10:00:00.000Z' }), DEFAULT_WEDDING_DAY_SETTINGS, '2027-01-30T10:35:00.000Z');
    expect(due).toBe(true); // default threshold is 30 minutes
  });

  it('never flags a Low-severity issue (no configured threshold)', () => {
    const due = isLiveIssueEscalationDue(issue({ severity: 'Low', reportedAt: '2027-01-30T10:00:00.000Z' }), DEFAULT_WEDDING_DAY_SETTINGS, '2027-02-01T00:00:00.000Z');
    expect(due).toBe(false);
  });

  it('never flags an already-resolved issue', () => {
    const due = isLiveIssueEscalationDue(
      issue({ severity: 'Critical', status: 'Resolved', reportedAt: '2027-01-30T10:00:00.000Z' }),
      DEFAULT_WEDDING_DAY_SETTINGS,
      '2027-01-30T11:00:00.000Z',
    );
    expect(due).toBe(false);
  });

  it('respects a custom configured threshold', () => {
    const customSettings = { ...DEFAULT_WEDDING_DAY_SETTINGS, criticalIssueEscalationMinutes: 60 };
    const due = isLiveIssueEscalationDue(issue({ severity: 'Critical', reportedAt: '2027-01-30T10:00:00.000Z' }), customSettings, '2027-01-30T10:30:00.000Z');
    expect(due).toBe(false);
  });
});
