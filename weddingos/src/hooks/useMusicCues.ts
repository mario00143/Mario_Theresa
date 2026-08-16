import { useCallback } from 'react';
import type { MusicCue } from '@/types';
import { musicCuesStore } from '@/data/stores';
import { addMusicCue, deleteMusicCue, updateMusicCue, type NewMusicCueInput } from '@/data/repositories/musicCueRepository';
import { useStoreValue } from './useStore';

export function useMusicCues() {
  const cues = useStoreValue(musicCuesStore);

  return {
    musicCues: [...cues].sort((a, b) => a.sequenceOrder - b.sequenceOrder),
    addMusicCue: useCallback((input: NewMusicCueInput) => addMusicCue(input), []),
    updateMusicCue: useCallback((id: string, patch: Partial<Omit<MusicCue, 'id' | 'createdAt'>>) => updateMusicCue(id, patch), []),
    deleteMusicCue: useCallback((id: string) => deleteMusicCue(id), []),
  };
}
