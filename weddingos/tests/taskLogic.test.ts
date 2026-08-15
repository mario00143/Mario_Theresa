import { describe, expect, it } from 'vitest';
import type { Task } from '@/types';
import {
  completionPercentage,
  criticalCompletionPercentage,
  getDependencyStatus,
  isProtectedPeriodViolation,
  isTaskDueSoon,
  isTaskDueWithinTwoWeeks,
  isTaskOverdue,
  validateTask,
  wouldCreateCircularDependency,
} from '@/utils/taskLogic';

const REFERENCE = new Date('2026-08-15T00:00:00.000Z');

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 'task-1',
    title: 'Sample task',
    description: '',
    event: 'Wedding',
    workstream: 'Governance',
    owner: 'Groom',
    status: 'Not Started',
    priority: 'Medium',
    dependencies: [],
    completionCriteria: 'Done when confirmed.',
    tags: [],
    subtasks: [],
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('overdue detection', () => {
  it('flags an incomplete task with a past due date as overdue', () => {
    const task = makeTask({ dueDate: '2026-08-10' });
    expect(isTaskOverdue(task, REFERENCE)).toBe(true);
  });

  it('does not flag a task due in the future as overdue', () => {
    const task = makeTask({ dueDate: '2026-08-20' });
    expect(isTaskOverdue(task, REFERENCE)).toBe(false);
  });

  it('does not flag a Done task as overdue even with a past due date', () => {
    const task = makeTask({ dueDate: '2026-08-01', status: 'Done', completionNote: 'Finished early.' });
    expect(isTaskOverdue(task, REFERENCE)).toBe(false);
  });

  it('does not flag a task with no due date as overdue', () => {
    const task = makeTask({ dueDate: undefined });
    expect(isTaskOverdue(task, REFERENCE)).toBe(false);
  });
});

describe('due-soon detection', () => {
  it('flags a task due within 7 days', () => {
    const task = makeTask({ dueDate: '2026-08-20' });
    expect(isTaskDueSoon(task, REFERENCE)).toBe(true);
  });

  it('does not flag a task due in 10 days as due-soon (7-day window)', () => {
    const task = makeTask({ dueDate: '2026-08-25' });
    expect(isTaskDueSoon(task, REFERENCE)).toBe(false);
  });

  it('flags a task due within 14 days for the two-week window', () => {
    const task = makeTask({ dueDate: '2026-08-28' });
    expect(isTaskDueWithinTwoWeeks(task, REFERENCE)).toBe(true);
  });

  it('does not flag an overdue task as due-soon', () => {
    const task = makeTask({ dueDate: '2026-08-01' });
    expect(isTaskDueSoon(task, REFERENCE)).toBe(false);
  });
});

describe('completion percentage', () => {
  it('computes overall completion excluding cancelled tasks', () => {
    const tasks = [
      makeTask({ id: '1', status: 'Done' }),
      makeTask({ id: '2', status: 'Done' }),
      makeTask({ id: '3', status: 'Not Started' }),
      makeTask({ id: '4', status: 'Cancelled' }),
    ];
    // 2 done out of 3 non-cancelled tasks = 67%
    expect(completionPercentage(tasks)).toBe(67);
  });

  it('returns 0 for an empty list', () => {
    expect(completionPercentage([])).toBe(0);
  });

  it('returns 100 when every task is done', () => {
    const tasks = [makeTask({ id: '1', status: 'Done' }), makeTask({ id: '2', status: 'Done' })];
    expect(completionPercentage(tasks)).toBe(100);
  });
});

describe('critical completion percentage', () => {
  it('computes completion across only Critical-priority tasks', () => {
    const tasks = [
      makeTask({ id: '1', priority: 'Critical', status: 'Done' }),
      makeTask({ id: '2', priority: 'Critical', status: 'Not Started' }),
      makeTask({ id: '3', priority: 'Low', status: 'Not Started' }),
    ];
    expect(criticalCompletionPercentage(tasks)).toBe(50);
  });

  it('returns 0 when there are no critical tasks', () => {
    const tasks = [makeTask({ priority: 'Low' })];
    expect(criticalCompletionPercentage(tasks)).toBe(0);
  });
});

