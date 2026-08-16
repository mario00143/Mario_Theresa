import type { GiftPlan } from '@/types';
import { generateId } from '@/lib/id';
import { giftPlansStore } from '../stores';

export type NewGiftPlanInput = Omit<GiftPlan, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addGiftPlan(input: NewGiftPlanInput): GiftPlan {
  const timestamp = nowISO();
  const plan: GiftPlan = { ...input, id: generateId('gift'), createdAt: timestamp, updatedAt: timestamp };
  giftPlansStore.set((prev) => [...prev, plan]);
  return plan;
}

export function updateGiftPlan(id: string, patch: Partial<Omit<GiftPlan, 'id' | 'createdAt'>>): void {
  giftPlansStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

export function deleteGiftPlan(id: string): void {
  giftPlansStore.set((prev) => prev.filter((p) => p.id !== id));
}
