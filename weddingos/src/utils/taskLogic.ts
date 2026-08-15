import type { Task } from '@/types';
import { DUE_SOON_LONG_DAYS, DUE_SOON_SHORT_DAYS } from '@/lib/constants';
import { daysUntil, isInProtectedPeriod, parseDate } from './date';

const CLOSED_STATUSES: Task['status'][] = ['Done', 'Cancelled'];

export function isTaskClosed(task: Task): boolean {
  return CLOSED_STATUSES.includes(task.status);
}

/** Overdue = has a due date in the past and is not yet closed. */
export function isTaskOverdue(task: Task, reference: Date = new Date()): boolean {
  if (isTaskClosed(task)) return false;
  const diff = daysUntil(task.dueDate, reference);
  if (diff === null) return false;
  return diff < 0;
}

export function isTaskDueWithin(task: Task, days: number, reference: Date = new Date()): boolean {
  if (isTaskClosed(task)) return false;
  const diff = daysUntil(task.dueDate, reference);
  if (diff === null) return false;
  return diff >= 0 && diff <= days;
}

export function isTaskDueToday(task: Task, reference: Date = new Date()): boolean {
  if (isTaskClosed(task)) return false;
  const diff = daysUntil(task.dueDate, reference);
  return diff === 0;
}

export function isTaskDueSoon(task: Task, reference: Date = new Date()): boolean {
  return isTaskDueWithin(task, DUE_SOON_SHORT_DAYS, reference);
}

export function isTaskDueWithinTwoWeeks(task: Task, reference: Date = new Date()): boolean {
  return isTaskDueWithin(task, DUE_SOON_LONG_DAYS, reference);
}

export function completionPercentage(tasks: Task[]): number {
  const relevant = tasks.filter((t) => t.status !== 'Cancelled');
  if (relevant.length === 0) return 0;
  const done = relevant.filter((t) => t.status === 'Done').length;
  return Math.round((done / relevant.length) * 100);
}

export function criticalCompletionPercentage(tasks: Task[]): number {
  const critical = tasks.filter((t) => t.priority === 'Critical' && t.status !== 'Cancelled');
  if (critical.length === 0) return 0;
  const done = critical.filter((t) => t.status === 'Done').length;
  return Math.round((done / critical.length) * 100);
}

export interface DependencyStatus {
  hasDependencies: boolean;
  incomplete: Task[];
  isBlockedByDependency: boolean;
}

export function getDependencyStatus(task: Task, allTasks: Task[]): DependencyStatus {
  const deps = task.dependencies
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));
  const incomplete = deps.filter((t) => t.status !== 'Done');
  return {
    hasDependencies: deps.length > 0,
    incomplete,
    isBlockedByDependency: incomplete.length > 0,
  };
}

/** Detects a would-be circular dependency if `task` were made to depend on `candidateDependencyId`. */
export function wouldCreateCircularDependency(
  taskId: string,
  candidateDependencyId: string,
  allTasks: Task[],
): boolean {
  if (taskId === candidateDependencyId) return true;
  const visited = new Set<string>();
  const stack = [candidateDependencyId];
  while (stack.length) {
    const current = stack.pop()!;
    if (current === taskId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const currentTask = allTasks.find((t) => t.id === current);
    if (currentTask) stack.push(...currentTask.dependencies);
  }
  return false;
}

const ACTIVE_STATUSES: Task['status'][] = ['Not Started', 'In Progress', 'Waiting', 'Blocked'];

export function isTaskActive(task: Task): boolean {
  return ACTIVE_STATUSES.includes(task.status);
}

export interface TaskValidationIssue {
  field: string;
  message: string;
}

/** Validation warnings per Phase 1 task rules (section 11). Non-blocking — surfaced as warnings. */
export function validateTask(task: Task, allTasks: Task[] = []): TaskValidationIssue[] {
  const issues: TaskValidationIssue[] = [];

  if (isTaskActive(task)) {
    if (!task.owner) issues.push({ field: 'owner', message: 'Active tasks should have an owner.' });
    if (!task.dueDate) issues.push({ field: 'dueDate', message: 'Active tasks should have a due date.' });
    if (!task.priority) issues.push({ field: 'priority', message: 'Active tasks should have a priority.' });
    if (!task.completionCriteria.trim())
      issues.push({ field: 'completionCriteria', message: 'Active tasks should have completion criteria.' });
  }

  if (task.status === 'Blocked' && !task.blockedReason?.trim()) {
    issues.push({ field: 'blockedReason', message: 'Blocked tasks require a blocked reason.' });
  }

  if (task.status === 'Done' && !task.completionNote?.trim() && !task.completionEvidence?.trim()) {
    issues.push({
      field: 'completionNote',
      message: 'Completed tasks require a completion note or completion evidence.',
    });
  }

  const dependencyStatus = getDependencyStatus(task, allTasks);
  if (dependencyStatus.isBlockedByDependency) {
    issues.push({
      field: 'dependencies',
      message: `Depends on ${dependencyStatus.incomplete.length} incomplete task(s): ${dependencyStatus.incomplete
        .map((t) => t.title)
        .join(', ')}.`,
    });
  }

  return issues;
}

export function isProtectedPeriodViolation(task: Task): boolean {
  if (!task.dueDate) return false;
  if (task.event !== 'Wedding' && task.event !== 'Both') return false;
  if (task.priority !== 'Critical' && task.priority !== 'High') return false;
  return isInProtectedPeriod(task.dueDate);
}

/** Approximate: days since the task was last updated, used as a proxy for "days blocked". */
export function daysBlocked(task: Task, reference: Date = new Date()): number {
  const updated = parseDate(task.updatedAt);
  if (!updated) return 0;
  const diff = daysUntil(task.updatedAt, reference);
  return diff === null ? 0 : Math.max(0, -diff);
}

export function workstreamCompletion(tasks: Task[]): { workstream: string; percentage: number; total: number; done: number }[] {
  const grouped = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = grouped.get(task.workstream) ?? [];
    list.push(task);
    grouped.set(task.workstream, list);
  }
  return Array.from(grouped.entries()).map(([workstream, list]) => ({
    workstream,
    percentage: completionPercentage(list),
    total: list.filter((t) => t.status !== 'Cancelled').length,
    done: list.filter((t) => t.status === 'Done').length,
  }));
}
