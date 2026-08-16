import { useCallback } from 'react';
import type { ChurchProfile } from '@/types';
import { churchProfilesStore } from '@/data/stores';
import { addChurchProfile, deleteChurchProfile, updateChurchProfile, type NewChurchProfileInput } from '@/data/repositories/churchProfileRepository';
import { useStoreValue } from './useStore';

export function useChurchProfiles() {
  const churchProfiles = useStoreValue(churchProfilesStore);

  return {
    churchProfiles,
    addChurchProfile: useCallback((input: NewChurchProfileInput) => addChurchProfile(input), []),
    updateChurchProfile: useCallback((id: string, patch: Partial<Omit<ChurchProfile, 'id' | 'createdAt'>>) => updateChurchProfile(id, patch), []),
    deleteChurchProfile: useCallback((id: string) => deleteChurchProfile(id), []),
  };
}
