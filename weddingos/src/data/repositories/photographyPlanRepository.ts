import type { PhotographyPlan } from '@/types';
import { generateId } from '@/lib/id';
import { photographyPlansStore } from '../stores';

export type NewPhotographyPlanInput = Omit<PhotographyPlan, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addPhotographyPlan(input: NewPhotographyPlanInput): PhotographyPlan {
  const timestamp = nowISO();
  const plan: PhotographyPlan = { ...input, id: generateId('photoplan'), createdAt: timestamp, updatedAt: timestamp };
  photographyPlansStore.set((prev) => [...prev, plan]);
  return plan;
}

export function updatePhotographyPlan(id: string, patch: Partial<Omit<PhotographyPlan, 'id' | 'createdAt'>>): void {
  photographyPlansStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

export function deletePhotographyPlan(id: string): void {
  photographyPlansStore.set((prev) => prev.filter((p) => p.id !== id));
}
