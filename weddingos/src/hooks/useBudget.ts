import { useCallback } from 'react';
import type { BudgetCategory, BudgetItem } from '@/types';
import { budgetCategoriesStore, budgetItemsStore } from '@/data/stores';
import {
  addBudgetCategory,
  deleteBudgetCategory,
  updateBudgetCategory,
  type NewBudgetCategoryInput,
} from '@/data/repositories/budgetCategoryRepository';
import { addBudgetItem, deleteBudgetItem, updateBudgetItem, type NewBudgetItemInput } from '@/data/repositories/budgetItemRepository';
import { useStoreValue } from './useStore';

export function useBudgetCategories() {
  const budgetCategories = useStoreValue(budgetCategoriesStore);

  return {
    budgetCategories: [...budgetCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    addBudgetCategory: useCallback((input: NewBudgetCategoryInput) => addBudgetCategory(input), []),
    updateBudgetCategory: useCallback(
      (id: string, patch: Partial<Omit<BudgetCategory, 'id' | 'createdAt'>>) => updateBudgetCategory(id, patch),
      [],
    ),
    deleteBudgetCategory: useCallback((id: string) => deleteBudgetCategory(id), []),
  };
}

export function useBudgetItems() {
  const budgetItems = useStoreValue(budgetItemsStore);

  return {
    budgetItems,
    addBudgetItem: useCallback((input: NewBudgetItemInput) => addBudgetItem(input), []),
    updateBudgetItem: useCallback((id: string, patch: Partial<Omit<BudgetItem, 'id' | 'createdAt'>>) => updateBudgetItem(id, patch), []),
    deleteBudgetItem: useCallback((id: string) => deleteBudgetItem(id), []),
  };
}

export function useBudgetItemsForCategory(categoryId: string | undefined): BudgetItem[] {
  const budgetItems = useStoreValue(budgetItemsStore);
  return categoryId ? budgetItems.filter((i) => i.categoryId === categoryId) : [];
}

export function useBudgetItemsForVendor(vendorId: string | undefined): BudgetItem[] {
  const budgetItems = useStoreValue(budgetItemsStore);
  return vendorId ? budgetItems.filter((i) => i.vendorId === vendorId) : [];
}
