import type { AppSettings, Decision, Guest, Household, Owner, Task } from '@/types';
import { createStore } from '@/lib/store';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/lib/storage';
import { createSeedBundle } from './seed';

/**
 * Seeds localStorage exactly once (tracked by the `seeded` flag). If the
 * user later deletes every task, we must NOT re-seed — this flag is what
 * distinguishes "never seeded" from "seeded then emptied by the user".
 */
function ensureSeeded(): void {
  const alreadySeeded = readJSON<boolean>(STORAGE_KEYS.seeded, false);
  if (alreadySeeded) return;

  const bundle = createSeedBundle();
  writeJSON(STORAGE_KEYS.settings, bundle.settings);
  writeJSON(STORAGE_KEYS.tasks, bundle.tasks);
  writeJSON(STORAGE_KEYS.decisions, bundle.decisions);
  writeJSON(STORAGE_KEYS.owners, bundle.owners);
  writeJSON(STORAGE_KEYS.households, bundle.households);
  writeJSON(STORAGE_KEYS.guests, bundle.guests);
  writeJSON(STORAGE_KEYS.seeded, true);
}

ensureSeeded();

export const settingsStore = createStore<AppSettings>(STORAGE_KEYS.settings, seedSettingsFallback());
export const tasksStore = createStore<Task[]>(STORAGE_KEYS.tasks, []);
export const decisionsStore = createStore<Decision[]>(STORAGE_KEYS.decisions, []);
export const ownersStore = createStore<Owner[]>(STORAGE_KEYS.owners, []);
export const householdsStore = createStore<Household[]>(STORAGE_KEYS.households, []);
export const guestsStore = createStore<Guest[]>(STORAGE_KEYS.guests, []);

function seedSettingsFallback(): AppSettings {
  // ensureSeeded() above guarantees settings already exist in storage by this point;
  // this fallback only matters if localStorage is unavailable (e.g. private browsing).
  return createSeedBundle().settings;
}

/** Wipes all WeddingOS data and reseeds fresh demo data. Used by Settings > Reset to Demo Data. */
export function resetToDemoData(): void {
  const bundle = createSeedBundle();
  settingsStore.set(bundle.settings);
  tasksStore.set(bundle.tasks);
  decisionsStore.set(bundle.decisions);
  ownersStore.set(bundle.owners);
  householdsStore.set(bundle.households);
  guestsStore.set(bundle.guests);
  writeJSON(STORAGE_KEYS.seeded, true);
}
