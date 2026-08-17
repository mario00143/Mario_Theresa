import { v4 as uuid, v5 as uuidv5 } from 'uuid';

export function generateId(prefix?: string): string {
  return prefix ? `${prefix}_${uuid()}` : uuid();
}

/**
 * Fixed, arbitrary namespace UUID used ONLY to derive deterministic seed
 * IDs (section 62) — never used for anything else, never a secret.
 */
const SEED_ID_NAMESPACE = '5f7e6a2e-6b0b-4b8a-9b9a-9d6a9a9f3a10';

/**
 * Unlike `generateId()` (random, used for every real user-created
 * record), this always returns the exact same id for the same
 * `(entityType, seedKey)` pair, in any session, on any machine, at any
 * time. This is what lets the Demo Data Cleanup Assistant
 * (data/demoData/seedIdentification.ts) confidently recognize "this
 * record is original demo/seed content" purely by id, with zero
 * guessing based on names — a record either has one of these exact,
 * precomputed ids or it doesn't.
 */
export function generateSeedId(entityType: string, seedKey: string): string {
  return `${entityType}_${uuidv5(seedKey, SEED_ID_NAMESPACE)}`;
}
