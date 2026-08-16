import { useCallback } from 'react';
import type { CeremonyItem } from '@/types';
import { ceremonyItemsStore } from '@/data/stores';
import {
  addCeremonyItem,
  deleteCeremonyItem,
  updateCeremonyItem,
  verifyCeremonyItem,
  type NewCeremonyItemInput,
} from '@/data/repositories/ceremonyItemRepository';
import { useStoreValue } from './useStore';

export function useCeremonyItems() {
  const ceremonyItems = useStoreValue(ceremonyItemsStore);

  return {
    ceremonyItems,
    addCeremonyItem: useCallback((input: NewCeremonyItemInput) => addCeremonyItem(input), []),
    updateCeremonyItem: useCallback((id: string, patch: Partial<Omit<CeremonyItem, 'id' | 'createdAt'>>) => updateCeremonyItem(id, patch), []),
    deleteCeremonyItem: useCallback((id: string) => deleteCeremonyItem(id), []),
    verifyCeremonyItem: useCallback((id: string) => verifyCeremonyItem(id), []),
  };
}