describe('protected engagement period detection', () => {
  it('flags a Critical Wedding task due inside 8-13 Jan 2027', () => {
    const task = makeTask({ event: 'Wedding', priority: 'Critical', dueDate: '2027-01-10' });
    expect(isProtectedPeriodViolation(task)).toBe(true);
  });

  it('flags a High "Both" task due on the boundary date (8 Jan)', () => {
    const task = makeTask({ event: 'Both', priority: 'High', dueDate: '2027-01-08' });
    expect(isProtectedPeriodViolation(task)).toBe(true);
  });

  it('flags the closing boundary date (13 Jan)', () => {
    const task = makeTask({ event: 'Wedding', priority: 'Critical', dueDate: '2027-01-13' });
    expect(isProtectedPeriodViolation(task)).toBe(true);
  });

  it('does not flag a date just outside the window (14 Jan)', () => {
    const task = makeTask({ event: 'Wedding', priority: 'Critical', dueDate: '2027-01-14' });
    expect(isProtectedPeriodViolation(task)).toBe(false);
  });

  it('does not flag a Medium/Low priority task inside the window', () => {
    const task = makeTask({ event: 'Wedding', priority: 'Medium', dueDate: '2027-01-10' });
    expect(isProtectedPeriodViolation(task)).toBe(false);
  });

  it('does not flag an Engagement-only task inside the window', () => {
    const task = makeTask({ event: 'Engagement', priority: 'Critical', dueDate: '2027-01-10' });
    expect(isProtectedPeriodViolation(task)).toBe(false);
  });
});

describe('dependency status', () => {
  it('reports blocked-by-dependency when a dependency is incomplete', () => {
    const dep = makeTask({ id: 'dep-1', status: 'Not Started' });
    const task = makeTask({ id: 'task-2', dependencies: ['dep-1'] });
    const status = getDependencyStatus(task, [dep, task]);
    expect(status.hasDependencies).toBe(true);
    expect(status.isBlockedByDependency).toBe(true);
    expect(status.incomplete).toHaveLength(1);
  });

  it('reports not blocked when all dependencies are done', () => {
    const dep = makeTask({ id: 'dep-1', status: 'Done', completionNote: 'done' });
    const task = makeTask({ id: 'task-2', dependencies: ['dep-1'] });
    const status = getDependencyStatus(task, [dep, task]);
    expect(status.isBlockedByDependency).toBe(false);
  });

  it('detects a direct circular dependency', () => {
    const a = makeTask({ id: 'a', dependencies: [] });
    const b = makeTask({ id: 'b', dependencies: ['a'] });
    expect(wouldCreateCircularDependency('a', 'b', [a, b])).toBe(true);
  });

  it('detects a transitive circular dependency', () => {
    const a = makeTask({ id: 'a', dependencies: [] });
    const b = makeTask({ id: 'b', dependencies: ['a'] });
    const c = makeTask({ id: 'c', dependencies: ['b'] });
    expect(wouldCreateCircularDependency('a', 'c', [a, b, c])).toBe(true);
  });

  it('allows a non-circular dependency', () => {
    const a = makeTask({ id: 'a', dependencies: [] });
    const b = makeTask({ id: 'b', dependencies: [] });
    expect(wouldCreateCircularDependency('a', 'b', [a, b])).toBe(false);
  });
});

describe('task validation rules', () => {
  it('warns when an active task is missing owner, due date and completion criteria', () => {
    const task = makeTask({ owner: '', dueDate: undefined, completionCriteria: '' });
    const issues = validateTask(task);
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['owner', 'dueDate', 'completionCriteria']));
  });

  it('requires a blocked reason when status is Blocked', () => {
    const task = makeTask({ status: 'Blocked', blockedReason: '' });
    const issues = validateTask(task);
    expect(issues.some((i) => i.field === 'blockedReason')).toBe(true);
  });

  it('does not warn about blocked reason when one is provided', () => {
    const task = makeTask({ status: 'Blocked', blockedReason: 'Waiting on vendor.' });
    const issues = validateTask(task);
    expect(issues.some((i) => i.field === 'blockedReason')).toBe(false);
  });

  it('requires completion note or evidence when status is Done', () => {
    const task = makeTask({ status: 'Done', completionNote: '', completionEvidence: '' });
    const issues = validateTask(task);
    expect(issues.some((i) => i.field === 'completionNote')).toBe(true);
  });

  it('passes when Done task has completion evidence but no note', () => {
    const task = makeTask({ status: 'Done', completionNote: '', completionEvidence: 'photo.jpg' });
    const issues = validateTask(task);
    expect(issues.some((i) => i.field === 'completionNote')).toBe(false);
  });

  it('flags incomplete dependencies', () => {
    const dep = makeTask({ id: 'dep-1', status: 'Not Started' });
    const task = makeTask({ id: 'task-2', dependencies: ['dep-1'] });
    const issues = validateTask(task, [dep, task]);
    expect(issues.some((i) => i.field === 'dependencies')).toBe(true);
  });
});
