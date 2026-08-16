import type { BudgetCategory } from '@/types';
import { generateId } from '@/lib/id';
import { budgetCategoriesStore, budgetItemsStore, paymentSchedulesStore, paymentsStore } from '../stores';

export type NewBudgetCategoryInput = Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addBudgetCategory(input: NewBudgetCategoryInput): BudgetCategory {
  const timestamp = nowISO();
  const category: BudgetCategory = { ...input, id: generateId('budgetcat'), createdAt: timestamp, updatedAt: timestamp };
  budgetCategoriesStore.set((prev) => [...prev, category]);
  return category;
}

export function updateBudgetCategory(id: string, patch: Partial<Omit<BudgetCategory, 'id' | 'createdAt'>>): void {
  budgetCategoriesStore.set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)));
}

/** Deletes a category and cascades: its budget items go too, un-linking (not deleting) any payment schedules/payments that referenced those items. */
export function deleteBudgetCategory(id: string): void {
  const itemIds = new Set(budgetItemsStore.get().filter((i) => i.categoryId === id).map((i) => i.id));
  budgetCategoriesStore.set((prev) => prev.filter((c) => c.id !== id));
  budgetItemsStore.set((prev) => prev.filter((i) => i.categoryId !== id));
  paymentSchedulesStore.set((prev) => prev.map((s) => (s.budgetItemId && itemIds.has(s.budgetItemId) ? { ...s, budgetItemId: undefined, updatedAt: nowISO() } : s)));
  paymentsStore.set((prev) => prev.map((p) => (p.budgetItemId && itemIds.has(p.budgetItemId) ? { ...p, budgetItemId: undefined, updatedAt: nowISO() } : p)));
}
