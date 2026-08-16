import { useCallback } from 'react';
import type { WelcomeKitItem } from '@/types';
import { welcomeKitItemsStore } from '@/data/stores';
import {
  addWelcomeKitItem,
  deleteWelcomeKitItem,
  updateWelcomeKitItem,
  type NewWelcomeKitItemInput,
} from '@/data/repositories/welcomeKitItemRepository';
import { useStoreValue } from './useStore';

export function useWelcomeKitItems() {
  const welcomeKitItems = useStoreValue(welcomeKitItemsStore);

  return {
    welcomeKitItems,
    addWelcomeKitItem: useCallback((input: NewWelcomeKitItemInput) => addWelcomeKitItem(input), []),
    updateWelcomeKitItem: useCallback(
      (id: string, patch: Partial<Omit<WelcomeKitItem, 'id' | 'createdAt'>>) => updateWelcomeKitItem(id, patch),
      [],
    ),
    deleteWelcomeKitItem: useCallback((id: string) => deleteWelcomeKitItem(id), []),
  };
}

export function useWelcomeKitItemsForKit(welcomeKitId: string | undefined): WelcomeKitItem[] {
  const items = useStoreValue(welcomeKitItemsStore);
  return welcomeKitId ? items.filter((i) => i.welcomeKitId === welcomeKitId) : [];
}
