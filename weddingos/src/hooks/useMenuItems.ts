import { useCallback } from 'react';
import type { MenuItem } from '@/types';
import { menuItemsStore } from '@/data/stores';
import { addMenuItem, deleteMenuItem, updateMenuItem, type NewMenuItemInput } from '@/data/repositories/menuItemRepository';
import { useStoreValue } from './useStore';

export function useMenuItems() {
  const menuItems = useStoreValue(menuItemsStore);

  return {
    menuItems,
    addMenuItem: useCallback((input: NewMenuItemInput) => addMenuItem(input), []),
    updateMenuItem: useCallback((id: string, patch: Partial<Omit<MenuItem, 'id' | 'createdAt'>>) => updateMenuItem(id, patch), []),
    deleteMenuItem: useCallback((id: string) => deleteMenuItem(id), []),
  };
}

export function useMenuItemsForCateringPlan(cateringPlanId: string | undefined): MenuItem[] {
  const menuItems = useStoreValue(menuItemsStore);
  return cateringPlanId ? menuItems.filter((m) => m.cateringPlanId === cateringPlanId) : [];
}
