import type { BudgetItem } from '@/types';
import { generateId } from '@/lib/id';
import { budgetItemsStore, paymentSchedulesStore, paymentsStore } from '../stores';

export type NewBudgetItemInput = Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addBudgetItem(input: NewBudgetItemInput): BudgetItem {
  const timestamp = nowISO();
  const item: BudgetItem = { ...input, id: generateId('budgetitem'), createdAt: timestamp, updatedAt: timestamp };
  budgetItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateBudgetItem(id: string, patch: Partial<Omit<BudgetItem, 'id' | 'createdAt'>>): void {
  budgetItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

/** Deletes a budget item and un-links (not deletes) any payment schedules/payments that referenced it. */
export function deleteBudgetItem(id: string): void {
  budgetItemsStore.set((prev) => prev.filter((i) => i.id !== id));
  paymentSchedulesStore.set((prev) => prev.map((s) => (s.budgetItemId === id ? { ...s, budgetItemId: undefined, updatedAt: nowISO() } : s)));
  paymentsStore.set((prev) => prev.map((p) => (p.budgetItemId === id ? { ...p, budgetItemId: undefined, updatedAt: nowISO() } : p)));
}
