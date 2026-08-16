import type { MenuItem } from '@/types';
import { generateId } from '@/lib/id';
import { menuItemsStore } from '../stores';

export type NewMenuItemInput = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addMenuItem(input: NewMenuItemInput): MenuItem {
  const timestamp = nowISO();
  const item: MenuItem = { ...input, id: generateId('menuitem'), createdAt: timestamp, updatedAt: timestamp };
  menuItemsStore.set((prev) => [...prev, item]);
  return item;
}

export function updateMenuItem(id: string, patch: Partial<Omit<MenuItem, 'id' | 'createdAt'>>): void {
  menuItemsStore.set((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i)));
}

export function deleteMenuItem(id: string): void {
  menuItemsStore.set((prev) => prev.filter((i) => i.id !== id));
}
