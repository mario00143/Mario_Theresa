import { useCallback } from 'react';
import type { CateringPlan } from '@/types';
import { cateringPlansStore } from '@/data/stores';
import { addCateringPlan, deleteCateringPlan, updateCateringPlan, type NewCateringPlanInput } from '@/data/repositories/cateringPlanRepository';
import { useStoreValue } from './useStore';

export function useCateringPlans() {
  const cateringPlans = useStoreValue(cateringPlansStore);

  return {
    cateringPlans,
    addCateringPlan: useCallback((input: NewCateringPlanInput) => addCateringPlan(input), []),
    updateCateringPlan: useCallback((id: string, patch: Partial<Omit<CateringPlan, 'id' | 'createdAt'>>) => updateCateringPlan(id, patch), []),
    deleteCateringPlan: useCallback((id: string) => deleteCateringPlan(id), []),
  };
}
