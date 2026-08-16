import { describe, expect, it } from 'vitest';
import type { ChurchRequirement } from '@/types';
import {
  computeChurchRequirementWarnings,
  getParishConfirmationQueue,
  isChurchRequirementOverdue,
  isCriticalChurchRequirementIncomplete,
  isParishConfirmationOverdue,
} from '@/utils/churchLogic';

function req(overrides: Partial<ChurchRequirement> = {}): ChurchRequirement {
  return {
    id: 'req-1',
    churchProfileId: 'church-1',
    title: 'Freedom to marry declaration',
    category: 'Freedom to Marry',
    applicability: 'Applicable',
    status: 'Not Started',
    documentRequired: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('church requirement warnings (section 7)', () => {
  it('produces no warnings for a Not Applicable requirement', () => {
    expect(computeChurchRequirementWarnings(req({ applicability: 'Not Applicable' }))).toEqual([]);
  });

  it('flags missing owner and due date on an incomplete Applicable requirement', () => {
    const warnings = computeChurchRequirementWarnings(req());
    expect(warnings).toContain('No owner assigned.');
    expect(warnings).toContain('No due date set.');
  });

  it('flags an overdue requirement', () => {
    const warnings = computeChurchRequirementWarnings(req({ dueDate: '2026-01-01', owner: 'Groom' }), '2026-06-01');
    expect(warnings).toContain('Overdue.');
  });

  it('flags a requirement due soon but not yet overdue', () => {
    const warnings = computeChurchRequirementWarnings(req({ dueDate: '2026-06-10', owner: 'Groom' }), '2026-06-01');
    expect(warnings.some((w) => w.startsWith('Due within'))).toBe(true);
  });

  it('flags a Submitted-but-not-verified requirement as still having an open warning', () => {
    const warnings = computeChurchRequirementWarnings(req({ status: 'Submitted', owner: 'Groom', dueDate: '2026-01-01' }), '2026-06-01');
    expect(warnings).toContain('Submitted but not yet verified.');
  });

  it('still surfaces the submitted-not-verified warning alongside missing-field warnings, since Submitted is not a done status', () => {
    const warnings = computeChurchRequirementWarnings(req({ status: 'Submitted' }));
    expect(warnings).toContain('Submitted but not yet verified.');
    expect(warnings).toContain('No owner assigned.');
  });

  it('produces no warnings for a Verified requirement', () => {
    expect(computeChurchRequirementWarnings(req({ status: 'Verified' }))).toEqual([]);
  });

  it('flags a document-required requirement with no document name', () => {
    const warnings = computeChurchRequirementWarnings(req({ documentRequired: true, owner: 'Groom', dueDate: '2027-01-01' }), '2026-06-01');
    expect(warnings).toContain('Document required but no document name/reference on file.');
  });

  it('flags an incomplete Witnesses requirement', () => {
    const warnings = computeChurchRequirementWarnings(req({ category: 'Witnesses', owner: 'Bride', dueDate: '2027-01-01' }), '2026-06-01');
    expect(warnings).toContain('Witness requirement not yet complete.');
  });

  it('flags an incomplete Marriage Register requirement', () => {
    const warnings = computeChurchRequirementWarnings(req({ category: 'Marriage Register', owner: 'Bride', dueDate: '2027-01-01' }), '2026-06-01');
    expect(warnings).toContain('Marriage register/certificate workflow unresolved.');
  });
});

describe('parish confirmation queue (section 7)', () => {
  it('includes only Confirm with Parish requirements', () => {
    const requirements = [req({ id: 'a', applicability: 'Confirm with Parish' }), req({ id: 'b', applicability: 'Applicable' })];
    const queue = getParishConfirmationQueue(requirements);
    expect(queue.map((r) => r.id)).toEqual(['a']);
  });

  it('flags a Confirm with Parish requirement within 30 days of the wedding as overdue', () => {
    expect(isParishConfirmationOverdue(req({ applicability: 'Confirm with Parish' }), '2027-01-30', '2027-01-10')).toBe(true);
  });

  it('does not flag a Confirm with Parish requirement well ahead of the wedding', () => {
    expect(isParishConfirmationOverdue(req({ applicability: 'Confirm with Parish' }), '2027-01-30', '2026-06-01')).toBe(false);
  });

  it('never flags an Applicable requirement as a parish-confirmation overdue item', () => {
    expect(isParishConfirmationOverdue(req({ applicability: 'Applicable' }), '2027-01-30', '2027-01-10')).toBe(false);
  });
});

describe('critical church requirement incomplete (section 7)', () => {
  it('flags a critical, incomplete requirement within 14 days of the wedding', () => {
    expect(isCriticalChurchRequirementIncomplete(req({ category: 'Freedom to Marry' }), '2027-01-30', '2027-01-20')).toBe(true);
  });

  it('does not flag a non-critical category', () => {
    expect(isCriticalChurchRequirementIncomplete(req({ category: 'Church Fees' }), '2027-01-30', '2027-01-20')).toBe(false);
  });

  it('does not flag a completed requirement', () => {
    expect(isCriticalChurchRequirementIncomplete(req({ category: 'Freedom to Marry', status: 'Verified' }), '2027-01-30', '2027-01-20')).toBe(false);
  });

  it('does not flag when well outside the 14-day window', () => {
    expect(isCriticalChurchRequirementIncomplete(req({ category: 'Freedom to Marry' }), '2027-01-30', '2026-06-01')).toBe(false);
  });
});

describe('church requirement overdue (section 7)', () => {
  it('flags an Applicable requirement past its due date and not done', () => {
    expect(isChurchRequirementOverdue(req({ dueDate: '2026-01-01' }), '2026-06-01')).toBe(true);
  });

  it('does not flag a requirement with no due date', () => {
    expect(isChurchRequirementOverdue(req(), '2026-06-01')).toBe(false);
  });

  it('does not flag a Not Applicable requirement even if a due date has passed', () => {
    expect(isChurchRequirementOverdue(req({ dueDate: '2026-01-01', applicability: 'Not Applicable' }), '2026-06-01')).toBe(false);
  });

  it('does not flag a Verified requirement', () => {
    expect(isChurchRequirementOverdue(req({ dueDate: '2026-01-01', status: 'Verified' }), '2026-06-01')).toBe(false);
  });
});
