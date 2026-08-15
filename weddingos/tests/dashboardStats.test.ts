import { describe, expect, it } from 'vitest';
import type { Task } from '@/types';
import { buildAttentionItems, computePlanningHealth, upcomingIncompleteTasks } from '@/utils/dashboardStats';

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

describe('planning health', () => {
  it('aggregates counts across tasks and decisions', () => {
    const tasks = [
      makeTask({ id: '1', status: 'Done' }),
      makeTask({ id: '2', status: 'Blocked' }),
      makeTask({ id: '3', status: 'Not Started', dueDate: '2020-01-01' }),
    ];
    const health = computePlanningHealth(tasks, []);
    expect(health.totalTasks).toBe(3);
    expect(health.completedTasks).toBe(1);
    expect(health.blockedTasks).toBe(1);
    expect(health.overdueTasks).toBe(1);
  });
});

describe('attention required', () => {
  it('surfaces a critical overdue task', () => {
    const tasks = [makeTask({ id: '1', priority: 'Critical', status: 'Not Started', dueDate: '2020-01-01' })];
    const items = buildAttentionItems(tasks, []);
    expect(items.some((i) => i.id === 'overdue-critical-1')).toBe(true);
  });

  it('surfaces a blocked task with its reason', () => {
    const tasks = [makeTask({ id: '1', status: 'Blocked', blockedReason: 'Waiting on vendor' })];
    const items = buildAttentionItems(tasks, []);
    const match = items.find((i) => i.id === 'blocked-1');
    expect(match?.message).toContain('Waiting on vendor');
  });

  it('surfaces a protected-period violation', () => {
    const tasks = [makeTask({ id: '1', event: 'Wedding', priority: 'High', dueDate: '2027-01-10' })];
    const items = buildAttentionItems(tasks, []);
    expect(items.some((i) => i.id === 'protected-1')).toBe(true);
  });

  it('does not surface a healthy on-track task', () => {
    const tasks = [makeTask({ id: '1', status: 'In Progress', dueDate: '2030-01-01' })];
    const items = buildAttentionItems(tasks, []);
    expect(items).toHaveLength(0);
  });
});

describe('upcoming tasks', () => {
  it('returns incomplete tasks sorted by due date, capped at the limit', () => {
    const tasks = [
      makeTask({ id: '1', dueDate: '2026-09-01' }),
      makeTask({ id: '2', dueDate: '2026-08-20' }),
      makeTask({ id: '3', dueDate: '2026-08-25' }),
      makeTask({ id: '4', status: 'Done', dueDate: '2026-08-16' }),
    ];
    const upcoming = upcomingIncompleteTasks(tasks, 2);
    expect(upcoming.map((t) => t.id)).toEqual(['2', '3']);
  });
});
