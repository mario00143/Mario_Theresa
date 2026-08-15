import type { Decision } from '@/types';
import { DUE_SOON_SHORT_DAYS } from '@/lib/constants';
import { daysUntil } from './date';

const CLOSED_STATUSES: Decision['status'][] = ['Decided', 'Deferred'];

export function isDecisionClosed(decision: Decision): boolean {
  return CLOSED_STATUSES.includes(decision.status);
}

export function isDecisionOverdue(decision: Decision, reference: Date = new Date()): boolean {
  if (isDecisionClosed(decision)) return false;
  const diff = daysUntil(decision.deadline, reference);
  if (diff === null) return false;
  return diff < 0;
}

export function isDecisionDueSoon(decision: Decision, reference: Date = new Date()): boolean {
  if (isDecisionClosed(decision)) return false;
  const diff = daysUntil(decision.deadline, reference);
  if (diff === null) return false;
  return diff >= 0 && diff <= DUE_SOON_SHORT_DAYS;
}
