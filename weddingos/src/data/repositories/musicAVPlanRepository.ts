import type { MusicAVPlan } from '@/types';
import { generateId } from '@/lib/id';
import { musicAVPlansStore } from '../stores';

export type NewMusicAVPlanInput = Omit<MusicAVPlan, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addMusicAVPlan(input: NewMusicAVPlanInput): MusicAVPlan {
  const timestamp = nowISO();
  const plan: MusicAVPlan = { ...input, id: generateId('musicav'), createdAt: timestamp, updatedAt: timestamp };
  musicAVPlansStore.set((prev) => [...prev, plan]);
  return plan;
}

export function updateMusicAVPlan(id: string, patch: Partial<Omit<MusicAVPlan, 'id' | 'createdAt'>>): void {
  musicAVPlansStore.set((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
}

export function deleteMusicAVPlan(id: string): void {
  musicAVPlansStore.set((prev) => prev.filter((p) => p.id !== id));
}
