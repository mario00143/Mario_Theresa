import { useCallback } from 'react';
import type { CeremonySequenceItem } from '@/types';
import { ceremonySequenceItemsStore } from '@/data/stores';
import {
  addCeremonySequenceItem,
  deleteCeremonySequenceItem,
  reorderCeremonySequenceItem,
  updateCeremonySequenceItem,
  type NewCeremonySequenceItemInput,
} from '@/data/repositories/ceremonySequenceItemRepository';
import { useStoreValue } from './useStore';

export function useCeremonySequence() {
  const items = useStoreValue(ceremonySequenceItemsStore);

  return {
    sequenceItems: [...items].sort((a, b) => a.sequenceOrder - b.sequenceOrder),
    addCeremonySequenceItem: useCallback((input: NewCeremonySequenceItemInput) => addCeremonySequenceItem(input), []),
    updateCeremonySequenceItem: useCallback(
      (id: string, patch: Partial<Omit<CeremonySequenceItem, 'id' | 'createdAt'>>) => updateCeremonySequenceItem(id, patch),
      [],
    ),
    deleteCeremonySequenceItem: useCallback((id: string) => deleteCeremonySequenceItem(id), []),
    reorderCeremonySequenceItem: useCallback((id: string, direction: 'up' | 'down') => reorderCeremonySequenceItem(id, direction), []),
  };
}
