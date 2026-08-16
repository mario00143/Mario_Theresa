import type { Store } from '@/lib/store';
import type { RepositoryAdapter } from './types';

/** Wraps a plain localStorage-backed Store<T[]> in the async RepositoryAdapter shape. */
export function createLocalAdapter<T extends { id: string }>(store: Store<T[]>): RepositoryAdapter<T> {
  return {
    async list() {
      return store.get();
    },
    async get(id) {
      return store.get().find((record) => record.id === id);
    },
    async create(record) {
      store.set((prev) => [...prev, record]);
      return record;
    },
    async update(id, patch) {
      let updated: T | undefined;
      store.set((prev) =>
        prev.map((record) => {
          if (record.id !== id) return record;
          updated = { ...record, ...patch };
          return updated;
        }),
      );
      if (!updated) throw new Error(`Record ${id} not found`);
      return updated;
    },
    async remove(id) {
      store.set((prev) => prev.filter((record) => record.id !== id));
    },
  };
}
