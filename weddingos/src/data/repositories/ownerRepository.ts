import type { Owner } from '@/types';
import { generateId } from '@/lib/id';
import { ownersStore, tasksStore } from '../stores';

export class OwnerInUseError extends Error {
  ownerName: string;
  taskCount: number;

  constructor(ownerName: string, taskCount: number) {
    super(`"${ownerName}" is assigned to ${taskCount} task(s). Reassign those tasks before deleting this role.`);
    this.name = 'OwnerInUseError';
    this.ownerName = ownerName;
    this.taskCount = taskCount;
  }
}

export function addOwner(name: string): Owner {
  const trimmed = name.trim();
  const owner: Owner = { id: generateId('owner'), name: trimmed, isCustom: true };
  ownersStore.set((prev) => [...prev, owner]);
  return owner;
}

export function renameOwner(id: string, newName: string): void {
  const trimmed = newName.trim();
  const owner = ownersStore.get().find((o) => o.id === id);
  if (!owner) return;
  const oldName = owner.name;

  ownersStore.set((prev) => prev.map((o) => (o.id === id ? { ...o, name: trimmed } : o)));

  if (oldName !== trimmed) {
    tasksStore.set((prev) =>
      prev.map((task) => (task.owner === oldName ? { ...task, owner: trimmed, updatedAt: new Date().toISOString() } : task)),
    );
  }
}

export function countTasksForOwner(ownerName: string): number {
  return tasksStore.get().filter((task) => task.owner === ownerName).length;
}

/** Deletes a custom owner role. Throws OwnerInUseError if tasks are still assigned to it. */
export function deleteOwner(id: string): void {
  const owner = ownersStore.get().find((o) => o.id === id);
  if (!owner) return;
  const assignedCount = countTasksForOwner(owner.name);
  if (assignedCount > 0) {
    throw new OwnerInUseError(owner.name, assignedCount);
  }
  ownersStore.set((prev) => prev.filter((o) => o.id !== id));
}
