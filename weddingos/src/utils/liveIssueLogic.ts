import type { LiveIssue, LiveIssueSeverity, WeddingDaySettings } from '@/types';
import { LIVE_ISSUE_OPEN_STATUSES } from '@/types';

export function isLiveIssueOpen(issue: LiveIssue): boolean {
  return (LIVE_ISSUE_OPEN_STATUSES as readonly string[]).includes(issue.status);
}

export function openLiveIssues(issues: LiveIssue[]): LiveIssue[] {
  return issues.filter(isLiveIssueOpen);
}

export function criticalOpenLiveIssues(issues: LiveIssue[]): LiveIssue[] {
  return openLiveIssues(issues).filter((i) => i.severity === 'Critical');
}

/** Minutes an issue has been open, measured from reportedAt to now (or to resolvedAt if already resolved). */
export function liveIssueOpenMinutes(issue: LiveIssue, referenceDateTimeISO: string = new Date().toISOString()): number {
  const start = new Date(issue.reportedAt).getTime();
  const end = new Date(issue.resolvedAt ?? referenceDateTimeISO).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 60_000));
}

function escalationThresholdMinutes(severity: LiveIssueSeverity, settings: Pick<WeddingDaySettings, 'criticalIssueEscalationMinutes' | 'highIssueEscalationMinutes' | 'mediumIssueEscalationMinutes'>): number | null {
  if (severity === 'Critical') return settings.criticalIssueEscalationMinutes;
  if (severity === 'High') return settings.highIssueEscalationMinutes;
  if (severity === 'Medium') return settings.mediumIssueEscalationMinutes;
  return null;
}

/** Section 14: whether an open issue has been open longer than its severity's configurable escalation threshold. */
export function isLiveIssueEscalationDue(
  issue: LiveIssue,
  settings: Pick<WeddingDaySettings, 'criticalIssueEscalationMinutes' | 'highIssueEscalationMinutes' | 'mediumIssueEscalationMinutes'>,
  referenceDateTimeISO: string = new Date().toISOString(),
): boolean {
  if (!isLiveIssueOpen(issue)) return false;
  const threshold = escalationThresholdMinutes(issue.severity, settings);
  if (threshold === null) return false;
  return liveIssueOpenMinutes(issue, referenceDateTimeISO) > threshold;
}
