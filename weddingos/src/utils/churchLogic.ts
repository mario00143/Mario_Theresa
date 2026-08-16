import type { ChurchProfile, ChurchRequirement } from '@/types';
import { CHURCH_REQUIREMENT_DONE_STATUSES, DEFAULT_CRITICAL_CHURCH_REQUIREMENT_CATEGORIES } from '@/types';
import { daysUntil, todayISO } from './date';

function isDone(status: ChurchRequirement['status']): boolean {
  return (CHURCH_REQUIREMENT_DONE_STATUSES as readonly string[]).includes(status);
}

/** Section 7: per-requirement warnings. Only "Applicable" requirements are checked against most rules. */
export function computeChurchRequirementWarnings(requirement: ChurchRequirement, referenceDate: string = todayISO()): string[] {
  const warnings: string[] = [];

  if (requirement.applicability !== 'Applicable') return warnings;
  if (isDone(requirement.status)) {
    if (requirement.status === 'Submitted') warnings.push('Submitted but not yet verified.');
    return warnings;
  }

  if (!requirement.owner) warnings.push('No owner assigned.');
  if (!requirement.dueDate) warnings.push('No due date set.');

  const daysLeft = requirement.dueDate ? daysUntil(requirement.dueDate, new Date(referenceDate)) : null;
  if (daysLeft !== null) {
    if (daysLeft < 0) warnings.push('Overdue.');
    else if (daysLeft <= 14) warnings.push(`Due within ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`);
  }

  if (requirement.documentRequired && !requirement.documentName) warnings.push('Document required but no document name/reference on file.');
  if (requirement.status === 'Submitted') warnings.push('Submitted but not yet verified.');
  if (requirement.category === 'Witnesses') warnings.push('Witness requirement not yet complete.');
  if (requirement.category === 'Marriage Register' || requirement.category === 'Marriage Certificate') {
    warnings.push('Marriage register/certificate workflow unresolved.');
  }

  return warnings;
}

/** All requirements still marked "Confirm with Parish" — the dedicated queue (section 7). */
export function getParishConfirmationQueue(requirements: ChurchRequirement[]): ChurchRequirement[] {
  return requirements.filter((r) => r.applicability === 'Confirm with Parish');
}

/** Section 7: denomination-sensitive "Confirm with Parish" items unresolved within 30 days of the wedding. */
export function isParishConfirmationOverdue(requirement: ChurchRequirement, weddingDate: string, referenceDate: string = todayISO()): boolean {
  if (requirement.applicability !== 'Confirm with Parish') return false;
  const daysLeft = daysUntil(weddingDate, new Date(referenceDate));
  return daysLeft !== null && daysLeft <= 30;
}

/** Section 7: ceremony date approaching (<=14 days) with a critical requirement still incomplete. */
export function isCriticalChurchRequirementIncomplete(
  requirement: ChurchRequirement,
  weddingDate: string,
  referenceDate: string = todayISO(),
  criticalCategories: string[] = DEFAULT_CRITICAL_CHURCH_REQUIREMENT_CATEGORIES,
): boolean {
  if (requirement.applicability !== 'Applicable') return false;
  if (isDone(requirement.status)) return false;
  if (!criticalCategories.includes(requirement.category)) return false;
  const daysLeft = daysUntil(weddingDate, new Date(referenceDate));
  return daysLeft !== null && daysLeft <= 14;
}

export interface ChurchReadinessInput {
  profile: ChurchProfile | undefined;
  requirements: ChurchRequirement[];
}

export function isChurchRequirementOverdue(requirement: ChurchRequirement, referenceDate: string = todayISO()): boolean {
  if (requirement.applicability !== 'Applicable' || isDone(requirement.status) || !requirement.dueDate) return false;
  return requirement.dueDate < referenceDate;
}
