import { useCallback } from 'react';
import type { AttireItem } from '@/types';
import { attireItemsStore } from '@/data/stores';
import { addAttireItem, deleteAttireItem, updateAttireItem, type NewAttireItemInput } from '@/data/repositories/attireItemRepository';
import { useStoreValue } from './useStore';

export function useAttireItems() {
  const attireItems = useStoreValue(attireItemsStore);

  return {
    attireItems,
    addAttireItem: useCallback((input: NewAttireItemInput) => addAttireItem(input), []),
    updateAttireItem: useCallback((id: string, patch: Partial<Omit<AttireItem, 'id' | 'createdAt'>>) => updateAttireItem(id, patch), []),
    deleteAttireItem: useCallback((id: string) => deleteAttireItem(id), []),
  };
}

export function useAttireItemsForProfile(attireProfileId: string | undefined): AttireItem[] {
  const attireItems = useStoreValue(attireItemsStore);
  return attireProfileId ? attireItems.filter((i) => i.attireProfileId === attireProfileId) : [];
}
