import { readJSON, writeJSON } from './storage';

/**
 * A minimal observable store persisted to localStorage.
 * Designed to work with React's useSyncExternalStore so any number of
 * components can read/write the same collection and stay in sync within
 * a single tab (localStorage's native 'storage' event only fires
 * cross-tab, which isn't enough for our needs).
 *
 * This is the repository abstraction referenced across the app: pages and
 * features never call localStorage directly, they call a Store instance
 * (or a hook built on one). Swapping to Supabase later means replacing
 * this file's internals, not every call site.
 */
export interface Store<T> {
  get: () => T;
  set: (value: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(key: string, initial: T): Store<T> {
  let state: T = readJSON<T>(key, initial);
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    get: () => state,
    set: (value) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
      state = next;
      writeJSON(key, state);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
