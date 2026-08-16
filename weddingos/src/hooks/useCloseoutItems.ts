import { useCallback } from 'react';
import type { CloseoutItem, CloseoutStatus } from '@/types';
import { closeoutItemsStore } from '@/data/stores';
import {
  addCloseoutItem,
  deleteCloseoutItem,
  setCloseoutItemStatus,
  updateCloseoutItem,
  type NewCloseoutItemInput,
} from '@/data/repositories/closeoutItemRepository';
import { useStoreValue } from './useStore';

export function useCloseoutItems() {
  const items = useStoreValue(closeoutItemsStore);

  return {
    closeoutItems: items,
    addCloseoutItem: useCallback((input: NewCloseoutItemInput) => addCloseoutItem(input), []),
    updateCloseoutItem: useCallback((id: string, patch: Partial<Omit<CloseoutItem, 'id' | 'createdAt'>>) => updateCloseoutItem(id, patch), []),
    deleteCloseoutItem: useCallback((id: string) => deleteCloseoutItem(id), []),
    setCloseoutItemStatus: useCallback((id: string, status: CloseoutStatus, verificationNote?: string) => setCloseoutItemStatus(id, status, verificationNote), []),
  };
}
