import type { MusicCue } from '@/types';
import { generateId } from '@/lib/id';
import { ceremonySequenceItemsStore, musicCuesStore } from '../stores';

export type NewMusicCueInput = Omit<MusicCue, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addMusicCue(input: NewMusicCueInput): MusicCue {
  const timestamp = nowISO();
  const cue: MusicCue = { ...input, id: generateId('cue'), createdAt: timestamp, updatedAt: timestamp };
  musicCuesStore.set((prev) => [...prev, cue]);
  return cue;
}

export function updateMusicCue(id: string, patch: Partial<Omit<MusicCue, 'id' | 'createdAt'>>): void {
  musicCuesStore.set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)));
}

/** Deletes a music cue and un-links it from any ceremony sequence item that referenced it. */
export function deleteMusicCue(id: string): void {
  musicCuesStore.set((prev) => prev.filter((c) => c.id !== id));
  ceremonySequenceItemsStore.set((prev) =>
    prev.map((s) => (s.musicCueId === id ? { ...s, musicCueId: undefined, updatedAt: nowISO() } : s)),
  );
}
