import { describe, expect, it, beforeEach } from 'vitest';
import { getSeedIdentificationModules, resetSeedIdentificationCache } from '@/data/demoData/seedIdentification';
import { buildSeedTasks } from '@/data/tasks.seed';
import { buildSeedDecisions } from '@/data/decisions.seed';
import { buildSeedHouseholdsAndGuests } from '@/data/households.seed';

describe('Demo Data Cleanup seed identification (section 62)', () => {
  beforeEach(() => resetSeedIdentificationCache());

  it('is fully deterministic — the same seed record gets the same id across independent generations', () => {
    const a = buildSeedTasks();
    const b = buildSeedTasks();
    expect(a.tasks.map((t) => t.id)).toEqual(b.tasks.map((t) => t.id));

    const decisionsA = buildSeedDecisions(new Map());
    const decisionsB = buildSeedDecisions(new Map());
    expect(decisionsA.map((d) => d.id)).toEqual(decisionsB.map((d) => d.id));

    const hgA = buildSeedHouseholdsAndGuests();
    const hgB = buildSeedHouseholdsAndGuests();
    expect(hgA.households.map((h) => h.id)).toEqual(hgB.households.map((h) => h.id));
    expect(hgA.guests.map((g) => g.id)).toEqual(hgB.guests.map((g) => g.id));
  });

  it('every seed record has a unique id within its own collection', () => {
    const { tasks } = buildSeedTasks();
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);

    const decisions = buildSeedDecisions(new Map());
    expect(new Set(decisions.map((d) => d.id)).size).toBe(decisions.length);

    const { households, guests } = buildSeedHouseholdsAndGuests();
    expect(new Set(households.map((h) => h.id)).size).toBe(households.length);
    expect(new Set(guests.map((g) => g.id)).size).toBe(guests.length);
  });

  it('every currently-generated demo record is confidently identified by getSeedIdentificationModules', () => {
    const { tasks } = buildSeedTasks();
    const decisions = buildSeedDecisions(new Map());
    const { households, guests } = buildSeedHouseholdsAndGuests();

    const modules = getSeedIdentificationModules();
    const byKey = Object.fromEntries(modules.map((m) => [m.collectionKey, m.knownIds]));

    for (const t of tasks) expect(byKey.tasks.has(t.id)).toBe(true);
    for (const d of decisions) expect(byKey.decisions.has(d.id)).toBe(true);
    for (const h of households) expect(byKey.households.has(h.id)).toBe(true);
    for (const g of guests) expect(byKey.guests.has(g.id)).toBe(true);
  });

  it('never flags a plausible-but-different user-created record just because the title matches (no name-guessing)', () => {
    const modules = getSeedIdentificationModules();
    const taskModule = modules.find((m) => m.collectionKey === 'tasks')!;
    // A record with the exact same title as a seed task, but a freshly-generated (non-deterministic) id, must NOT be flagged.
    const userCreatedId = 'task_user-created-with-same-title';
    expect(taskModule.knownIds.has(userCreatedId)).toBe(false);
  });
});
