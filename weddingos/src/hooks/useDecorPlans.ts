import { useCallback } from 'react';
import type { DecorPlan } from '@/types';
import { decorPlansStore } from '@/data/stores';
import { addDecorPlan, deleteDecorPlan, updateDecorPlan, type NewDecorPlanInput } from '@/data/repositories/decorPlanRepository';
import { useStoreValue } from './useStore';

export function useDecorPlans() {
  const decorPlans = useStoreValue(decorPlansStore);

  return {
    decorPlans,
    addDecorPlan: useCallback((input: NewDecorPlanInput) => addDecorPlan(input), []),
    updateDecorPlan: useCallback((id: string, patch: Partial<Omit<DecorPlan, 'id' | 'createdAt'>>) => updateDecorPlan(id, patch), []),
    deleteDecorPlan: useCallback((id: string) => deleteDecorPlan(id), []),
  };
}
