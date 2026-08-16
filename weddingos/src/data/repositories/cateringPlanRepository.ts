import type { CateringPlan } from '@/types';
import { generateId } from '@/lib/id';
import { cateringPlansStore, menuItemsStore } from '../stores';

export type NewCateringPlanInput = Omit<CateringPlan, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addCateringPlan(input: NewCateringPlanInput): CateringPlan {
  const timestamp = nowISO();
  const plan: CateringPlan = { ...input, id: generateId('catering'), createdAt: timestamp, updatedAt: timestamp };
  cateringPlansStore.set((prev) => [...prev, plan]);
  return plan;
}

export function updateCateringPlan(id: string, patch: Partial<Omit<CateringPlan, 'id' | 'createdAt'>>): void {
  cateringPlansStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

/** Deletes a catering plan and cascades to its menu items. */
export function deleteCateringPlan(id: string): void {
  cateringPlansStore.set((prev) => prev.filter((p) => p.id !== id));
  menuItemsStore.set((prev) => prev.filter((m) => m.cateringPlanId !== id));
}
