import { useCallback } from 'react';
import type { PhotographyPlan } from '@/types';
import { photographyPlansStore } from '@/data/stores';
import {
  addPhotographyPlan,
  deletePhotographyPlan,
  updatePhotographyPlan,
  type NewPhotographyPlanInput,
} from '@/data/repositories/photographyPlanRepository';
import { useStoreValue } from './useStore';

export function usePhotographyPlans() {
  const photographyPlans = useStoreValue(photographyPlansStore);

  return {
    photographyPlans,
    addPhotographyPlan: useCallback((input: NewPhotographyPlanInput) => addPhotographyPlan(input), []),
    updatePhotographyPlan: useCallback(
      (id: string, patch: Partial<Omit<PhotographyPlan, 'id' | 'createdAt'>>) => updatePhotographyPlan(id, patch),
      [],
    ),
    deletePhotographyPlan: useCallback((id: string) => deletePhotographyPlan(id), []),
  };
}
