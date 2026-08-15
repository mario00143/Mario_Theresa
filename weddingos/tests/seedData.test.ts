import { describe, expect, it } from 'vitest';
import { createSeedBundle } from '@/data/seed';
import { isValidDateString } from '@/utils/date';

describe('seed data', () => {
  const bundle = createSeedBundle();

  it('includes at least 120 tasks', () => {
    expect(bundle.tasks.length).toBeGreaterThanOrEqual(120);
  });

  it('gives every task the required fields', () => {
    for (const task of bundle.tasks) {
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.event).toBeTruthy();
      expect(task.workstream).toBeTruthy();
      expect(task.owner.length).toBeGreaterThan(0);
      expect(task.priority).toBeTruthy();
      expect(task.status).toBeTruthy();
      expect(task.dueDate).toBeTruthy();
      expect(isValidDateString(task.dueDate)).toBe(true);
      expect(task.completionCriteria.length).toBeGreaterThan(0);
    }
  });

  it('has unique task ids', () => {
    const ids = new Set(bundle.tasks.map((t) => t.id));
    expect(ids.size).toBe(bundle.tasks.length);
  });

  it('resolves every dependency to a real task in the same bundle', () => {
    const ids = new Set(bundle.tasks.map((t) => t.id));
    for (const task of bundle.tasks) {
      for (const depId of task.dependencies) {
        expect(ids.has(depId)).toBe(true);
      }
    }
  });

  it('includes at least one task inside the protected engagement period', () => {
    const inWindow = bundle.tasks.some((t) => t.dueDate && t.dueDate >= '2027-01-08' && t.dueDate <= '2027-01-13');
    expect(inWindow).toBe(true);
  });

  it('includes roughly 10 seeded decisions with valid deadlines where set', () => {
    expect(bundle.decisions.length).toBeGreaterThanOrEqual(8);
    for (const decision of bundle.decisions) {
      if (decision.deadline) expect(isValidDateString(decision.deadline)).toBe(true);
    }
  });

  it('seeds all 15 default owner roles', () => {
    expect(bundle.owners.length).toBe(15);
    expect(bundle.owners.every((o) => !o.isCustom)).toBe(true);
  });
});
