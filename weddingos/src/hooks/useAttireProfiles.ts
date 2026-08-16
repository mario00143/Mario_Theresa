import { useCallback } from 'react';
import type { AttireProfile } from '@/types';
import { attireProfilesStore } from '@/data/stores';
import { addAttireProfile, deleteAttireProfile, updateAttireProfile, type NewAttireProfileInput } from '@/data/repositories/attireProfileRepository';
import { useStoreValue } from './useStore';

export function useAttireProfiles() {
  const attireProfiles = useStoreValue(attireProfilesStore);

  return {
    attireProfiles,
    addAttireProfile: useCallback((input: NewAttireProfileInput) => addAttireProfile(input), []),
    updateAttireProfile: useCallback((id: string, patch: Partial<Omit<AttireProfile, 'id' | 'createdAt'>>) => updateAttireProfile(id, patch), []),
    deleteAttireProfile: useCallback((id: string) => deleteAttireProfile(id), []),
  };
}
