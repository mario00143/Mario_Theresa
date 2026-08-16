import type { PhotoGroup } from '@/types';
import { generateId } from '@/lib/id';
import { photoGroupsStore } from '../stores';

export type NewPhotoGroupInput = Omit<PhotoGroup, 'id' | 'createdAt' | 'updatedAt' | 'participants'> & Partial<Pick<PhotoGroup, 'participants'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addPhotoGroup(input: NewPhotoGroupInput): PhotoGroup {
  const timestamp = nowISO();
  const group: PhotoGroup = { ...input, participants: input.participants ?? [], id: generateId('photogroup'), createdAt: timestamp, updatedAt: timestamp };
  photoGroupsStore.set((prev) => [...prev, group]);
  return group;
}

export function updatePhotoGroup(id: string, patch: Partial<Omit<PhotoGroup, 'id' | 'createdAt'>>): void {
  photoGroupsStore.set((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: nowISO() } : g)));
}

export function deletePhotoGroup(id: string): void {
  photoGroupsStore.set((prev) => prev.filter((g) => g.id !== id));
}
