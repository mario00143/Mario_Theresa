import { useCallback } from 'react';
import type { MusicAVPlan } from '@/types';
import { musicAVPlansStore } from '@/data/stores';
import { addMusicAVPlan, deleteMusicAVPlan, updateMusicAVPlan, type NewMusicAVPlanInput } from '@/data/repositories/musicAVPlanRepository';
import { useStoreValue } from './useStore';

export function useMusicAVPlans() {
  const musicAVPlans = useStoreValue(musicAVPlansStore);

  return {
    musicAVPlans,
    addMusicAVPlan: useCallback((input: NewMusicAVPlanInput) => addMusicAVPlan(input), []),
    updateMusicAVPlan: useCallback((id: string, patch: Partial<Omit<MusicAVPlan, 'id' | 'createdAt'>>) => updateMusicAVPlan(id, patch), []),
    deleteMusicAVPlan: useCallback((id: string) => deleteMusicAVPlan(id), []),
  };
}
