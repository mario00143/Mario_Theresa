import { useCallback } from 'react';
import type { Task } from '@/types';
import { tasksStore } from '@/data/stores';
import {
  addSubtask,
  addTask,
  deleteSubtask,
  deleteTask,
  duplicateTask,
  setTaskStatus,
  updateSubtask,
  updateTask,
  type NewTaskInput,
} from '@/data/repositories/taskRepository';
import { useStoreValue } from './useStore';

export function useTasks() {
  const tasks = useStoreValue(tasksStore);

  return {
    tasks,
    addTask: useCallback((input: NewTaskInput) => addTask(input), []),
    updateTask: useCallback((id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => updateTask(id, patch), []),
    setTaskStatus: useCallback((id: string, status: Task['status']) => setTaskStatus(id, status), []),
    deleteTask: useCallback((id: string) => deleteTask(id), []),
    duplicateTask: useCallback((id: string) => duplicateTask(id), []),
    addSubtask: useCallback(
      (taskId: string, title: string, owner?: string, dueDate?: string) => addSubtask(taskId, title, owner, dueDate),
      [],
    ),
    updateSubtask: useCallback(
      (taskId: string, subtaskId: string, patch: Parameters<typeof updateSubtask>[2]) =>
        updateSubtask(taskId, subtaskId, patch),
      [],
    ),
    deleteSubtask: useCallback((taskId: string, subtaskId: string) => deleteSubtask(taskId, subtaskId), []),
  };
}

export function useTask(id: string | undefined): Task | undefined {
  const tasks = useStoreValue(tasksStore);
  return id ? tasks.find((t) => t.id === id) : undefined;
}
