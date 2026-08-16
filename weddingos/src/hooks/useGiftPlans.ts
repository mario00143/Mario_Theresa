import { useCallback } from 'react';
import type { GiftPlan } from '@/types';
import { giftPlansStore } from '@/data/stores';
import { addGiftPlan, deleteGiftPlan, updateGiftPlan, type NewGiftPlanInput } from '@/data/repositories/giftPlanRepository';
import { useStoreValue } from './useStore';

export function useGiftPlans() {
  const giftPlans = useStoreValue(giftPlansStore);

  return {
    giftPlans,
    addGiftPlan: useCallback((input: NewGiftPlanInput) => addGiftPlan(input), []),
    updateGiftPlan: useCallback((id: string, patch: Partial<Omit<GiftPlan, 'id' | 'createdAt'>>) => updateGiftPlan(id, patch), []),
    deleteGiftPlan: useCallback((id: string) => deleteGiftPlan(id), []),
  };
}
