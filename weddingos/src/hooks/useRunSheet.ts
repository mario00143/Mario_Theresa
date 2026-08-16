import { useCallback } from 'react';
import type { RunSheetItem } from '@/types';
import { runSheetItemsStore } from '@/data/stores';
import {
  addRunSheetItem,
  applyDelayShift,
  completeRunSheetItem,
  delayRunSheetItem,
  deleteRunSheetItem,
  startRunSheetItem,
  updateRunSheetItem,
  type NewRunSheetItemInput,
} from '@/data/repositories/runSheetItemRepository';
import { useStoreValue } from './useStore';

export function useRunSheet() {
  const items = useStoreValue(runSheetItemsStore);

  return {
    runSheetItems: items,
    addRunSheetItem: useCallback((input: NewRunSheetItemInput) => addRunSheetItem(input), []),
    updateRunSheetItem: useCallback((id: string, patch: Partial<Omit<RunSheetItem, 'id' | 'createdAt'>>) => updateRunSheetItem(id, patch), []),
    deleteRunSheetItem: useCallback((id: string) => deleteRunSheetItem(id), []),
    startRunSheetItem: useCallback((id: string, referenceDateTimeISO?: string) => startRunSheetItem(id, referenceDateTimeISO), []),
    completeRunSheetItem: useCallback((id: string, referenceDateTimeISO?: string) => completeRunSheetItem(id, referenceDateTimeISO), []),
    delayRunSheetItem: useCallback((id: string, delayMinutes: number, reason?: string) => delayRunSheetItem(id, delayMinutes, reason), []),
    applyDelayShift: useCallback((itemIds: string[], shiftMinutes: number, auditNote: string) => applyDelayShift(itemIds, shiftMinutes, auditNote), []),
  };
}

export function useRunSheetItem(id: string | undefined): RunSheetItem | undefined {
  const items = useStoreValue(runSheetItemsStore);
  return id ? items.find((i) => i.id === id) : undefined;
}

export function useRunSheetItemsForTask(taskId: string | undefined): RunSheetItem[] {
  const items = useStoreValue(runSheetItemsStore);
  return taskId ? items.filter((i) => i.relatedTaskIds.includes(taskId)) : [];
}
