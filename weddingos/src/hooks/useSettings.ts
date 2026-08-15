import { useCallback } from 'react';
import type { AppSettings } from '@/types';
import { settingsStore } from '@/data/stores';
import { replaceSettings, updateSettings } from '@/data/repositories/settingsRepository';
import { useStoreValue } from './useStore';

export function useSettings() {
  const settings = useStoreValue(settingsStore);

  return {
    settings,
    updateSettings: useCallback((patch: Partial<AppSettings>) => updateSettings(patch), []),
    replaceSettings: useCallback((next: AppSettings) => replaceSettings(next), []),
  };
}
