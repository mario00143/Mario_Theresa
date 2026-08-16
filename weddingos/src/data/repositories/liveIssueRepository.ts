import type { LiveIssue, LiveIssueSeverity, LiveIssueStatus } from '@/types';
import { generateId } from '@/lib/id';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import { liveIssuesStore } from '../stores';

export type NewLiveIssueInput = Omit<LiveIssue, 'id' | 'createdAt' | 'updatedAt' | 'reportedAt' | 'followUpRequired'> &
  Partial<Pick<LiveIssue, 'reportedAt' | 'followUpRequired'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addLiveIssue(input: NewLiveIssueInput): LiveIssue {
  const timestamp = nowISO();
  const issue: LiveIssue = {
    followUpRequired: false,
    ...input,
    reportedAt: input.reportedAt ?? timestamp,
    id: generateId('issue'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  liveIssuesStore.set((prev) => [...prev, issue]);
  return issue;
}

export function updateLiveIssue(id: string, patch: Partial<Omit<LiveIssue, 'id' | 'createdAt'>>): void {
  liveIssuesStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

export function deleteLiveIssue(id: string): void {
  liveIssuesStore.set((prev) => prev.filter((i) => i.id !== id));
}

export function escalateLiveIssue(id: string, severity: LiveIssueSeverity): void {
  const previous = liveIssuesStore.get().find((i) => i.id === id);
  updateLiveIssue(id, { severity });
  logAuditAction({
    action: 'liveIssue.severity_change',
    entityType: 'LiveIssue',
    entityId: id,
    summary: `Changed severity of "${previous?.title ?? id}" from ${previous?.severity ?? '?'} to ${severity}`,
    metadata: { fromSeverity: previous?.severity ?? null, toSeverity: severity },
  });
}

export function assignLiveIssueOwner(id: string, owner: string, backupOwner?: string): void {
  updateLiveIssue(id, { owner, backupOwner });
}

export function addLiveIssueMitigation(id: string, mitigation: string): void {
  liveIssuesStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, mitigation, status: i.status === 'Open' ? 'Mitigating' : i.status, updatedAt: nowISO() } : i)));
}

export function resolveLiveIssue(id: string, resolution?: string): void {
  const timestamp = nowISO();
  liveIssuesStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'Resolved', resolution: resolution ?? i.resolution, resolvedAt: timestamp, updatedAt: timestamp } : i)));
}

export function reopenLiveIssue(id: string, status: LiveIssueStatus = 'Open'): void {
  liveIssuesStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, status, resolvedAt: undefined, updatedAt: nowISO() } : i)));
}
