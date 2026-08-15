import type { Decision, Guest, Household, Task } from '@/types';
import {
  completionPercentage,
  criticalCompletionPercentage,
  getDependencyStatus,
  isProtectedPeriodViolation,
  isTaskDueWithin,
  isTaskDueWithinTwoWeeks,
  isTaskOverdue,
} from './taskLogic';
import { isDecisionOverdue } from './decisionLogic';
import { isFollowUpOverdue } from './invitationLogic';
import { detectDataIssues } from './guestDataQuality';

export interface PlanningHealth {
  overallCompletion: number;
  criticalCompletion: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueNext7Days: number;
  dueNext14Days: number;
  blockedTasks: number;
  pendingDecisions: number;
}

export function computePlanningHealth(tasks: Task[], decisions: Decision[]): PlanningHealth {
  const nonCancelled = tasks.filter((t) => t.status !== 'Cancelled');
  return {
    overallCompletion: completionPercentage(tasks),
    criticalCompletion: criticalCompletionPercentage(tasks),
    totalTasks: nonCancelled.length,
    completedTasks: tasks.filter((t) => t.status === 'Done').length,
    overdueTasks: tasks.filter((t) => isTaskOverdue(t)).length,
    dueNext7Days: tasks.filter((t) => isTaskDueWithin(t, 7)).length,
    dueNext14Days: tasks.filter((t) => isTaskDueWithinTwoWeeks(t)).length,
    blockedTasks: tasks.filter((t) => t.status === 'Blocked').length,
    pendingDecisions: decisions.filter((d) => d.status === 'Open' || d.status === 'Under Discussion').length,
  };
}

export type AttentionSeverity = 'critical' | 'warning';

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  message: string;
  linkType: 'task' | 'decision' | 'household' | 'guest' | 'route';
  linkId: string;
}

export function buildAttentionItems(tasks: Task[], decisions: Decision[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const task of tasks) {
    if (isTaskOverdue(task) && task.priority === 'Critical') {
      items.push({
        id: `overdue-critical-${task.id}`,
        severity: 'critical',
        message: `Critical task overdue: "${task.title}"`,
        linkType: 'task',
        linkId: task.id,
      });
    } else if (isTaskOverdue(task) && task.priority === 'High') {
      items.push({
        id: `overdue-high-${task.id}`,
        severity: 'warning',
        message: `High-priority task overdue: "${task.title}"`,
        linkType: 'task',
        linkId: task.id,
      });
    }

    if (task.status === 'Blocked') {
      items.push({
        id: `blocked-${task.id}`,
        severity: 'warning',
        message: `Task blocked: "${task.title}"${task.blockedReason ? ` — ${task.blockedReason}` : ''}`,
        linkType: 'task',
        linkId: task.id,
      });
    }

    if (isProtectedPeriodViolation(task)) {
      items.push({
        id: `protected-${task.id}`,
        severity: 'critical',
        message: `Protected engagement period — consider completing "${task.title}" earlier.`,
        linkType: 'task',
        linkId: task.id,
      });
    }

    const dependencyStatus = getDependencyStatus(task, tasks);
    if (dependencyStatus.isBlockedByDependency && task.status !== 'Done' && task.status !== 'Cancelled') {
      items.push({
        id: `dependency-${task.id}`,
        severity: 'warning',
        message: `Dependency incomplete for "${task.title}" (waiting on ${dependencyStatus.incomplete.length} task${dependencyStatus.incomplete.length === 1 ? '' : 's'})`,
        linkType: 'task',
        linkId: task.id,
      });
    }
  }

  for (const decision of decisions) {
    if (isDecisionOverdue(decision)) {
      items.push({
        id: `decision-overdue-${decision.id}`,
        severity: 'critical',
        message: `Decision overdue: "${decision.title}"`,
        linkType: 'decision',
        linkId: decision.id,
      });
    }
  }

  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}

export function upcomingIncompleteTasks(tasks: Task[], limit = 10): Task[] {
  return tasks
    .filter((t) => t.status !== 'Done' && t.status !== 'Cancelled' && t.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0))
    .slice(0, limit);
}

/** Guest-related Attention Required items: overdue RSVP follow-ups, households flagged for invitation follow-up, and a data-quality summary. */
export function buildGuestAttentionItems(households: Household[], guests: Guest[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const household of households) {
    if (isFollowUpOverdue(household)) {
      items.push({
        id: `rsvp-followup-overdue-${household.id}`,
        severity: 'critical',
        message: `RSVP follow-up overdue for "${household.householdName}"`,
        linkType: 'household',
        linkId: household.id,
      });
    }
    if (household.invitationStatus === 'Follow-up Required') {
      items.push({
        id: `invitation-followup-${household.id}`,
        severity: 'warning',
        message: `Invitation follow-up required for "${household.householdName}"`,
        linkType: 'household',
        linkId: household.id,
      });
    }
  }

  const dataIssues = detectDataIssues(households, guests);
  if (dataIssues.length > 0) {
    items.push({
      id: 'guest-data-issues-summary',
      severity: 'warning',
      message: `${dataIssues.length} guest data issue${dataIssues.length === 1 ? '' : 's'} need${dataIssues.length === 1 ? 's' : ''} review`,
      linkType: 'route',
      linkId: '/guests/reports',
    });
  }

  return items;
}
