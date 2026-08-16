import type { WelcomeKit } from '@/types';
import { generateId } from '@/lib/id';
import { welcomeKitItemsStore, welcomeKitsStore } from '../stores';

export type NewWelcomeKitInput = Omit<WelcomeKit, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addWelcomeKit(input: NewWelcomeKitInput): WelcomeKit {
  const timestamp = nowISO();
  const kit: WelcomeKit = { ...input, id: generateId('kit'), createdAt: timestamp, updatedAt: timestamp };
  welcomeKitsStore.set((prev) => [...prev, kit]);
  return kit;
}

export function updateWelcomeKit(id: string, patch: Partial<Omit<WelcomeKit, 'id' | 'createdAt'>>): void {
  welcomeKitsStore.set((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch, updatedAt: nowISO() } : k)));
}

/** Deletes a welcome kit and cascades to its items. */
export function deleteWelcomeKit(id: string): void {
  welcomeKitsStore.set((prev) => prev.filter((k) => k.id !== id));
  welcomeKitItemsStore.set((prev) => prev.filter((i) => i.welcomeKitId !== id));
}
