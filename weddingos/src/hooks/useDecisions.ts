import { useCallback } from 'react';
import type { Decision } from '@/types';
import { decisionsStore } from '@/data/stores';
import { addDecision, deleteDecision, updateDecision, type NewDecisionInput } from '@/data/repositories/decisionRepository';
import { useStoreValue } from './useStore';

export function useDecisions() {
  const decisions = useStoreValue(decisionsStore);

  return {
    decisions,
    addDecision: useCallback((input: NewDecisionInput) => addDecision(input), []),
    updateDecision: useCallback(
      (id: string, patch: Partial<Omit<Decision, 'id' | 'createdAt'>>) => updateDecision(id, patch),
      [],
    ),
    deleteDecision: useCallback((id: string) => deleteDecision(id), []),
  };
}

export function useDecision(id: string | undefined): Decision | undefined {
  const decisions = useStoreValue(decisionsStore);
  return id ? decisions.find((d) => d.id === id) : undefined;
}
