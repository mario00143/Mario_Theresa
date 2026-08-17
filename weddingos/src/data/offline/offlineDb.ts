import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { OfflineSnapshot } from '@/types/offlineSnapshot';
import type { OfflineMutation } from '@/types/offlineMutationQueue';

/**
 * IndexedDB is used here (never localStorage) specifically because the
 * Offline Pack can be a non-trivial amount of joined data, and because
 * IndexedDB — unlike localStorage — is never blocking, has a much larger
 * practical quota, and survives being written to from a service worker
 * context too if that's ever needed later.
 */
interface WeddingOSOfflineDb extends DBSchema {
  snapshot: {
    key: string;
    value: OfflineSnapshot;
  };
  mutationQueue: {
    key: string;
    value: OfflineMutation;
    indexes: { 'by-status': string; 'by-createdAt': string };
  };
}

const DB_NAME = 'weddingos-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<WeddingOSOfflineDb>> | null = null;

function getDb(): Promise<IDBPDatabase<WeddingOSOfflineDb>> {
  if (!dbPromise) {
    dbPromise = openDB<WeddingOSOfflineDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('snapshot')) {
          db.createObjectStore('snapshot', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('mutationQueue')) {
          const store = db.createObjectStore('mutationQueue', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

/** True if IndexedDB is available at all in this browser/context (some locked-down browsers or private-mode edge cases disable it). */
export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

export async function putSnapshot(snapshot: OfflineSnapshot): Promise<void> {
  const db = await getDb();
  await db.put('snapshot', snapshot);
}

export async function getSnapshot(): Promise<OfflineSnapshot | undefined> {
  if (!isIndexedDbAvailable()) return undefined;
  const db = await getDb();
  return db.get('snapshot', 'current');
}

export async function clearSnapshot(): Promise<void> {
  const db = await getDb();
  await db.delete('snapshot', 'current');
}

export async function putMutation(mutation: OfflineMutation): Promise<void> {
  const db = await getDb();
  await db.put('mutationQueue', mutation);
}

export async function getAllMutations(): Promise<OfflineMutation[]> {
  if (!isIndexedDbAvailable()) return [];
  const db = await getDb();
  const all = await db.getAll('mutationQueue');
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function deleteMutation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('mutationQueue', id);
}

export async function clearAllOfflineData(): Promise<void> {
  const db = await getDb();
  await db.clear('snapshot');
  await db.clear('mutationQueue');
}
