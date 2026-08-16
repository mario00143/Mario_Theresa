import { useCallback } from 'react';
import type { WelcomeKit } from '@/types';
import { welcomeKitsStore } from '@/data/stores';
import { addWelcomeKit, deleteWelcomeKit, updateWelcomeKit, type NewWelcomeKitInput } from '@/data/repositories/welcomeKitRepository';
import { useStoreValue } from './useStore';

export function useWelcomeKits() {
  const welcomeKits = useStoreValue(welcomeKitsStore);

  return {
    welcomeKits,
    addWelcomeKit: useCallback((input: NewWelcomeKitInput) => addWelcomeKit(input), []),
    updateWelcomeKit: useCallback((id: string, patch: Partial<Omit<WelcomeKit, 'id' | 'createdAt'>>) => updateWelcomeKit(id, patch), []),
    deleteWelcomeKit: useCallback((id: string) => deleteWelcomeKit(id), []),
  };
}
