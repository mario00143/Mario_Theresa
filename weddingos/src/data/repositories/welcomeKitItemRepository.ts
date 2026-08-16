import type { WelcomeKitItem } from '@/types';
import { generateId } from '@/lib/id';
import { welcomeKitItemsStore } from '../stores';

export type NewWelcomeKitItemInput = Omit<WelcomeKitItem, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addWelcomeKitItem(input: NewWelcomeKitItemInput): WelcomeKitItem {
  const timestamp = nowISO();
  const item: WelcomeKitItem = { ...input, id: generateId('kititem'), createdAt: timestamp, updatedAt: timestamp };
  welcomeKitItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateWelcomeKitItem(id: string, patch: Partial<Omit<WelcomeKitItem, 'id' | 'createdAt'>>): void {
  welcomeKitItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

export function deleteWelcomeKitItem(id: string): void {
  welcomeKitItemsStore.set((prev) => prev.filter((i) => i.id !== id));
}
