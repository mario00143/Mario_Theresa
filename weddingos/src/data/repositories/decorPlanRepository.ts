import type { DecorPlan } from '@/types';
import { generateId } from '@/lib/id';
import { decorDeliverablesStore, decorPlansStore } from '../stores';

export type NewDecorPlanInput = Omit<DecorPlan, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addDecorPlan(input: NewDecorPlanInput): DecorPlan {
  const timestamp = nowISO();
  const plan: DecorPlan = { ...input, id: generateId('decor'), createdAt: timestamp, updatedAt: timestamp };
  decorPlansStore.set((prev) => [...prev, plan]);
  return plan;
}

export function updateDecorPlan(id: string, patch: Partial<Omit<DecorPlan, 'id' | 'createdAt'>>): void {
  decorPlansStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

/** Deletes a décor plan and cascades to its deliverables. */
export function deleteDecorPlan(id: string): void {
  decorPlansStore.set((prev) => prev.filter((p) => p.id !== id));
  decorDeliverablesStore.set((prev) => prev.filter((d) => d.decorPlanId !== id));
}
