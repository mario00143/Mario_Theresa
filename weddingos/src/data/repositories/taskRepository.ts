import type { Subtask, Task, TaskStatus } from '@/types';
import { generateId } from '@/lib/id';
import { runSheetItemsStore, tasksStore } from '../stores';

export type NewTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'dependencies' | 'tags'> &
  Partial<Pick<Task, 'subtasks' | 'dependencies' | 'tags'>>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addTask(input: NewTaskInput): Task {
  const timestamp = nowISO();
  const task: Task = {
    ...input,
    id: generateId('task'),
    dependencies: input.dependencies ?? [],
    tags: input.tags ?? [],
    subtasks: input.subtasks ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  tasksStore.set((prev) => [...prev, task]);
  return task;
}

export function updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
  tasksStore.set((prev) =>
    prev.map((task) => (task.id === id ? { ...task, ...patch, updatedAt: nowISO() } : task)),
  );
}

export function setTaskStatus(id: string, status: TaskStatus): void {
  updateTask(id, { status });
}

export function deleteTask(id: string): void {
  tasksStore.set((prev) =>
    prev
      .filter((task) => task.id !== id)
      .map((task) => (task.dependencies.includes(id) ? { ...task, dependencies: task.dependencies.filter((d) => d !== id) } : task)),
  );
  runSheetItemsStore.set((prev) =>
    prev.map((r) => (r.relatedTaskIds.includes(id) ? { ...r, relatedTaskIds: r.relatedTaskIds.filter((t) => t !== id), updatedAt: new Date().toISOString() } : r)),
  );
}

export function duplicateTask(id: string): Task | null {
  const source = tasksStore.get().find((task) => task.id === id);
  if (!source) return null;
  const timestamp = nowISO();
  const duplicate: Task = {
    ...source,
    id: generateId('task'),
    title: `${source.title} (Copy)`,
    status: 'Not Started',
    completionNote: undefined,
    completionEvidence: undefined,
    subtasks: source.subtasks.map((s) => ({ ...s, id: generateId('subtask'), completed: false })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  tasksStore.set((prev) => [...prev, duplicate]);
  return duplicate;
}

export function addSubtask(taskId: string, title: string, owner?: string, dueDate?: string): void {
  const subtask: Subtask = { id: generateId('subtask'), title, completed: false, owner, dueDate };
  tasksStore.set((prev) =>
    prev.map((task) => (task.id === taskId ? { ...task, subtasks: [...task.subtasks, subtask], updatedAt: nowISO() } : task)),
  );
}

export function updateSubtask(taskId: string, subtaskId: string, patch: Partial<Omit<Subtask, 'id'>>): void {
  tasksStore.set((prev) =>
    prev.map((task) =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...patch } : s)),
            updatedAt: nowISO(),
          }
        : task,
    ),
  );
}

export function deleteSubtask(taskId: string, subtaskId: string): void {
  tasksStore.set((prev) =>
    prev.map((task) =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId), updatedAt: nowISO() }
        : task,
    ),
  );
}
