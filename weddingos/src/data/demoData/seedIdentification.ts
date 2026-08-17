/**
 * Section 62's confidently-known seed IDs. Deliberately NOT name-matching
 * ("Do not guess based on names") — every id here is re-derived from the
 * exact same deterministic `generateSeedId()` calls the seed generators
 * themselves use (lib/id.ts), so a record in a live workspace either has
 * one of these exact ids or it doesn't. There is no fuzzy matching.
 *
 * Coverage is intentionally partial: Tasks, Decisions, Households, and
 * Guests are covered (the demo content most likely to read as obviously
 * fictional "clutter" a couple would want cleared before real use).
 * Logistics/Finance/Wedding Prep/Wedding Day seed records predate this
 * deterministic-id scheme and still use random ids per generation, so
 * they cannot be confidently identified after the fact — the Cleanup
 * Assistant only ever shows/acts on the categories below, never guesses
 * at the rest. See docs/KNOWN_LIMITATIONS.md.
 */
import { buildSeedTasks } from '@/data/tasks.seed';
import { buildSeedDecisions } from '@/data/decisions.seed';
import { buildSeedHouseholdsAndGuests } from '@/data/households.seed';

export interface SeedIdentificationModule {
  label: string;
  collectionKey: 'tasks' | 'decisions' | 'households' | 'guests';
  knownIds: Set<string>;
}

let cachedModules: SeedIdentificationModule[] | null = null;

/** Computed once per session (pure, deterministic — safe to cache). */
export function getSeedIdentificationModules(): SeedIdentificationModule[] {
  if (cachedModules) return cachedModules;

  const { tasks } = buildSeedTasks();
  const decisions = buildSeedDecisions(new Map());
  const { households, guests } = buildSeedHouseholdsAndGuests();

  cachedModules = [
    { label: 'Tasks', collectionKey: 'tasks', knownIds: new Set(tasks.map((t) => t.id)) },
    { label: 'Decisions', collectionKey: 'decisions', knownIds: new Set(decisions.map((d) => d.id)) },
    { label: 'Households', collectionKey: 'households', knownIds: new Set(households.map((h) => h.id)) },
    { label: 'Guests', collectionKey: 'guests', knownIds: new Set(guests.map((g) => g.id)) },
  ];
  return cachedModules;
}

/** Test-only escape hatch. */
export function resetSeedIdentificationCache(): void {
  cachedModules = null;
}
