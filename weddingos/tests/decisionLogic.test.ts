import { describe, expect, it } from 'vitest';
import type { Decision } from '@/types';
import { isDecisionDueSoon, isDecisionOverdue } from '@/utils/decisionLogic';

const REFERENCE = new Date('2026-08-15T00:00:00.000Z');

function makeDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    id: 'decision-1',
    title: 'Sample decision',
    description: '',
    category: 'Governance',
    owner: 'Groom',
    options: [],
    status: 'Open',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('decision overdue logic', () => {
  it('flags an open decision past its deadline as overdue', () => {
    const decision = makeDecision({ deadline: '2026-08-10', status: 'Open' });
    expect(isDecisionOverdue(decision, REFERENCE)).toBe(true);
  });

  it('does not flag a decision with a future deadline', () => {
    const decision = makeDecision({ deadline: '2026-08-20', status: 'Open' });
    expect(isDecisionOverdue(decision, REFERENCE)).toBe(false);
  });

  it('does not flag a Decided decision even past its deadline', () => {
    const decision = makeDecision({ deadline: '2026-08-01', status: 'Decided', finalDecision: 'Chosen option' });
    expect(isDecisionOverdue(decision, REFERENCE)).toBe(false);
  });

  it('does not flag a Deferred decision as overdue', () => {
    const decision = makeDecision({ deadline: '2026-08-01', status: 'Deferred' });
    expect(isDecisionOverdue(decision, REFERENCE)).toBe(false);
  });

  it('does not flag a decision without a deadline', () => {
    const decision = makeDecision({ deadline: undefined });
    expect(isDecisionOverdue(decision, REFERENCE)).toBe(false);
  });
});

describe('decision due-soon logic', () => {
  it('flags a decision due within 7 days', () => {
    const decision = makeDecision({ deadline: '2026-08-20', status: 'Under Discussion' });
    expect(isDecisionDueSoon(decision, REFERENCE)).toBe(true);
  });

  it('does not flag a decision due in 10 days', () => {
    const decision = makeDecision({ deadline: '2026-08-25', status: 'Open' });
    expect(isDecisionDueSoon(decision, REFERENCE)).toBe(false);
  });

  it('does not flag an overdue decision as due-soon', () => {
    const decision = makeDecision({ deadline: '2026-08-10', status: 'Open' });
    expect(isDecisionDueSoon(decision, REFERENCE)).toBe(false);
  });
});
