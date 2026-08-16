import { useCallback } from 'react';
import type { LiveIssue, LiveIssueSeverity, LiveIssueStatus } from '@/types';
import { liveIssuesStore } from '@/data/stores';
import {
  addLiveIssue,
  addLiveIssueMitigation,
  assignLiveIssueOwner,
  deleteLiveIssue,
  escalateLiveIssue,
  reopenLiveIssue,
  resolveLiveIssue,
  updateLiveIssue,
  type NewLiveIssueInput,
} from '@/data/repositories/liveIssueRepository';
import { useStoreValue } from './useStore';

export function useLiveIssues() {
  const issues = useStoreValue(liveIssuesStore);

  return {
    liveIssues: issues,
    addLiveIssue: useCallback((input: NewLiveIssueInput) => addLiveIssue(input), []),
    updateLiveIssue: useCallback((id: string, patch: Partial<Omit<LiveIssue, 'id' | 'createdAt'>>) => updateLiveIssue(id, patch), []),
    deleteLiveIssue: useCallback((id: string) => deleteLiveIssue(id), []),
    escalateLiveIssue: useCallback((id: string, severity: LiveIssueSeverity) => escalateLiveIssue(id, severity), []),
    assignLiveIssueOwner: useCallback((id: string, owner: string, backupOwner?: string) => assignLiveIssueOwner(id, owner, backupOwner), []),
    addLiveIssueMitigation: useCallback((id: string, mitigation: string) => addLiveIssueMitigation(id, mitigation), []),
    resolveLiveIssue: useCallback((id: string, resolution?: string) => resolveLiveIssue(id, resolution), []),
    reopenLiveIssue: useCallback((id: string, status?: LiveIssueStatus) => reopenLiveIssue(id, status), []),
  };
}

export function useLiveIssue(id: string | undefined): LiveIssue | undefined {
  const issues = useStoreValue(liveIssuesStore);
  return id ? issues.find((i) => i.id === id) : undefined;
}
